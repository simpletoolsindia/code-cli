import { Effect, Schema } from "effect"
import * as Tool from "./tool"

type Row = Record<string, unknown>

const CreateParameters = Schema.Struct({
  data: Schema.String.annotate({ description: "JSON object or array of objects to inspect as a dataframe." }),
  name: Schema.optional(Schema.String).annotate({ description: "Optional dataframe name. Defaults to df." }),
})

const FilterParameters = Schema.Struct({
  data: Schema.Array(Schema.Record(Schema.String, Schema.Unknown)).annotate({
    description: "Rows to filter.",
  }),
  conditions: Schema.String.annotate({
    description:
      'JSON conditions. Supports equality and operators like {"age":{"$gte":18}, "name":{"$contains":"Ann"}}.',
  }),
})

const AggregateParameters = Schema.Struct({
  data: Schema.Array(Schema.Record(Schema.String, Schema.Unknown)).annotate({
    description: "Rows to aggregate.",
  }),
  group_by: Schema.Array(Schema.String).annotate({
    description: "Column names to group by.",
  }),
  aggregations: Schema.Record(Schema.String, Schema.String).annotate({
    description: "Column-to-aggregation map. Supported functions: sum, avg, count, min, max.",
  }),
})

const LinePlotParameters = Schema.Struct({
  x: Schema.Array(Schema.Unknown).annotate({ description: "X-axis values." }),
  y: Schema.Array(Schema.Unknown).annotate({ description: "Y-axis values." }),
  title: Schema.optional(Schema.String).annotate({ description: "Optional chart title." }),
})

const BarPlotParameters = Schema.Struct({
  categories: Schema.Array(Schema.Unknown).annotate({ description: "Category labels." }),
  values: Schema.Array(Schema.Unknown).annotate({ description: "Bar values." }),
  title: Schema.optional(Schema.String).annotate({ description: "Optional chart title." }),
})

function isRow(value: unknown): value is Row {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function compare(rowValue: unknown, condition: unknown) {
  if (!isRow(condition)) return rowValue === condition
  return Object.entries(condition).every(([operator, value]) => {
    if (operator === "$eq") return rowValue === value
    if (operator === "$ne") return rowValue !== value
    if (operator === "$gt") return Number(rowValue) > Number(value)
    if (operator === "$gte") return Number(rowValue) >= Number(value)
    if (operator === "$lt") return Number(rowValue) < Number(value)
    if (operator === "$lte") return Number(rowValue) <= Number(value)
    if (operator === "$contains") return String(rowValue).includes(String(value))
    return true
  })
}

function parseRows(data: string) {
  const parsed = JSON.parse(data) as unknown
  return (Array.isArray(parsed) ? parsed : [parsed]).filter(isRow)
}

function preview(values: readonly unknown[]) {
  return values.slice(0, 5).map(String).join(", ")
}

export const PandasCreateTool = Tool.define(
  "pandas_create",
  Effect.succeed({
    description: "Create a lightweight dataframe summary from JSON data.",
    parameters: CreateParameters,
    execute: (params: Schema.Schema.Type<typeof CreateParameters>) =>
      Effect.sync(() => {
        const rows = parseRows(params.data)
        return {
          title: `Dataframe ${params.name ?? "df"}`,
          metadata: { rows: rows.length },
          output: JSON.stringify(
            {
              name: params.name ?? "df",
              rowCount: rows.length,
              columns: Object.keys(rows[0] ?? {}),
              preview: rows.slice(0, 5),
            },
            null,
            2,
          ),
        }
      }).pipe(Effect.orDie),
  }),
)

export const PandasFilterTool = Tool.define(
  "pandas_filter",
  Effect.succeed({
    description: "Filter rows using JSON equality and comparison conditions.",
    parameters: FilterParameters,
    execute: (params: Schema.Schema.Type<typeof FilterParameters>) =>
      Effect.sync(() => {
        const conditions = JSON.parse(params.conditions) as unknown
        if (!isRow(conditions)) throw new Error("conditions must be a JSON object")
        const rows = params.data.filter((row) =>
          Object.entries(conditions).every(([key, condition]) => compare(row[key], condition)),
        )
        return {
          title: `Filtered ${rows.length} rows`,
          metadata: { rows: rows.length },
          output: JSON.stringify(rows, null, 2),
        }
      }).pipe(Effect.orDie),
  }),
)

export const PandasAggregateTool = Tool.define(
  "pandas_aggregate",
  Effect.succeed({
    description: "Group rows and calculate sum, avg, count, min, or max aggregations.",
    parameters: AggregateParameters,
    execute: (params: Schema.Schema.Type<typeof AggregateParameters>) =>
      Effect.sync(() => {
        const grouped = Map.groupBy(params.data, (row) => params.group_by.map((key) => String(row[key])).join("|"))
        const rows = Array.from(grouped.entries()).map(([key, items]) => {
          const result: Row = Object.fromEntries(
            params.group_by.map((column, index) => [column, key.split("|")[index]]),
          )
          Object.entries(params.aggregations).forEach(([column, fn]) => {
            const values = items.map((row) => Number(row[column])).filter((value) => Number.isFinite(value))
            if (fn === "sum") result[`${column}_sum`] = values.reduce((total, value) => total + value, 0)
            if (fn === "avg")
              result[`${column}_avg`] = values.length
                ? values.reduce((total, value) => total + value, 0) / values.length
                : 0
            if (fn === "count") result[`${column}_count`] = values.length
            if (fn === "min") result[`${column}_min`] = values.length ? Math.min(...values) : 0
            if (fn === "max") result[`${column}_max`] = values.length ? Math.max(...values) : 0
          })
          return result
        })
        return {
          title: `Aggregated ${rows.length} groups`,
          metadata: { rows: rows.length },
          output: JSON.stringify(rows, null, 2),
        }
      }).pipe(Effect.orDie),
  }),
)

export const PlotLineTool = Tool.define(
  "plot_line",
  Effect.succeed({
    description: "Prepare a line chart summary from x/y values.",
    parameters: LinePlotParameters,
    execute: (params: Schema.Schema.Type<typeof LinePlotParameters>) =>
      Effect.succeed({
        title: params.title ?? "Line plot",
        metadata: { points: Math.min(params.x.length, params.y.length) },
        output: `Line chart: ${params.title ?? "Plot"}\nX: ${preview(params.x)}\nY: ${preview(params.y)}\nUse the bash tool with matplotlib or another plotting library to render an image.`,
      }),
  }),
)

export const PlotBarTool = Tool.define(
  "plot_bar",
  Effect.succeed({
    description: "Prepare a bar chart summary from categories and values.",
    parameters: BarPlotParameters,
    execute: (params: Schema.Schema.Type<typeof BarPlotParameters>) =>
      Effect.succeed({
        title: params.title ?? "Bar plot",
        metadata: { bars: Math.min(params.categories.length, params.values.length) },
        output: `Bar chart: ${params.title ?? "Plot"}\nCategories: ${preview(params.categories)}\nValues: ${preview(params.values)}\nUse the bash tool with matplotlib or another plotting library to render an image.`,
      }),
  }),
)
