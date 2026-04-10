#!/usr/bin/env bun
// @bun
var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = import.meta.require;

// node_modules/@anthropic-ai/sdk/version.mjs
var VERSION = "0.32.1";

// node_modules/@anthropic-ai/sdk/_shims/registry.mjs
function setShims(shims, options = { auto: false }) {
  if (auto) {
    throw new Error(`you must \`import '@anthropic-ai/sdk/shims/${shims.kind}'\` before importing anything else from @anthropic-ai/sdk`);
  }
  if (kind) {
    throw new Error(`can't \`import '@anthropic-ai/sdk/shims/${shims.kind}'\` after \`import '@anthropic-ai/sdk/shims/${kind}'\``);
  }
  auto = options.auto;
  kind = shims.kind;
  fetch2 = shims.fetch;
  Request2 = shims.Request;
  Response2 = shims.Response;
  Headers2 = shims.Headers;
  FormData2 = shims.FormData;
  Blob2 = shims.Blob;
  File2 = shims.File;
  ReadableStream2 = shims.ReadableStream;
  getMultipartRequestOptions = shims.getMultipartRequestOptions;
  getDefaultAgent = shims.getDefaultAgent;
  fileFromPath = shims.fileFromPath;
  isFsReadStream = shims.isFsReadStream;
}
var auto = false, kind = undefined, fetch2 = undefined, Request2 = undefined, Response2 = undefined, Headers2 = undefined, FormData2 = undefined, Blob2 = undefined, File2 = undefined, ReadableStream2 = undefined, getMultipartRequestOptions = undefined, getDefaultAgent = undefined, fileFromPath = undefined, isFsReadStream = undefined;

// node_modules/@anthropic-ai/sdk/_shims/MultipartBody.mjs
var MultipartBody;
var init_MultipartBody = __esm(() => {
  MultipartBody = class MultipartBody {
    constructor(body) {
      this.body = body;
    }
    get [Symbol.toStringTag]() {
      return "MultipartBody";
    }
  };
});

// node_modules/@anthropic-ai/sdk/_shims/web-runtime.mjs
function getRuntime({ manuallyImported } = {}) {
  const recommendation = manuallyImported ? `You may need to use polyfills` : `Add one of these imports before your first \`import \u2026 from '@anthropic-ai/sdk'\`:
- \`import '@anthropic-ai/sdk/shims/node'\` (if you're running on Node)
- \`import '@anthropic-ai/sdk/shims/web'\` (otherwise)
`;
  let _fetch, _Request, _Response, _Headers;
  try {
    _fetch = fetch;
    _Request = Request;
    _Response = Response;
    _Headers = Headers;
  } catch (error) {
    throw new Error(`this environment is missing the following Web Fetch API type: ${error.message}. ${recommendation}`);
  }
  return {
    kind: "web",
    fetch: _fetch,
    Request: _Request,
    Response: _Response,
    Headers: _Headers,
    FormData: typeof FormData !== "undefined" ? FormData : class FormData3 {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'FormData' is undefined. ${recommendation}`);
      }
    },
    Blob: typeof Blob !== "undefined" ? Blob : class Blob3 {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'Blob' is undefined. ${recommendation}`);
      }
    },
    File: typeof File !== "undefined" ? File : class File3 {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'File' is undefined. ${recommendation}`);
      }
    },
    ReadableStream: typeof ReadableStream !== "undefined" ? ReadableStream : class ReadableStream3 {
      constructor() {
        throw new Error(`streaming isn't supported in this environment yet as 'ReadableStream' is undefined. ${recommendation}`);
      }
    },
    getMultipartRequestOptions: async (form, opts) => ({
      ...opts,
      body: new MultipartBody(form)
    }),
    getDefaultAgent: (url) => {
      return;
    },
    fileFromPath: () => {
      throw new Error("The `fileFromPath` function is only supported in Node. See the README for more details: https://www.github.com/anthropics/anthropic-sdk-typescript#file-uploads");
    },
    isFsReadStream: (value) => false
  };
}
var init_web_runtime = __esm(() => {
  init_MultipartBody();
});

// node_modules/@anthropic-ai/sdk/_shims/bun-runtime.mjs
import { ReadStream as FsReadStream } from "fs";
function getRuntime2() {
  const runtime = getRuntime();
  function isFsReadStream2(value) {
    return value instanceof FsReadStream;
  }
  return { ...runtime, isFsReadStream: isFsReadStream2 };
}
var init_bun_runtime = __esm(() => {
  init_web_runtime();
});

// node_modules/@anthropic-ai/sdk/_shims/auto/runtime-bun.mjs
var init_runtime_bun = __esm(() => {
  init_bun_runtime();
});

// node_modules/@anthropic-ai/sdk/_shims/index.mjs
var init__shims = __esm(() => {
  init_runtime_bun();
  if (!kind)
    setShims(getRuntime2(), { auto: true });
});

// node_modules/@anthropic-ai/sdk/error.mjs
var AnthropicError, APIError, APIUserAbortError, APIConnectionError, APIConnectionTimeoutError, BadRequestError, AuthenticationError, PermissionDeniedError, NotFoundError, ConflictError, UnprocessableEntityError, RateLimitError, InternalServerError;
var init_error = __esm(() => {
  init_core();
  AnthropicError = class AnthropicError extends Error {
  };
  APIError = class APIError extends AnthropicError {
    constructor(status, error, message, headers) {
      super(`${APIError.makeMessage(status, error, message)}`);
      this.status = status;
      this.headers = headers;
      this.request_id = headers?.["request-id"];
      this.error = error;
    }
    static makeMessage(status, error, message) {
      const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
      if (status && msg) {
        return `${status} ${msg}`;
      }
      if (status) {
        return `${status} status code (no body)`;
      }
      if (msg) {
        return msg;
      }
      return "(no status code or body)";
    }
    static generate(status, errorResponse, message, headers) {
      if (!status) {
        return new APIConnectionError({ message, cause: castToError(errorResponse) });
      }
      const error = errorResponse;
      if (status === 400) {
        return new BadRequestError(status, error, message, headers);
      }
      if (status === 401) {
        return new AuthenticationError(status, error, message, headers);
      }
      if (status === 403) {
        return new PermissionDeniedError(status, error, message, headers);
      }
      if (status === 404) {
        return new NotFoundError(status, error, message, headers);
      }
      if (status === 409) {
        return new ConflictError(status, error, message, headers);
      }
      if (status === 422) {
        return new UnprocessableEntityError(status, error, message, headers);
      }
      if (status === 429) {
        return new RateLimitError(status, error, message, headers);
      }
      if (status >= 500) {
        return new InternalServerError(status, error, message, headers);
      }
      return new APIError(status, error, message, headers);
    }
  };
  APIUserAbortError = class APIUserAbortError extends APIError {
    constructor({ message } = {}) {
      super(undefined, undefined, message || "Request was aborted.", undefined);
      this.status = undefined;
    }
  };
  APIConnectionError = class APIConnectionError extends APIError {
    constructor({ message, cause }) {
      super(undefined, undefined, message || "Connection error.", undefined);
      this.status = undefined;
      if (cause)
        this.cause = cause;
    }
  };
  APIConnectionTimeoutError = class APIConnectionTimeoutError extends APIConnectionError {
    constructor({ message } = {}) {
      super({ message: message ?? "Request timed out." });
    }
  };
  BadRequestError = class BadRequestError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 400;
    }
  };
  AuthenticationError = class AuthenticationError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 401;
    }
  };
  PermissionDeniedError = class PermissionDeniedError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 403;
    }
  };
  NotFoundError = class NotFoundError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 404;
    }
  };
  ConflictError = class ConflictError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 409;
    }
  };
  UnprocessableEntityError = class UnprocessableEntityError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 422;
    }
  };
  RateLimitError = class RateLimitError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 429;
    }
  };
  InternalServerError = class InternalServerError extends APIError {
  };
});

// node_modules/@anthropic-ai/sdk/internal/decoders/line.mjs
class LineDecoder {
  constructor() {
    this.buffer = [];
    this.trailingCR = false;
  }
  decode(chunk) {
    let text = this.decodeText(chunk);
    if (this.trailingCR) {
      text = "\r" + text;
      this.trailingCR = false;
    }
    if (text.endsWith("\r")) {
      this.trailingCR = true;
      text = text.slice(0, -1);
    }
    if (!text) {
      return [];
    }
    const trailingNewline = LineDecoder.NEWLINE_CHARS.has(text[text.length - 1] || "");
    let lines = text.split(LineDecoder.NEWLINE_REGEXP);
    if (trailingNewline) {
      lines.pop();
    }
    if (lines.length === 1 && !trailingNewline) {
      this.buffer.push(lines[0]);
      return [];
    }
    if (this.buffer.length > 0) {
      lines = [this.buffer.join("") + lines[0], ...lines.slice(1)];
      this.buffer = [];
    }
    if (!trailingNewline) {
      this.buffer = [lines.pop() || ""];
    }
    return lines;
  }
  decodeText(bytes) {
    if (bytes == null)
      return "";
    if (typeof bytes === "string")
      return bytes;
    if (typeof Buffer !== "undefined") {
      if (bytes instanceof Buffer) {
        return bytes.toString();
      }
      if (bytes instanceof Uint8Array) {
        return Buffer.from(bytes).toString();
      }
      throw new AnthropicError(`Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`);
    }
    if (typeof TextDecoder !== "undefined") {
      if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
        this.textDecoder ?? (this.textDecoder = new TextDecoder("utf8"));
        return this.textDecoder.decode(bytes);
      }
      throw new AnthropicError(`Unexpected: received non-Uint8Array/ArrayBuffer (${bytes.constructor.name}) in a web platform. Please report this error.`);
    }
    throw new AnthropicError(`Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.`);
  }
  flush() {
    if (!this.buffer.length && !this.trailingCR) {
      return [];
    }
    const lines = [this.buffer.join("")];
    this.buffer = [];
    this.trailingCR = false;
    return lines;
  }
}
var init_line = __esm(() => {
  init_error();
  LineDecoder.NEWLINE_CHARS = new Set([`
`, "\r"]);
  LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
});

// node_modules/@anthropic-ai/sdk/streaming.mjs
async function* _iterSSEMessages(response, controller) {
  if (!response.body) {
    controller.abort();
    throw new AnthropicError(`Attempted to iterate over a response with no body`);
  }
  const sseDecoder = new SSEDecoder;
  const lineDecoder = new LineDecoder;
  const iter = readableStreamAsyncIterable(response.body);
  for await (const sseChunk of iterSSEChunks(iter)) {
    for (const line of lineDecoder.decode(sseChunk)) {
      const sse = sseDecoder.decode(line);
      if (sse)
        yield sse;
    }
  }
  for (const line of lineDecoder.flush()) {
    const sse = sseDecoder.decode(line);
    if (sse)
      yield sse;
  }
}
async function* iterSSEChunks(iterator) {
  let data = new Uint8Array;
  for await (const chunk of iterator) {
    if (chunk == null) {
      continue;
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
    let newData = new Uint8Array(data.length + binaryChunk.length);
    newData.set(data);
    newData.set(binaryChunk, data.length);
    data = newData;
    let patternIndex;
    while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
      yield data.slice(0, patternIndex);
      data = data.slice(patternIndex);
    }
  }
  if (data.length > 0) {
    yield data;
  }
}
function findDoubleNewlineIndex(buffer) {
  const newline = 10;
  const carriage = 13;
  for (let i = 0;i < buffer.length - 2; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
      return i + 4;
    }
  }
  return -1;
}

class SSEDecoder {
  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.substring(0, line.length - 1);
    }
    if (!line) {
      if (!this.event && !this.data.length)
        return null;
      const sse = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      this.event = null;
      this.data = [];
      this.chunks = [];
      return sse;
    }
    this.chunks.push(line);
    if (line.startsWith(":")) {
      return null;
    }
    let [fieldname, _, value] = partition(line, ":");
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldname === "event") {
      this.event = value;
    } else if (fieldname === "data") {
      this.data.push(value);
    }
    return null;
  }
}
function partition(str, delimiter) {
  const index = str.indexOf(delimiter);
  if (index !== -1) {
    return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
  }
  return [str, "", ""];
}
function readableStreamAsyncIterable(stream) {
  if (stream[Symbol.asyncIterator])
    return stream;
  const reader = stream.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result?.done)
          reader.releaseLock();
        return result;
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: undefined };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
var Stream;
var init_streaming = __esm(() => {
  init__shims();
  init_error();
  init_line();
  init_core();
  init_error();
  Stream = class Stream {
    constructor(iterator, controller) {
      this.iterator = iterator;
      this.controller = controller;
    }
    static fromSSEResponse(response, controller) {
      let consumed = false;
      async function* iterator() {
        if (consumed) {
          throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        }
        consumed = true;
        let done = false;
        try {
          for await (const sse of _iterSSEMessages(response, controller)) {
            if (sse.event === "completion") {
              try {
                yield JSON.parse(sse.data);
              } catch (e) {
                console.error(`Could not parse message into JSON:`, sse.data);
                console.error(`From chunk:`, sse.raw);
                throw e;
              }
            }
            if (sse.event === "message_start" || sse.event === "message_delta" || sse.event === "message_stop" || sse.event === "content_block_start" || sse.event === "content_block_delta" || sse.event === "content_block_stop") {
              try {
                yield JSON.parse(sse.data);
              } catch (e) {
                console.error(`Could not parse message into JSON:`, sse.data);
                console.error(`From chunk:`, sse.raw);
                throw e;
              }
            }
            if (sse.event === "ping") {
              continue;
            }
            if (sse.event === "error") {
              throw APIError.generate(undefined, `SSE Error: ${sse.data}`, sse.data, createResponseHeaders(response.headers));
            }
          }
          done = true;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError")
            return;
          throw e;
        } finally {
          if (!done)
            controller.abort();
        }
      }
      return new Stream(iterator, controller);
    }
    static fromReadableStream(readableStream, controller) {
      let consumed = false;
      async function* iterLines() {
        const lineDecoder = new LineDecoder;
        const iter = readableStreamAsyncIterable(readableStream);
        for await (const chunk of iter) {
          for (const line of lineDecoder.decode(chunk)) {
            yield line;
          }
        }
        for (const line of lineDecoder.flush()) {
          yield line;
        }
      }
      async function* iterator() {
        if (consumed) {
          throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        }
        consumed = true;
        let done = false;
        try {
          for await (const line of iterLines()) {
            if (done)
              continue;
            if (line)
              yield JSON.parse(line);
          }
          done = true;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError")
            return;
          throw e;
        } finally {
          if (!done)
            controller.abort();
        }
      }
      return new Stream(iterator, controller);
    }
    [Symbol.asyncIterator]() {
      return this.iterator();
    }
    tee() {
      const left = [];
      const right = [];
      const iterator = this.iterator();
      const teeIterator = (queue) => {
        return {
          next: () => {
            if (queue.length === 0) {
              const result = iterator.next();
              left.push(result);
              right.push(result);
            }
            return queue.shift();
          }
        };
      };
      return [
        new Stream(() => teeIterator(left), this.controller),
        new Stream(() => teeIterator(right), this.controller)
      ];
    }
    toReadableStream() {
      const self = this;
      let iter;
      const encoder = new TextEncoder;
      return new ReadableStream2({
        async start() {
          iter = self[Symbol.asyncIterator]();
        },
        async pull(ctrl) {
          try {
            const { value, done } = await iter.next();
            if (done)
              return ctrl.close();
            const bytes = encoder.encode(JSON.stringify(value) + `
`);
            ctrl.enqueue(bytes);
          } catch (err) {
            ctrl.error(err);
          }
        },
        async cancel() {
          await iter.return?.();
        }
      });
    }
  };
});

// node_modules/@anthropic-ai/sdk/uploads.mjs
async function toFile(value, name, options) {
  value = await value;
  if (isFileLike(value)) {
    return value;
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop() ?? "unknown_file");
    const data = isBlobLike(blob) ? [await blob.arrayBuffer()] : [blob];
    return new File2(data, name, options);
  }
  const bits = await getBytes(value);
  name || (name = getName(value) ?? "unknown_file");
  if (!options?.type) {
    const type = bits[0]?.type;
    if (typeof type === "string") {
      options = { ...options, type };
    }
  }
  return new File2(bits, name, options);
}
async function getBytes(value) {
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(await value.arrayBuffer());
  } else if (isAsyncIterableIterator(value)) {
    for await (const chunk of value) {
      parts.push(chunk);
    }
  } else {
    throw new Error(`Unexpected data type: ${typeof value}; constructor: ${value?.constructor?.name}; props: ${propsForError(value)}`);
  }
  return parts;
}
function propsForError(value) {
  const props = Object.getOwnPropertyNames(value);
  return `[${props.map((p) => `"${p}"`).join(", ")}]`;
}
function getName(value) {
  return getStringFromMaybeBuffer(value.name) || getStringFromMaybeBuffer(value.filename) || getStringFromMaybeBuffer(value.path)?.split(/[\\/]/).pop();
}
var isResponseLike = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function", isFileLike = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value), isBlobLike = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function", getStringFromMaybeBuffer = (x) => {
  if (typeof x === "string")
    return x;
  if (typeof Buffer !== "undefined" && x instanceof Buffer)
    return String(x);
  return;
}, isAsyncIterableIterator = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function", isMultipartBody = (body) => body && typeof body === "object" && body.body && body[Symbol.toStringTag] === "MultipartBody";
var init_uploads = __esm(() => {
  init__shims();
  init__shims();
});

// node_modules/@anthropic-ai/sdk/core.mjs
async function defaultParseResponse(props) {
  const { response } = props;
  if (props.options.stream) {
    debug("response", response.status, response.url, response.headers, response.body);
    if (props.options.__streamClass) {
      return props.options.__streamClass.fromSSEResponse(response, props.controller);
    }
    return Stream.fromSSEResponse(response, props.controller);
  }
  if (response.status === 204) {
    return null;
  }
  if (props.options.__binaryResponse) {
    return response;
  }
  const contentType = response.headers.get("content-type");
  const isJSON = contentType?.includes("application/json") || contentType?.includes("application/vnd.api+json");
  if (isJSON) {
    const json = await response.json();
    debug("response", response.status, response.url, response.headers, json);
    return json;
  }
  const text = await response.text();
  debug("response", response.status, response.url, response.headers, text);
  return text;
}

class APIClient {
  constructor({
    baseURL,
    maxRetries = 2,
    timeout = 600000,
    httpAgent,
    fetch: overridenFetch
  }) {
    this.baseURL = baseURL;
    this.maxRetries = validatePositiveInteger("maxRetries", maxRetries);
    this.timeout = validatePositiveInteger("timeout", timeout);
    this.httpAgent = httpAgent;
    this.fetch = overridenFetch ?? fetch2;
  }
  authHeaders(opts) {
    return {};
  }
  defaultHeaders(opts) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": this.getUserAgent(),
      ...getPlatformHeaders(),
      ...this.authHeaders(opts)
    };
  }
  validateHeaders(headers, customHeaders) {}
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }
  get(path, opts) {
    return this.methodRequest("get", path, opts);
  }
  post(path, opts) {
    return this.methodRequest("post", path, opts);
  }
  patch(path, opts) {
    return this.methodRequest("patch", path, opts);
  }
  put(path, opts) {
    return this.methodRequest("put", path, opts);
  }
  delete(path, opts) {
    return this.methodRequest("delete", path, opts);
  }
  methodRequest(method, path, opts) {
    return this.request(Promise.resolve(opts).then(async (opts2) => {
      const body = opts2 && isBlobLike(opts2?.body) ? new DataView(await opts2.body.arrayBuffer()) : opts2?.body instanceof DataView ? opts2.body : opts2?.body instanceof ArrayBuffer ? new DataView(opts2.body) : opts2 && ArrayBuffer.isView(opts2?.body) ? new DataView(opts2.body.buffer) : opts2?.body;
      return { method, path, ...opts2, body };
    }));
  }
  getAPIList(path, Page, opts) {
    return this.requestAPIList(Page, { method: "get", path, ...opts });
  }
  calculateContentLength(body) {
    if (typeof body === "string") {
      if (typeof Buffer !== "undefined") {
        return Buffer.byteLength(body, "utf8").toString();
      }
      if (typeof TextEncoder !== "undefined") {
        const encoder = new TextEncoder;
        const encoded = encoder.encode(body);
        return encoded.length.toString();
      }
    } else if (ArrayBuffer.isView(body)) {
      return body.byteLength.toString();
    }
    return null;
  }
  buildRequest(options, { retryCount = 0 } = {}) {
    const { method, path, query, headers = {} } = options;
    const body = ArrayBuffer.isView(options.body) || options.__binaryRequest && typeof options.body === "string" ? options.body : isMultipartBody(options.body) ? options.body.body : options.body ? JSON.stringify(options.body, null, 2) : null;
    const contentLength = this.calculateContentLength(body);
    const url = this.buildURL(path, query);
    if ("timeout" in options)
      validatePositiveInteger("timeout", options.timeout);
    const timeout = options.timeout ?? this.timeout;
    const httpAgent = options.httpAgent ?? this.httpAgent ?? getDefaultAgent(url);
    const minAgentTimeout = timeout + 1000;
    if (typeof httpAgent?.options?.timeout === "number" && minAgentTimeout > (httpAgent.options.timeout ?? 0)) {
      httpAgent.options.timeout = minAgentTimeout;
    }
    if (this.idempotencyHeader && method !== "get") {
      if (!options.idempotencyKey)
        options.idempotencyKey = this.defaultIdempotencyKey();
      headers[this.idempotencyHeader] = options.idempotencyKey;
    }
    const reqHeaders = this.buildHeaders({ options, headers, contentLength, retryCount });
    const req = {
      method,
      ...body && { body },
      headers: reqHeaders,
      ...httpAgent && { agent: httpAgent },
      signal: options.signal ?? null
    };
    return { req, url, timeout };
  }
  buildHeaders({ options, headers, contentLength, retryCount }) {
    const reqHeaders = {};
    if (contentLength) {
      reqHeaders["content-length"] = contentLength;
    }
    const defaultHeaders = this.defaultHeaders(options);
    applyHeadersMut(reqHeaders, defaultHeaders);
    applyHeadersMut(reqHeaders, headers);
    if (isMultipartBody(options.body) && kind !== "node") {
      delete reqHeaders["content-type"];
    }
    if (getHeader(defaultHeaders, "x-stainless-retry-count") === undefined && getHeader(headers, "x-stainless-retry-count") === undefined) {
      reqHeaders["x-stainless-retry-count"] = String(retryCount);
    }
    this.validateHeaders(reqHeaders, headers);
    return reqHeaders;
  }
  async prepareOptions(options) {}
  async prepareRequest(request, { url, options }) {}
  parseHeaders(headers) {
    return !headers ? {} : (Symbol.iterator in headers) ? Object.fromEntries(Array.from(headers).map((header) => [...header])) : { ...headers };
  }
  makeStatusError(status, error, message, headers) {
    return APIError.generate(status, error, message, headers);
  }
  request(options, remainingRetries = null) {
    return new APIPromise(this.makeRequest(options, remainingRetries));
  }
  async makeRequest(optionsInput, retriesRemaining) {
    const options = await optionsInput;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }
    await this.prepareOptions(options);
    const { req, url, timeout } = this.buildRequest(options, { retryCount: maxRetries - retriesRemaining });
    await this.prepareRequest(req, { url, options });
    debug("request", url, options, req.headers);
    if (options.signal?.aborted) {
      throw new APIUserAbortError;
    }
    const controller = new AbortController;
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    if (response instanceof Error) {
      if (options.signal?.aborted) {
        throw new APIUserAbortError;
      }
      if (retriesRemaining) {
        return this.retryRequest(options, retriesRemaining);
      }
      if (response.name === "AbortError") {
        throw new APIConnectionTimeoutError;
      }
      throw new APIConnectionError({ cause: response });
    }
    const responseHeaders = createResponseHeaders(response.headers);
    if (!response.ok) {
      if (retriesRemaining && this.shouldRetry(response)) {
        const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
        debug(`response (error; ${retryMessage2})`, response.status, url, responseHeaders);
        return this.retryRequest(options, retriesRemaining, responseHeaders);
      }
      const errText = await response.text().catch((e) => castToError(e).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? undefined : errText;
      const retryMessage = retriesRemaining ? `(error; no more retries left)` : `(error; not retryable)`;
      debug(`response (error; ${retryMessage})`, response.status, url, responseHeaders, errMessage);
      const err = this.makeStatusError(response.status, errJSON, errMessage, responseHeaders);
      throw err;
    }
    return { response, options, controller };
  }
  requestAPIList(Page, options) {
    const request = this.makeRequest(options, null);
    return new PagePromise(this, request, Page);
  }
  buildURL(path, query) {
    const url = isAbsoluteURL(path) ? new URL(path) : new URL(this.baseURL + (this.baseURL.endsWith("/") && path.startsWith("/") ? path.slice(1) : path));
    const defaultQuery = this.defaultQuery();
    if (!isEmptyObj(defaultQuery)) {
      query = { ...defaultQuery, ...query };
    }
    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  stringifyQuery(query) {
    return Object.entries(query).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
      if (value === null) {
        return `${encodeURIComponent(key)}=`;
      }
      throw new AnthropicError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
    }).join("&");
  }
  async fetchWithTimeout(url, init, ms, controller) {
    const { signal, ...options } = init || {};
    if (signal)
      signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    return this.getRequestClient().fetch.call(undefined, url, { signal: controller.signal, ...options }).finally(() => {
      clearTimeout(timeout);
    });
  }
  getRequestClient() {
    return { fetch: this.fetch };
  }
  shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options, retriesRemaining, responseHeaders) {
    let timeoutMillis;
    const retryAfterMillisHeader = responseHeaders?.["retry-after-ms"];
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }
    const retryAfterHeader = responseHeaders?.["retry-after"];
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1000;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1000)) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep(timeoutMillis);
    return this.makeRequest(options, retriesRemaining - 1);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1000;
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION}`;
  }
}
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match = pattern.exec(navigator.userAgent);
    if (match) {
      const major = match[1] || 0;
      const minor = match[2] || 0;
      const patch = match[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function applyHeadersMut(targetHeaders, newHeaders) {
  for (const k in newHeaders) {
    if (!hasOwn(newHeaders, k))
      continue;
    const lowerKey = k.toLowerCase();
    if (!lowerKey)
      continue;
    const val = newHeaders[k];
    if (val === null) {
      delete targetHeaders[lowerKey];
    } else if (val !== undefined) {
      targetHeaders[lowerKey] = val;
    }
  }
}
function debug(action, ...args) {
  if (typeof process !== "undefined" && process?.env?.["DEBUG"] === "true") {
    console.log(`Anthropic:DEBUG:${action}`, ...args);
  }
}
var __classPrivateFieldSet = function(receiver, state, value, kind2, f) {
  if (kind2 === "m")
    throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, __classPrivateFieldGet = function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, _AbstractPage_client, APIPromise, AbstractPage, PagePromise, createResponseHeaders = (headers) => {
  return new Proxy(Object.fromEntries(headers.entries()), {
    get(target, name) {
      const key = name.toString();
      return target[key.toLowerCase()] || target[key];
    }
  });
}, requestOptionsKeys, isRequestOptions = (obj) => {
  return typeof obj === "object" && obj !== null && !isEmptyObj(obj) && Object.keys(obj).every((k) => hasOwn(requestOptionsKeys, k));
}, getPlatformProperties = () => {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(Deno.build.os),
      "X-Stainless-Arch": normalizeArch(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(process.platform),
      "X-Stainless-Arch": normalizeArch(process.arch),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  const browserInfo = getBrowserInfo();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
}, normalizeArch = (arch) => {
  if (arch === "x32")
    return "x32";
  if (arch === "x86_64" || arch === "x64")
    return "x64";
  if (arch === "arm")
    return "arm";
  if (arch === "aarch64" || arch === "arm64")
    return "arm64";
  if (arch)
    return `other:${arch}`;
  return "unknown";
}, normalizePlatform = (platform) => {
  platform = platform.toLowerCase();
  if (platform.includes("ios"))
    return "iOS";
  if (platform === "android")
    return "Android";
  if (platform === "darwin")
    return "MacOS";
  if (platform === "win32")
    return "Windows";
  if (platform === "freebsd")
    return "FreeBSD";
  if (platform === "openbsd")
    return "OpenBSD";
  if (platform === "linux")
    return "Linux";
  if (platform)
    return `Other:${platform}`;
  return "Unknown";
}, _platformHeaders, getPlatformHeaders = () => {
  return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
}, safeJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return;
  }
}, startsWithSchemeRegexp, isAbsoluteURL = (url) => {
  return startsWithSchemeRegexp.test(url);
}, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), validatePositiveInteger = (name, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new AnthropicError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new AnthropicError(`${name} must be a positive integer`);
  }
  return n;
}, castToError = (err) => {
  if (err instanceof Error)
    return err;
  if (typeof err === "object" && err !== null) {
    try {
      return new Error(JSON.stringify(err));
    } catch {}
  }
  return new Error(String(err));
}, readEnv = (env) => {
  if (typeof process !== "undefined") {
    return process.env?.[env]?.trim() ?? undefined;
  }
  if (typeof Deno !== "undefined") {
    return Deno.env?.get?.(env)?.trim();
  }
  return;
}, uuid4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}, isRunningInBrowser = () => {
  return typeof window !== "undefined" && typeof window.document !== "undefined" && typeof navigator !== "undefined";
}, isHeadersProtocol = (headers) => {
  return typeof headers?.get === "function";
}, getHeader = (headers, header) => {
  const lowerCasedHeader = header.toLowerCase();
  if (isHeadersProtocol(headers)) {
    const intercapsHeader = header[0]?.toUpperCase() + header.substring(1).replace(/([^\w])(\w)/g, (_m, g1, g2) => g1 + g2.toUpperCase());
    for (const key of [header, lowerCasedHeader, header.toUpperCase(), intercapsHeader]) {
      const value = headers.get(key);
      if (value) {
        return value;
      }
    }
  }
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lowerCasedHeader) {
      if (Array.isArray(value)) {
        if (value.length <= 1)
          return value[0];
        console.warn(`Received ${value.length} entries for the ${header} header, using the first entry.`);
        return value[0];
      }
      return value;
    }
  }
  return;
};
var init_core = __esm(() => {
  init_streaming();
  init_error();
  init__shims();
  init_uploads();
  APIPromise = class APIPromise extends Promise {
    constructor(responsePromise, parseResponse = defaultParseResponse) {
      super((resolve) => {
        resolve(null);
      });
      this.responsePromise = responsePromise;
      this.parseResponse = parseResponse;
    }
    _thenUnwrap(transform) {
      return new APIPromise(this.responsePromise, async (props) => transform(await this.parseResponse(props), props));
    }
    asResponse() {
      return this.responsePromise.then((p) => p.response);
    }
    async withResponse() {
      const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
      return { data, response };
    }
    parse() {
      if (!this.parsedPromise) {
        this.parsedPromise = this.responsePromise.then(this.parseResponse);
      }
      return this.parsedPromise;
    }
    then(onfulfilled, onrejected) {
      return this.parse().then(onfulfilled, onrejected);
    }
    catch(onrejected) {
      return this.parse().catch(onrejected);
    }
    finally(onfinally) {
      return this.parse().finally(onfinally);
    }
  };
  AbstractPage = class AbstractPage {
    constructor(client, response, body, options) {
      _AbstractPage_client.set(this, undefined);
      __classPrivateFieldSet(this, _AbstractPage_client, client, "f");
      this.options = options;
      this.response = response;
      this.body = body;
    }
    hasNextPage() {
      const items = this.getPaginatedItems();
      if (!items.length)
        return false;
      return this.nextPageInfo() != null;
    }
    async getNextPage() {
      const nextInfo = this.nextPageInfo();
      if (!nextInfo) {
        throw new AnthropicError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
      }
      const nextOptions = { ...this.options };
      if ("params" in nextInfo && typeof nextOptions.query === "object") {
        nextOptions.query = { ...nextOptions.query, ...nextInfo.params };
      } else if ("url" in nextInfo) {
        const params = [...Object.entries(nextOptions.query || {}), ...nextInfo.url.searchParams.entries()];
        for (const [key, value] of params) {
          nextInfo.url.searchParams.set(key, value);
        }
        nextOptions.query = undefined;
        nextOptions.path = nextInfo.url.toString();
      }
      return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
    }
    async* iterPages() {
      let page = this;
      yield page;
      while (page.hasNextPage()) {
        page = await page.getNextPage();
        yield page;
      }
    }
    async* [(_AbstractPage_client = new WeakMap, Symbol.asyncIterator)]() {
      for await (const page of this.iterPages()) {
        for (const item of page.getPaginatedItems()) {
          yield item;
        }
      }
    }
  };
  PagePromise = class PagePromise extends APIPromise {
    constructor(client, request, Page) {
      super(request, async (props) => new Page(client, props.response, await defaultParseResponse(props), props.options));
    }
    async* [Symbol.asyncIterator]() {
      const page = await this;
      for await (const item of page) {
        yield item;
      }
    }
  };
  requestOptionsKeys = {
    method: true,
    path: true,
    query: true,
    body: true,
    headers: true,
    maxRetries: true,
    stream: true,
    timeout: true,
    httpAgent: true,
    signal: true,
    idempotencyKey: true,
    __binaryRequest: true,
    __binaryResponse: true,
    __streamClass: true
  };
  startsWithSchemeRegexp = new RegExp("^(?:[a-z]+:)?//", "i");
});

// node_modules/@anthropic-ai/sdk/pagination.mjs
var Page;
var init_pagination = __esm(() => {
  init_core();
  Page = class Page extends AbstractPage {
    constructor(client, response, body, options) {
      super(client, response, body, options);
      this.data = body.data || [];
      this.has_more = body.has_more || false;
      this.first_id = body.first_id || null;
      this.last_id = body.last_id || null;
    }
    getPaginatedItems() {
      return this.data ?? [];
    }
    nextPageParams() {
      const info = this.nextPageInfo();
      if (!info)
        return null;
      if ("params" in info)
        return info.params;
      const params = Object.fromEntries(info.url.searchParams);
      if (!Object.keys(params).length)
        return null;
      return params;
    }
    nextPageInfo() {
      if (this.options.query?.["before_id"]) {
        const firstId = this.first_id;
        if (!firstId) {
          return null;
        }
        return {
          params: {
            before_id: firstId
          }
        };
      }
      const cursor = this.last_id;
      if (!cursor) {
        return null;
      }
      return {
        params: {
          after_id: cursor
        }
      };
    }
  };
});

// node_modules/@anthropic-ai/sdk/resource.mjs
class APIResource {
  constructor(client) {
    this._client = client;
  }
}

// node_modules/@anthropic-ai/sdk/internal/decoders/jsonl.mjs
var JSONLDecoder;
var init_jsonl = __esm(() => {
  init_error();
  init_streaming();
  init_line();
  JSONLDecoder = class JSONLDecoder {
    constructor(iterator, controller) {
      this.iterator = iterator;
      this.controller = controller;
    }
    async* decoder() {
      const lineDecoder = new LineDecoder;
      for await (const chunk of this.iterator) {
        for (const line of lineDecoder.decode(chunk)) {
          yield JSON.parse(line);
        }
      }
      for (const line of lineDecoder.flush()) {
        yield JSON.parse(line);
      }
    }
    [Symbol.asyncIterator]() {
      return this.decoder();
    }
    static fromResponse(response, controller) {
      if (!response.body) {
        controller.abort();
        throw new AnthropicError(`Attempted to iterate over a response with no body`);
      }
      return new JSONLDecoder(readableStreamAsyncIterable(response.body), controller);
    }
  };
});

// node_modules/@anthropic-ai/sdk/resources/beta/messages/batches.mjs
var Batches, BetaMessageBatchesPage;
var init_batches = __esm(() => {
  init_core();
  init_pagination();
  init_jsonl();
  init_error();
  Batches = class Batches extends APIResource {
    create(params, options) {
      const { betas, ...body } = params;
      return this._client.post("/v1/messages/batches?beta=true", {
        body,
        ...options,
        headers: {
          "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString(),
          ...options?.headers
        }
      });
    }
    retrieve(messageBatchId, params = {}, options) {
      if (isRequestOptions(params)) {
        return this.retrieve(messageBatchId, {}, params);
      }
      const { betas } = params;
      return this._client.get(`/v1/messages/batches/${messageBatchId}?beta=true`, {
        ...options,
        headers: {
          "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString(),
          ...options?.headers
        }
      });
    }
    list(params = {}, options) {
      if (isRequestOptions(params)) {
        return this.list({}, params);
      }
      const { betas, ...query } = params;
      return this._client.getAPIList("/v1/messages/batches?beta=true", BetaMessageBatchesPage, {
        query,
        ...options,
        headers: {
          "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString(),
          ...options?.headers
        }
      });
    }
    cancel(messageBatchId, params = {}, options) {
      if (isRequestOptions(params)) {
        return this.cancel(messageBatchId, {}, params);
      }
      const { betas } = params;
      return this._client.post(`/v1/messages/batches/${messageBatchId}/cancel?beta=true`, {
        ...options,
        headers: {
          "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString(),
          ...options?.headers
        }
      });
    }
    async results(messageBatchId, params = {}, options) {
      if (isRequestOptions(params)) {
        return this.results(messageBatchId, {}, params);
      }
      const batch = await this.retrieve(messageBatchId);
      if (!batch.results_url) {
        throw new AnthropicError(`No batch \`results_url\`; Has it finished processing? ${batch.processing_status} - ${batch.id}`);
      }
      const { betas } = params;
      return this._client.get(batch.results_url, {
        ...options,
        headers: {
          "anthropic-beta": [...betas ?? [], "message-batches-2024-09-24"].toString(),
          ...options?.headers
        },
        __binaryResponse: true
      })._thenUnwrap((_, props) => JSONLDecoder.fromResponse(props.response, props.controller));
    }
  };
  BetaMessageBatchesPage = class BetaMessageBatchesPage extends Page {
  };
  Batches.BetaMessageBatchesPage = BetaMessageBatchesPage;
});

// node_modules/@anthropic-ai/sdk/resources/beta/messages/messages.mjs
var Messages;
var init_messages = __esm(() => {
  init_batches();
  init_batches();
  Messages = class Messages extends APIResource {
    constructor() {
      super(...arguments);
      this.batches = new Batches(this._client);
    }
    create(params, options) {
      const { betas, ...body } = params;
      return this._client.post("/v1/messages?beta=true", {
        body,
        timeout: this._client._options.timeout ?? 600000,
        ...options,
        headers: {
          ...betas?.toString() != null ? { "anthropic-beta": betas?.toString() } : undefined,
          ...options?.headers
        },
        stream: params.stream ?? false
      });
    }
    countTokens(params, options) {
      const { betas, ...body } = params;
      return this._client.post("/v1/messages/count_tokens?beta=true", {
        body,
        ...options,
        headers: {
          "anthropic-beta": [...betas ?? [], "token-counting-2024-11-01"].toString(),
          ...options?.headers
        }
      });
    }
  };
  Messages.Batches = Batches;
  Messages.BetaMessageBatchesPage = BetaMessageBatchesPage;
});

// node_modules/@anthropic-ai/sdk/_vendor/partial-json-parser/parser.mjs
var tokenize = (input) => {
  let current = 0;
  let tokens = [];
  while (current < input.length) {
    let char = input[current];
    if (char === "\\") {
      current++;
      continue;
    }
    if (char === "{") {
      tokens.push({
        type: "brace",
        value: "{"
      });
      current++;
      continue;
    }
    if (char === "}") {
      tokens.push({
        type: "brace",
        value: "}"
      });
      current++;
      continue;
    }
    if (char === "[") {
      tokens.push({
        type: "paren",
        value: "["
      });
      current++;
      continue;
    }
    if (char === "]") {
      tokens.push({
        type: "paren",
        value: "]"
      });
      current++;
      continue;
    }
    if (char === ":") {
      tokens.push({
        type: "separator",
        value: ":"
      });
      current++;
      continue;
    }
    if (char === ",") {
      tokens.push({
        type: "delimiter",
        value: ","
      });
      current++;
      continue;
    }
    if (char === '"') {
      let value = "";
      let danglingQuote = false;
      char = input[++current];
      while (char !== '"') {
        if (current === input.length) {
          danglingQuote = true;
          break;
        }
        if (char === "\\") {
          current++;
          if (current === input.length) {
            danglingQuote = true;
            break;
          }
          value += char + input[current];
          char = input[++current];
        } else {
          value += char;
          char = input[++current];
        }
      }
      char = input[++current];
      if (!danglingQuote) {
        tokens.push({
          type: "string",
          value
        });
      }
      continue;
    }
    let WHITESPACE = /\s/;
    if (char && WHITESPACE.test(char)) {
      current++;
      continue;
    }
    let NUMBERS = /[0-9]/;
    if (char && NUMBERS.test(char) || char === "-" || char === ".") {
      let value = "";
      if (char === "-") {
        value += char;
        char = input[++current];
      }
      while (char && NUMBERS.test(char) || char === ".") {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: "number",
        value
      });
      continue;
    }
    let LETTERS = /[a-z]/i;
    if (char && LETTERS.test(char)) {
      let value = "";
      while (char && LETTERS.test(char)) {
        if (current === input.length) {
          break;
        }
        value += char;
        char = input[++current];
      }
      if (value == "true" || value == "false" || value === "null") {
        tokens.push({
          type: "name",
          value
        });
      } else {
        current++;
        continue;
      }
      continue;
    }
    current++;
  }
  return tokens;
}, strip = (tokens) => {
  if (tokens.length === 0) {
    return tokens;
  }
  let lastToken = tokens[tokens.length - 1];
  switch (lastToken.type) {
    case "separator":
      tokens = tokens.slice(0, tokens.length - 1);
      return strip(tokens);
      break;
    case "number":
      let lastCharacterOfLastToken = lastToken.value[lastToken.value.length - 1];
      if (lastCharacterOfLastToken === "." || lastCharacterOfLastToken === "-") {
        tokens = tokens.slice(0, tokens.length - 1);
        return strip(tokens);
      }
    case "string":
      let tokenBeforeTheLastToken = tokens[tokens.length - 2];
      if (tokenBeforeTheLastToken?.type === "delimiter") {
        tokens = tokens.slice(0, tokens.length - 1);
        return strip(tokens);
      } else if (tokenBeforeTheLastToken?.type === "brace" && tokenBeforeTheLastToken.value === "{") {
        tokens = tokens.slice(0, tokens.length - 1);
        return strip(tokens);
      }
      break;
    case "delimiter":
      tokens = tokens.slice(0, tokens.length - 1);
      return strip(tokens);
      break;
  }
  return tokens;
}, unstrip = (tokens) => {
  let tail = [];
  tokens.map((token) => {
    if (token.type === "brace") {
      if (token.value === "{") {
        tail.push("}");
      } else {
        tail.splice(tail.lastIndexOf("}"), 1);
      }
    }
    if (token.type === "paren") {
      if (token.value === "[") {
        tail.push("]");
      } else {
        tail.splice(tail.lastIndexOf("]"), 1);
      }
    }
  });
  if (tail.length > 0) {
    tail.reverse().map((item) => {
      if (item === "}") {
        tokens.push({
          type: "brace",
          value: "}"
        });
      } else if (item === "]") {
        tokens.push({
          type: "paren",
          value: "]"
        });
      }
    });
  }
  return tokens;
}, generate = (tokens) => {
  let output = "";
  tokens.map((token) => {
    switch (token.type) {
      case "string":
        output += '"' + token.value + '"';
        break;
      default:
        output += token.value;
        break;
    }
  });
  return output;
}, partialParse = (input) => JSON.parse(generate(unstrip(strip(tokenize(input)))));
var init_parser = () => {};

// node_modules/@anthropic-ai/sdk/lib/PromptCachingBetaMessageStream.mjs
var __classPrivateFieldSet2 = function(receiver, state, value, kind2, f) {
  if (kind2 === "m")
    throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, __classPrivateFieldGet2 = function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, _PromptCachingBetaMessageStream_instances, _PromptCachingBetaMessageStream_currentMessageSnapshot, _PromptCachingBetaMessageStream_connectedPromise, _PromptCachingBetaMessageStream_resolveConnectedPromise, _PromptCachingBetaMessageStream_rejectConnectedPromise, _PromptCachingBetaMessageStream_endPromise, _PromptCachingBetaMessageStream_resolveEndPromise, _PromptCachingBetaMessageStream_rejectEndPromise, _PromptCachingBetaMessageStream_listeners, _PromptCachingBetaMessageStream_ended, _PromptCachingBetaMessageStream_errored, _PromptCachingBetaMessageStream_aborted, _PromptCachingBetaMessageStream_catchingPromiseCreated, _PromptCachingBetaMessageStream_getFinalMessage, _PromptCachingBetaMessageStream_getFinalText, _PromptCachingBetaMessageStream_handleError, _PromptCachingBetaMessageStream_beginRequest, _PromptCachingBetaMessageStream_addStreamEvent, _PromptCachingBetaMessageStream_endRequest, _PromptCachingBetaMessageStream_accumulateMessage, JSON_BUF_PROPERTY = "__json_buf", PromptCachingBetaMessageStream;
var init_PromptCachingBetaMessageStream = __esm(() => {
  init_error();
  init_streaming();
  init_parser();
  PromptCachingBetaMessageStream = class PromptCachingBetaMessageStream {
    constructor() {
      _PromptCachingBetaMessageStream_instances.add(this);
      this.messages = [];
      this.receivedMessages = [];
      _PromptCachingBetaMessageStream_currentMessageSnapshot.set(this, undefined);
      this.controller = new AbortController;
      _PromptCachingBetaMessageStream_connectedPromise.set(this, undefined);
      _PromptCachingBetaMessageStream_resolveConnectedPromise.set(this, () => {});
      _PromptCachingBetaMessageStream_rejectConnectedPromise.set(this, () => {});
      _PromptCachingBetaMessageStream_endPromise.set(this, undefined);
      _PromptCachingBetaMessageStream_resolveEndPromise.set(this, () => {});
      _PromptCachingBetaMessageStream_rejectEndPromise.set(this, () => {});
      _PromptCachingBetaMessageStream_listeners.set(this, {});
      _PromptCachingBetaMessageStream_ended.set(this, false);
      _PromptCachingBetaMessageStream_errored.set(this, false);
      _PromptCachingBetaMessageStream_aborted.set(this, false);
      _PromptCachingBetaMessageStream_catchingPromiseCreated.set(this, false);
      _PromptCachingBetaMessageStream_handleError.set(this, (error) => {
        __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_errored, true, "f");
        if (error instanceof Error && error.name === "AbortError") {
          error = new APIUserAbortError;
        }
        if (error instanceof APIUserAbortError) {
          __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_aborted, true, "f");
          return this._emit("abort", error);
        }
        if (error instanceof AnthropicError) {
          return this._emit("error", error);
        }
        if (error instanceof Error) {
          const anthropicError = new AnthropicError(error.message);
          anthropicError.cause = error;
          return this._emit("error", anthropicError);
        }
        return this._emit("error", new AnthropicError(String(error)));
      });
      __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_connectedPromise, new Promise((resolve, reject) => {
        __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_resolveConnectedPromise, resolve, "f");
        __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_rejectConnectedPromise, reject, "f");
      }), "f");
      __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_endPromise, new Promise((resolve, reject) => {
        __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_resolveEndPromise, resolve, "f");
        __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_rejectEndPromise, reject, "f");
      }), "f");
      __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_connectedPromise, "f").catch(() => {});
      __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_endPromise, "f").catch(() => {});
    }
    static fromReadableStream(stream) {
      const runner = new PromptCachingBetaMessageStream;
      runner._run(() => runner._fromReadableStream(stream));
      return runner;
    }
    static createMessage(messages, params, options) {
      const runner = new PromptCachingBetaMessageStream;
      for (const message of params.messages) {
        runner._addPromptCachingBetaMessageParam(message);
      }
      runner._run(() => runner._createPromptCachingBetaMessage(messages, { ...params, stream: true }, { ...options, headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" } }));
      return runner;
    }
    _run(executor) {
      executor().then(() => {
        this._emitFinal();
        this._emit("end");
      }, __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_handleError, "f"));
    }
    _addPromptCachingBetaMessageParam(message) {
      this.messages.push(message);
    }
    _addPromptCachingBetaMessage(message, emit = true) {
      this.receivedMessages.push(message);
      if (emit) {
        this._emit("message", message);
      }
    }
    async _createPromptCachingBetaMessage(messages, params, options) {
      const signal = options?.signal;
      if (signal) {
        if (signal.aborted)
          this.controller.abort();
        signal.addEventListener("abort", () => this.controller.abort());
      }
      __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_instances, "m", _PromptCachingBetaMessageStream_beginRequest).call(this);
      const stream = await messages.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
      this._connected();
      for await (const event of stream) {
        __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_instances, "m", _PromptCachingBetaMessageStream_addStreamEvent).call(this, event);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError;
      }
      __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_instances, "m", _PromptCachingBetaMessageStream_endRequest).call(this);
    }
    _connected() {
      if (this.ended)
        return;
      __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_resolveConnectedPromise, "f").call(this);
      this._emit("connect");
    }
    get ended() {
      return __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_ended, "f");
    }
    get errored() {
      return __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_errored, "f");
    }
    get aborted() {
      return __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_aborted, "f");
    }
    abort() {
      this.controller.abort();
    }
    on(event, listener) {
      const listeners = __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_listeners, "f")[event] || (__classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_listeners, "f")[event] = []);
      listeners.push({ listener });
      return this;
    }
    off(event, listener) {
      const listeners = __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_listeners, "f")[event];
      if (!listeners)
        return this;
      const index = listeners.findIndex((l) => l.listener === listener);
      if (index >= 0)
        listeners.splice(index, 1);
      return this;
    }
    once(event, listener) {
      const listeners = __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_listeners, "f")[event] || (__classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_listeners, "f")[event] = []);
      listeners.push({ listener, once: true });
      return this;
    }
    emitted(event) {
      return new Promise((resolve, reject) => {
        __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_catchingPromiseCreated, true, "f");
        if (event !== "error")
          this.once("error", reject);
        this.once(event, resolve);
      });
    }
    async done() {
      __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_catchingPromiseCreated, true, "f");
      await __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_endPromise, "f");
    }
    get currentMessage() {
      return __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_currentMessageSnapshot, "f");
    }
    async finalMessage() {
      await this.done();
      return __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_instances, "m", _PromptCachingBetaMessageStream_getFinalMessage).call(this);
    }
    async finalText() {
      await this.done();
      return __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_instances, "m", _PromptCachingBetaMessageStream_getFinalText).call(this);
    }
    _emit(event, ...args) {
      if (__classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_ended, "f"))
        return;
      if (event === "end") {
        __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_ended, true, "f");
        __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_resolveEndPromise, "f").call(this);
      }
      const listeners = __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_listeners, "f")[event];
      if (listeners) {
        __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
        listeners.forEach(({ listener }) => listener(...args));
      }
      if (event === "abort") {
        const error = args[0];
        if (!__classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
          Promise.reject(error);
        }
        __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_rejectConnectedPromise, "f").call(this, error);
        __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_rejectEndPromise, "f").call(this, error);
        this._emit("end");
        return;
      }
      if (event === "error") {
        const error = args[0];
        if (!__classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
          Promise.reject(error);
        }
        __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_rejectConnectedPromise, "f").call(this, error);
        __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_rejectEndPromise, "f").call(this, error);
        this._emit("end");
      }
    }
    _emitFinal() {
      const finalPromptCachingBetaMessage = this.receivedMessages.at(-1);
      if (finalPromptCachingBetaMessage) {
        this._emit("finalPromptCachingBetaMessage", __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_instances, "m", _PromptCachingBetaMessageStream_getFinalMessage).call(this));
      }
    }
    async _fromReadableStream(readableStream, options) {
      const signal = options?.signal;
      if (signal) {
        if (signal.aborted)
          this.controller.abort();
        signal.addEventListener("abort", () => this.controller.abort());
      }
      __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_instances, "m", _PromptCachingBetaMessageStream_beginRequest).call(this);
      this._connected();
      const stream = Stream.fromReadableStream(readableStream, this.controller);
      for await (const event of stream) {
        __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_instances, "m", _PromptCachingBetaMessageStream_addStreamEvent).call(this, event);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError;
      }
      __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_instances, "m", _PromptCachingBetaMessageStream_endRequest).call(this);
    }
    [(_PromptCachingBetaMessageStream_currentMessageSnapshot = new WeakMap, _PromptCachingBetaMessageStream_connectedPromise = new WeakMap, _PromptCachingBetaMessageStream_resolveConnectedPromise = new WeakMap, _PromptCachingBetaMessageStream_rejectConnectedPromise = new WeakMap, _PromptCachingBetaMessageStream_endPromise = new WeakMap, _PromptCachingBetaMessageStream_resolveEndPromise = new WeakMap, _PromptCachingBetaMessageStream_rejectEndPromise = new WeakMap, _PromptCachingBetaMessageStream_listeners = new WeakMap, _PromptCachingBetaMessageStream_ended = new WeakMap, _PromptCachingBetaMessageStream_errored = new WeakMap, _PromptCachingBetaMessageStream_aborted = new WeakMap, _PromptCachingBetaMessageStream_catchingPromiseCreated = new WeakMap, _PromptCachingBetaMessageStream_handleError = new WeakMap, _PromptCachingBetaMessageStream_instances = new WeakSet, _PromptCachingBetaMessageStream_getFinalMessage = function _PromptCachingBetaMessageStream_getFinalMessage2() {
      if (this.receivedMessages.length === 0) {
        throw new AnthropicError("stream ended without producing a PromptCachingBetaMessage with role=assistant");
      }
      return this.receivedMessages.at(-1);
    }, _PromptCachingBetaMessageStream_getFinalText = function _PromptCachingBetaMessageStream_getFinalText2() {
      if (this.receivedMessages.length === 0) {
        throw new AnthropicError("stream ended without producing a PromptCachingBetaMessage with role=assistant");
      }
      const textBlocks = this.receivedMessages.at(-1).content.filter((block) => block.type === "text").map((block) => block.text);
      if (textBlocks.length === 0) {
        throw new AnthropicError("stream ended without producing a content block with type=text");
      }
      return textBlocks.join(" ");
    }, _PromptCachingBetaMessageStream_beginRequest = function _PromptCachingBetaMessageStream_beginRequest2() {
      if (this.ended)
        return;
      __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_currentMessageSnapshot, undefined, "f");
    }, _PromptCachingBetaMessageStream_addStreamEvent = function _PromptCachingBetaMessageStream_addStreamEvent2(event) {
      if (this.ended)
        return;
      const messageSnapshot = __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_instances, "m", _PromptCachingBetaMessageStream_accumulateMessage).call(this, event);
      this._emit("streamEvent", event, messageSnapshot);
      switch (event.type) {
        case "content_block_delta": {
          const content = messageSnapshot.content.at(-1);
          if (event.delta.type === "text_delta" && content.type === "text") {
            this._emit("text", event.delta.text, content.text || "");
          } else if (event.delta.type === "input_json_delta" && content.type === "tool_use") {
            if (content.input) {
              this._emit("inputJson", event.delta.partial_json, content.input);
            }
          }
          break;
        }
        case "message_stop": {
          this._addPromptCachingBetaMessageParam(messageSnapshot);
          this._addPromptCachingBetaMessage(messageSnapshot, true);
          break;
        }
        case "content_block_stop": {
          this._emit("contentBlock", messageSnapshot.content.at(-1));
          break;
        }
        case "message_start": {
          __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_currentMessageSnapshot, messageSnapshot, "f");
          break;
        }
        case "content_block_start":
        case "message_delta":
          break;
      }
    }, _PromptCachingBetaMessageStream_endRequest = function _PromptCachingBetaMessageStream_endRequest2() {
      if (this.ended) {
        throw new AnthropicError(`stream has ended, this shouldn't happen`);
      }
      const snapshot = __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_currentMessageSnapshot, "f");
      if (!snapshot) {
        throw new AnthropicError(`request ended without sending any chunks`);
      }
      __classPrivateFieldSet2(this, _PromptCachingBetaMessageStream_currentMessageSnapshot, undefined, "f");
      return snapshot;
    }, _PromptCachingBetaMessageStream_accumulateMessage = function _PromptCachingBetaMessageStream_accumulateMessage2(event) {
      let snapshot = __classPrivateFieldGet2(this, _PromptCachingBetaMessageStream_currentMessageSnapshot, "f");
      if (event.type === "message_start") {
        if (snapshot) {
          throw new AnthropicError(`Unexpected event order, got ${event.type} before receiving "message_stop"`);
        }
        return event.message;
      }
      if (!snapshot) {
        throw new AnthropicError(`Unexpected event order, got ${event.type} before "message_start"`);
      }
      switch (event.type) {
        case "message_stop":
          return snapshot;
        case "message_delta":
          snapshot.stop_reason = event.delta.stop_reason;
          snapshot.stop_sequence = event.delta.stop_sequence;
          snapshot.usage.output_tokens = event.usage.output_tokens;
          return snapshot;
        case "content_block_start":
          snapshot.content.push(event.content_block);
          return snapshot;
        case "content_block_delta": {
          const snapshotContent = snapshot.content.at(event.index);
          if (snapshotContent?.type === "text" && event.delta.type === "text_delta") {
            snapshotContent.text += event.delta.text;
          } else if (snapshotContent?.type === "tool_use" && event.delta.type === "input_json_delta") {
            let jsonBuf = snapshotContent[JSON_BUF_PROPERTY] || "";
            jsonBuf += event.delta.partial_json;
            Object.defineProperty(snapshotContent, JSON_BUF_PROPERTY, {
              value: jsonBuf,
              enumerable: false,
              writable: true
            });
            if (jsonBuf) {
              snapshotContent.input = partialParse(jsonBuf);
            }
          }
          return snapshot;
        }
        case "content_block_stop":
          return snapshot;
      }
    }, Symbol.asyncIterator)]() {
      const pushQueue = [];
      const readQueue = [];
      let done = false;
      this.on("streamEvent", (event) => {
        const reader = readQueue.shift();
        if (reader) {
          reader.resolve(event);
        } else {
          pushQueue.push(event);
        }
      });
      this.on("end", () => {
        done = true;
        for (const reader of readQueue) {
          reader.resolve(undefined);
        }
        readQueue.length = 0;
      });
      this.on("abort", (err) => {
        done = true;
        for (const reader of readQueue) {
          reader.reject(err);
        }
        readQueue.length = 0;
      });
      this.on("error", (err) => {
        done = true;
        for (const reader of readQueue) {
          reader.reject(err);
        }
        readQueue.length = 0;
      });
      return {
        next: async () => {
          if (!pushQueue.length) {
            if (done) {
              return { value: undefined, done: true };
            }
            return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: undefined, done: true });
          }
          const chunk = pushQueue.shift();
          return { value: chunk, done: false };
        },
        return: async () => {
          this.abort();
          return { value: undefined, done: true };
        }
      };
    }
    toReadableStream() {
      const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
      return stream.toReadableStream();
    }
  };
});

// node_modules/@anthropic-ai/sdk/resources/beta/prompt-caching/messages.mjs
var Messages2;
var init_messages2 = __esm(() => {
  init_PromptCachingBetaMessageStream();
  Messages2 = class Messages2 extends APIResource {
    create(params, options) {
      const { betas, ...body } = params;
      return this._client.post("/v1/messages?beta=prompt_caching", {
        body,
        timeout: this._client._options.timeout ?? 600000,
        ...options,
        headers: {
          "anthropic-beta": [...betas ?? [], "prompt-caching-2024-07-31"].toString(),
          ...options?.headers
        },
        stream: params.stream ?? false
      });
    }
    stream(body, options) {
      return PromptCachingBetaMessageStream.createMessage(this, body, options);
    }
  };
});

// node_modules/@anthropic-ai/sdk/resources/beta/prompt-caching/prompt-caching.mjs
var PromptCaching;
var init_prompt_caching = __esm(() => {
  init_messages2();
  init_messages2();
  PromptCaching = class PromptCaching extends APIResource {
    constructor() {
      super(...arguments);
      this.messages = new Messages2(this._client);
    }
  };
  PromptCaching.Messages = Messages2;
});

// node_modules/@anthropic-ai/sdk/resources/beta/beta.mjs
var Beta;
var init_beta = __esm(() => {
  init_messages();
  init_messages();
  init_prompt_caching();
  init_prompt_caching();
  Beta = class Beta extends APIResource {
    constructor() {
      super(...arguments);
      this.messages = new Messages(this._client);
      this.promptCaching = new PromptCaching(this._client);
    }
  };
  Beta.Messages = Messages;
  Beta.PromptCaching = PromptCaching;
});

// node_modules/@anthropic-ai/sdk/resources/completions.mjs
var Completions;
var init_completions = __esm(() => {
  Completions = class Completions extends APIResource {
    create(body, options) {
      return this._client.post("/v1/complete", {
        body,
        timeout: this._client._options.timeout ?? 600000,
        ...options,
        stream: body.stream ?? false
      });
    }
  };
});

// node_modules/@anthropic-ai/sdk/lib/MessageStream.mjs
var __classPrivateFieldSet3 = function(receiver, state, value, kind2, f) {
  if (kind2 === "m")
    throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, __classPrivateFieldGet3 = function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, _MessageStream_instances, _MessageStream_currentMessageSnapshot, _MessageStream_connectedPromise, _MessageStream_resolveConnectedPromise, _MessageStream_rejectConnectedPromise, _MessageStream_endPromise, _MessageStream_resolveEndPromise, _MessageStream_rejectEndPromise, _MessageStream_listeners, _MessageStream_ended, _MessageStream_errored, _MessageStream_aborted, _MessageStream_catchingPromiseCreated, _MessageStream_getFinalMessage, _MessageStream_getFinalText, _MessageStream_handleError, _MessageStream_beginRequest, _MessageStream_addStreamEvent, _MessageStream_endRequest, _MessageStream_accumulateMessage, JSON_BUF_PROPERTY2 = "__json_buf", MessageStream;
var init_MessageStream = __esm(() => {
  init_error();
  init_streaming();
  init_parser();
  MessageStream = class MessageStream {
    constructor() {
      _MessageStream_instances.add(this);
      this.messages = [];
      this.receivedMessages = [];
      _MessageStream_currentMessageSnapshot.set(this, undefined);
      this.controller = new AbortController;
      _MessageStream_connectedPromise.set(this, undefined);
      _MessageStream_resolveConnectedPromise.set(this, () => {});
      _MessageStream_rejectConnectedPromise.set(this, () => {});
      _MessageStream_endPromise.set(this, undefined);
      _MessageStream_resolveEndPromise.set(this, () => {});
      _MessageStream_rejectEndPromise.set(this, () => {});
      _MessageStream_listeners.set(this, {});
      _MessageStream_ended.set(this, false);
      _MessageStream_errored.set(this, false);
      _MessageStream_aborted.set(this, false);
      _MessageStream_catchingPromiseCreated.set(this, false);
      _MessageStream_handleError.set(this, (error) => {
        __classPrivateFieldSet3(this, _MessageStream_errored, true, "f");
        if (error instanceof Error && error.name === "AbortError") {
          error = new APIUserAbortError;
        }
        if (error instanceof APIUserAbortError) {
          __classPrivateFieldSet3(this, _MessageStream_aborted, true, "f");
          return this._emit("abort", error);
        }
        if (error instanceof AnthropicError) {
          return this._emit("error", error);
        }
        if (error instanceof Error) {
          const anthropicError = new AnthropicError(error.message);
          anthropicError.cause = error;
          return this._emit("error", anthropicError);
        }
        return this._emit("error", new AnthropicError(String(error)));
      });
      __classPrivateFieldSet3(this, _MessageStream_connectedPromise, new Promise((resolve, reject) => {
        __classPrivateFieldSet3(this, _MessageStream_resolveConnectedPromise, resolve, "f");
        __classPrivateFieldSet3(this, _MessageStream_rejectConnectedPromise, reject, "f");
      }), "f");
      __classPrivateFieldSet3(this, _MessageStream_endPromise, new Promise((resolve, reject) => {
        __classPrivateFieldSet3(this, _MessageStream_resolveEndPromise, resolve, "f");
        __classPrivateFieldSet3(this, _MessageStream_rejectEndPromise, reject, "f");
      }), "f");
      __classPrivateFieldGet3(this, _MessageStream_connectedPromise, "f").catch(() => {});
      __classPrivateFieldGet3(this, _MessageStream_endPromise, "f").catch(() => {});
    }
    static fromReadableStream(stream) {
      const runner = new MessageStream;
      runner._run(() => runner._fromReadableStream(stream));
      return runner;
    }
    static createMessage(messages, params, options) {
      const runner = new MessageStream;
      for (const message of params.messages) {
        runner._addMessageParam(message);
      }
      runner._run(() => runner._createMessage(messages, { ...params, stream: true }, { ...options, headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" } }));
      return runner;
    }
    _run(executor) {
      executor().then(() => {
        this._emitFinal();
        this._emit("end");
      }, __classPrivateFieldGet3(this, _MessageStream_handleError, "f"));
    }
    _addMessageParam(message) {
      this.messages.push(message);
    }
    _addMessage(message, emit = true) {
      this.receivedMessages.push(message);
      if (emit) {
        this._emit("message", message);
      }
    }
    async _createMessage(messages, params, options) {
      const signal = options?.signal;
      if (signal) {
        if (signal.aborted)
          this.controller.abort();
        signal.addEventListener("abort", () => this.controller.abort());
      }
      __classPrivateFieldGet3(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
      const stream = await messages.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
      this._connected();
      for await (const event of stream) {
        __classPrivateFieldGet3(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError;
      }
      __classPrivateFieldGet3(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
    }
    _connected() {
      if (this.ended)
        return;
      __classPrivateFieldGet3(this, _MessageStream_resolveConnectedPromise, "f").call(this);
      this._emit("connect");
    }
    get ended() {
      return __classPrivateFieldGet3(this, _MessageStream_ended, "f");
    }
    get errored() {
      return __classPrivateFieldGet3(this, _MessageStream_errored, "f");
    }
    get aborted() {
      return __classPrivateFieldGet3(this, _MessageStream_aborted, "f");
    }
    abort() {
      this.controller.abort();
    }
    on(event, listener) {
      const listeners = __classPrivateFieldGet3(this, _MessageStream_listeners, "f")[event] || (__classPrivateFieldGet3(this, _MessageStream_listeners, "f")[event] = []);
      listeners.push({ listener });
      return this;
    }
    off(event, listener) {
      const listeners = __classPrivateFieldGet3(this, _MessageStream_listeners, "f")[event];
      if (!listeners)
        return this;
      const index = listeners.findIndex((l) => l.listener === listener);
      if (index >= 0)
        listeners.splice(index, 1);
      return this;
    }
    once(event, listener) {
      const listeners = __classPrivateFieldGet3(this, _MessageStream_listeners, "f")[event] || (__classPrivateFieldGet3(this, _MessageStream_listeners, "f")[event] = []);
      listeners.push({ listener, once: true });
      return this;
    }
    emitted(event) {
      return new Promise((resolve, reject) => {
        __classPrivateFieldSet3(this, _MessageStream_catchingPromiseCreated, true, "f");
        if (event !== "error")
          this.once("error", reject);
        this.once(event, resolve);
      });
    }
    async done() {
      __classPrivateFieldSet3(this, _MessageStream_catchingPromiseCreated, true, "f");
      await __classPrivateFieldGet3(this, _MessageStream_endPromise, "f");
    }
    get currentMessage() {
      return __classPrivateFieldGet3(this, _MessageStream_currentMessageSnapshot, "f");
    }
    async finalMessage() {
      await this.done();
      return __classPrivateFieldGet3(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this);
    }
    async finalText() {
      await this.done();
      return __classPrivateFieldGet3(this, _MessageStream_instances, "m", _MessageStream_getFinalText).call(this);
    }
    _emit(event, ...args) {
      if (__classPrivateFieldGet3(this, _MessageStream_ended, "f"))
        return;
      if (event === "end") {
        __classPrivateFieldSet3(this, _MessageStream_ended, true, "f");
        __classPrivateFieldGet3(this, _MessageStream_resolveEndPromise, "f").call(this);
      }
      const listeners = __classPrivateFieldGet3(this, _MessageStream_listeners, "f")[event];
      if (listeners) {
        __classPrivateFieldGet3(this, _MessageStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
        listeners.forEach(({ listener }) => listener(...args));
      }
      if (event === "abort") {
        const error = args[0];
        if (!__classPrivateFieldGet3(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
          Promise.reject(error);
        }
        __classPrivateFieldGet3(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
        __classPrivateFieldGet3(this, _MessageStream_rejectEndPromise, "f").call(this, error);
        this._emit("end");
        return;
      }
      if (event === "error") {
        const error = args[0];
        if (!__classPrivateFieldGet3(this, _MessageStream_catchingPromiseCreated, "f") && !listeners?.length) {
          Promise.reject(error);
        }
        __classPrivateFieldGet3(this, _MessageStream_rejectConnectedPromise, "f").call(this, error);
        __classPrivateFieldGet3(this, _MessageStream_rejectEndPromise, "f").call(this, error);
        this._emit("end");
      }
    }
    _emitFinal() {
      const finalMessage = this.receivedMessages.at(-1);
      if (finalMessage) {
        this._emit("finalMessage", __classPrivateFieldGet3(this, _MessageStream_instances, "m", _MessageStream_getFinalMessage).call(this));
      }
    }
    async _fromReadableStream(readableStream, options) {
      const signal = options?.signal;
      if (signal) {
        if (signal.aborted)
          this.controller.abort();
        signal.addEventListener("abort", () => this.controller.abort());
      }
      __classPrivateFieldGet3(this, _MessageStream_instances, "m", _MessageStream_beginRequest).call(this);
      this._connected();
      const stream = Stream.fromReadableStream(readableStream, this.controller);
      for await (const event of stream) {
        __classPrivateFieldGet3(this, _MessageStream_instances, "m", _MessageStream_addStreamEvent).call(this, event);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError;
      }
      __classPrivateFieldGet3(this, _MessageStream_instances, "m", _MessageStream_endRequest).call(this);
    }
    [(_MessageStream_currentMessageSnapshot = new WeakMap, _MessageStream_connectedPromise = new WeakMap, _MessageStream_resolveConnectedPromise = new WeakMap, _MessageStream_rejectConnectedPromise = new WeakMap, _MessageStream_endPromise = new WeakMap, _MessageStream_resolveEndPromise = new WeakMap, _MessageStream_rejectEndPromise = new WeakMap, _MessageStream_listeners = new WeakMap, _MessageStream_ended = new WeakMap, _MessageStream_errored = new WeakMap, _MessageStream_aborted = new WeakMap, _MessageStream_catchingPromiseCreated = new WeakMap, _MessageStream_handleError = new WeakMap, _MessageStream_instances = new WeakSet, _MessageStream_getFinalMessage = function _MessageStream_getFinalMessage2() {
      if (this.receivedMessages.length === 0) {
        throw new AnthropicError("stream ended without producing a Message with role=assistant");
      }
      return this.receivedMessages.at(-1);
    }, _MessageStream_getFinalText = function _MessageStream_getFinalText2() {
      if (this.receivedMessages.length === 0) {
        throw new AnthropicError("stream ended without producing a Message with role=assistant");
      }
      const textBlocks = this.receivedMessages.at(-1).content.filter((block) => block.type === "text").map((block) => block.text);
      if (textBlocks.length === 0) {
        throw new AnthropicError("stream ended without producing a content block with type=text");
      }
      return textBlocks.join(" ");
    }, _MessageStream_beginRequest = function _MessageStream_beginRequest2() {
      if (this.ended)
        return;
      __classPrivateFieldSet3(this, _MessageStream_currentMessageSnapshot, undefined, "f");
    }, _MessageStream_addStreamEvent = function _MessageStream_addStreamEvent2(event) {
      if (this.ended)
        return;
      const messageSnapshot = __classPrivateFieldGet3(this, _MessageStream_instances, "m", _MessageStream_accumulateMessage).call(this, event);
      this._emit("streamEvent", event, messageSnapshot);
      switch (event.type) {
        case "content_block_delta": {
          const content = messageSnapshot.content.at(-1);
          if (event.delta.type === "text_delta" && content.type === "text") {
            this._emit("text", event.delta.text, content.text || "");
          } else if (event.delta.type === "input_json_delta" && content.type === "tool_use") {
            if (content.input) {
              this._emit("inputJson", event.delta.partial_json, content.input);
            }
          }
          break;
        }
        case "message_stop": {
          this._addMessageParam(messageSnapshot);
          this._addMessage(messageSnapshot, true);
          break;
        }
        case "content_block_stop": {
          this._emit("contentBlock", messageSnapshot.content.at(-1));
          break;
        }
        case "message_start": {
          __classPrivateFieldSet3(this, _MessageStream_currentMessageSnapshot, messageSnapshot, "f");
          break;
        }
        case "content_block_start":
        case "message_delta":
          break;
      }
    }, _MessageStream_endRequest = function _MessageStream_endRequest2() {
      if (this.ended) {
        throw new AnthropicError(`stream has ended, this shouldn't happen`);
      }
      const snapshot = __classPrivateFieldGet3(this, _MessageStream_currentMessageSnapshot, "f");
      if (!snapshot) {
        throw new AnthropicError(`request ended without sending any chunks`);
      }
      __classPrivateFieldSet3(this, _MessageStream_currentMessageSnapshot, undefined, "f");
      return snapshot;
    }, _MessageStream_accumulateMessage = function _MessageStream_accumulateMessage2(event) {
      let snapshot = __classPrivateFieldGet3(this, _MessageStream_currentMessageSnapshot, "f");
      if (event.type === "message_start") {
        if (snapshot) {
          throw new AnthropicError(`Unexpected event order, got ${event.type} before receiving "message_stop"`);
        }
        return event.message;
      }
      if (!snapshot) {
        throw new AnthropicError(`Unexpected event order, got ${event.type} before "message_start"`);
      }
      switch (event.type) {
        case "message_stop":
          return snapshot;
        case "message_delta":
          snapshot.stop_reason = event.delta.stop_reason;
          snapshot.stop_sequence = event.delta.stop_sequence;
          snapshot.usage.output_tokens = event.usage.output_tokens;
          return snapshot;
        case "content_block_start":
          snapshot.content.push(event.content_block);
          return snapshot;
        case "content_block_delta": {
          const snapshotContent = snapshot.content.at(event.index);
          if (snapshotContent?.type === "text" && event.delta.type === "text_delta") {
            snapshotContent.text += event.delta.text;
          } else if (snapshotContent?.type === "tool_use" && event.delta.type === "input_json_delta") {
            let jsonBuf = snapshotContent[JSON_BUF_PROPERTY2] || "";
            jsonBuf += event.delta.partial_json;
            Object.defineProperty(snapshotContent, JSON_BUF_PROPERTY2, {
              value: jsonBuf,
              enumerable: false,
              writable: true
            });
            if (jsonBuf) {
              snapshotContent.input = partialParse(jsonBuf);
            }
          }
          return snapshot;
        }
        case "content_block_stop":
          return snapshot;
      }
    }, Symbol.asyncIterator)]() {
      const pushQueue = [];
      const readQueue = [];
      let done = false;
      this.on("streamEvent", (event) => {
        const reader = readQueue.shift();
        if (reader) {
          reader.resolve(event);
        } else {
          pushQueue.push(event);
        }
      });
      this.on("end", () => {
        done = true;
        for (const reader of readQueue) {
          reader.resolve(undefined);
        }
        readQueue.length = 0;
      });
      this.on("abort", (err) => {
        done = true;
        for (const reader of readQueue) {
          reader.reject(err);
        }
        readQueue.length = 0;
      });
      this.on("error", (err) => {
        done = true;
        for (const reader of readQueue) {
          reader.reject(err);
        }
        readQueue.length = 0;
      });
      return {
        next: async () => {
          if (!pushQueue.length) {
            if (done) {
              return { value: undefined, done: true };
            }
            return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: undefined, done: true });
          }
          const chunk = pushQueue.shift();
          return { value: chunk, done: false };
        },
        return: async () => {
          this.abort();
          return { value: undefined, done: true };
        }
      };
    }
    toReadableStream() {
      const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
      return stream.toReadableStream();
    }
  };
});

// node_modules/@anthropic-ai/sdk/resources/messages.mjs
var Messages3, DEPRECATED_MODELS;
var init_messages3 = __esm(() => {
  init_MessageStream();
  Messages3 = class Messages3 extends APIResource {
    create(body, options) {
      if (body.model in DEPRECATED_MODELS) {
        console.warn(`The model '${body.model}' is deprecated and will reach end-of-life on ${DEPRECATED_MODELS[body.model]}
Please migrate to a newer model. Visit https://docs.anthropic.com/en/docs/resources/model-deprecations for more information.`);
      }
      return this._client.post("/v1/messages", {
        body,
        timeout: this._client._options.timeout ?? 600000,
        ...options,
        stream: body.stream ?? false
      });
    }
    stream(body, options) {
      return MessageStream.createMessage(this, body, options);
    }
  };
  DEPRECATED_MODELS = {
    "claude-1.3": "November 6th, 2024",
    "claude-1.3-100k": "November 6th, 2024",
    "claude-instant-1.1": "November 6th, 2024",
    "claude-instant-1.1-100k": "November 6th, 2024",
    "claude-instant-1.2": "November 6th, 2024"
  };
});

// node_modules/@anthropic-ai/sdk/resources/index.mjs
var init_resources = __esm(() => {
  init_beta();
  init_completions();
  init_messages3();
});

// node_modules/@anthropic-ai/sdk/index.mjs
var exports_sdk = {};
__export(exports_sdk, {
  toFile: () => toFile2,
  fileFromPath: () => fileFromPath2,
  default: () => sdk_default,
  UnprocessableEntityError: () => UnprocessableEntityError,
  RateLimitError: () => RateLimitError,
  PermissionDeniedError: () => PermissionDeniedError,
  NotFoundError: () => NotFoundError,
  InternalServerError: () => InternalServerError,
  HUMAN_PROMPT: () => HUMAN_PROMPT,
  ConflictError: () => ConflictError,
  BadRequestError: () => BadRequestError,
  AuthenticationError: () => AuthenticationError,
  AnthropicError: () => AnthropicError,
  Anthropic: () => Anthropic,
  APIUserAbortError: () => APIUserAbortError,
  APIError: () => APIError,
  APIConnectionTimeoutError: () => APIConnectionTimeoutError,
  APIConnectionError: () => APIConnectionError,
  AI_PROMPT: () => AI_PROMPT
});
var _a, Anthropic, HUMAN_PROMPT, AI_PROMPT, toFile2, fileFromPath2, sdk_default;
var init_sdk = __esm(() => {
  init_core();
  init_error();
  init_uploads();
  init_resources();
  init_completions();
  init_messages3();
  init_beta();
  init_error();
  Anthropic = class Anthropic extends APIClient {
    constructor({ baseURL = readEnv("ANTHROPIC_BASE_URL"), apiKey = readEnv("ANTHROPIC_API_KEY") ?? null, authToken = readEnv("ANTHROPIC_AUTH_TOKEN") ?? null, ...opts } = {}) {
      const options = {
        apiKey,
        authToken,
        ...opts,
        baseURL: baseURL || `https://api.anthropic.com`
      };
      if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
        throw new AnthropicError(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

TODO: link!
`);
      }
      super({
        baseURL: options.baseURL,
        timeout: options.timeout ?? 600000,
        httpAgent: options.httpAgent,
        maxRetries: options.maxRetries,
        fetch: options.fetch
      });
      this.completions = new Completions(this);
      this.messages = new Messages3(this);
      this.beta = new Beta(this);
      this._options = options;
      this.apiKey = apiKey;
      this.authToken = authToken;
    }
    defaultQuery() {
      return this._options.defaultQuery;
    }
    defaultHeaders(opts) {
      return {
        ...super.defaultHeaders(opts),
        ...this._options.dangerouslyAllowBrowser ? { "anthropic-dangerous-direct-browser-access": "true" } : undefined,
        "anthropic-version": "2023-06-01",
        ...this._options.defaultHeaders
      };
    }
    validateHeaders(headers, customHeaders) {
      if (this.apiKey && headers["x-api-key"]) {
        return;
      }
      if (customHeaders["x-api-key"] === null) {
        return;
      }
      if (this.authToken && headers["authorization"]) {
        return;
      }
      if (customHeaders["authorization"] === null) {
        return;
      }
      throw new Error('Could not resolve authentication method. Expected either apiKey or authToken to be set. Or for one of the "X-Api-Key" or "Authorization" headers to be explicitly omitted');
    }
    authHeaders(opts) {
      const apiKeyAuth = this.apiKeyAuth(opts);
      const bearerAuth = this.bearerAuth(opts);
      if (apiKeyAuth != null && !isEmptyObj(apiKeyAuth)) {
        return apiKeyAuth;
      }
      if (bearerAuth != null && !isEmptyObj(bearerAuth)) {
        return bearerAuth;
      }
      return {};
    }
    apiKeyAuth(opts) {
      if (this.apiKey == null) {
        return {};
      }
      return { "X-Api-Key": this.apiKey };
    }
    bearerAuth(opts) {
      if (this.authToken == null) {
        return {};
      }
      return { Authorization: `Bearer ${this.authToken}` };
    }
  };
  _a = Anthropic;
  Anthropic.Anthropic = _a;
  Anthropic.HUMAN_PROMPT = `

Human:`;
  Anthropic.AI_PROMPT = `

Assistant:`;
  Anthropic.DEFAULT_TIMEOUT = 600000;
  Anthropic.AnthropicError = AnthropicError;
  Anthropic.APIError = APIError;
  Anthropic.APIConnectionError = APIConnectionError;
  Anthropic.APIConnectionTimeoutError = APIConnectionTimeoutError;
  Anthropic.APIUserAbortError = APIUserAbortError;
  Anthropic.NotFoundError = NotFoundError;
  Anthropic.ConflictError = ConflictError;
  Anthropic.RateLimitError = RateLimitError;
  Anthropic.BadRequestError = BadRequestError;
  Anthropic.AuthenticationError = AuthenticationError;
  Anthropic.InternalServerError = InternalServerError;
  Anthropic.PermissionDeniedError = PermissionDeniedError;
  Anthropic.UnprocessableEntityError = UnprocessableEntityError;
  Anthropic.toFile = toFile;
  Anthropic.fileFromPath = fileFromPath;
  ({ HUMAN_PROMPT, AI_PROMPT } = Anthropic);
  toFile2 = toFile;
  fileFromPath2 = fileFromPath;
  Anthropic.Completions = Completions;
  Anthropic.Messages = Messages3;
  Anthropic.Beta = Beta;
  sdk_default = Anthropic;
});

// node_modules/openai/internal/qs/formats.mjs
var default_format = "RFC3986", formatters, RFC1738 = "RFC1738";
var init_formats = __esm(() => {
  formatters = {
    RFC1738: (v) => String(v).replace(/%20/g, "+"),
    RFC3986: (v) => String(v)
  };
});

// node_modules/openai/internal/qs/utils.mjs
function is_buffer(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
function maybe_map(val, fn) {
  if (is_array(val)) {
    const mapped = [];
    for (let i = 0;i < val.length; i += 1) {
      mapped.push(fn(val[i]));
    }
    return mapped;
  }
  return fn(val);
}
var is_array, hex_table, limit = 1024, encode = (str, _defaultEncoder, charset, _kind, format) => {
  if (str.length === 0) {
    return str;
  }
  let string = str;
  if (typeof str === "symbol") {
    string = Symbol.prototype.toString.call(str);
  } else if (typeof str !== "string") {
    string = String(str);
  }
  if (charset === "iso-8859-1") {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
      return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
    });
  }
  let out = "";
  for (let j = 0;j < string.length; j += limit) {
    const segment = string.length >= limit ? string.slice(j, j + limit) : string;
    const arr = [];
    for (let i = 0;i < segment.length; ++i) {
      let c = segment.charCodeAt(i);
      if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === RFC1738 && (c === 40 || c === 41)) {
        arr[arr.length] = segment.charAt(i);
        continue;
      }
      if (c < 128) {
        arr[arr.length] = hex_table[c];
        continue;
      }
      if (c < 2048) {
        arr[arr.length] = hex_table[192 | c >> 6] + hex_table[128 | c & 63];
        continue;
      }
      if (c < 55296 || c >= 57344) {
        arr[arr.length] = hex_table[224 | c >> 12] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
        continue;
      }
      i += 1;
      c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
      arr[arr.length] = hex_table[240 | c >> 18] + hex_table[128 | c >> 12 & 63] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
    }
    out += arr.join("");
  }
  return out;
};
var init_utils = __esm(() => {
  init_formats();
  is_array = Array.isArray;
  hex_table = (() => {
    const array = [];
    for (let i = 0;i < 256; ++i) {
      array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
    }
    return array;
  })();
});

// node_modules/openai/internal/qs/stringify.mjs
function is_non_nullish_primitive(v) {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
}
function inner_stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
  let obj = object;
  let tmp_sc = sideChannel;
  let step = 0;
  let find_flag = false;
  while ((tmp_sc = tmp_sc.get(sentinel)) !== undefined && !find_flag) {
    const pos = tmp_sc.get(object);
    step += 1;
    if (typeof pos !== "undefined") {
      if (pos === step) {
        throw new RangeError("Cyclic object value");
      } else {
        find_flag = true;
      }
    }
    if (typeof tmp_sc.get(sentinel) === "undefined") {
      step = 0;
    }
  }
  if (typeof filter === "function") {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate?.(obj);
  } else if (generateArrayPrefix === "comma" && is_array2(obj)) {
    obj = maybe_map(obj, function(value) {
      if (value instanceof Date) {
        return serializeDate?.(value);
      }
      return value;
    });
  }
  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, "key", format) : prefix;
    }
    obj = "";
  }
  if (is_non_nullish_primitive(obj) || is_buffer(obj)) {
    if (encoder) {
      const key_value = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format);
      return [
        formatter?.(key_value) + "=" + formatter?.(encoder(obj, defaults.encoder, charset, "value", format))
      ];
    }
    return [formatter?.(prefix) + "=" + formatter?.(String(obj))];
  }
  const values = [];
  if (typeof obj === "undefined") {
    return values;
  }
  let obj_keys;
  if (generateArrayPrefix === "comma" && is_array2(obj)) {
    if (encodeValuesOnly && encoder) {
      obj = maybe_map(obj, encoder);
    }
    obj_keys = [{ value: obj.length > 0 ? obj.join(",") || null : undefined }];
  } else if (is_array2(filter)) {
    obj_keys = filter;
  } else {
    const keys = Object.keys(obj);
    obj_keys = sort ? keys.sort(sort) : keys;
  }
  const encoded_prefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
  const adjusted_prefix = commaRoundTrip && is_array2(obj) && obj.length === 1 ? encoded_prefix + "[]" : encoded_prefix;
  if (allowEmptyArrays && is_array2(obj) && obj.length === 0) {
    return adjusted_prefix + "[]";
  }
  for (let j = 0;j < obj_keys.length; ++j) {
    const key = obj_keys[j];
    const value = typeof key === "object" && typeof key.value !== "undefined" ? key.value : obj[key];
    if (skipNulls && value === null) {
      continue;
    }
    const encoded_key = allowDots && encodeDotInKeys ? key.replace(/\./g, "%2E") : key;
    const key_prefix = is_array2(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjusted_prefix, encoded_key) : adjusted_prefix : adjusted_prefix + (allowDots ? "." + encoded_key : "[" + encoded_key + "]");
    sideChannel.set(object, step);
    const valueSideChannel = new WeakMap;
    valueSideChannel.set(sentinel, sideChannel);
    push_to_array(values, inner_stringify(value, key_prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, generateArrayPrefix === "comma" && encodeValuesOnly && is_array2(obj) ? null : encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, valueSideChannel));
  }
  return values;
}
function normalize_stringify_options(opts = defaults) {
  if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  }
  if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  }
  if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
    throw new TypeError("Encoder has to be a function.");
  }
  const charset = opts.charset || defaults.charset;
  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  }
  let format = default_format;
  if (typeof opts.format !== "undefined") {
    if (!has.call(formatters, opts.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    format = opts.format;
  }
  const formatter = formatters[format];
  let filter = defaults.filter;
  if (typeof opts.filter === "function" || is_array2(opts.filter)) {
    filter = opts.filter;
  }
  let arrayFormat;
  if (opts.arrayFormat && opts.arrayFormat in array_prefix_generators) {
    arrayFormat = opts.arrayFormat;
  } else if ("indices" in opts) {
    arrayFormat = opts.indices ? "indices" : "repeat";
  } else {
    arrayFormat = defaults.arrayFormat;
  }
  if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  const allowDots = typeof opts.allowDots === "undefined" ? !!opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
  return {
    addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
    allowDots,
    allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
    arrayFormat,
    charset,
    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
    commaRoundTrip: !!opts.commaRoundTrip,
    delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
    encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
    encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
    encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
    encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
    filter,
    format,
    formatter,
    serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
    skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
    sort: typeof opts.sort === "function" ? opts.sort : null,
    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
  };
}
function stringify(object, opts = {}) {
  let obj = object;
  const options = normalize_stringify_options(opts);
  let obj_keys;
  let filter;
  if (typeof options.filter === "function") {
    filter = options.filter;
    obj = filter("", obj);
  } else if (is_array2(options.filter)) {
    filter = options.filter;
    obj_keys = filter;
  }
  const keys = [];
  if (typeof obj !== "object" || obj === null) {
    return "";
  }
  const generateArrayPrefix = array_prefix_generators[options.arrayFormat];
  const commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
  if (!obj_keys) {
    obj_keys = Object.keys(obj);
  }
  if (options.sort) {
    obj_keys.sort(options.sort);
  }
  const sideChannel = new WeakMap;
  for (let i = 0;i < obj_keys.length; ++i) {
    const key = obj_keys[i];
    if (options.skipNulls && obj[key] === null) {
      continue;
    }
    push_to_array(keys, inner_stringify(obj[key], key, generateArrayPrefix, commaRoundTrip, options.allowEmptyArrays, options.strictNullHandling, options.skipNulls, options.encodeDotInKeys, options.encode ? options.encoder : null, options.filter, options.sort, options.allowDots, options.serializeDate, options.format, options.formatter, options.encodeValuesOnly, options.charset, sideChannel));
  }
  const joined = keys.join(options.delimiter);
  let prefix = options.addQueryPrefix === true ? "?" : "";
  if (options.charsetSentinel) {
    if (options.charset === "iso-8859-1") {
      prefix += "utf8=%26%2310003%3B&";
    } else {
      prefix += "utf8=%E2%9C%93&";
    }
  }
  return joined.length > 0 ? prefix + joined : "";
}
var has, array_prefix_generators, is_array2, push, push_to_array = function(arr, value_or_array) {
  push.apply(arr, is_array2(value_or_array) ? value_or_array : [value_or_array]);
}, to_ISO, defaults, sentinel;
var init_stringify = __esm(() => {
  init_utils();
  init_formats();
  has = Object.prototype.hasOwnProperty;
  array_prefix_generators = {
    brackets(prefix) {
      return String(prefix) + "[]";
    },
    comma: "comma",
    indices(prefix, key) {
      return String(prefix) + "[" + key + "]";
    },
    repeat(prefix) {
      return String(prefix);
    }
  };
  is_array2 = Array.isArray;
  push = Array.prototype.push;
  to_ISO = Date.prototype.toISOString;
  defaults = {
    addQueryPrefix: false,
    allowDots: false,
    allowEmptyArrays: false,
    arrayFormat: "indices",
    charset: "utf-8",
    charsetSentinel: false,
    delimiter: "&",
    encode: true,
    encodeDotInKeys: false,
    encoder: encode,
    encodeValuesOnly: false,
    format: default_format,
    formatter: formatters[default_format],
    indices: false,
    serializeDate(date) {
      return to_ISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
  };
  sentinel = {};
});

// node_modules/openai/internal/qs/index.mjs
var init_qs = __esm(() => {
  init_stringify();
});

// node_modules/openai/version.mjs
var VERSION2 = "4.104.0";

// node_modules/openai/_shims/registry.mjs
function setShims2(shims, options = { auto: false }) {
  if (auto2) {
    throw new Error(`you must \`import 'openai/shims/${shims.kind}'\` before importing anything else from openai`);
  }
  if (kind2) {
    throw new Error(`can't \`import 'openai/shims/${shims.kind}'\` after \`import 'openai/shims/${kind2}'\``);
  }
  auto2 = options.auto;
  kind2 = shims.kind;
  fetch3 = shims.fetch;
  Request3 = shims.Request;
  Response3 = shims.Response;
  Headers3 = shims.Headers;
  FormData3 = shims.FormData;
  Blob3 = shims.Blob;
  File3 = shims.File;
  ReadableStream3 = shims.ReadableStream;
  getMultipartRequestOptions2 = shims.getMultipartRequestOptions;
  getDefaultAgent2 = shims.getDefaultAgent;
  fileFromPath3 = shims.fileFromPath;
  isFsReadStream2 = shims.isFsReadStream;
}
var auto2 = false, kind2 = undefined, fetch3 = undefined, Request3 = undefined, Response3 = undefined, Headers3 = undefined, FormData3 = undefined, Blob3 = undefined, File3 = undefined, ReadableStream3 = undefined, getMultipartRequestOptions2 = undefined, getDefaultAgent2 = undefined, fileFromPath3 = undefined, isFsReadStream2 = undefined;

// node_modules/openai/_shims/MultipartBody.mjs
var MultipartBody2;
var init_MultipartBody2 = __esm(() => {
  MultipartBody2 = class MultipartBody2 {
    constructor(body) {
      this.body = body;
    }
    get [Symbol.toStringTag]() {
      return "MultipartBody";
    }
  };
});

// node_modules/openai/_shims/web-runtime.mjs
function getRuntime3({ manuallyImported } = {}) {
  const recommendation = manuallyImported ? `You may need to use polyfills` : `Add one of these imports before your first \`import \u2026 from 'openai'\`:
- \`import 'openai/shims/node'\` (if you're running on Node)
- \`import 'openai/shims/web'\` (otherwise)
`;
  let _fetch, _Request, _Response, _Headers;
  try {
    _fetch = fetch;
    _Request = Request;
    _Response = Response;
    _Headers = Headers;
  } catch (error) {
    throw new Error(`this environment is missing the following Web Fetch API type: ${error.message}. ${recommendation}`);
  }
  return {
    kind: "web",
    fetch: _fetch,
    Request: _Request,
    Response: _Response,
    Headers: _Headers,
    FormData: typeof FormData !== "undefined" ? FormData : class FormData4 {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'FormData' is undefined. ${recommendation}`);
      }
    },
    Blob: typeof Blob !== "undefined" ? Blob : class Blob4 {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'Blob' is undefined. ${recommendation}`);
      }
    },
    File: typeof File !== "undefined" ? File : class File4 {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'File' is undefined. ${recommendation}`);
      }
    },
    ReadableStream: typeof ReadableStream !== "undefined" ? ReadableStream : class ReadableStream4 {
      constructor() {
        throw new Error(`streaming isn't supported in this environment yet as 'ReadableStream' is undefined. ${recommendation}`);
      }
    },
    getMultipartRequestOptions: async (form, opts) => ({
      ...opts,
      body: new MultipartBody2(form)
    }),
    getDefaultAgent: (url) => {
      return;
    },
    fileFromPath: () => {
      throw new Error("The `fileFromPath` function is only supported in Node. See the README for more details: https://www.github.com/openai/openai-node#file-uploads");
    },
    isFsReadStream: (value) => false
  };
}
var init_web_runtime2 = __esm(() => {
  init_MultipartBody2();
});

// node_modules/openai/_shims/bun-runtime.mjs
import { ReadStream as FsReadStream2 } from "fs";
function getRuntime4() {
  const runtime = getRuntime3();
  function isFsReadStream3(value) {
    return value instanceof FsReadStream2;
  }
  return { ...runtime, isFsReadStream: isFsReadStream3 };
}
var init_bun_runtime2 = __esm(() => {
  init_web_runtime2();
});

// node_modules/openai/_shims/auto/runtime-bun.mjs
var init_runtime_bun2 = __esm(() => {
  init_bun_runtime2();
});

// node_modules/openai/_shims/index.mjs
var init = () => {
  if (!kind2)
    setShims2(getRuntime4(), { auto: true });
};
var init__shims2 = __esm(() => {
  init_runtime_bun2();
  init();
});

// node_modules/openai/error.mjs
var OpenAIError, APIError2, APIUserAbortError2, APIConnectionError2, APIConnectionTimeoutError2, BadRequestError2, AuthenticationError2, PermissionDeniedError2, NotFoundError2, ConflictError2, UnprocessableEntityError2, RateLimitError2, InternalServerError2, LengthFinishReasonError, ContentFilterFinishReasonError;
var init_error2 = __esm(() => {
  init_core2();
  OpenAIError = class OpenAIError extends Error {
  };
  APIError2 = class APIError2 extends OpenAIError {
    constructor(status, error, message, headers) {
      super(`${APIError2.makeMessage(status, error, message)}`);
      this.status = status;
      this.headers = headers;
      this.request_id = headers?.["x-request-id"];
      this.error = error;
      const data = error;
      this.code = data?.["code"];
      this.param = data?.["param"];
      this.type = data?.["type"];
    }
    static makeMessage(status, error, message) {
      const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
      if (status && msg) {
        return `${status} ${msg}`;
      }
      if (status) {
        return `${status} status code (no body)`;
      }
      if (msg) {
        return msg;
      }
      return "(no status code or body)";
    }
    static generate(status, errorResponse, message, headers) {
      if (!status || !headers) {
        return new APIConnectionError2({ message, cause: castToError2(errorResponse) });
      }
      const error = errorResponse?.["error"];
      if (status === 400) {
        return new BadRequestError2(status, error, message, headers);
      }
      if (status === 401) {
        return new AuthenticationError2(status, error, message, headers);
      }
      if (status === 403) {
        return new PermissionDeniedError2(status, error, message, headers);
      }
      if (status === 404) {
        return new NotFoundError2(status, error, message, headers);
      }
      if (status === 409) {
        return new ConflictError2(status, error, message, headers);
      }
      if (status === 422) {
        return new UnprocessableEntityError2(status, error, message, headers);
      }
      if (status === 429) {
        return new RateLimitError2(status, error, message, headers);
      }
      if (status >= 500) {
        return new InternalServerError2(status, error, message, headers);
      }
      return new APIError2(status, error, message, headers);
    }
  };
  APIUserAbortError2 = class APIUserAbortError2 extends APIError2 {
    constructor({ message } = {}) {
      super(undefined, undefined, message || "Request was aborted.", undefined);
    }
  };
  APIConnectionError2 = class APIConnectionError2 extends APIError2 {
    constructor({ message, cause }) {
      super(undefined, undefined, message || "Connection error.", undefined);
      if (cause)
        this.cause = cause;
    }
  };
  APIConnectionTimeoutError2 = class APIConnectionTimeoutError2 extends APIConnectionError2 {
    constructor({ message } = {}) {
      super({ message: message ?? "Request timed out." });
    }
  };
  BadRequestError2 = class BadRequestError2 extends APIError2 {
  };
  AuthenticationError2 = class AuthenticationError2 extends APIError2 {
  };
  PermissionDeniedError2 = class PermissionDeniedError2 extends APIError2 {
  };
  NotFoundError2 = class NotFoundError2 extends APIError2 {
  };
  ConflictError2 = class ConflictError2 extends APIError2 {
  };
  UnprocessableEntityError2 = class UnprocessableEntityError2 extends APIError2 {
  };
  RateLimitError2 = class RateLimitError2 extends APIError2 {
  };
  InternalServerError2 = class InternalServerError2 extends APIError2 {
  };
  LengthFinishReasonError = class LengthFinishReasonError extends OpenAIError {
    constructor() {
      super(`Could not parse response content as the length limit was reached`);
    }
  };
  ContentFilterFinishReasonError = class ContentFilterFinishReasonError extends OpenAIError {
    constructor() {
      super(`Could not parse response content as the request was rejected by the content filter`);
    }
  };
});

// node_modules/openai/internal/decoders/line.mjs
class LineDecoder2 {
  constructor() {
    _LineDecoder_carriageReturnIndex.set(this, undefined);
    this.buffer = new Uint8Array;
    __classPrivateFieldSet4(this, _LineDecoder_carriageReturnIndex, null, "f");
  }
  decode(chunk) {
    if (chunk == null) {
      return [];
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
    let newData = new Uint8Array(this.buffer.length + binaryChunk.length);
    newData.set(this.buffer);
    newData.set(binaryChunk, this.buffer.length);
    this.buffer = newData;
    const lines = [];
    let patternIndex;
    while ((patternIndex = findNewlineIndex(this.buffer, __classPrivateFieldGet4(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
      if (patternIndex.carriage && __classPrivateFieldGet4(this, _LineDecoder_carriageReturnIndex, "f") == null) {
        __classPrivateFieldSet4(this, _LineDecoder_carriageReturnIndex, patternIndex.index, "f");
        continue;
      }
      if (__classPrivateFieldGet4(this, _LineDecoder_carriageReturnIndex, "f") != null && (patternIndex.index !== __classPrivateFieldGet4(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
        lines.push(this.decodeText(this.buffer.slice(0, __classPrivateFieldGet4(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
        this.buffer = this.buffer.slice(__classPrivateFieldGet4(this, _LineDecoder_carriageReturnIndex, "f"));
        __classPrivateFieldSet4(this, _LineDecoder_carriageReturnIndex, null, "f");
        continue;
      }
      const endIndex = __classPrivateFieldGet4(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
      const line = this.decodeText(this.buffer.slice(0, endIndex));
      lines.push(line);
      this.buffer = this.buffer.slice(patternIndex.index);
      __classPrivateFieldSet4(this, _LineDecoder_carriageReturnIndex, null, "f");
    }
    return lines;
  }
  decodeText(bytes) {
    if (bytes == null)
      return "";
    if (typeof bytes === "string")
      return bytes;
    if (typeof Buffer !== "undefined") {
      if (bytes instanceof Buffer) {
        return bytes.toString();
      }
      if (bytes instanceof Uint8Array) {
        return Buffer.from(bytes).toString();
      }
      throw new OpenAIError(`Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`);
    }
    if (typeof TextDecoder !== "undefined") {
      if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
        this.textDecoder ?? (this.textDecoder = new TextDecoder("utf8"));
        return this.textDecoder.decode(bytes);
      }
      throw new OpenAIError(`Unexpected: received non-Uint8Array/ArrayBuffer (${bytes.constructor.name}) in a web platform. Please report this error.`);
    }
    throw new OpenAIError(`Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.`);
  }
  flush() {
    if (!this.buffer.length) {
      return [];
    }
    return this.decode(`
`);
  }
}
function findNewlineIndex(buffer, startIndex) {
  const newline = 10;
  const carriage = 13;
  for (let i = startIndex ?? 0;i < buffer.length; i++) {
    if (buffer[i] === newline) {
      return { preceding: i, index: i + 1, carriage: false };
    }
    if (buffer[i] === carriage) {
      return { preceding: i, index: i + 1, carriage: true };
    }
  }
  return null;
}
function findDoubleNewlineIndex2(buffer) {
  const newline = 10;
  const carriage = 13;
  for (let i = 0;i < buffer.length - 1; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
      return i + 4;
    }
  }
  return -1;
}
var __classPrivateFieldSet4 = function(receiver, state, value, kind3, f) {
  if (kind3 === "m")
    throw new TypeError("Private method is not writable");
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind3 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, __classPrivateFieldGet4 = function(receiver, state, kind3, f) {
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind3 === "m" ? f : kind3 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, _LineDecoder_carriageReturnIndex;
var init_line2 = __esm(() => {
  init_error2();
  _LineDecoder_carriageReturnIndex = new WeakMap;
  LineDecoder2.NEWLINE_CHARS = new Set([`
`, "\r"]);
  LineDecoder2.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
});

// node_modules/openai/internal/stream-utils.mjs
function ReadableStreamToAsyncIterable(stream) {
  if (stream[Symbol.asyncIterator])
    return stream;
  const reader = stream.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result?.done)
          reader.releaseLock();
        return result;
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: undefined };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}

// node_modules/openai/streaming.mjs
async function* _iterSSEMessages2(response, controller) {
  if (!response.body) {
    controller.abort();
    throw new OpenAIError(`Attempted to iterate over a response with no body`);
  }
  const sseDecoder = new SSEDecoder2;
  const lineDecoder = new LineDecoder2;
  const iter = ReadableStreamToAsyncIterable(response.body);
  for await (const sseChunk of iterSSEChunks2(iter)) {
    for (const line of lineDecoder.decode(sseChunk)) {
      const sse = sseDecoder.decode(line);
      if (sse)
        yield sse;
    }
  }
  for (const line of lineDecoder.flush()) {
    const sse = sseDecoder.decode(line);
    if (sse)
      yield sse;
  }
}
async function* iterSSEChunks2(iterator) {
  let data = new Uint8Array;
  for await (const chunk of iterator) {
    if (chunk == null) {
      continue;
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
    let newData = new Uint8Array(data.length + binaryChunk.length);
    newData.set(data);
    newData.set(binaryChunk, data.length);
    data = newData;
    let patternIndex;
    while ((patternIndex = findDoubleNewlineIndex2(data)) !== -1) {
      yield data.slice(0, patternIndex);
      data = data.slice(patternIndex);
    }
  }
  if (data.length > 0) {
    yield data;
  }
}

class SSEDecoder2 {
  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.substring(0, line.length - 1);
    }
    if (!line) {
      if (!this.event && !this.data.length)
        return null;
      const sse = {
        event: this.event,
        data: this.data.join(`
`),
        raw: this.chunks
      };
      this.event = null;
      this.data = [];
      this.chunks = [];
      return sse;
    }
    this.chunks.push(line);
    if (line.startsWith(":")) {
      return null;
    }
    let [fieldname, _, value] = partition2(line, ":");
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldname === "event") {
      this.event = value;
    } else if (fieldname === "data") {
      this.data.push(value);
    }
    return null;
  }
}
function partition2(str, delimiter) {
  const index = str.indexOf(delimiter);
  if (index !== -1) {
    return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
  }
  return [str, "", ""];
}
var Stream2;
var init_streaming2 = __esm(() => {
  init__shims2();
  init_error2();
  init_line2();
  init_core2();
  init_error2();
  Stream2 = class Stream2 {
    constructor(iterator, controller) {
      this.iterator = iterator;
      this.controller = controller;
    }
    static fromSSEResponse(response, controller) {
      let consumed = false;
      async function* iterator() {
        if (consumed) {
          throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        }
        consumed = true;
        let done = false;
        try {
          for await (const sse of _iterSSEMessages2(response, controller)) {
            if (done)
              continue;
            if (sse.data.startsWith("[DONE]")) {
              done = true;
              continue;
            }
            if (sse.event === null || sse.event.startsWith("response.") || sse.event.startsWith("transcript.")) {
              let data;
              try {
                data = JSON.parse(sse.data);
              } catch (e) {
                console.error(`Could not parse message into JSON:`, sse.data);
                console.error(`From chunk:`, sse.raw);
                throw e;
              }
              if (data && data.error) {
                throw new APIError2(undefined, data.error, undefined, createResponseHeaders2(response.headers));
              }
              yield data;
            } else {
              let data;
              try {
                data = JSON.parse(sse.data);
              } catch (e) {
                console.error(`Could not parse message into JSON:`, sse.data);
                console.error(`From chunk:`, sse.raw);
                throw e;
              }
              if (sse.event == "error") {
                throw new APIError2(undefined, data.error, data.message, undefined);
              }
              yield { event: sse.event, data };
            }
          }
          done = true;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError")
            return;
          throw e;
        } finally {
          if (!done)
            controller.abort();
        }
      }
      return new Stream2(iterator, controller);
    }
    static fromReadableStream(readableStream, controller) {
      let consumed = false;
      async function* iterLines() {
        const lineDecoder = new LineDecoder2;
        const iter = ReadableStreamToAsyncIterable(readableStream);
        for await (const chunk of iter) {
          for (const line of lineDecoder.decode(chunk)) {
            yield line;
          }
        }
        for (const line of lineDecoder.flush()) {
          yield line;
        }
      }
      async function* iterator() {
        if (consumed) {
          throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        }
        consumed = true;
        let done = false;
        try {
          for await (const line of iterLines()) {
            if (done)
              continue;
            if (line)
              yield JSON.parse(line);
          }
          done = true;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError")
            return;
          throw e;
        } finally {
          if (!done)
            controller.abort();
        }
      }
      return new Stream2(iterator, controller);
    }
    [Symbol.asyncIterator]() {
      return this.iterator();
    }
    tee() {
      const left = [];
      const right = [];
      const iterator = this.iterator();
      const teeIterator = (queue) => {
        return {
          next: () => {
            if (queue.length === 0) {
              const result = iterator.next();
              left.push(result);
              right.push(result);
            }
            return queue.shift();
          }
        };
      };
      return [
        new Stream2(() => teeIterator(left), this.controller),
        new Stream2(() => teeIterator(right), this.controller)
      ];
    }
    toReadableStream() {
      const self = this;
      let iter;
      const encoder = new TextEncoder;
      return new ReadableStream3({
        async start() {
          iter = self[Symbol.asyncIterator]();
        },
        async pull(ctrl) {
          try {
            const { value, done } = await iter.next();
            if (done)
              return ctrl.close();
            const bytes = encoder.encode(JSON.stringify(value) + `
`);
            ctrl.enqueue(bytes);
          } catch (err) {
            ctrl.error(err);
          }
        },
        async cancel() {
          await iter.return?.();
        }
      });
    }
  };
});

// node_modules/openai/uploads.mjs
async function toFile3(value, name, options) {
  value = await value;
  if (isFileLike2(value)) {
    return value;
  }
  if (isResponseLike2(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop() ?? "unknown_file");
    const data = isBlobLike2(blob) ? [await blob.arrayBuffer()] : [blob];
    return new File3(data, name, options);
  }
  const bits = await getBytes2(value);
  name || (name = getName2(value) ?? "unknown_file");
  if (!options?.type) {
    const type = bits[0]?.type;
    if (typeof type === "string") {
      options = { ...options, type };
    }
  }
  return new File3(bits, name, options);
}
async function getBytes2(value) {
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike2(value)) {
    parts.push(await value.arrayBuffer());
  } else if (isAsyncIterableIterator2(value)) {
    for await (const chunk of value) {
      parts.push(chunk);
    }
  } else {
    throw new Error(`Unexpected data type: ${typeof value}; constructor: ${value?.constructor?.name}; props: ${propsForError2(value)}`);
  }
  return parts;
}
function propsForError2(value) {
  const props = Object.getOwnPropertyNames(value);
  return `[${props.map((p) => `"${p}"`).join(", ")}]`;
}
function getName2(value) {
  return getStringFromMaybeBuffer2(value.name) || getStringFromMaybeBuffer2(value.filename) || getStringFromMaybeBuffer2(value.path)?.split(/[\\/]/).pop();
}
var isResponseLike2 = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function", isFileLike2 = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike2(value), isBlobLike2 = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function", isUploadable = (value) => {
  return isFileLike2(value) || isResponseLike2(value) || isFsReadStream2(value);
}, getStringFromMaybeBuffer2 = (x) => {
  if (typeof x === "string")
    return x;
  if (typeof Buffer !== "undefined" && x instanceof Buffer)
    return String(x);
  return;
}, isAsyncIterableIterator2 = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function", isMultipartBody2 = (body) => body && typeof body === "object" && body.body && body[Symbol.toStringTag] === "MultipartBody", multipartFormRequestOptions = async (opts) => {
  const form = await createForm(opts.body);
  return getMultipartRequestOptions2(form, opts);
}, createForm = async (body) => {
  const form = new FormData3;
  await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
  return form;
}, addFormValue = async (form, key, value) => {
  if (value === undefined)
    return;
  if (value == null) {
    throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    form.append(key, String(value));
  } else if (isUploadable(value)) {
    const file = await toFile3(value);
    form.append(key, file);
  } else if (Array.isArray(value)) {
    await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry)));
  } else if (typeof value === "object") {
    await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop)));
  } else {
    throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
  }
};
var init_uploads2 = __esm(() => {
  init__shims2();
  init__shims2();
});

// node_modules/openai/core.mjs
async function defaultParseResponse2(props) {
  const { response } = props;
  if (props.options.stream) {
    debug2("response", response.status, response.url, response.headers, response.body);
    if (props.options.__streamClass) {
      return props.options.__streamClass.fromSSEResponse(response, props.controller);
    }
    return Stream2.fromSSEResponse(response, props.controller);
  }
  if (response.status === 204) {
    return null;
  }
  if (props.options.__binaryResponse) {
    return response;
  }
  const contentType = response.headers.get("content-type");
  const mediaType = contentType?.split(";")[0]?.trim();
  const isJSON = mediaType?.includes("application/json") || mediaType?.endsWith("+json");
  if (isJSON) {
    const json = await response.json();
    debug2("response", response.status, response.url, response.headers, json);
    return _addRequestID(json, response);
  }
  const text = await response.text();
  debug2("response", response.status, response.url, response.headers, text);
  return text;
}
function _addRequestID(value, response) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  return Object.defineProperty(value, "_request_id", {
    value: response.headers.get("x-request-id"),
    enumerable: false
  });
}

class APIClient2 {
  constructor({
    baseURL,
    maxRetries = 2,
    timeout = 600000,
    httpAgent,
    fetch: overriddenFetch
  }) {
    this.baseURL = baseURL;
    this.maxRetries = validatePositiveInteger2("maxRetries", maxRetries);
    this.timeout = validatePositiveInteger2("timeout", timeout);
    this.httpAgent = httpAgent;
    this.fetch = overriddenFetch ?? fetch3;
  }
  authHeaders(opts) {
    return {};
  }
  defaultHeaders(opts) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": this.getUserAgent(),
      ...getPlatformHeaders2(),
      ...this.authHeaders(opts)
    };
  }
  validateHeaders(headers, customHeaders) {}
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid42()}`;
  }
  get(path, opts) {
    return this.methodRequest("get", path, opts);
  }
  post(path, opts) {
    return this.methodRequest("post", path, opts);
  }
  patch(path, opts) {
    return this.methodRequest("patch", path, opts);
  }
  put(path, opts) {
    return this.methodRequest("put", path, opts);
  }
  delete(path, opts) {
    return this.methodRequest("delete", path, opts);
  }
  methodRequest(method, path, opts) {
    return this.request(Promise.resolve(opts).then(async (opts2) => {
      const body = opts2 && isBlobLike2(opts2?.body) ? new DataView(await opts2.body.arrayBuffer()) : opts2?.body instanceof DataView ? opts2.body : opts2?.body instanceof ArrayBuffer ? new DataView(opts2.body) : opts2 && ArrayBuffer.isView(opts2?.body) ? new DataView(opts2.body.buffer) : opts2?.body;
      return { method, path, ...opts2, body };
    }));
  }
  getAPIList(path, Page2, opts) {
    return this.requestAPIList(Page2, { method: "get", path, ...opts });
  }
  calculateContentLength(body) {
    if (typeof body === "string") {
      if (typeof Buffer !== "undefined") {
        return Buffer.byteLength(body, "utf8").toString();
      }
      if (typeof TextEncoder !== "undefined") {
        const encoder = new TextEncoder;
        const encoded = encoder.encode(body);
        return encoded.length.toString();
      }
    } else if (ArrayBuffer.isView(body)) {
      return body.byteLength.toString();
    }
    return null;
  }
  buildRequest(inputOptions, { retryCount = 0 } = {}) {
    const options = { ...inputOptions };
    const { method, path, query, headers = {} } = options;
    const body = ArrayBuffer.isView(options.body) || options.__binaryRequest && typeof options.body === "string" ? options.body : isMultipartBody2(options.body) ? options.body.body : options.body ? JSON.stringify(options.body, null, 2) : null;
    const contentLength = this.calculateContentLength(body);
    const url = this.buildURL(path, query);
    if ("timeout" in options)
      validatePositiveInteger2("timeout", options.timeout);
    options.timeout = options.timeout ?? this.timeout;
    const httpAgent = options.httpAgent ?? this.httpAgent ?? getDefaultAgent2(url);
    const minAgentTimeout = options.timeout + 1000;
    if (typeof httpAgent?.options?.timeout === "number" && minAgentTimeout > (httpAgent.options.timeout ?? 0)) {
      httpAgent.options.timeout = minAgentTimeout;
    }
    if (this.idempotencyHeader && method !== "get") {
      if (!inputOptions.idempotencyKey)
        inputOptions.idempotencyKey = this.defaultIdempotencyKey();
      headers[this.idempotencyHeader] = inputOptions.idempotencyKey;
    }
    const reqHeaders = this.buildHeaders({ options, headers, contentLength, retryCount });
    const req = {
      method,
      ...body && { body },
      headers: reqHeaders,
      ...httpAgent && { agent: httpAgent },
      signal: options.signal ?? null
    };
    return { req, url, timeout: options.timeout };
  }
  buildHeaders({ options, headers, contentLength, retryCount }) {
    const reqHeaders = {};
    if (contentLength) {
      reqHeaders["content-length"] = contentLength;
    }
    const defaultHeaders = this.defaultHeaders(options);
    applyHeadersMut2(reqHeaders, defaultHeaders);
    applyHeadersMut2(reqHeaders, headers);
    if (isMultipartBody2(options.body) && kind2 !== "node") {
      delete reqHeaders["content-type"];
    }
    if (getHeader2(defaultHeaders, "x-stainless-retry-count") === undefined && getHeader2(headers, "x-stainless-retry-count") === undefined) {
      reqHeaders["x-stainless-retry-count"] = String(retryCount);
    }
    if (getHeader2(defaultHeaders, "x-stainless-timeout") === undefined && getHeader2(headers, "x-stainless-timeout") === undefined && options.timeout) {
      reqHeaders["x-stainless-timeout"] = String(Math.trunc(options.timeout / 1000));
    }
    this.validateHeaders(reqHeaders, headers);
    return reqHeaders;
  }
  async prepareOptions(options) {}
  async prepareRequest(request, { url, options }) {}
  parseHeaders(headers) {
    return !headers ? {} : (Symbol.iterator in headers) ? Object.fromEntries(Array.from(headers).map((header) => [...header])) : { ...headers };
  }
  makeStatusError(status, error, message, headers) {
    return APIError2.generate(status, error, message, headers);
  }
  request(options, remainingRetries = null) {
    return new APIPromise2(this.makeRequest(options, remainingRetries));
  }
  async makeRequest(optionsInput, retriesRemaining) {
    const options = await optionsInput;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }
    await this.prepareOptions(options);
    const { req, url, timeout } = this.buildRequest(options, { retryCount: maxRetries - retriesRemaining });
    await this.prepareRequest(req, { url, options });
    debug2("request", url, options, req.headers);
    if (options.signal?.aborted) {
      throw new APIUserAbortError2;
    }
    const controller = new AbortController;
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError2);
    if (response instanceof Error) {
      if (options.signal?.aborted) {
        throw new APIUserAbortError2;
      }
      if (retriesRemaining) {
        return this.retryRequest(options, retriesRemaining);
      }
      if (response.name === "AbortError") {
        throw new APIConnectionTimeoutError2;
      }
      throw new APIConnectionError2({ cause: response });
    }
    const responseHeaders = createResponseHeaders2(response.headers);
    if (!response.ok) {
      if (retriesRemaining && this.shouldRetry(response)) {
        const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
        debug2(`response (error; ${retryMessage2})`, response.status, url, responseHeaders);
        return this.retryRequest(options, retriesRemaining, responseHeaders);
      }
      const errText = await response.text().catch((e) => castToError2(e).message);
      const errJSON = safeJSON2(errText);
      const errMessage = errJSON ? undefined : errText;
      const retryMessage = retriesRemaining ? `(error; no more retries left)` : `(error; not retryable)`;
      debug2(`response (error; ${retryMessage})`, response.status, url, responseHeaders, errMessage);
      const err = this.makeStatusError(response.status, errJSON, errMessage, responseHeaders);
      throw err;
    }
    return { response, options, controller };
  }
  requestAPIList(Page2, options) {
    const request = this.makeRequest(options, null);
    return new PagePromise2(this, request, Page2);
  }
  buildURL(path, query) {
    const url = isAbsoluteURL2(path) ? new URL(path) : new URL(this.baseURL + (this.baseURL.endsWith("/") && path.startsWith("/") ? path.slice(1) : path));
    const defaultQuery = this.defaultQuery();
    if (!isEmptyObj2(defaultQuery)) {
      query = { ...defaultQuery, ...query };
    }
    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  stringifyQuery(query) {
    return Object.entries(query).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
      if (value === null) {
        return `${encodeURIComponent(key)}=`;
      }
      throw new OpenAIError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
    }).join("&");
  }
  async fetchWithTimeout(url, init2, ms, controller) {
    const { signal, ...options } = init2 || {};
    if (signal)
      signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    const fetchOptions = {
      signal: controller.signal,
      ...options
    };
    if (fetchOptions.method) {
      fetchOptions.method = fetchOptions.method.toUpperCase();
    }
    return this.fetch.call(undefined, url, fetchOptions).finally(() => {
      clearTimeout(timeout);
    });
  }
  shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options, retriesRemaining, responseHeaders) {
    let timeoutMillis;
    const retryAfterMillisHeader = responseHeaders?.["retry-after-ms"];
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }
    const retryAfterHeader = responseHeaders?.["retry-after"];
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1000;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1000)) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep2(timeoutMillis);
    return this.makeRequest(options, retriesRemaining - 1);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1000;
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION2}`;
  }
}
function getBrowserInfo2() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match = pattern.exec(navigator.userAgent);
    if (match) {
      const major = match[1] || 0;
      const minor = match[2] || 0;
      const patch = match[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
function isEmptyObj2(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
function hasOwn2(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function applyHeadersMut2(targetHeaders, newHeaders) {
  for (const k in newHeaders) {
    if (!hasOwn2(newHeaders, k))
      continue;
    const lowerKey = k.toLowerCase();
    if (!lowerKey)
      continue;
    const val = newHeaders[k];
    if (val === null) {
      delete targetHeaders[lowerKey];
    } else if (val !== undefined) {
      targetHeaders[lowerKey] = val;
    }
  }
}
function debug2(action, ...args) {
  if (typeof process !== "undefined" && process?.env?.["DEBUG"] === "true") {
    const modifiedArgs = args.map((arg) => {
      if (!arg) {
        return arg;
      }
      if (arg["headers"]) {
        const modifiedArg2 = { ...arg, headers: { ...arg["headers"] } };
        for (const header in arg["headers"]) {
          if (SENSITIVE_HEADERS.has(header.toLowerCase())) {
            modifiedArg2["headers"][header] = "REDACTED";
          }
        }
        return modifiedArg2;
      }
      let modifiedArg = null;
      for (const header in arg) {
        if (SENSITIVE_HEADERS.has(header.toLowerCase())) {
          modifiedArg ?? (modifiedArg = { ...arg });
          modifiedArg[header] = "REDACTED";
        }
      }
      return modifiedArg ?? arg;
    });
    console.log(`OpenAI:DEBUG:${action}`, ...modifiedArgs);
  }
}
function isObj(obj) {
  return obj != null && typeof obj === "object" && !Array.isArray(obj);
}
var __classPrivateFieldSet5 = function(receiver, state, value, kind3, f) {
  if (kind3 === "m")
    throw new TypeError("Private method is not writable");
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind3 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, __classPrivateFieldGet5 = function(receiver, state, kind3, f) {
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind3 === "m" ? f : kind3 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, _AbstractPage_client2, APIPromise2, AbstractPage2, PagePromise2, createResponseHeaders2 = (headers) => {
  return new Proxy(Object.fromEntries(headers.entries()), {
    get(target, name) {
      const key = name.toString();
      return target[key.toLowerCase()] || target[key];
    }
  });
}, requestOptionsKeys2, isRequestOptions2 = (obj) => {
  return typeof obj === "object" && obj !== null && !isEmptyObj2(obj) && Object.keys(obj).every((k) => hasOwn2(requestOptionsKeys2, k));
}, getPlatformProperties2 = () => {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION2,
      "X-Stainless-OS": normalizePlatform2(Deno.build.os),
      "X-Stainless-Arch": normalizeArch2(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION2,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION2,
      "X-Stainless-OS": normalizePlatform2(process.platform),
      "X-Stainless-Arch": normalizeArch2(process.arch),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  const browserInfo = getBrowserInfo2();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION2,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION2,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
}, normalizeArch2 = (arch) => {
  if (arch === "x32")
    return "x32";
  if (arch === "x86_64" || arch === "x64")
    return "x64";
  if (arch === "arm")
    return "arm";
  if (arch === "aarch64" || arch === "arm64")
    return "arm64";
  if (arch)
    return `other:${arch}`;
  return "unknown";
}, normalizePlatform2 = (platform) => {
  platform = platform.toLowerCase();
  if (platform.includes("ios"))
    return "iOS";
  if (platform === "android")
    return "Android";
  if (platform === "darwin")
    return "MacOS";
  if (platform === "win32")
    return "Windows";
  if (platform === "freebsd")
    return "FreeBSD";
  if (platform === "openbsd")
    return "OpenBSD";
  if (platform === "linux")
    return "Linux";
  if (platform)
    return `Other:${platform}`;
  return "Unknown";
}, _platformHeaders2, getPlatformHeaders2 = () => {
  return _platformHeaders2 ?? (_platformHeaders2 = getPlatformProperties2());
}, safeJSON2 = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return;
  }
}, startsWithSchemeRegexp2, isAbsoluteURL2 = (url) => {
  return startsWithSchemeRegexp2.test(url);
}, sleep2 = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), validatePositiveInteger2 = (name, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new OpenAIError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new OpenAIError(`${name} must be a positive integer`);
  }
  return n;
}, castToError2 = (err) => {
  if (err instanceof Error)
    return err;
  if (typeof err === "object" && err !== null) {
    try {
      return new Error(JSON.stringify(err));
    } catch {}
  }
  return new Error(err);
}, readEnv2 = (env) => {
  if (typeof process !== "undefined") {
    return process.env?.[env]?.trim() ?? undefined;
  }
  if (typeof Deno !== "undefined") {
    return Deno.env?.get?.(env)?.trim();
  }
  return;
}, SENSITIVE_HEADERS, uuid42 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}, isRunningInBrowser2 = () => {
  return typeof window !== "undefined" && typeof window.document !== "undefined" && typeof navigator !== "undefined";
}, isHeadersProtocol2 = (headers) => {
  return typeof headers?.get === "function";
}, getHeader2 = (headers, header) => {
  const lowerCasedHeader = header.toLowerCase();
  if (isHeadersProtocol2(headers)) {
    const intercapsHeader = header[0]?.toUpperCase() + header.substring(1).replace(/([^\w])(\w)/g, (_m, g1, g2) => g1 + g2.toUpperCase());
    for (const key of [header, lowerCasedHeader, header.toUpperCase(), intercapsHeader]) {
      const value = headers.get(key);
      if (value) {
        return value;
      }
    }
  }
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lowerCasedHeader) {
      if (Array.isArray(value)) {
        if (value.length <= 1)
          return value[0];
        console.warn(`Received ${value.length} entries for the ${header} header, using the first entry.`);
        return value[0];
      }
      return value;
    }
  }
  return;
}, toFloat32Array = (base64Str) => {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(base64Str, "base64");
    return Array.from(new Float32Array(buf.buffer, buf.byteOffset, buf.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const binaryStr = atob(base64Str);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0;i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return Array.from(new Float32Array(bytes.buffer));
  }
};
var init_core2 = __esm(() => {
  init_streaming2();
  init_error2();
  init__shims2();
  init_uploads2();
  init_uploads2();
  init();
  APIPromise2 = class APIPromise2 extends Promise {
    constructor(responsePromise, parseResponse = defaultParseResponse2) {
      super((resolve) => {
        resolve(null);
      });
      this.responsePromise = responsePromise;
      this.parseResponse = parseResponse;
    }
    _thenUnwrap(transform) {
      return new APIPromise2(this.responsePromise, async (props) => _addRequestID(transform(await this.parseResponse(props), props), props.response));
    }
    asResponse() {
      return this.responsePromise.then((p) => p.response);
    }
    async withResponse() {
      const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
      return { data, response, request_id: response.headers.get("x-request-id") };
    }
    parse() {
      if (!this.parsedPromise) {
        this.parsedPromise = this.responsePromise.then(this.parseResponse);
      }
      return this.parsedPromise;
    }
    then(onfulfilled, onrejected) {
      return this.parse().then(onfulfilled, onrejected);
    }
    catch(onrejected) {
      return this.parse().catch(onrejected);
    }
    finally(onfinally) {
      return this.parse().finally(onfinally);
    }
  };
  AbstractPage2 = class AbstractPage2 {
    constructor(client, response, body, options) {
      _AbstractPage_client2.set(this, undefined);
      __classPrivateFieldSet5(this, _AbstractPage_client2, client, "f");
      this.options = options;
      this.response = response;
      this.body = body;
    }
    hasNextPage() {
      const items = this.getPaginatedItems();
      if (!items.length)
        return false;
      return this.nextPageInfo() != null;
    }
    async getNextPage() {
      const nextInfo = this.nextPageInfo();
      if (!nextInfo) {
        throw new OpenAIError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
      }
      const nextOptions = { ...this.options };
      if ("params" in nextInfo && typeof nextOptions.query === "object") {
        nextOptions.query = { ...nextOptions.query, ...nextInfo.params };
      } else if ("url" in nextInfo) {
        const params = [...Object.entries(nextOptions.query || {}), ...nextInfo.url.searchParams.entries()];
        for (const [key, value] of params) {
          nextInfo.url.searchParams.set(key, value);
        }
        nextOptions.query = undefined;
        nextOptions.path = nextInfo.url.toString();
      }
      return await __classPrivateFieldGet5(this, _AbstractPage_client2, "f").requestAPIList(this.constructor, nextOptions);
    }
    async* iterPages() {
      let page = this;
      yield page;
      while (page.hasNextPage()) {
        page = await page.getNextPage();
        yield page;
      }
    }
    async* [(_AbstractPage_client2 = new WeakMap, Symbol.asyncIterator)]() {
      for await (const page of this.iterPages()) {
        for (const item of page.getPaginatedItems()) {
          yield item;
        }
      }
    }
  };
  PagePromise2 = class PagePromise2 extends APIPromise2 {
    constructor(client, request, Page2) {
      super(request, async (props) => new Page2(client, props.response, await defaultParseResponse2(props), props.options));
    }
    async* [Symbol.asyncIterator]() {
      const page = await this;
      for await (const item of page) {
        yield item;
      }
    }
  };
  requestOptionsKeys2 = {
    method: true,
    path: true,
    query: true,
    body: true,
    headers: true,
    maxRetries: true,
    stream: true,
    timeout: true,
    httpAgent: true,
    signal: true,
    idempotencyKey: true,
    __metadata: true,
    __binaryRequest: true,
    __binaryResponse: true,
    __streamClass: true
  };
  startsWithSchemeRegexp2 = /^[a-z][a-z0-9+.-]*:/i;
  SENSITIVE_HEADERS = new Set(["authorization", "api-key"]);
});

// node_modules/openai/pagination.mjs
var Page2, CursorPage;
var init_pagination2 = __esm(() => {
  init_core2();
  Page2 = class Page2 extends AbstractPage2 {
    constructor(client, response, body, options) {
      super(client, response, body, options);
      this.data = body.data || [];
      this.object = body.object;
    }
    getPaginatedItems() {
      return this.data ?? [];
    }
    nextPageParams() {
      return null;
    }
    nextPageInfo() {
      return null;
    }
  };
  CursorPage = class CursorPage extends AbstractPage2 {
    constructor(client, response, body, options) {
      super(client, response, body, options);
      this.data = body.data || [];
      this.has_more = body.has_more || false;
    }
    getPaginatedItems() {
      return this.data ?? [];
    }
    hasNextPage() {
      if (this.has_more === false) {
        return false;
      }
      return super.hasNextPage();
    }
    nextPageParams() {
      const info = this.nextPageInfo();
      if (!info)
        return null;
      if ("params" in info)
        return info.params;
      const params = Object.fromEntries(info.url.searchParams);
      if (!Object.keys(params).length)
        return null;
      return params;
    }
    nextPageInfo() {
      const data = this.getPaginatedItems();
      if (!data.length) {
        return null;
      }
      const id = data[data.length - 1]?.id;
      if (!id) {
        return null;
      }
      return { params: { after: id } };
    }
  };
});

// node_modules/openai/resource.mjs
class APIResource2 {
  constructor(client) {
    this._client = client;
  }
}

// node_modules/openai/resources/chat/completions/messages.mjs
var Messages4;
var init_messages4 = __esm(() => {
  init_core2();
  init_completions2();
  Messages4 = class Messages4 extends APIResource2 {
    list(completionId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list(completionId, {}, query);
      }
      return this._client.getAPIList(`/chat/completions/${completionId}/messages`, ChatCompletionStoreMessagesPage, { query, ...options });
    }
  };
});

// node_modules/openai/resources/chat/completions/completions.mjs
var Completions2, ChatCompletionsPage, ChatCompletionStoreMessagesPage;
var init_completions2 = __esm(() => {
  init_core2();
  init_messages4();
  init_messages4();
  init_pagination2();
  Completions2 = class Completions2 extends APIResource2 {
    constructor() {
      super(...arguments);
      this.messages = new Messages4(this._client);
    }
    create(body, options) {
      return this._client.post("/chat/completions", { body, ...options, stream: body.stream ?? false });
    }
    retrieve(completionId, options) {
      return this._client.get(`/chat/completions/${completionId}`, options);
    }
    update(completionId, body, options) {
      return this._client.post(`/chat/completions/${completionId}`, { body, ...options });
    }
    list(query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list({}, query);
      }
      return this._client.getAPIList("/chat/completions", ChatCompletionsPage, { query, ...options });
    }
    del(completionId, options) {
      return this._client.delete(`/chat/completions/${completionId}`, options);
    }
  };
  ChatCompletionsPage = class ChatCompletionsPage extends CursorPage {
  };
  ChatCompletionStoreMessagesPage = class ChatCompletionStoreMessagesPage extends CursorPage {
  };
  Completions2.ChatCompletionsPage = ChatCompletionsPage;
  Completions2.Messages = Messages4;
});

// node_modules/openai/resources/chat/chat.mjs
var Chat;
var init_chat = __esm(() => {
  init_completions2();
  init_completions2();
  Chat = class Chat extends APIResource2 {
    constructor() {
      super(...arguments);
      this.completions = new Completions2(this._client);
    }
  };
  Chat.Completions = Completions2;
  Chat.ChatCompletionsPage = ChatCompletionsPage;
});

// node_modules/openai/resources/chat/index.mjs
var init_chat2 = __esm(() => {
  init_chat();
});

// node_modules/openai/resources/shared.mjs
var init_shared = () => {};

// node_modules/openai/resources/audio/speech.mjs
var Speech;
var init_speech = __esm(() => {
  Speech = class Speech extends APIResource2 {
    create(body, options) {
      return this._client.post("/audio/speech", {
        body,
        ...options,
        headers: { Accept: "application/octet-stream", ...options?.headers },
        __binaryResponse: true
      });
    }
  };
});

// node_modules/openai/resources/audio/transcriptions.mjs
var Transcriptions;
var init_transcriptions = __esm(() => {
  init_core2();
  Transcriptions = class Transcriptions extends APIResource2 {
    create(body, options) {
      return this._client.post("/audio/transcriptions", multipartFormRequestOptions({
        body,
        ...options,
        stream: body.stream ?? false,
        __metadata: { model: body.model }
      }));
    }
  };
});

// node_modules/openai/resources/audio/translations.mjs
var Translations;
var init_translations = __esm(() => {
  init_core2();
  Translations = class Translations extends APIResource2 {
    create(body, options) {
      return this._client.post("/audio/translations", multipartFormRequestOptions({ body, ...options, __metadata: { model: body.model } }));
    }
  };
});

// node_modules/openai/resources/audio/audio.mjs
var Audio;
var init_audio = __esm(() => {
  init_speech();
  init_speech();
  init_transcriptions();
  init_transcriptions();
  init_translations();
  init_translations();
  Audio = class Audio extends APIResource2 {
    constructor() {
      super(...arguments);
      this.transcriptions = new Transcriptions(this._client);
      this.translations = new Translations(this._client);
      this.speech = new Speech(this._client);
    }
  };
  Audio.Transcriptions = Transcriptions;
  Audio.Translations = Translations;
  Audio.Speech = Speech;
});

// node_modules/openai/resources/batches.mjs
var Batches2, BatchesPage;
var init_batches2 = __esm(() => {
  init_core2();
  init_pagination2();
  Batches2 = class Batches2 extends APIResource2 {
    create(body, options) {
      return this._client.post("/batches", { body, ...options });
    }
    retrieve(batchId, options) {
      return this._client.get(`/batches/${batchId}`, options);
    }
    list(query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list({}, query);
      }
      return this._client.getAPIList("/batches", BatchesPage, { query, ...options });
    }
    cancel(batchId, options) {
      return this._client.post(`/batches/${batchId}/cancel`, options);
    }
  };
  BatchesPage = class BatchesPage extends CursorPage {
  };
  Batches2.BatchesPage = BatchesPage;
});

// node_modules/openai/lib/EventStream.mjs
class EventStream {
  constructor() {
    _EventStream_instances.add(this);
    this.controller = new AbortController;
    _EventStream_connectedPromise.set(this, undefined);
    _EventStream_resolveConnectedPromise.set(this, () => {});
    _EventStream_rejectConnectedPromise.set(this, () => {});
    _EventStream_endPromise.set(this, undefined);
    _EventStream_resolveEndPromise.set(this, () => {});
    _EventStream_rejectEndPromise.set(this, () => {});
    _EventStream_listeners.set(this, {});
    _EventStream_ended.set(this, false);
    _EventStream_errored.set(this, false);
    _EventStream_aborted.set(this, false);
    _EventStream_catchingPromiseCreated.set(this, false);
    __classPrivateFieldSet6(this, _EventStream_connectedPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet6(this, _EventStream_resolveConnectedPromise, resolve, "f");
      __classPrivateFieldSet6(this, _EventStream_rejectConnectedPromise, reject, "f");
    }), "f");
    __classPrivateFieldSet6(this, _EventStream_endPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet6(this, _EventStream_resolveEndPromise, resolve, "f");
      __classPrivateFieldSet6(this, _EventStream_rejectEndPromise, reject, "f");
    }), "f");
    __classPrivateFieldGet6(this, _EventStream_connectedPromise, "f").catch(() => {});
    __classPrivateFieldGet6(this, _EventStream_endPromise, "f").catch(() => {});
  }
  _run(executor) {
    setTimeout(() => {
      executor().then(() => {
        this._emitFinal();
        this._emit("end");
      }, __classPrivateFieldGet6(this, _EventStream_instances, "m", _EventStream_handleError).bind(this));
    }, 0);
  }
  _connected() {
    if (this.ended)
      return;
    __classPrivateFieldGet6(this, _EventStream_resolveConnectedPromise, "f").call(this);
    this._emit("connect");
  }
  get ended() {
    return __classPrivateFieldGet6(this, _EventStream_ended, "f");
  }
  get errored() {
    return __classPrivateFieldGet6(this, _EventStream_errored, "f");
  }
  get aborted() {
    return __classPrivateFieldGet6(this, _EventStream_aborted, "f");
  }
  abort() {
    this.controller.abort();
  }
  on(event, listener) {
    const listeners = __classPrivateFieldGet6(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet6(this, _EventStream_listeners, "f")[event] = []);
    listeners.push({ listener });
    return this;
  }
  off(event, listener) {
    const listeners = __classPrivateFieldGet6(this, _EventStream_listeners, "f")[event];
    if (!listeners)
      return this;
    const index = listeners.findIndex((l) => l.listener === listener);
    if (index >= 0)
      listeners.splice(index, 1);
    return this;
  }
  once(event, listener) {
    const listeners = __classPrivateFieldGet6(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet6(this, _EventStream_listeners, "f")[event] = []);
    listeners.push({ listener, once: true });
    return this;
  }
  emitted(event) {
    return new Promise((resolve, reject) => {
      __classPrivateFieldSet6(this, _EventStream_catchingPromiseCreated, true, "f");
      if (event !== "error")
        this.once("error", reject);
      this.once(event, resolve);
    });
  }
  async done() {
    __classPrivateFieldSet6(this, _EventStream_catchingPromiseCreated, true, "f");
    await __classPrivateFieldGet6(this, _EventStream_endPromise, "f");
  }
  _emit(event, ...args) {
    if (__classPrivateFieldGet6(this, _EventStream_ended, "f")) {
      return;
    }
    if (event === "end") {
      __classPrivateFieldSet6(this, _EventStream_ended, true, "f");
      __classPrivateFieldGet6(this, _EventStream_resolveEndPromise, "f").call(this);
    }
    const listeners = __classPrivateFieldGet6(this, _EventStream_listeners, "f")[event];
    if (listeners) {
      __classPrivateFieldGet6(this, _EventStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
      listeners.forEach(({ listener }) => listener(...args));
    }
    if (event === "abort") {
      const error = args[0];
      if (!__classPrivateFieldGet6(this, _EventStream_catchingPromiseCreated, "f") && !listeners?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet6(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet6(this, _EventStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
      return;
    }
    if (event === "error") {
      const error = args[0];
      if (!__classPrivateFieldGet6(this, _EventStream_catchingPromiseCreated, "f") && !listeners?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet6(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet6(this, _EventStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
    }
  }
  _emitFinal() {}
}
var __classPrivateFieldSet6 = function(receiver, state, value, kind3, f) {
  if (kind3 === "m")
    throw new TypeError("Private method is not writable");
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind3 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, __classPrivateFieldGet6 = function(receiver, state, kind3, f) {
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind3 === "m" ? f : kind3 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, _EventStream_instances, _EventStream_connectedPromise, _EventStream_resolveConnectedPromise, _EventStream_rejectConnectedPromise, _EventStream_endPromise, _EventStream_resolveEndPromise, _EventStream_rejectEndPromise, _EventStream_listeners, _EventStream_ended, _EventStream_errored, _EventStream_aborted, _EventStream_catchingPromiseCreated, _EventStream_handleError;
var init_EventStream = __esm(() => {
  init_error2();
  _EventStream_connectedPromise = new WeakMap, _EventStream_resolveConnectedPromise = new WeakMap, _EventStream_rejectConnectedPromise = new WeakMap, _EventStream_endPromise = new WeakMap, _EventStream_resolveEndPromise = new WeakMap, _EventStream_rejectEndPromise = new WeakMap, _EventStream_listeners = new WeakMap, _EventStream_ended = new WeakMap, _EventStream_errored = new WeakMap, _EventStream_aborted = new WeakMap, _EventStream_catchingPromiseCreated = new WeakMap, _EventStream_instances = new WeakSet, _EventStream_handleError = function _EventStream_handleError2(error) {
    __classPrivateFieldSet6(this, _EventStream_errored, true, "f");
    if (error instanceof Error && error.name === "AbortError") {
      error = new APIUserAbortError2;
    }
    if (error instanceof APIUserAbortError2) {
      __classPrivateFieldSet6(this, _EventStream_aborted, true, "f");
      return this._emit("abort", error);
    }
    if (error instanceof OpenAIError) {
      return this._emit("error", error);
    }
    if (error instanceof Error) {
      const openAIError = new OpenAIError(error.message);
      openAIError.cause = error;
      return this._emit("error", openAIError);
    }
    return this._emit("error", new OpenAIError(String(error)));
  };
});

// node_modules/openai/lib/AssistantStream.mjs
function assertNever(_x) {}
var __classPrivateFieldGet7 = function(receiver, state, kind3, f) {
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind3 === "m" ? f : kind3 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, __classPrivateFieldSet7 = function(receiver, state, value, kind3, f) {
  if (kind3 === "m")
    throw new TypeError("Private method is not writable");
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind3 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, _AssistantStream_instances, _AssistantStream_events, _AssistantStream_runStepSnapshots, _AssistantStream_messageSnapshots, _AssistantStream_messageSnapshot, _AssistantStream_finalRun, _AssistantStream_currentContentIndex, _AssistantStream_currentContent, _AssistantStream_currentToolCallIndex, _AssistantStream_currentToolCall, _AssistantStream_currentEvent, _AssistantStream_currentRunSnapshot, _AssistantStream_currentRunStepSnapshot, _AssistantStream_addEvent, _AssistantStream_endRequest, _AssistantStream_handleMessage, _AssistantStream_handleRunStep, _AssistantStream_handleEvent, _AssistantStream_accumulateRunStep, _AssistantStream_accumulateMessage, _AssistantStream_accumulateContent, _AssistantStream_handleRun, AssistantStream;
var init_AssistantStream = __esm(() => {
  init_core2();
  init_streaming2();
  init_error2();
  init_EventStream();
  AssistantStream = class AssistantStream extends EventStream {
    constructor() {
      super(...arguments);
      _AssistantStream_instances.add(this);
      _AssistantStream_events.set(this, []);
      _AssistantStream_runStepSnapshots.set(this, {});
      _AssistantStream_messageSnapshots.set(this, {});
      _AssistantStream_messageSnapshot.set(this, undefined);
      _AssistantStream_finalRun.set(this, undefined);
      _AssistantStream_currentContentIndex.set(this, undefined);
      _AssistantStream_currentContent.set(this, undefined);
      _AssistantStream_currentToolCallIndex.set(this, undefined);
      _AssistantStream_currentToolCall.set(this, undefined);
      _AssistantStream_currentEvent.set(this, undefined);
      _AssistantStream_currentRunSnapshot.set(this, undefined);
      _AssistantStream_currentRunStepSnapshot.set(this, undefined);
    }
    [(_AssistantStream_events = new WeakMap, _AssistantStream_runStepSnapshots = new WeakMap, _AssistantStream_messageSnapshots = new WeakMap, _AssistantStream_messageSnapshot = new WeakMap, _AssistantStream_finalRun = new WeakMap, _AssistantStream_currentContentIndex = new WeakMap, _AssistantStream_currentContent = new WeakMap, _AssistantStream_currentToolCallIndex = new WeakMap, _AssistantStream_currentToolCall = new WeakMap, _AssistantStream_currentEvent = new WeakMap, _AssistantStream_currentRunSnapshot = new WeakMap, _AssistantStream_currentRunStepSnapshot = new WeakMap, _AssistantStream_instances = new WeakSet, Symbol.asyncIterator)]() {
      const pushQueue = [];
      const readQueue = [];
      let done = false;
      this.on("event", (event) => {
        const reader = readQueue.shift();
        if (reader) {
          reader.resolve(event);
        } else {
          pushQueue.push(event);
        }
      });
      this.on("end", () => {
        done = true;
        for (const reader of readQueue) {
          reader.resolve(undefined);
        }
        readQueue.length = 0;
      });
      this.on("abort", (err) => {
        done = true;
        for (const reader of readQueue) {
          reader.reject(err);
        }
        readQueue.length = 0;
      });
      this.on("error", (err) => {
        done = true;
        for (const reader of readQueue) {
          reader.reject(err);
        }
        readQueue.length = 0;
      });
      return {
        next: async () => {
          if (!pushQueue.length) {
            if (done) {
              return { value: undefined, done: true };
            }
            return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: undefined, done: true });
          }
          const chunk = pushQueue.shift();
          return { value: chunk, done: false };
        },
        return: async () => {
          this.abort();
          return { value: undefined, done: true };
        }
      };
    }
    static fromReadableStream(stream) {
      const runner = new AssistantStream;
      runner._run(() => runner._fromReadableStream(stream));
      return runner;
    }
    async _fromReadableStream(readableStream, options) {
      const signal = options?.signal;
      if (signal) {
        if (signal.aborted)
          this.controller.abort();
        signal.addEventListener("abort", () => this.controller.abort());
      }
      this._connected();
      const stream = Stream2.fromReadableStream(readableStream, this.controller);
      for await (const event of stream) {
        __classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError2;
      }
      return this._addRun(__classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
    }
    toReadableStream() {
      const stream = new Stream2(this[Symbol.asyncIterator].bind(this), this.controller);
      return stream.toReadableStream();
    }
    static createToolAssistantStream(threadId, runId, runs, params, options) {
      const runner = new AssistantStream;
      runner._run(() => runner._runToolAssistantStream(threadId, runId, runs, params, {
        ...options,
        headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
      }));
      return runner;
    }
    async _createToolAssistantStream(run, threadId, runId, params, options) {
      const signal = options?.signal;
      if (signal) {
        if (signal.aborted)
          this.controller.abort();
        signal.addEventListener("abort", () => this.controller.abort());
      }
      const body = { ...params, stream: true };
      const stream = await run.submitToolOutputs(threadId, runId, body, {
        ...options,
        signal: this.controller.signal
      });
      this._connected();
      for await (const event of stream) {
        __classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError2;
      }
      return this._addRun(__classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
    }
    static createThreadAssistantStream(params, thread, options) {
      const runner = new AssistantStream;
      runner._run(() => runner._threadAssistantStream(params, thread, {
        ...options,
        headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
      }));
      return runner;
    }
    static createAssistantStream(threadId, runs, params, options) {
      const runner = new AssistantStream;
      runner._run(() => runner._runAssistantStream(threadId, runs, params, {
        ...options,
        headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
      }));
      return runner;
    }
    currentEvent() {
      return __classPrivateFieldGet7(this, _AssistantStream_currentEvent, "f");
    }
    currentRun() {
      return __classPrivateFieldGet7(this, _AssistantStream_currentRunSnapshot, "f");
    }
    currentMessageSnapshot() {
      return __classPrivateFieldGet7(this, _AssistantStream_messageSnapshot, "f");
    }
    currentRunStepSnapshot() {
      return __classPrivateFieldGet7(this, _AssistantStream_currentRunStepSnapshot, "f");
    }
    async finalRunSteps() {
      await this.done();
      return Object.values(__classPrivateFieldGet7(this, _AssistantStream_runStepSnapshots, "f"));
    }
    async finalMessages() {
      await this.done();
      return Object.values(__classPrivateFieldGet7(this, _AssistantStream_messageSnapshots, "f"));
    }
    async finalRun() {
      await this.done();
      if (!__classPrivateFieldGet7(this, _AssistantStream_finalRun, "f"))
        throw Error("Final run was not received.");
      return __classPrivateFieldGet7(this, _AssistantStream_finalRun, "f");
    }
    async _createThreadAssistantStream(thread, params, options) {
      const signal = options?.signal;
      if (signal) {
        if (signal.aborted)
          this.controller.abort();
        signal.addEventListener("abort", () => this.controller.abort());
      }
      const body = { ...params, stream: true };
      const stream = await thread.createAndRun(body, { ...options, signal: this.controller.signal });
      this._connected();
      for await (const event of stream) {
        __classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError2;
      }
      return this._addRun(__classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
    }
    async _createAssistantStream(run, threadId, params, options) {
      const signal = options?.signal;
      if (signal) {
        if (signal.aborted)
          this.controller.abort();
        signal.addEventListener("abort", () => this.controller.abort());
      }
      const body = { ...params, stream: true };
      const stream = await run.create(threadId, body, { ...options, signal: this.controller.signal });
      this._connected();
      for await (const event of stream) {
        __classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError2;
      }
      return this._addRun(__classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
    }
    static accumulateDelta(acc, delta) {
      for (const [key, deltaValue] of Object.entries(delta)) {
        if (!acc.hasOwnProperty(key)) {
          acc[key] = deltaValue;
          continue;
        }
        let accValue = acc[key];
        if (accValue === null || accValue === undefined) {
          acc[key] = deltaValue;
          continue;
        }
        if (key === "index" || key === "type") {
          acc[key] = deltaValue;
          continue;
        }
        if (typeof accValue === "string" && typeof deltaValue === "string") {
          accValue += deltaValue;
        } else if (typeof accValue === "number" && typeof deltaValue === "number") {
          accValue += deltaValue;
        } else if (isObj(accValue) && isObj(deltaValue)) {
          accValue = this.accumulateDelta(accValue, deltaValue);
        } else if (Array.isArray(accValue) && Array.isArray(deltaValue)) {
          if (accValue.every((x) => typeof x === "string" || typeof x === "number")) {
            accValue.push(...deltaValue);
            continue;
          }
          for (const deltaEntry of deltaValue) {
            if (!isObj(deltaEntry)) {
              throw new Error(`Expected array delta entry to be an object but got: ${deltaEntry}`);
            }
            const index = deltaEntry["index"];
            if (index == null) {
              console.error(deltaEntry);
              throw new Error("Expected array delta entry to have an `index` property");
            }
            if (typeof index !== "number") {
              throw new Error(`Expected array delta entry \`index\` property to be a number but got ${index}`);
            }
            const accEntry = accValue[index];
            if (accEntry == null) {
              accValue.push(deltaEntry);
            } else {
              accValue[index] = this.accumulateDelta(accEntry, deltaEntry);
            }
          }
          continue;
        } else {
          throw Error(`Unhandled record type: ${key}, deltaValue: ${deltaValue}, accValue: ${accValue}`);
        }
        acc[key] = accValue;
      }
      return acc;
    }
    _addRun(run) {
      return run;
    }
    async _threadAssistantStream(params, thread, options) {
      return await this._createThreadAssistantStream(thread, params, options);
    }
    async _runAssistantStream(threadId, runs, params, options) {
      return await this._createAssistantStream(runs, threadId, params, options);
    }
    async _runToolAssistantStream(threadId, runId, runs, params, options) {
      return await this._createToolAssistantStream(runs, threadId, runId, params, options);
    }
  };
  _AssistantStream_addEvent = function _AssistantStream_addEvent2(event) {
    if (this.ended)
      return;
    __classPrivateFieldSet7(this, _AssistantStream_currentEvent, event, "f");
    __classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_handleEvent).call(this, event);
    switch (event.event) {
      case "thread.created":
        break;
      case "thread.run.created":
      case "thread.run.queued":
      case "thread.run.in_progress":
      case "thread.run.requires_action":
      case "thread.run.completed":
      case "thread.run.incomplete":
      case "thread.run.failed":
      case "thread.run.cancelling":
      case "thread.run.cancelled":
      case "thread.run.expired":
        __classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_handleRun).call(this, event);
        break;
      case "thread.run.step.created":
      case "thread.run.step.in_progress":
      case "thread.run.step.delta":
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        __classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_handleRunStep).call(this, event);
        break;
      case "thread.message.created":
      case "thread.message.in_progress":
      case "thread.message.delta":
      case "thread.message.completed":
      case "thread.message.incomplete":
        __classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_handleMessage).call(this, event);
        break;
      case "error":
        throw new Error("Encountered an error event in event processing - errors should be processed earlier");
      default:
        assertNever(event);
    }
  }, _AssistantStream_endRequest = function _AssistantStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    if (!__classPrivateFieldGet7(this, _AssistantStream_finalRun, "f"))
      throw Error("Final run has not been received");
    return __classPrivateFieldGet7(this, _AssistantStream_finalRun, "f");
  }, _AssistantStream_handleMessage = function _AssistantStream_handleMessage2(event) {
    const [accumulatedMessage, newContent] = __classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_accumulateMessage).call(this, event, __classPrivateFieldGet7(this, _AssistantStream_messageSnapshot, "f"));
    __classPrivateFieldSet7(this, _AssistantStream_messageSnapshot, accumulatedMessage, "f");
    __classPrivateFieldGet7(this, _AssistantStream_messageSnapshots, "f")[accumulatedMessage.id] = accumulatedMessage;
    for (const content of newContent) {
      const snapshotContent = accumulatedMessage.content[content.index];
      if (snapshotContent?.type == "text") {
        this._emit("textCreated", snapshotContent.text);
      }
    }
    switch (event.event) {
      case "thread.message.created":
        this._emit("messageCreated", event.data);
        break;
      case "thread.message.in_progress":
        break;
      case "thread.message.delta":
        this._emit("messageDelta", event.data.delta, accumulatedMessage);
        if (event.data.delta.content) {
          for (const content of event.data.delta.content) {
            if (content.type == "text" && content.text) {
              let textDelta = content.text;
              let snapshot = accumulatedMessage.content[content.index];
              if (snapshot && snapshot.type == "text") {
                this._emit("textDelta", textDelta, snapshot.text);
              } else {
                throw Error("The snapshot associated with this text delta is not text or missing");
              }
            }
            if (content.index != __classPrivateFieldGet7(this, _AssistantStream_currentContentIndex, "f")) {
              if (__classPrivateFieldGet7(this, _AssistantStream_currentContent, "f")) {
                switch (__classPrivateFieldGet7(this, _AssistantStream_currentContent, "f").type) {
                  case "text":
                    this._emit("textDone", __classPrivateFieldGet7(this, _AssistantStream_currentContent, "f").text, __classPrivateFieldGet7(this, _AssistantStream_messageSnapshot, "f"));
                    break;
                  case "image_file":
                    this._emit("imageFileDone", __classPrivateFieldGet7(this, _AssistantStream_currentContent, "f").image_file, __classPrivateFieldGet7(this, _AssistantStream_messageSnapshot, "f"));
                    break;
                }
              }
              __classPrivateFieldSet7(this, _AssistantStream_currentContentIndex, content.index, "f");
            }
            __classPrivateFieldSet7(this, _AssistantStream_currentContent, accumulatedMessage.content[content.index], "f");
          }
        }
        break;
      case "thread.message.completed":
      case "thread.message.incomplete":
        if (__classPrivateFieldGet7(this, _AssistantStream_currentContentIndex, "f") !== undefined) {
          const currentContent = event.data.content[__classPrivateFieldGet7(this, _AssistantStream_currentContentIndex, "f")];
          if (currentContent) {
            switch (currentContent.type) {
              case "image_file":
                this._emit("imageFileDone", currentContent.image_file, __classPrivateFieldGet7(this, _AssistantStream_messageSnapshot, "f"));
                break;
              case "text":
                this._emit("textDone", currentContent.text, __classPrivateFieldGet7(this, _AssistantStream_messageSnapshot, "f"));
                break;
            }
          }
        }
        if (__classPrivateFieldGet7(this, _AssistantStream_messageSnapshot, "f")) {
          this._emit("messageDone", event.data);
        }
        __classPrivateFieldSet7(this, _AssistantStream_messageSnapshot, undefined, "f");
    }
  }, _AssistantStream_handleRunStep = function _AssistantStream_handleRunStep2(event) {
    const accumulatedRunStep = __classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_accumulateRunStep).call(this, event);
    __classPrivateFieldSet7(this, _AssistantStream_currentRunStepSnapshot, accumulatedRunStep, "f");
    switch (event.event) {
      case "thread.run.step.created":
        this._emit("runStepCreated", event.data);
        break;
      case "thread.run.step.delta":
        const delta = event.data.delta;
        if (delta.step_details && delta.step_details.type == "tool_calls" && delta.step_details.tool_calls && accumulatedRunStep.step_details.type == "tool_calls") {
          for (const toolCall of delta.step_details.tool_calls) {
            if (toolCall.index == __classPrivateFieldGet7(this, _AssistantStream_currentToolCallIndex, "f")) {
              this._emit("toolCallDelta", toolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index]);
            } else {
              if (__classPrivateFieldGet7(this, _AssistantStream_currentToolCall, "f")) {
                this._emit("toolCallDone", __classPrivateFieldGet7(this, _AssistantStream_currentToolCall, "f"));
              }
              __classPrivateFieldSet7(this, _AssistantStream_currentToolCallIndex, toolCall.index, "f");
              __classPrivateFieldSet7(this, _AssistantStream_currentToolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index], "f");
              if (__classPrivateFieldGet7(this, _AssistantStream_currentToolCall, "f"))
                this._emit("toolCallCreated", __classPrivateFieldGet7(this, _AssistantStream_currentToolCall, "f"));
            }
          }
        }
        this._emit("runStepDelta", event.data.delta, accumulatedRunStep);
        break;
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
        __classPrivateFieldSet7(this, _AssistantStream_currentRunStepSnapshot, undefined, "f");
        const details = event.data.step_details;
        if (details.type == "tool_calls") {
          if (__classPrivateFieldGet7(this, _AssistantStream_currentToolCall, "f")) {
            this._emit("toolCallDone", __classPrivateFieldGet7(this, _AssistantStream_currentToolCall, "f"));
            __classPrivateFieldSet7(this, _AssistantStream_currentToolCall, undefined, "f");
          }
        }
        this._emit("runStepDone", event.data, accumulatedRunStep);
        break;
      case "thread.run.step.in_progress":
        break;
    }
  }, _AssistantStream_handleEvent = function _AssistantStream_handleEvent2(event) {
    __classPrivateFieldGet7(this, _AssistantStream_events, "f").push(event);
    this._emit("event", event);
  }, _AssistantStream_accumulateRunStep = function _AssistantStream_accumulateRunStep2(event) {
    switch (event.event) {
      case "thread.run.step.created":
        __classPrivateFieldGet7(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
        return event.data;
      case "thread.run.step.delta":
        let snapshot = __classPrivateFieldGet7(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
        if (!snapshot) {
          throw Error("Received a RunStepDelta before creation of a snapshot");
        }
        let data = event.data;
        if (data.delta) {
          const accumulated = AssistantStream.accumulateDelta(snapshot, data.delta);
          __classPrivateFieldGet7(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = accumulated;
        }
        return __classPrivateFieldGet7(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
      case "thread.run.step.completed":
      case "thread.run.step.failed":
      case "thread.run.step.cancelled":
      case "thread.run.step.expired":
      case "thread.run.step.in_progress":
        __classPrivateFieldGet7(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
        break;
    }
    if (__classPrivateFieldGet7(this, _AssistantStream_runStepSnapshots, "f")[event.data.id])
      return __classPrivateFieldGet7(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
    throw new Error("No snapshot available");
  }, _AssistantStream_accumulateMessage = function _AssistantStream_accumulateMessage2(event, snapshot) {
    let newContent = [];
    switch (event.event) {
      case "thread.message.created":
        return [event.data, newContent];
      case "thread.message.delta":
        if (!snapshot) {
          throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
        }
        let data = event.data;
        if (data.delta.content) {
          for (const contentElement of data.delta.content) {
            if (contentElement.index in snapshot.content) {
              let currentContent = snapshot.content[contentElement.index];
              snapshot.content[contentElement.index] = __classPrivateFieldGet7(this, _AssistantStream_instances, "m", _AssistantStream_accumulateContent).call(this, contentElement, currentContent);
            } else {
              snapshot.content[contentElement.index] = contentElement;
              newContent.push(contentElement);
            }
          }
        }
        return [snapshot, newContent];
      case "thread.message.in_progress":
      case "thread.message.completed":
      case "thread.message.incomplete":
        if (snapshot) {
          return [snapshot, newContent];
        } else {
          throw Error("Received thread message event with no existing snapshot");
        }
    }
    throw Error("Tried to accumulate a non-message event");
  }, _AssistantStream_accumulateContent = function _AssistantStream_accumulateContent2(contentElement, currentContent) {
    return AssistantStream.accumulateDelta(currentContent, contentElement);
  }, _AssistantStream_handleRun = function _AssistantStream_handleRun2(event) {
    __classPrivateFieldSet7(this, _AssistantStream_currentRunSnapshot, event.data, "f");
    switch (event.event) {
      case "thread.run.created":
        break;
      case "thread.run.queued":
        break;
      case "thread.run.in_progress":
        break;
      case "thread.run.requires_action":
      case "thread.run.cancelled":
      case "thread.run.failed":
      case "thread.run.completed":
      case "thread.run.expired":
        __classPrivateFieldSet7(this, _AssistantStream_finalRun, event.data, "f");
        if (__classPrivateFieldGet7(this, _AssistantStream_currentToolCall, "f")) {
          this._emit("toolCallDone", __classPrivateFieldGet7(this, _AssistantStream_currentToolCall, "f"));
          __classPrivateFieldSet7(this, _AssistantStream_currentToolCall, undefined, "f");
        }
        break;
      case "thread.run.cancelling":
        break;
    }
  };
});

// node_modules/openai/resources/beta/assistants.mjs
var Assistants, AssistantsPage;
var init_assistants = __esm(() => {
  init_core2();
  init_pagination2();
  Assistants = class Assistants extends APIResource2 {
    create(body, options) {
      return this._client.post("/assistants", {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    retrieve(assistantId, options) {
      return this._client.get(`/assistants/${assistantId}`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    update(assistantId, body, options) {
      return this._client.post(`/assistants/${assistantId}`, {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    list(query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list({}, query);
      }
      return this._client.getAPIList("/assistants", AssistantsPage, {
        query,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    del(assistantId, options) {
      return this._client.delete(`/assistants/${assistantId}`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
  };
  AssistantsPage = class AssistantsPage extends CursorPage {
  };
  Assistants.AssistantsPage = AssistantsPage;
});

// node_modules/openai/lib/RunnableFunction.mjs
function isRunnableFunctionWithParse(fn) {
  return typeof fn.parse === "function";
}

// node_modules/openai/lib/chatCompletionUtils.mjs
var isAssistantMessage = (message) => {
  return message?.role === "assistant";
}, isFunctionMessage = (message) => {
  return message?.role === "function";
}, isToolMessage = (message) => {
  return message?.role === "tool";
};

// node_modules/openai/lib/parser.mjs
function isAutoParsableResponseFormat(response_format) {
  return response_format?.["$brand"] === "auto-parseable-response-format";
}
function isAutoParsableTool(tool) {
  return tool?.["$brand"] === "auto-parseable-tool";
}
function maybeParseChatCompletion(completion, params) {
  if (!params || !hasAutoParseableInput(params)) {
    return {
      ...completion,
      choices: completion.choices.map((choice) => ({
        ...choice,
        message: {
          ...choice.message,
          parsed: null,
          ...choice.message.tool_calls ? {
            tool_calls: choice.message.tool_calls
          } : undefined
        }
      }))
    };
  }
  return parseChatCompletion(completion, params);
}
function parseChatCompletion(completion, params) {
  const choices = completion.choices.map((choice) => {
    if (choice.finish_reason === "length") {
      throw new LengthFinishReasonError;
    }
    if (choice.finish_reason === "content_filter") {
      throw new ContentFilterFinishReasonError;
    }
    return {
      ...choice,
      message: {
        ...choice.message,
        ...choice.message.tool_calls ? {
          tool_calls: choice.message.tool_calls?.map((toolCall) => parseToolCall(params, toolCall)) ?? undefined
        } : undefined,
        parsed: choice.message.content && !choice.message.refusal ? parseResponseFormat(params, choice.message.content) : null
      }
    };
  });
  return { ...completion, choices };
}
function parseResponseFormat(params, content) {
  if (params.response_format?.type !== "json_schema") {
    return null;
  }
  if (params.response_format?.type === "json_schema") {
    if ("$parseRaw" in params.response_format) {
      const response_format = params.response_format;
      return response_format.$parseRaw(content);
    }
    return JSON.parse(content);
  }
  return null;
}
function parseToolCall(params, toolCall) {
  const inputTool = params.tools?.find((inputTool2) => inputTool2.function?.name === toolCall.function.name);
  return {
    ...toolCall,
    function: {
      ...toolCall.function,
      parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCall.function.arguments) : inputTool?.function.strict ? JSON.parse(toolCall.function.arguments) : null
    }
  };
}
function shouldParseToolCall(params, toolCall) {
  if (!params) {
    return false;
  }
  const inputTool = params.tools?.find((inputTool2) => inputTool2.function?.name === toolCall.function.name);
  return isAutoParsableTool(inputTool) || inputTool?.function.strict || false;
}
function hasAutoParseableInput(params) {
  if (isAutoParsableResponseFormat(params.response_format)) {
    return true;
  }
  return params.tools?.some((t) => isAutoParsableTool(t) || t.type === "function" && t.function.strict === true) ?? false;
}
function validateInputTools(tools) {
  for (const tool of tools ?? []) {
    if (tool.type !== "function") {
      throw new OpenAIError(`Currently only \`function\` tool types support auto-parsing; Received \`${tool.type}\``);
    }
    if (tool.function.strict !== true) {
      throw new OpenAIError(`The \`${tool.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
    }
  }
}
var init_parser2 = __esm(() => {
  init_error2();
});

// node_modules/openai/lib/AbstractChatCompletionRunner.mjs
var __classPrivateFieldGet8 = function(receiver, state, kind3, f) {
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind3 === "m" ? f : kind3 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, _AbstractChatCompletionRunner_instances, _AbstractChatCompletionRunner_getFinalContent, _AbstractChatCompletionRunner_getFinalMessage, _AbstractChatCompletionRunner_getFinalFunctionCall, _AbstractChatCompletionRunner_getFinalFunctionCallResult, _AbstractChatCompletionRunner_calculateTotalUsage, _AbstractChatCompletionRunner_validateParams, _AbstractChatCompletionRunner_stringifyFunctionCallResult, DEFAULT_MAX_CHAT_COMPLETIONS = 10, AbstractChatCompletionRunner;
var init_AbstractChatCompletionRunner = __esm(() => {
  init_error2();
  init_EventStream();
  init_parser2();
  AbstractChatCompletionRunner = class AbstractChatCompletionRunner extends EventStream {
    constructor() {
      super(...arguments);
      _AbstractChatCompletionRunner_instances.add(this);
      this._chatCompletions = [];
      this.messages = [];
    }
    _addChatCompletion(chatCompletion) {
      this._chatCompletions.push(chatCompletion);
      this._emit("chatCompletion", chatCompletion);
      const message = chatCompletion.choices[0]?.message;
      if (message)
        this._addMessage(message);
      return chatCompletion;
    }
    _addMessage(message, emit = true) {
      if (!("content" in message))
        message.content = null;
      this.messages.push(message);
      if (emit) {
        this._emit("message", message);
        if ((isFunctionMessage(message) || isToolMessage(message)) && message.content) {
          this._emit("functionCallResult", message.content);
        } else if (isAssistantMessage(message) && message.function_call) {
          this._emit("functionCall", message.function_call);
        } else if (isAssistantMessage(message) && message.tool_calls) {
          for (const tool_call of message.tool_calls) {
            if (tool_call.type === "function") {
              this._emit("functionCall", tool_call.function);
            }
          }
        }
      }
    }
    async finalChatCompletion() {
      await this.done();
      const completion = this._chatCompletions[this._chatCompletions.length - 1];
      if (!completion)
        throw new OpenAIError("stream ended without producing a ChatCompletion");
      return completion;
    }
    async finalContent() {
      await this.done();
      return __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
    }
    async finalMessage() {
      await this.done();
      return __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
    }
    async finalFunctionCall() {
      await this.done();
      return __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCall).call(this);
    }
    async finalFunctionCallResult() {
      await this.done();
      return __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCallResult).call(this);
    }
    async totalUsage() {
      await this.done();
      return __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this);
    }
    allChatCompletions() {
      return [...this._chatCompletions];
    }
    _emitFinal() {
      const completion = this._chatCompletions[this._chatCompletions.length - 1];
      if (completion)
        this._emit("finalChatCompletion", completion);
      const finalMessage = __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
      if (finalMessage)
        this._emit("finalMessage", finalMessage);
      const finalContent = __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
      if (finalContent)
        this._emit("finalContent", finalContent);
      const finalFunctionCall = __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCall).call(this);
      if (finalFunctionCall)
        this._emit("finalFunctionCall", finalFunctionCall);
      const finalFunctionCallResult = __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCallResult).call(this);
      if (finalFunctionCallResult != null)
        this._emit("finalFunctionCallResult", finalFunctionCallResult);
      if (this._chatCompletions.some((c) => c.usage)) {
        this._emit("totalUsage", __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this));
      }
    }
    async _createChatCompletion(client, params, options) {
      const signal = options?.signal;
      if (signal) {
        if (signal.aborted)
          this.controller.abort();
        signal.addEventListener("abort", () => this.controller.abort());
      }
      __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_validateParams).call(this, params);
      const chatCompletion = await client.chat.completions.create({ ...params, stream: false }, { ...options, signal: this.controller.signal });
      this._connected();
      return this._addChatCompletion(parseChatCompletion(chatCompletion, params));
    }
    async _runChatCompletion(client, params, options) {
      for (const message of params.messages) {
        this._addMessage(message, false);
      }
      return await this._createChatCompletion(client, params, options);
    }
    async _runFunctions(client, params, options) {
      const role = "function";
      const { function_call = "auto", stream, ...restParams } = params;
      const singleFunctionToCall = typeof function_call !== "string" && function_call?.name;
      const { maxChatCompletions = DEFAULT_MAX_CHAT_COMPLETIONS } = options || {};
      const functionsByName = {};
      for (const f of params.functions) {
        functionsByName[f.name || f.function.name] = f;
      }
      const functions = params.functions.map((f) => ({
        name: f.name || f.function.name,
        parameters: f.parameters,
        description: f.description
      }));
      for (const message of params.messages) {
        this._addMessage(message, false);
      }
      for (let i = 0;i < maxChatCompletions; ++i) {
        const chatCompletion = await this._createChatCompletion(client, {
          ...restParams,
          function_call,
          functions,
          messages: [...this.messages]
        }, options);
        const message = chatCompletion.choices[0]?.message;
        if (!message) {
          throw new OpenAIError(`missing message in ChatCompletion response`);
        }
        if (!message.function_call)
          return;
        const { name, arguments: args } = message.function_call;
        const fn = functionsByName[name];
        if (!fn) {
          const content2 = `Invalid function_call: ${JSON.stringify(name)}. Available options are: ${functions.map((f) => JSON.stringify(f.name)).join(", ")}. Please try again`;
          this._addMessage({ role, name, content: content2 });
          continue;
        } else if (singleFunctionToCall && singleFunctionToCall !== name) {
          const content2 = `Invalid function_call: ${JSON.stringify(name)}. ${JSON.stringify(singleFunctionToCall)} requested. Please try again`;
          this._addMessage({ role, name, content: content2 });
          continue;
        }
        let parsed;
        try {
          parsed = isRunnableFunctionWithParse(fn) ? await fn.parse(args) : args;
        } catch (error) {
          this._addMessage({
            role,
            name,
            content: error instanceof Error ? error.message : String(error)
          });
          continue;
        }
        const rawContent = await fn.function(parsed, this);
        const content = __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_stringifyFunctionCallResult).call(this, rawContent);
        this._addMessage({ role, name, content });
        if (singleFunctionToCall)
          return;
      }
    }
    async _runTools(client, params, options) {
      const role = "tool";
      const { tool_choice = "auto", stream, ...restParams } = params;
      const singleFunctionToCall = typeof tool_choice !== "string" && tool_choice?.function?.name;
      const { maxChatCompletions = DEFAULT_MAX_CHAT_COMPLETIONS } = options || {};
      const inputTools = params.tools.map((tool) => {
        if (isAutoParsableTool(tool)) {
          if (!tool.$callback) {
            throw new OpenAIError("Tool given to `.runTools()` that does not have an associated function");
          }
          return {
            type: "function",
            function: {
              function: tool.$callback,
              name: tool.function.name,
              description: tool.function.description || "",
              parameters: tool.function.parameters,
              parse: tool.$parseRaw,
              strict: true
            }
          };
        }
        return tool;
      });
      const functionsByName = {};
      for (const f of inputTools) {
        if (f.type === "function") {
          functionsByName[f.function.name || f.function.function.name] = f.function;
        }
      }
      const tools = "tools" in params ? inputTools.map((t) => t.type === "function" ? {
        type: "function",
        function: {
          name: t.function.name || t.function.function.name,
          parameters: t.function.parameters,
          description: t.function.description,
          strict: t.function.strict
        }
      } : t) : undefined;
      for (const message of params.messages) {
        this._addMessage(message, false);
      }
      for (let i = 0;i < maxChatCompletions; ++i) {
        const chatCompletion = await this._createChatCompletion(client, {
          ...restParams,
          tool_choice,
          tools,
          messages: [...this.messages]
        }, options);
        const message = chatCompletion.choices[0]?.message;
        if (!message) {
          throw new OpenAIError(`missing message in ChatCompletion response`);
        }
        if (!message.tool_calls?.length) {
          return;
        }
        for (const tool_call of message.tool_calls) {
          if (tool_call.type !== "function")
            continue;
          const tool_call_id = tool_call.id;
          const { name, arguments: args } = tool_call.function;
          const fn = functionsByName[name];
          if (!fn) {
            const content2 = `Invalid tool_call: ${JSON.stringify(name)}. Available options are: ${Object.keys(functionsByName).map((name2) => JSON.stringify(name2)).join(", ")}. Please try again`;
            this._addMessage({ role, tool_call_id, content: content2 });
            continue;
          } else if (singleFunctionToCall && singleFunctionToCall !== name) {
            const content2 = `Invalid tool_call: ${JSON.stringify(name)}. ${JSON.stringify(singleFunctionToCall)} requested. Please try again`;
            this._addMessage({ role, tool_call_id, content: content2 });
            continue;
          }
          let parsed;
          try {
            parsed = isRunnableFunctionWithParse(fn) ? await fn.parse(args) : args;
          } catch (error) {
            const content2 = error instanceof Error ? error.message : String(error);
            this._addMessage({ role, tool_call_id, content: content2 });
            continue;
          }
          const rawContent = await fn.function(parsed, this);
          const content = __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_stringifyFunctionCallResult).call(this, rawContent);
          this._addMessage({ role, tool_call_id, content });
          if (singleFunctionToCall) {
            return;
          }
        }
      }
      return;
    }
  };
  _AbstractChatCompletionRunner_instances = new WeakSet, _AbstractChatCompletionRunner_getFinalContent = function _AbstractChatCompletionRunner_getFinalContent2() {
    return __classPrivateFieldGet8(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this).content ?? null;
  }, _AbstractChatCompletionRunner_getFinalMessage = function _AbstractChatCompletionRunner_getFinalMessage2() {
    let i = this.messages.length;
    while (i-- > 0) {
      const message = this.messages[i];
      if (isAssistantMessage(message)) {
        const { function_call, ...rest } = message;
        const ret = {
          ...rest,
          content: message.content ?? null,
          refusal: message.refusal ?? null
        };
        if (function_call) {
          ret.function_call = function_call;
        }
        return ret;
      }
    }
    throw new OpenAIError("stream ended without producing a ChatCompletionMessage with role=assistant");
  }, _AbstractChatCompletionRunner_getFinalFunctionCall = function _AbstractChatCompletionRunner_getFinalFunctionCall2() {
    for (let i = this.messages.length - 1;i >= 0; i--) {
      const message = this.messages[i];
      if (isAssistantMessage(message) && message?.function_call) {
        return message.function_call;
      }
      if (isAssistantMessage(message) && message?.tool_calls?.length) {
        return message.tool_calls.at(-1)?.function;
      }
    }
    return;
  }, _AbstractChatCompletionRunner_getFinalFunctionCallResult = function _AbstractChatCompletionRunner_getFinalFunctionCallResult2() {
    for (let i = this.messages.length - 1;i >= 0; i--) {
      const message = this.messages[i];
      if (isFunctionMessage(message) && message.content != null) {
        return message.content;
      }
      if (isToolMessage(message) && message.content != null && typeof message.content === "string" && this.messages.some((x) => x.role === "assistant" && x.tool_calls?.some((y) => y.type === "function" && y.id === message.tool_call_id))) {
        return message.content;
      }
    }
    return;
  }, _AbstractChatCompletionRunner_calculateTotalUsage = function _AbstractChatCompletionRunner_calculateTotalUsage2() {
    const total = {
      completion_tokens: 0,
      prompt_tokens: 0,
      total_tokens: 0
    };
    for (const { usage } of this._chatCompletions) {
      if (usage) {
        total.completion_tokens += usage.completion_tokens;
        total.prompt_tokens += usage.prompt_tokens;
        total.total_tokens += usage.total_tokens;
      }
    }
    return total;
  }, _AbstractChatCompletionRunner_validateParams = function _AbstractChatCompletionRunner_validateParams2(params) {
    if (params.n != null && params.n > 1) {
      throw new OpenAIError("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
    }
  }, _AbstractChatCompletionRunner_stringifyFunctionCallResult = function _AbstractChatCompletionRunner_stringifyFunctionCallResult2(rawContent) {
    return typeof rawContent === "string" ? rawContent : rawContent === undefined ? "undefined" : JSON.stringify(rawContent);
  };
});

// node_modules/openai/lib/ChatCompletionRunner.mjs
var ChatCompletionRunner;
var init_ChatCompletionRunner = __esm(() => {
  init_AbstractChatCompletionRunner();
  ChatCompletionRunner = class ChatCompletionRunner extends AbstractChatCompletionRunner {
    static runFunctions(client, params, options) {
      const runner = new ChatCompletionRunner;
      const opts = {
        ...options,
        headers: { ...options?.headers, "X-Stainless-Helper-Method": "runFunctions" }
      };
      runner._run(() => runner._runFunctions(client, params, opts));
      return runner;
    }
    static runTools(client, params, options) {
      const runner = new ChatCompletionRunner;
      const opts = {
        ...options,
        headers: { ...options?.headers, "X-Stainless-Helper-Method": "runTools" }
      };
      runner._run(() => runner._runTools(client, params, opts));
      return runner;
    }
    _addMessage(message, emit = true) {
      super._addMessage(message, emit);
      if (isAssistantMessage(message) && message.content) {
        this._emit("content", message.content);
      }
    }
  };
});

// node_modules/openai/_vendor/partial-json-parser/parser.mjs
function parseJSON(jsonString, allowPartial = Allow.ALL) {
  if (typeof jsonString !== "string") {
    throw new TypeError(`expecting str, got ${typeof jsonString}`);
  }
  if (!jsonString.trim()) {
    throw new Error(`${jsonString} is empty`);
  }
  return _parseJSON(jsonString.trim(), allowPartial);
}
var STR = 1, NUM = 2, ARR = 4, OBJ = 8, NULL = 16, BOOL = 32, NAN = 64, INFINITY = 128, MINUS_INFINITY = 256, INF, SPECIAL, ATOM, COLLECTION, ALL, Allow, PartialJSON, MalformedJSON, _parseJSON = (jsonString, allow) => {
  const length = jsonString.length;
  let index = 0;
  const markPartialJSON = (msg) => {
    throw new PartialJSON(`${msg} at position ${index}`);
  };
  const throwMalformedError = (msg) => {
    throw new MalformedJSON(`${msg} at position ${index}`);
  };
  const parseAny = () => {
    skipBlank();
    if (index >= length)
      markPartialJSON("Unexpected end of input");
    if (jsonString[index] === '"')
      return parseStr();
    if (jsonString[index] === "{")
      return parseObj();
    if (jsonString[index] === "[")
      return parseArr();
    if (jsonString.substring(index, index + 4) === "null" || Allow.NULL & allow && length - index < 4 && "null".startsWith(jsonString.substring(index))) {
      index += 4;
      return null;
    }
    if (jsonString.substring(index, index + 4) === "true" || Allow.BOOL & allow && length - index < 4 && "true".startsWith(jsonString.substring(index))) {
      index += 4;
      return true;
    }
    if (jsonString.substring(index, index + 5) === "false" || Allow.BOOL & allow && length - index < 5 && "false".startsWith(jsonString.substring(index))) {
      index += 5;
      return false;
    }
    if (jsonString.substring(index, index + 8) === "Infinity" || Allow.INFINITY & allow && length - index < 8 && "Infinity".startsWith(jsonString.substring(index))) {
      index += 8;
      return Infinity;
    }
    if (jsonString.substring(index, index + 9) === "-Infinity" || Allow.MINUS_INFINITY & allow && 1 < length - index && length - index < 9 && "-Infinity".startsWith(jsonString.substring(index))) {
      index += 9;
      return -Infinity;
    }
    if (jsonString.substring(index, index + 3) === "NaN" || Allow.NAN & allow && length - index < 3 && "NaN".startsWith(jsonString.substring(index))) {
      index += 3;
      return NaN;
    }
    return parseNum();
  };
  const parseStr = () => {
    const start = index;
    let escape2 = false;
    index++;
    while (index < length && (jsonString[index] !== '"' || escape2 && jsonString[index - 1] === "\\")) {
      escape2 = jsonString[index] === "\\" ? !escape2 : false;
      index++;
    }
    if (jsonString.charAt(index) == '"') {
      try {
        return JSON.parse(jsonString.substring(start, ++index - Number(escape2)));
      } catch (e) {
        throwMalformedError(String(e));
      }
    } else if (Allow.STR & allow) {
      try {
        return JSON.parse(jsonString.substring(start, index - Number(escape2)) + '"');
      } catch (e) {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("\\")) + '"');
      }
    }
    markPartialJSON("Unterminated string literal");
  };
  const parseObj = () => {
    index++;
    skipBlank();
    const obj = {};
    try {
      while (jsonString[index] !== "}") {
        skipBlank();
        if (index >= length && Allow.OBJ & allow)
          return obj;
        const key = parseStr();
        skipBlank();
        index++;
        try {
          const value = parseAny();
          Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true });
        } catch (e) {
          if (Allow.OBJ & allow)
            return obj;
          else
            throw e;
        }
        skipBlank();
        if (jsonString[index] === ",")
          index++;
      }
    } catch (e) {
      if (Allow.OBJ & allow)
        return obj;
      else
        markPartialJSON("Expected '}' at end of object");
    }
    index++;
    return obj;
  };
  const parseArr = () => {
    index++;
    const arr = [];
    try {
      while (jsonString[index] !== "]") {
        arr.push(parseAny());
        skipBlank();
        if (jsonString[index] === ",") {
          index++;
        }
      }
    } catch (e) {
      if (Allow.ARR & allow) {
        return arr;
      }
      markPartialJSON("Expected ']' at end of array");
    }
    index++;
    return arr;
  };
  const parseNum = () => {
    if (index === 0) {
      if (jsonString === "-" && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        if (Allow.NUM & allow) {
          try {
            if (jsonString[jsonString.length - 1] === ".")
              return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf(".")));
            return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf("e")));
          } catch (e2) {}
        }
        throwMalformedError(String(e));
      }
    }
    const start = index;
    if (jsonString[index] === "-")
      index++;
    while (jsonString[index] && !",]}".includes(jsonString[index]))
      index++;
    if (index == length && !(Allow.NUM & allow))
      markPartialJSON("Unterminated number literal");
    try {
      return JSON.parse(jsonString.substring(start, index));
    } catch (e) {
      if (jsonString.substring(start, index) === "-" && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("e")));
      } catch (e2) {
        throwMalformedError(String(e2));
      }
    }
  };
  const skipBlank = () => {
    while (index < length && ` 
\r	`.includes(jsonString[index])) {
      index++;
    }
  };
  return parseAny();
}, partialParse2 = (input) => parseJSON(input, Allow.ALL ^ Allow.NUM);
var init_parser3 = __esm(() => {
  INF = INFINITY | MINUS_INFINITY;
  SPECIAL = NULL | BOOL | INF | NAN;
  ATOM = STR | NUM | SPECIAL;
  COLLECTION = ARR | OBJ;
  ALL = ATOM | COLLECTION;
  Allow = {
    STR,
    NUM,
    ARR,
    OBJ,
    NULL,
    BOOL,
    NAN,
    INFINITY,
    MINUS_INFINITY,
    INF,
    SPECIAL,
    ATOM,
    COLLECTION,
    ALL
  };
  PartialJSON = class PartialJSON extends Error {
  };
  MalformedJSON = class MalformedJSON extends Error {
  };
});

// node_modules/openai/lib/ChatCompletionStream.mjs
function finalizeChatCompletion(snapshot, params) {
  const { id, choices, created, model, system_fingerprint, ...rest } = snapshot;
  const completion = {
    ...rest,
    id,
    choices: choices.map(({ message, finish_reason, index, logprobs, ...choiceRest }) => {
      if (!finish_reason) {
        throw new OpenAIError(`missing finish_reason for choice ${index}`);
      }
      const { content = null, function_call, tool_calls, ...messageRest } = message;
      const role = message.role;
      if (!role) {
        throw new OpenAIError(`missing role for choice ${index}`);
      }
      if (function_call) {
        const { arguments: args, name } = function_call;
        if (args == null) {
          throw new OpenAIError(`missing function_call.arguments for choice ${index}`);
        }
        if (!name) {
          throw new OpenAIError(`missing function_call.name for choice ${index}`);
        }
        return {
          ...choiceRest,
          message: {
            content,
            function_call: { arguments: args, name },
            role,
            refusal: message.refusal ?? null
          },
          finish_reason,
          index,
          logprobs
        };
      }
      if (tool_calls) {
        return {
          ...choiceRest,
          index,
          finish_reason,
          logprobs,
          message: {
            ...messageRest,
            role,
            content,
            refusal: message.refusal ?? null,
            tool_calls: tool_calls.map((tool_call, i) => {
              const { function: fn, type, id: id2, ...toolRest } = tool_call;
              const { arguments: args, name, ...fnRest } = fn || {};
              if (id2 == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].id
${str(snapshot)}`);
              }
              if (type == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].type
${str(snapshot)}`);
              }
              if (name == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.name
${str(snapshot)}`);
              }
              if (args == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.arguments
${str(snapshot)}`);
              }
              return { ...toolRest, id: id2, type, function: { ...fnRest, name, arguments: args } };
            })
          }
        };
      }
      return {
        ...choiceRest,
        message: { ...messageRest, content, role, refusal: message.refusal ?? null },
        finish_reason,
        index,
        logprobs
      };
    }),
    created,
    model,
    object: "chat.completion",
    ...system_fingerprint ? { system_fingerprint } : {}
  };
  return maybeParseChatCompletion(completion, params);
}
function str(x) {
  return JSON.stringify(x);
}
function assertIsEmpty(obj) {
  return;
}
function assertNever2(_x) {}
var __classPrivateFieldSet8 = function(receiver, state, value, kind3, f) {
  if (kind3 === "m")
    throw new TypeError("Private method is not writable");
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind3 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, __classPrivateFieldGet9 = function(receiver, state, kind3, f) {
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind3 === "m" ? f : kind3 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, _ChatCompletionStream_instances, _ChatCompletionStream_params, _ChatCompletionStream_choiceEventStates, _ChatCompletionStream_currentChatCompletionSnapshot, _ChatCompletionStream_beginRequest, _ChatCompletionStream_getChoiceEventState, _ChatCompletionStream_addChunk, _ChatCompletionStream_emitToolCallDoneEvent, _ChatCompletionStream_emitContentDoneEvents, _ChatCompletionStream_endRequest, _ChatCompletionStream_getAutoParseableResponseFormat, _ChatCompletionStream_accumulateChatCompletion, ChatCompletionStream;
var init_ChatCompletionStream = __esm(() => {
  init_error2();
  init_AbstractChatCompletionRunner();
  init_streaming2();
  init_parser2();
  init_parser3();
  ChatCompletionStream = class ChatCompletionStream extends AbstractChatCompletionRunner {
    constructor(params) {
      super();
      _ChatCompletionStream_instances.add(this);
      _ChatCompletionStream_params.set(this, undefined);
      _ChatCompletionStream_choiceEventStates.set(this, undefined);
      _ChatCompletionStream_currentChatCompletionSnapshot.set(this, undefined);
      __classPrivateFieldSet8(this, _ChatCompletionStream_params, params, "f");
      __classPrivateFieldSet8(this, _ChatCompletionStream_choiceEventStates, [], "f");
    }
    get currentChatCompletionSnapshot() {
      return __classPrivateFieldGet9(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    }
    static fromReadableStream(stream) {
      const runner = new ChatCompletionStream(null);
      runner._run(() => runner._fromReadableStream(stream));
      return runner;
    }
    static createChatCompletion(client, params, options) {
      const runner = new ChatCompletionStream(params);
      runner._run(() => runner._runChatCompletion(client, { ...params, stream: true }, { ...options, headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" } }));
      return runner;
    }
    async _createChatCompletion(client, params, options) {
      super._createChatCompletion;
      const signal = options?.signal;
      if (signal) {
        if (signal.aborted)
          this.controller.abort();
        signal.addEventListener("abort", () => this.controller.abort());
      }
      __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
      const stream = await client.chat.completions.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
      this._connected();
      for await (const chunk of stream) {
        __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError2;
      }
      return this._addChatCompletion(__classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
    }
    async _fromReadableStream(readableStream, options) {
      const signal = options?.signal;
      if (signal) {
        if (signal.aborted)
          this.controller.abort();
        signal.addEventListener("abort", () => this.controller.abort());
      }
      __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
      this._connected();
      const stream = Stream2.fromReadableStream(readableStream, this.controller);
      let chatId;
      for await (const chunk of stream) {
        if (chatId && chatId !== chunk.id) {
          this._addChatCompletion(__classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
        }
        __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
        chatId = chunk.id;
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError2;
      }
      return this._addChatCompletion(__classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
    }
    [(_ChatCompletionStream_params = new WeakMap, _ChatCompletionStream_choiceEventStates = new WeakMap, _ChatCompletionStream_currentChatCompletionSnapshot = new WeakMap, _ChatCompletionStream_instances = new WeakSet, _ChatCompletionStream_beginRequest = function _ChatCompletionStream_beginRequest2() {
      if (this.ended)
        return;
      __classPrivateFieldSet8(this, _ChatCompletionStream_currentChatCompletionSnapshot, undefined, "f");
    }, _ChatCompletionStream_getChoiceEventState = function _ChatCompletionStream_getChoiceEventState2(choice) {
      let state = __classPrivateFieldGet9(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index];
      if (state) {
        return state;
      }
      state = {
        content_done: false,
        refusal_done: false,
        logprobs_content_done: false,
        logprobs_refusal_done: false,
        done_tool_calls: new Set,
        current_tool_call_index: null
      };
      __classPrivateFieldGet9(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index] = state;
      return state;
    }, _ChatCompletionStream_addChunk = function _ChatCompletionStream_addChunk2(chunk) {
      if (this.ended)
        return;
      const completion = __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_accumulateChatCompletion).call(this, chunk);
      this._emit("chunk", chunk, completion);
      for (const choice of chunk.choices) {
        const choiceSnapshot = completion.choices[choice.index];
        if (choice.delta.content != null && choiceSnapshot.message?.role === "assistant" && choiceSnapshot.message?.content) {
          this._emit("content", choice.delta.content, choiceSnapshot.message.content);
          this._emit("content.delta", {
            delta: choice.delta.content,
            snapshot: choiceSnapshot.message.content,
            parsed: choiceSnapshot.message.parsed
          });
        }
        if (choice.delta.refusal != null && choiceSnapshot.message?.role === "assistant" && choiceSnapshot.message?.refusal) {
          this._emit("refusal.delta", {
            delta: choice.delta.refusal,
            snapshot: choiceSnapshot.message.refusal
          });
        }
        if (choice.logprobs?.content != null && choiceSnapshot.message?.role === "assistant") {
          this._emit("logprobs.content.delta", {
            content: choice.logprobs?.content,
            snapshot: choiceSnapshot.logprobs?.content ?? []
          });
        }
        if (choice.logprobs?.refusal != null && choiceSnapshot.message?.role === "assistant") {
          this._emit("logprobs.refusal.delta", {
            refusal: choice.logprobs?.refusal,
            snapshot: choiceSnapshot.logprobs?.refusal ?? []
          });
        }
        const state = __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
        if (choiceSnapshot.finish_reason) {
          __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
          if (state.current_tool_call_index != null) {
            __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
          }
        }
        for (const toolCall of choice.delta.tool_calls ?? []) {
          if (state.current_tool_call_index !== toolCall.index) {
            __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
            if (state.current_tool_call_index != null) {
              __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
            }
          }
          state.current_tool_call_index = toolCall.index;
        }
        for (const toolCallDelta of choice.delta.tool_calls ?? []) {
          const toolCallSnapshot = choiceSnapshot.message.tool_calls?.[toolCallDelta.index];
          if (!toolCallSnapshot?.type) {
            continue;
          }
          if (toolCallSnapshot?.type === "function") {
            this._emit("tool_calls.function.arguments.delta", {
              name: toolCallSnapshot.function?.name,
              index: toolCallDelta.index,
              arguments: toolCallSnapshot.function.arguments,
              parsed_arguments: toolCallSnapshot.function.parsed_arguments,
              arguments_delta: toolCallDelta.function?.arguments ?? ""
            });
          } else {
            assertNever2(toolCallSnapshot?.type);
          }
        }
      }
    }, _ChatCompletionStream_emitToolCallDoneEvent = function _ChatCompletionStream_emitToolCallDoneEvent2(choiceSnapshot, toolCallIndex) {
      const state = __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
      if (state.done_tool_calls.has(toolCallIndex)) {
        return;
      }
      const toolCallSnapshot = choiceSnapshot.message.tool_calls?.[toolCallIndex];
      if (!toolCallSnapshot) {
        throw new Error("no tool call snapshot");
      }
      if (!toolCallSnapshot.type) {
        throw new Error("tool call snapshot missing `type`");
      }
      if (toolCallSnapshot.type === "function") {
        const inputTool = __classPrivateFieldGet9(this, _ChatCompletionStream_params, "f")?.tools?.find((tool) => tool.type === "function" && tool.function.name === toolCallSnapshot.function.name);
        this._emit("tool_calls.function.arguments.done", {
          name: toolCallSnapshot.function.name,
          index: toolCallIndex,
          arguments: toolCallSnapshot.function.arguments,
          parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCallSnapshot.function.arguments) : inputTool?.function.strict ? JSON.parse(toolCallSnapshot.function.arguments) : null
        });
      } else {
        assertNever2(toolCallSnapshot.type);
      }
    }, _ChatCompletionStream_emitContentDoneEvents = function _ChatCompletionStream_emitContentDoneEvents2(choiceSnapshot) {
      const state = __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
      if (choiceSnapshot.message.content && !state.content_done) {
        state.content_done = true;
        const responseFormat = __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this);
        this._emit("content.done", {
          content: choiceSnapshot.message.content,
          parsed: responseFormat ? responseFormat.$parseRaw(choiceSnapshot.message.content) : null
        });
      }
      if (choiceSnapshot.message.refusal && !state.refusal_done) {
        state.refusal_done = true;
        this._emit("refusal.done", { refusal: choiceSnapshot.message.refusal });
      }
      if (choiceSnapshot.logprobs?.content && !state.logprobs_content_done) {
        state.logprobs_content_done = true;
        this._emit("logprobs.content.done", { content: choiceSnapshot.logprobs.content });
      }
      if (choiceSnapshot.logprobs?.refusal && !state.logprobs_refusal_done) {
        state.logprobs_refusal_done = true;
        this._emit("logprobs.refusal.done", { refusal: choiceSnapshot.logprobs.refusal });
      }
    }, _ChatCompletionStream_endRequest = function _ChatCompletionStream_endRequest2() {
      if (this.ended) {
        throw new OpenAIError(`stream has ended, this shouldn't happen`);
      }
      const snapshot = __classPrivateFieldGet9(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
      if (!snapshot) {
        throw new OpenAIError(`request ended without sending any chunks`);
      }
      __classPrivateFieldSet8(this, _ChatCompletionStream_currentChatCompletionSnapshot, undefined, "f");
      __classPrivateFieldSet8(this, _ChatCompletionStream_choiceEventStates, [], "f");
      return finalizeChatCompletion(snapshot, __classPrivateFieldGet9(this, _ChatCompletionStream_params, "f"));
    }, _ChatCompletionStream_getAutoParseableResponseFormat = function _ChatCompletionStream_getAutoParseableResponseFormat2() {
      const responseFormat = __classPrivateFieldGet9(this, _ChatCompletionStream_params, "f")?.response_format;
      if (isAutoParsableResponseFormat(responseFormat)) {
        return responseFormat;
      }
      return null;
    }, _ChatCompletionStream_accumulateChatCompletion = function _ChatCompletionStream_accumulateChatCompletion2(chunk) {
      var _a2, _b, _c, _d;
      let snapshot = __classPrivateFieldGet9(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
      const { choices, ...rest } = chunk;
      if (!snapshot) {
        snapshot = __classPrivateFieldSet8(this, _ChatCompletionStream_currentChatCompletionSnapshot, {
          ...rest,
          choices: []
        }, "f");
      } else {
        Object.assign(snapshot, rest);
      }
      for (const { delta, finish_reason, index, logprobs = null, ...other } of chunk.choices) {
        let choice = snapshot.choices[index];
        if (!choice) {
          choice = snapshot.choices[index] = { finish_reason, index, message: {}, logprobs, ...other };
        }
        if (logprobs) {
          if (!choice.logprobs) {
            choice.logprobs = Object.assign({}, logprobs);
          } else {
            const { content: content2, refusal: refusal2, ...rest3 } = logprobs;
            assertIsEmpty(rest3);
            Object.assign(choice.logprobs, rest3);
            if (content2) {
              (_a2 = choice.logprobs).content ?? (_a2.content = []);
              choice.logprobs.content.push(...content2);
            }
            if (refusal2) {
              (_b = choice.logprobs).refusal ?? (_b.refusal = []);
              choice.logprobs.refusal.push(...refusal2);
            }
          }
        }
        if (finish_reason) {
          choice.finish_reason = finish_reason;
          if (__classPrivateFieldGet9(this, _ChatCompletionStream_params, "f") && hasAutoParseableInput(__classPrivateFieldGet9(this, _ChatCompletionStream_params, "f"))) {
            if (finish_reason === "length") {
              throw new LengthFinishReasonError;
            }
            if (finish_reason === "content_filter") {
              throw new ContentFilterFinishReasonError;
            }
          }
        }
        Object.assign(choice, other);
        if (!delta)
          continue;
        const { content, refusal, function_call, role, tool_calls, ...rest2 } = delta;
        assertIsEmpty(rest2);
        Object.assign(choice.message, rest2);
        if (refusal) {
          choice.message.refusal = (choice.message.refusal || "") + refusal;
        }
        if (role)
          choice.message.role = role;
        if (function_call) {
          if (!choice.message.function_call) {
            choice.message.function_call = function_call;
          } else {
            if (function_call.name)
              choice.message.function_call.name = function_call.name;
            if (function_call.arguments) {
              (_c = choice.message.function_call).arguments ?? (_c.arguments = "");
              choice.message.function_call.arguments += function_call.arguments;
            }
          }
        }
        if (content) {
          choice.message.content = (choice.message.content || "") + content;
          if (!choice.message.refusal && __classPrivateFieldGet9(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this)) {
            choice.message.parsed = partialParse2(choice.message.content);
          }
        }
        if (tool_calls) {
          if (!choice.message.tool_calls)
            choice.message.tool_calls = [];
          for (const { index: index2, id, type, function: fn, ...rest3 } of tool_calls) {
            const tool_call = (_d = choice.message.tool_calls)[index2] ?? (_d[index2] = {});
            Object.assign(tool_call, rest3);
            if (id)
              tool_call.id = id;
            if (type)
              tool_call.type = type;
            if (fn)
              tool_call.function ?? (tool_call.function = { name: fn.name ?? "", arguments: "" });
            if (fn?.name)
              tool_call.function.name = fn.name;
            if (fn?.arguments) {
              tool_call.function.arguments += fn.arguments;
              if (shouldParseToolCall(__classPrivateFieldGet9(this, _ChatCompletionStream_params, "f"), tool_call)) {
                tool_call.function.parsed_arguments = partialParse2(tool_call.function.arguments);
              }
            }
          }
        }
      }
      return snapshot;
    }, Symbol.asyncIterator)]() {
      const pushQueue = [];
      const readQueue = [];
      let done = false;
      this.on("chunk", (chunk) => {
        const reader = readQueue.shift();
        if (reader) {
          reader.resolve(chunk);
        } else {
          pushQueue.push(chunk);
        }
      });
      this.on("end", () => {
        done = true;
        for (const reader of readQueue) {
          reader.resolve(undefined);
        }
        readQueue.length = 0;
      });
      this.on("abort", (err) => {
        done = true;
        for (const reader of readQueue) {
          reader.reject(err);
        }
        readQueue.length = 0;
      });
      this.on("error", (err) => {
        done = true;
        for (const reader of readQueue) {
          reader.reject(err);
        }
        readQueue.length = 0;
      });
      return {
        next: async () => {
          if (!pushQueue.length) {
            if (done) {
              return { value: undefined, done: true };
            }
            return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: undefined, done: true });
          }
          const chunk = pushQueue.shift();
          return { value: chunk, done: false };
        },
        return: async () => {
          this.abort();
          return { value: undefined, done: true };
        }
      };
    }
    toReadableStream() {
      const stream = new Stream2(this[Symbol.asyncIterator].bind(this), this.controller);
      return stream.toReadableStream();
    }
  };
});

// node_modules/openai/lib/ChatCompletionStreamingRunner.mjs
var ChatCompletionStreamingRunner;
var init_ChatCompletionStreamingRunner = __esm(() => {
  init_ChatCompletionStream();
  ChatCompletionStreamingRunner = class ChatCompletionStreamingRunner extends ChatCompletionStream {
    static fromReadableStream(stream) {
      const runner = new ChatCompletionStreamingRunner(null);
      runner._run(() => runner._fromReadableStream(stream));
      return runner;
    }
    static runFunctions(client, params, options) {
      const runner = new ChatCompletionStreamingRunner(null);
      const opts = {
        ...options,
        headers: { ...options?.headers, "X-Stainless-Helper-Method": "runFunctions" }
      };
      runner._run(() => runner._runFunctions(client, params, opts));
      return runner;
    }
    static runTools(client, params, options) {
      const runner = new ChatCompletionStreamingRunner(params);
      const opts = {
        ...options,
        headers: { ...options?.headers, "X-Stainless-Helper-Method": "runTools" }
      };
      runner._run(() => runner._runTools(client, params, opts));
      return runner;
    }
  };
});

// node_modules/openai/resources/beta/chat/completions.mjs
var Completions3;
var init_completions3 = __esm(() => {
  init_ChatCompletionRunner();
  init_ChatCompletionStreamingRunner();
  init_ChatCompletionStream();
  init_parser2();
  Completions3 = class Completions3 extends APIResource2 {
    parse(body, options) {
      validateInputTools(body.tools);
      return this._client.chat.completions.create(body, {
        ...options,
        headers: {
          ...options?.headers,
          "X-Stainless-Helper-Method": "beta.chat.completions.parse"
        }
      })._thenUnwrap((completion) => parseChatCompletion(completion, body));
    }
    runFunctions(body, options) {
      if (body.stream) {
        return ChatCompletionStreamingRunner.runFunctions(this._client, body, options);
      }
      return ChatCompletionRunner.runFunctions(this._client, body, options);
    }
    runTools(body, options) {
      if (body.stream) {
        return ChatCompletionStreamingRunner.runTools(this._client, body, options);
      }
      return ChatCompletionRunner.runTools(this._client, body, options);
    }
    stream(body, options) {
      return ChatCompletionStream.createChatCompletion(this._client, body, options);
    }
  };
});

// node_modules/openai/resources/beta/chat/chat.mjs
var Chat2;
var init_chat3 = __esm(() => {
  init_completions3();
  Chat2 = class Chat2 extends APIResource2 {
    constructor() {
      super(...arguments);
      this.completions = new Completions3(this._client);
    }
  };
  (function(Chat3) {
    Chat3.Completions = Completions3;
  })(Chat2 || (Chat2 = {}));
});

// node_modules/openai/resources/beta/realtime/sessions.mjs
var Sessions;
var init_sessions = __esm(() => {
  Sessions = class Sessions extends APIResource2 {
    create(body, options) {
      return this._client.post("/realtime/sessions", {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
  };
});

// node_modules/openai/resources/beta/realtime/transcription-sessions.mjs
var TranscriptionSessions;
var init_transcription_sessions = __esm(() => {
  TranscriptionSessions = class TranscriptionSessions extends APIResource2 {
    create(body, options) {
      return this._client.post("/realtime/transcription_sessions", {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
  };
});

// node_modules/openai/resources/beta/realtime/realtime.mjs
var Realtime;
var init_realtime = __esm(() => {
  init_sessions();
  init_sessions();
  init_transcription_sessions();
  init_transcription_sessions();
  Realtime = class Realtime extends APIResource2 {
    constructor() {
      super(...arguments);
      this.sessions = new Sessions(this._client);
      this.transcriptionSessions = new TranscriptionSessions(this._client);
    }
  };
  Realtime.Sessions = Sessions;
  Realtime.TranscriptionSessions = TranscriptionSessions;
});

// node_modules/openai/resources/beta/threads/messages.mjs
var Messages5, MessagesPage;
var init_messages5 = __esm(() => {
  init_core2();
  init_pagination2();
  Messages5 = class Messages5 extends APIResource2 {
    create(threadId, body, options) {
      return this._client.post(`/threads/${threadId}/messages`, {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    retrieve(threadId, messageId, options) {
      return this._client.get(`/threads/${threadId}/messages/${messageId}`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    update(threadId, messageId, body, options) {
      return this._client.post(`/threads/${threadId}/messages/${messageId}`, {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    list(threadId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list(threadId, {}, query);
      }
      return this._client.getAPIList(`/threads/${threadId}/messages`, MessagesPage, {
        query,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    del(threadId, messageId, options) {
      return this._client.delete(`/threads/${threadId}/messages/${messageId}`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
  };
  MessagesPage = class MessagesPage extends CursorPage {
  };
  Messages5.MessagesPage = MessagesPage;
});

// node_modules/openai/resources/beta/threads/runs/steps.mjs
var Steps, RunStepsPage;
var init_steps = __esm(() => {
  init_core2();
  init_pagination2();
  Steps = class Steps extends APIResource2 {
    retrieve(threadId, runId, stepId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.retrieve(threadId, runId, stepId, {}, query);
      }
      return this._client.get(`/threads/${threadId}/runs/${runId}/steps/${stepId}`, {
        query,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    list(threadId, runId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list(threadId, runId, {}, query);
      }
      return this._client.getAPIList(`/threads/${threadId}/runs/${runId}/steps`, RunStepsPage, {
        query,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
  };
  RunStepsPage = class RunStepsPage extends CursorPage {
  };
  Steps.RunStepsPage = RunStepsPage;
});

// node_modules/openai/resources/beta/threads/runs/runs.mjs
var Runs, RunsPage;
var init_runs = __esm(() => {
  init_core2();
  init_AssistantStream();
  init_core2();
  init_steps();
  init_steps();
  init_pagination2();
  Runs = class Runs extends APIResource2 {
    constructor() {
      super(...arguments);
      this.steps = new Steps(this._client);
    }
    create(threadId, params, options) {
      const { include, ...body } = params;
      return this._client.post(`/threads/${threadId}/runs`, {
        query: { include },
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
        stream: params.stream ?? false
      });
    }
    retrieve(threadId, runId, options) {
      return this._client.get(`/threads/${threadId}/runs/${runId}`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    update(threadId, runId, body, options) {
      return this._client.post(`/threads/${threadId}/runs/${runId}`, {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    list(threadId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list(threadId, {}, query);
      }
      return this._client.getAPIList(`/threads/${threadId}/runs`, RunsPage, {
        query,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    cancel(threadId, runId, options) {
      return this._client.post(`/threads/${threadId}/runs/${runId}/cancel`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    async createAndPoll(threadId, body, options) {
      const run = await this.create(threadId, body, options);
      return await this.poll(threadId, run.id, options);
    }
    createAndStream(threadId, body, options) {
      return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
    }
    async poll(threadId, runId, options) {
      const headers = { ...options?.headers, "X-Stainless-Poll-Helper": "true" };
      if (options?.pollIntervalMs) {
        headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs.toString();
      }
      while (true) {
        const { data: run, response } = await this.retrieve(threadId, runId, {
          ...options,
          headers: { ...options?.headers, ...headers }
        }).withResponse();
        switch (run.status) {
          case "queued":
          case "in_progress":
          case "cancelling":
            let sleepInterval = 5000;
            if (options?.pollIntervalMs) {
              sleepInterval = options.pollIntervalMs;
            } else {
              const headerInterval = response.headers.get("openai-poll-after-ms");
              if (headerInterval) {
                const headerIntervalMs = parseInt(headerInterval);
                if (!isNaN(headerIntervalMs)) {
                  sleepInterval = headerIntervalMs;
                }
              }
            }
            await sleep2(sleepInterval);
            break;
          case "requires_action":
          case "incomplete":
          case "cancelled":
          case "completed":
          case "failed":
          case "expired":
            return run;
        }
      }
    }
    stream(threadId, body, options) {
      return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
    }
    submitToolOutputs(threadId, runId, body, options) {
      return this._client.post(`/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
        stream: body.stream ?? false
      });
    }
    async submitToolOutputsAndPoll(threadId, runId, body, options) {
      const run = await this.submitToolOutputs(threadId, runId, body, options);
      return await this.poll(threadId, run.id, options);
    }
    submitToolOutputsStream(threadId, runId, body, options) {
      return AssistantStream.createToolAssistantStream(threadId, runId, this._client.beta.threads.runs, body, options);
    }
  };
  RunsPage = class RunsPage extends CursorPage {
  };
  Runs.RunsPage = RunsPage;
  Runs.Steps = Steps;
  Runs.RunStepsPage = RunStepsPage;
});

// node_modules/openai/resources/beta/threads/threads.mjs
var Threads;
var init_threads = __esm(() => {
  init_core2();
  init_AssistantStream();
  init_messages5();
  init_messages5();
  init_runs();
  init_runs();
  Threads = class Threads extends APIResource2 {
    constructor() {
      super(...arguments);
      this.runs = new Runs(this._client);
      this.messages = new Messages5(this._client);
    }
    create(body = {}, options) {
      if (isRequestOptions2(body)) {
        return this.create({}, body);
      }
      return this._client.post("/threads", {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    retrieve(threadId, options) {
      return this._client.get(`/threads/${threadId}`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    update(threadId, body, options) {
      return this._client.post(`/threads/${threadId}`, {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    del(threadId, options) {
      return this._client.delete(`/threads/${threadId}`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    createAndRun(body, options) {
      return this._client.post("/threads/runs", {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
        stream: body.stream ?? false
      });
    }
    async createAndRunPoll(body, options) {
      const run = await this.createAndRun(body, options);
      return await this.runs.poll(run.thread_id, run.id, options);
    }
    createAndRunStream(body, options) {
      return AssistantStream.createThreadAssistantStream(body, this._client.beta.threads, options);
    }
  };
  Threads.Runs = Runs;
  Threads.RunsPage = RunsPage;
  Threads.Messages = Messages5;
  Threads.MessagesPage = MessagesPage;
});

// node_modules/openai/resources/beta/beta.mjs
var Beta2;
var init_beta2 = __esm(() => {
  init_assistants();
  init_chat3();
  init_assistants();
  init_realtime();
  init_realtime();
  init_threads();
  init_threads();
  Beta2 = class Beta2 extends APIResource2 {
    constructor() {
      super(...arguments);
      this.realtime = new Realtime(this._client);
      this.chat = new Chat2(this._client);
      this.assistants = new Assistants(this._client);
      this.threads = new Threads(this._client);
    }
  };
  Beta2.Realtime = Realtime;
  Beta2.Assistants = Assistants;
  Beta2.AssistantsPage = AssistantsPage;
  Beta2.Threads = Threads;
});

// node_modules/openai/resources/completions.mjs
var Completions4;
var init_completions4 = __esm(() => {
  Completions4 = class Completions4 extends APIResource2 {
    create(body, options) {
      return this._client.post("/completions", { body, ...options, stream: body.stream ?? false });
    }
  };
});

// node_modules/openai/resources/containers/files/content.mjs
var Content;
var init_content = __esm(() => {
  Content = class Content extends APIResource2 {
    retrieve(containerId, fileId, options) {
      return this._client.get(`/containers/${containerId}/files/${fileId}/content`, {
        ...options,
        headers: { Accept: "application/binary", ...options?.headers },
        __binaryResponse: true
      });
    }
  };
});

// node_modules/openai/resources/containers/files/files.mjs
var Files, FileListResponsesPage;
var init_files = __esm(() => {
  init_core2();
  init_core2();
  init_content();
  init_content();
  init_pagination2();
  Files = class Files extends APIResource2 {
    constructor() {
      super(...arguments);
      this.content = new Content(this._client);
    }
    create(containerId, body, options) {
      return this._client.post(`/containers/${containerId}/files`, multipartFormRequestOptions({ body, ...options }));
    }
    retrieve(containerId, fileId, options) {
      return this._client.get(`/containers/${containerId}/files/${fileId}`, options);
    }
    list(containerId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list(containerId, {}, query);
      }
      return this._client.getAPIList(`/containers/${containerId}/files`, FileListResponsesPage, {
        query,
        ...options
      });
    }
    del(containerId, fileId, options) {
      return this._client.delete(`/containers/${containerId}/files/${fileId}`, {
        ...options,
        headers: { Accept: "*/*", ...options?.headers }
      });
    }
  };
  FileListResponsesPage = class FileListResponsesPage extends CursorPage {
  };
  Files.FileListResponsesPage = FileListResponsesPage;
  Files.Content = Content;
});

// node_modules/openai/resources/containers/containers.mjs
var Containers, ContainerListResponsesPage;
var init_containers = __esm(() => {
  init_core2();
  init_files();
  init_files();
  init_pagination2();
  Containers = class Containers extends APIResource2 {
    constructor() {
      super(...arguments);
      this.files = new Files(this._client);
    }
    create(body, options) {
      return this._client.post("/containers", { body, ...options });
    }
    retrieve(containerId, options) {
      return this._client.get(`/containers/${containerId}`, options);
    }
    list(query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list({}, query);
      }
      return this._client.getAPIList("/containers", ContainerListResponsesPage, { query, ...options });
    }
    del(containerId, options) {
      return this._client.delete(`/containers/${containerId}`, {
        ...options,
        headers: { Accept: "*/*", ...options?.headers }
      });
    }
  };
  ContainerListResponsesPage = class ContainerListResponsesPage extends CursorPage {
  };
  Containers.ContainerListResponsesPage = ContainerListResponsesPage;
  Containers.Files = Files;
  Containers.FileListResponsesPage = FileListResponsesPage;
});

// node_modules/openai/resources/embeddings.mjs
var Embeddings;
var init_embeddings = __esm(() => {
  init_core2();
  Embeddings = class Embeddings extends APIResource2 {
    create(body, options) {
      const hasUserProvidedEncodingFormat = !!body.encoding_format;
      let encoding_format = hasUserProvidedEncodingFormat ? body.encoding_format : "base64";
      if (hasUserProvidedEncodingFormat) {
        debug2("Request", "User defined encoding_format:", body.encoding_format);
      }
      const response = this._client.post("/embeddings", {
        body: {
          ...body,
          encoding_format
        },
        ...options
      });
      if (hasUserProvidedEncodingFormat) {
        return response;
      }
      debug2("response", "Decoding base64 embeddings to float32 array");
      return response._thenUnwrap((response2) => {
        if (response2 && response2.data) {
          response2.data.forEach((embeddingBase64Obj) => {
            const embeddingBase64Str = embeddingBase64Obj.embedding;
            embeddingBase64Obj.embedding = toFloat32Array(embeddingBase64Str);
          });
        }
        return response2;
      });
    }
  };
});

// node_modules/openai/resources/evals/runs/output-items.mjs
var OutputItems, OutputItemListResponsesPage;
var init_output_items = __esm(() => {
  init_core2();
  init_pagination2();
  OutputItems = class OutputItems extends APIResource2 {
    retrieve(evalId, runId, outputItemId, options) {
      return this._client.get(`/evals/${evalId}/runs/${runId}/output_items/${outputItemId}`, options);
    }
    list(evalId, runId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list(evalId, runId, {}, query);
      }
      return this._client.getAPIList(`/evals/${evalId}/runs/${runId}/output_items`, OutputItemListResponsesPage, { query, ...options });
    }
  };
  OutputItemListResponsesPage = class OutputItemListResponsesPage extends CursorPage {
  };
  OutputItems.OutputItemListResponsesPage = OutputItemListResponsesPage;
});

// node_modules/openai/resources/evals/runs/runs.mjs
var Runs2, RunListResponsesPage;
var init_runs2 = __esm(() => {
  init_core2();
  init_output_items();
  init_output_items();
  init_pagination2();
  Runs2 = class Runs2 extends APIResource2 {
    constructor() {
      super(...arguments);
      this.outputItems = new OutputItems(this._client);
    }
    create(evalId, body, options) {
      return this._client.post(`/evals/${evalId}/runs`, { body, ...options });
    }
    retrieve(evalId, runId, options) {
      return this._client.get(`/evals/${evalId}/runs/${runId}`, options);
    }
    list(evalId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list(evalId, {}, query);
      }
      return this._client.getAPIList(`/evals/${evalId}/runs`, RunListResponsesPage, { query, ...options });
    }
    del(evalId, runId, options) {
      return this._client.delete(`/evals/${evalId}/runs/${runId}`, options);
    }
    cancel(evalId, runId, options) {
      return this._client.post(`/evals/${evalId}/runs/${runId}`, options);
    }
  };
  RunListResponsesPage = class RunListResponsesPage extends CursorPage {
  };
  Runs2.RunListResponsesPage = RunListResponsesPage;
  Runs2.OutputItems = OutputItems;
  Runs2.OutputItemListResponsesPage = OutputItemListResponsesPage;
});

// node_modules/openai/resources/evals/evals.mjs
var Evals, EvalListResponsesPage;
var init_evals = __esm(() => {
  init_core2();
  init_runs2();
  init_runs2();
  init_pagination2();
  Evals = class Evals extends APIResource2 {
    constructor() {
      super(...arguments);
      this.runs = new Runs2(this._client);
    }
    create(body, options) {
      return this._client.post("/evals", { body, ...options });
    }
    retrieve(evalId, options) {
      return this._client.get(`/evals/${evalId}`, options);
    }
    update(evalId, body, options) {
      return this._client.post(`/evals/${evalId}`, { body, ...options });
    }
    list(query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list({}, query);
      }
      return this._client.getAPIList("/evals", EvalListResponsesPage, { query, ...options });
    }
    del(evalId, options) {
      return this._client.delete(`/evals/${evalId}`, options);
    }
  };
  EvalListResponsesPage = class EvalListResponsesPage extends CursorPage {
  };
  Evals.EvalListResponsesPage = EvalListResponsesPage;
  Evals.Runs = Runs2;
  Evals.RunListResponsesPage = RunListResponsesPage;
});

// node_modules/openai/resources/files.mjs
var Files2, FileObjectsPage;
var init_files2 = __esm(() => {
  init_core2();
  init_core2();
  init_error2();
  init_core2();
  init_pagination2();
  Files2 = class Files2 extends APIResource2 {
    create(body, options) {
      return this._client.post("/files", multipartFormRequestOptions({ body, ...options }));
    }
    retrieve(fileId, options) {
      return this._client.get(`/files/${fileId}`, options);
    }
    list(query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list({}, query);
      }
      return this._client.getAPIList("/files", FileObjectsPage, { query, ...options });
    }
    del(fileId, options) {
      return this._client.delete(`/files/${fileId}`, options);
    }
    content(fileId, options) {
      return this._client.get(`/files/${fileId}/content`, {
        ...options,
        headers: { Accept: "application/binary", ...options?.headers },
        __binaryResponse: true
      });
    }
    retrieveContent(fileId, options) {
      return this._client.get(`/files/${fileId}/content`, options);
    }
    async waitForProcessing(id, { pollInterval = 5000, maxWait = 30 * 60 * 1000 } = {}) {
      const TERMINAL_STATES = new Set(["processed", "error", "deleted"]);
      const start = Date.now();
      let file = await this.retrieve(id);
      while (!file.status || !TERMINAL_STATES.has(file.status)) {
        await sleep2(pollInterval);
        file = await this.retrieve(id);
        if (Date.now() - start > maxWait) {
          throw new APIConnectionTimeoutError2({
            message: `Giving up on waiting for file ${id} to finish processing after ${maxWait} milliseconds.`
          });
        }
      }
      return file;
    }
  };
  FileObjectsPage = class FileObjectsPage extends CursorPage {
  };
  Files2.FileObjectsPage = FileObjectsPage;
});

// node_modules/openai/resources/fine-tuning/methods.mjs
var Methods;
var init_methods = __esm(() => {
  Methods = class Methods extends APIResource2 {
  };
});

// node_modules/openai/resources/fine-tuning/alpha/graders.mjs
var Graders;
var init_graders = __esm(() => {
  Graders = class Graders extends APIResource2 {
    run(body, options) {
      return this._client.post("/fine_tuning/alpha/graders/run", { body, ...options });
    }
    validate(body, options) {
      return this._client.post("/fine_tuning/alpha/graders/validate", { body, ...options });
    }
  };
});

// node_modules/openai/resources/fine-tuning/alpha/alpha.mjs
var Alpha;
var init_alpha = __esm(() => {
  init_graders();
  init_graders();
  Alpha = class Alpha extends APIResource2 {
    constructor() {
      super(...arguments);
      this.graders = new Graders(this._client);
    }
  };
  Alpha.Graders = Graders;
});

// node_modules/openai/resources/fine-tuning/checkpoints/permissions.mjs
var Permissions, PermissionCreateResponsesPage;
var init_permissions = __esm(() => {
  init_core2();
  init_pagination2();
  Permissions = class Permissions extends APIResource2 {
    create(fineTunedModelCheckpoint, body, options) {
      return this._client.getAPIList(`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, PermissionCreateResponsesPage, { body, method: "post", ...options });
    }
    retrieve(fineTunedModelCheckpoint, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.retrieve(fineTunedModelCheckpoint, {}, query);
      }
      return this._client.get(`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, {
        query,
        ...options
      });
    }
    del(fineTunedModelCheckpoint, permissionId, options) {
      return this._client.delete(`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions/${permissionId}`, options);
    }
  };
  PermissionCreateResponsesPage = class PermissionCreateResponsesPage extends Page2 {
  };
  Permissions.PermissionCreateResponsesPage = PermissionCreateResponsesPage;
});

// node_modules/openai/resources/fine-tuning/checkpoints/checkpoints.mjs
var Checkpoints;
var init_checkpoints = __esm(() => {
  init_permissions();
  init_permissions();
  Checkpoints = class Checkpoints extends APIResource2 {
    constructor() {
      super(...arguments);
      this.permissions = new Permissions(this._client);
    }
  };
  Checkpoints.Permissions = Permissions;
  Checkpoints.PermissionCreateResponsesPage = PermissionCreateResponsesPage;
});

// node_modules/openai/resources/fine-tuning/jobs/checkpoints.mjs
var Checkpoints2, FineTuningJobCheckpointsPage;
var init_checkpoints2 = __esm(() => {
  init_core2();
  init_pagination2();
  Checkpoints2 = class Checkpoints2 extends APIResource2 {
    list(fineTuningJobId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list(fineTuningJobId, {}, query);
      }
      return this._client.getAPIList(`/fine_tuning/jobs/${fineTuningJobId}/checkpoints`, FineTuningJobCheckpointsPage, { query, ...options });
    }
  };
  FineTuningJobCheckpointsPage = class FineTuningJobCheckpointsPage extends CursorPage {
  };
  Checkpoints2.FineTuningJobCheckpointsPage = FineTuningJobCheckpointsPage;
});

// node_modules/openai/resources/fine-tuning/jobs/jobs.mjs
var Jobs, FineTuningJobsPage, FineTuningJobEventsPage;
var init_jobs = __esm(() => {
  init_core2();
  init_checkpoints2();
  init_checkpoints2();
  init_pagination2();
  Jobs = class Jobs extends APIResource2 {
    constructor() {
      super(...arguments);
      this.checkpoints = new Checkpoints2(this._client);
    }
    create(body, options) {
      return this._client.post("/fine_tuning/jobs", { body, ...options });
    }
    retrieve(fineTuningJobId, options) {
      return this._client.get(`/fine_tuning/jobs/${fineTuningJobId}`, options);
    }
    list(query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list({}, query);
      }
      return this._client.getAPIList("/fine_tuning/jobs", FineTuningJobsPage, { query, ...options });
    }
    cancel(fineTuningJobId, options) {
      return this._client.post(`/fine_tuning/jobs/${fineTuningJobId}/cancel`, options);
    }
    listEvents(fineTuningJobId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.listEvents(fineTuningJobId, {}, query);
      }
      return this._client.getAPIList(`/fine_tuning/jobs/${fineTuningJobId}/events`, FineTuningJobEventsPage, {
        query,
        ...options
      });
    }
    pause(fineTuningJobId, options) {
      return this._client.post(`/fine_tuning/jobs/${fineTuningJobId}/pause`, options);
    }
    resume(fineTuningJobId, options) {
      return this._client.post(`/fine_tuning/jobs/${fineTuningJobId}/resume`, options);
    }
  };
  FineTuningJobsPage = class FineTuningJobsPage extends CursorPage {
  };
  FineTuningJobEventsPage = class FineTuningJobEventsPage extends CursorPage {
  };
  Jobs.FineTuningJobsPage = FineTuningJobsPage;
  Jobs.FineTuningJobEventsPage = FineTuningJobEventsPage;
  Jobs.Checkpoints = Checkpoints2;
  Jobs.FineTuningJobCheckpointsPage = FineTuningJobCheckpointsPage;
});

// node_modules/openai/resources/fine-tuning/fine-tuning.mjs
var FineTuning;
var init_fine_tuning = __esm(() => {
  init_methods();
  init_methods();
  init_alpha();
  init_alpha();
  init_checkpoints();
  init_checkpoints();
  init_jobs();
  init_jobs();
  FineTuning = class FineTuning extends APIResource2 {
    constructor() {
      super(...arguments);
      this.methods = new Methods(this._client);
      this.jobs = new Jobs(this._client);
      this.checkpoints = new Checkpoints(this._client);
      this.alpha = new Alpha(this._client);
    }
  };
  FineTuning.Methods = Methods;
  FineTuning.Jobs = Jobs;
  FineTuning.FineTuningJobsPage = FineTuningJobsPage;
  FineTuning.FineTuningJobEventsPage = FineTuningJobEventsPage;
  FineTuning.Checkpoints = Checkpoints;
  FineTuning.Alpha = Alpha;
});

// node_modules/openai/resources/graders/grader-models.mjs
var GraderModels;
var init_grader_models = __esm(() => {
  GraderModels = class GraderModels extends APIResource2 {
  };
});

// node_modules/openai/resources/graders/graders.mjs
var Graders2;
var init_graders2 = __esm(() => {
  init_grader_models();
  init_grader_models();
  Graders2 = class Graders2 extends APIResource2 {
    constructor() {
      super(...arguments);
      this.graderModels = new GraderModels(this._client);
    }
  };
  Graders2.GraderModels = GraderModels;
});

// node_modules/openai/resources/images.mjs
var Images;
var init_images = __esm(() => {
  init_core2();
  Images = class Images extends APIResource2 {
    createVariation(body, options) {
      return this._client.post("/images/variations", multipartFormRequestOptions({ body, ...options }));
    }
    edit(body, options) {
      return this._client.post("/images/edits", multipartFormRequestOptions({ body, ...options }));
    }
    generate(body, options) {
      return this._client.post("/images/generations", { body, ...options });
    }
  };
});

// node_modules/openai/resources/models.mjs
var Models, ModelsPage;
var init_models = __esm(() => {
  init_pagination2();
  Models = class Models extends APIResource2 {
    retrieve(model, options) {
      return this._client.get(`/models/${model}`, options);
    }
    list(options) {
      return this._client.getAPIList("/models", ModelsPage, options);
    }
    del(model, options) {
      return this._client.delete(`/models/${model}`, options);
    }
  };
  ModelsPage = class ModelsPage extends Page2 {
  };
  Models.ModelsPage = ModelsPage;
});

// node_modules/openai/resources/moderations.mjs
var Moderations;
var init_moderations = __esm(() => {
  Moderations = class Moderations extends APIResource2 {
    create(body, options) {
      return this._client.post("/moderations", { body, ...options });
    }
  };
});

// node_modules/openai/lib/ResponsesParser.mjs
function maybeParseResponse(response, params) {
  if (!params || !hasAutoParseableInput2(params)) {
    return {
      ...response,
      output_parsed: null,
      output: response.output.map((item) => {
        if (item.type === "function_call") {
          return {
            ...item,
            parsed_arguments: null
          };
        }
        if (item.type === "message") {
          return {
            ...item,
            content: item.content.map((content) => ({
              ...content,
              parsed: null
            }))
          };
        } else {
          return item;
        }
      })
    };
  }
  return parseResponse(response, params);
}
function parseResponse(response, params) {
  const output = response.output.map((item) => {
    if (item.type === "function_call") {
      return {
        ...item,
        parsed_arguments: parseToolCall2(params, item)
      };
    }
    if (item.type === "message") {
      const content = item.content.map((content2) => {
        if (content2.type === "output_text") {
          return {
            ...content2,
            parsed: parseTextFormat(params, content2.text)
          };
        }
        return content2;
      });
      return {
        ...item,
        content
      };
    }
    return item;
  });
  const parsed = Object.assign({}, response, { output });
  if (!Object.getOwnPropertyDescriptor(response, "output_text")) {
    addOutputText(parsed);
  }
  Object.defineProperty(parsed, "output_parsed", {
    enumerable: true,
    get() {
      for (const output2 of parsed.output) {
        if (output2.type !== "message") {
          continue;
        }
        for (const content of output2.content) {
          if (content.type === "output_text" && content.parsed !== null) {
            return content.parsed;
          }
        }
      }
      return null;
    }
  });
  return parsed;
}
function parseTextFormat(params, content) {
  if (params.text?.format?.type !== "json_schema") {
    return null;
  }
  if ("$parseRaw" in params.text?.format) {
    const text_format = params.text?.format;
    return text_format.$parseRaw(content);
  }
  return JSON.parse(content);
}
function hasAutoParseableInput2(params) {
  if (isAutoParsableResponseFormat(params.text?.format)) {
    return true;
  }
  return false;
}
function isAutoParsableTool2(tool) {
  return tool?.["$brand"] === "auto-parseable-tool";
}
function getInputToolByName(input_tools, name) {
  return input_tools.find((tool) => tool.type === "function" && tool.name === name);
}
function parseToolCall2(params, toolCall) {
  const inputTool = getInputToolByName(params.tools ?? [], toolCall.name);
  return {
    ...toolCall,
    ...toolCall,
    parsed_arguments: isAutoParsableTool2(inputTool) ? inputTool.$parseRaw(toolCall.arguments) : inputTool?.strict ? JSON.parse(toolCall.arguments) : null
  };
}
function addOutputText(rsp) {
  const texts = [];
  for (const output of rsp.output) {
    if (output.type !== "message") {
      continue;
    }
    for (const content of output.content) {
      if (content.type === "output_text") {
        texts.push(content.text);
      }
    }
  }
  rsp.output_text = texts.join("");
}
var init_ResponsesParser = __esm(() => {
  init_parser2();
});

// node_modules/openai/resources/responses/input-items.mjs
var InputItems;
var init_input_items = __esm(() => {
  init_core2();
  init_responses();
  InputItems = class InputItems extends APIResource2 {
    list(responseId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list(responseId, {}, query);
      }
      return this._client.getAPIList(`/responses/${responseId}/input_items`, ResponseItemsPage, {
        query,
        ...options
      });
    }
  };
});

// node_modules/openai/lib/responses/ResponseStream.mjs
function finalizeResponse(snapshot, params) {
  return maybeParseResponse(snapshot, params);
}
var __classPrivateFieldSet9 = function(receiver, state, value, kind3, f) {
  if (kind3 === "m")
    throw new TypeError("Private method is not writable");
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind3 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}, __classPrivateFieldGet10 = function(receiver, state, kind3, f) {
  if (kind3 === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind3 === "m" ? f : kind3 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}, _ResponseStream_instances, _ResponseStream_params, _ResponseStream_currentResponseSnapshot, _ResponseStream_finalResponse, _ResponseStream_beginRequest, _ResponseStream_addEvent, _ResponseStream_endRequest, _ResponseStream_accumulateResponse, ResponseStream;
var init_ResponseStream = __esm(() => {
  init_error2();
  init_EventStream();
  init_ResponsesParser();
  ResponseStream = class ResponseStream extends EventStream {
    constructor(params) {
      super();
      _ResponseStream_instances.add(this);
      _ResponseStream_params.set(this, undefined);
      _ResponseStream_currentResponseSnapshot.set(this, undefined);
      _ResponseStream_finalResponse.set(this, undefined);
      __classPrivateFieldSet9(this, _ResponseStream_params, params, "f");
    }
    static createResponse(client, params, options) {
      const runner = new ResponseStream(params);
      runner._run(() => runner._createOrRetrieveResponse(client, params, {
        ...options,
        headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
      }));
      return runner;
    }
    async _createOrRetrieveResponse(client, params, options) {
      const signal = options?.signal;
      if (signal) {
        if (signal.aborted)
          this.controller.abort();
        signal.addEventListener("abort", () => this.controller.abort());
      }
      __classPrivateFieldGet10(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
      let stream;
      let starting_after = null;
      if ("response_id" in params) {
        stream = await client.responses.retrieve(params.response_id, { stream: true }, { ...options, signal: this.controller.signal, stream: true });
        starting_after = params.starting_after ?? null;
      } else {
        stream = await client.responses.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
      }
      this._connected();
      for await (const event of stream) {
        __classPrivateFieldGet10(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, starting_after);
      }
      if (stream.controller.signal?.aborted) {
        throw new APIUserAbortError2;
      }
      return __classPrivateFieldGet10(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
    }
    [(_ResponseStream_params = new WeakMap, _ResponseStream_currentResponseSnapshot = new WeakMap, _ResponseStream_finalResponse = new WeakMap, _ResponseStream_instances = new WeakSet, _ResponseStream_beginRequest = function _ResponseStream_beginRequest2() {
      if (this.ended)
        return;
      __classPrivateFieldSet9(this, _ResponseStream_currentResponseSnapshot, undefined, "f");
    }, _ResponseStream_addEvent = function _ResponseStream_addEvent2(event, starting_after) {
      if (this.ended)
        return;
      const maybeEmit = (name, event2) => {
        if (starting_after == null || event2.sequence_number > starting_after) {
          this._emit(name, event2);
        }
      };
      const response = __classPrivateFieldGet10(this, _ResponseStream_instances, "m", _ResponseStream_accumulateResponse).call(this, event);
      maybeEmit("event", event);
      switch (event.type) {
        case "response.output_text.delta": {
          const output = response.output[event.output_index];
          if (!output) {
            throw new OpenAIError(`missing output at index ${event.output_index}`);
          }
          if (output.type === "message") {
            const content = output.content[event.content_index];
            if (!content) {
              throw new OpenAIError(`missing content at index ${event.content_index}`);
            }
            if (content.type !== "output_text") {
              throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
            }
            maybeEmit("response.output_text.delta", {
              ...event,
              snapshot: content.text
            });
          }
          break;
        }
        case "response.function_call_arguments.delta": {
          const output = response.output[event.output_index];
          if (!output) {
            throw new OpenAIError(`missing output at index ${event.output_index}`);
          }
          if (output.type === "function_call") {
            maybeEmit("response.function_call_arguments.delta", {
              ...event,
              snapshot: output.arguments
            });
          }
          break;
        }
        default:
          maybeEmit(event.type, event);
          break;
      }
    }, _ResponseStream_endRequest = function _ResponseStream_endRequest2() {
      if (this.ended) {
        throw new OpenAIError(`stream has ended, this shouldn't happen`);
      }
      const snapshot = __classPrivateFieldGet10(this, _ResponseStream_currentResponseSnapshot, "f");
      if (!snapshot) {
        throw new OpenAIError(`request ended without sending any events`);
      }
      __classPrivateFieldSet9(this, _ResponseStream_currentResponseSnapshot, undefined, "f");
      const parsedResponse = finalizeResponse(snapshot, __classPrivateFieldGet10(this, _ResponseStream_params, "f"));
      __classPrivateFieldSet9(this, _ResponseStream_finalResponse, parsedResponse, "f");
      return parsedResponse;
    }, _ResponseStream_accumulateResponse = function _ResponseStream_accumulateResponse2(event) {
      let snapshot = __classPrivateFieldGet10(this, _ResponseStream_currentResponseSnapshot, "f");
      if (!snapshot) {
        if (event.type !== "response.created") {
          throw new OpenAIError(`When snapshot hasn't been set yet, expected 'response.created' event, got ${event.type}`);
        }
        snapshot = __classPrivateFieldSet9(this, _ResponseStream_currentResponseSnapshot, event.response, "f");
        return snapshot;
      }
      switch (event.type) {
        case "response.output_item.added": {
          snapshot.output.push(event.item);
          break;
        }
        case "response.content_part.added": {
          const output = snapshot.output[event.output_index];
          if (!output) {
            throw new OpenAIError(`missing output at index ${event.output_index}`);
          }
          if (output.type === "message") {
            output.content.push(event.part);
          }
          break;
        }
        case "response.output_text.delta": {
          const output = snapshot.output[event.output_index];
          if (!output) {
            throw new OpenAIError(`missing output at index ${event.output_index}`);
          }
          if (output.type === "message") {
            const content = output.content[event.content_index];
            if (!content) {
              throw new OpenAIError(`missing content at index ${event.content_index}`);
            }
            if (content.type !== "output_text") {
              throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
            }
            content.text += event.delta;
          }
          break;
        }
        case "response.function_call_arguments.delta": {
          const output = snapshot.output[event.output_index];
          if (!output) {
            throw new OpenAIError(`missing output at index ${event.output_index}`);
          }
          if (output.type === "function_call") {
            output.arguments += event.delta;
          }
          break;
        }
        case "response.completed": {
          __classPrivateFieldSet9(this, _ResponseStream_currentResponseSnapshot, event.response, "f");
          break;
        }
      }
      return snapshot;
    }, Symbol.asyncIterator)]() {
      const pushQueue = [];
      const readQueue = [];
      let done = false;
      this.on("event", (event) => {
        const reader = readQueue.shift();
        if (reader) {
          reader.resolve(event);
        } else {
          pushQueue.push(event);
        }
      });
      this.on("end", () => {
        done = true;
        for (const reader of readQueue) {
          reader.resolve(undefined);
        }
        readQueue.length = 0;
      });
      this.on("abort", (err) => {
        done = true;
        for (const reader of readQueue) {
          reader.reject(err);
        }
        readQueue.length = 0;
      });
      this.on("error", (err) => {
        done = true;
        for (const reader of readQueue) {
          reader.reject(err);
        }
        readQueue.length = 0;
      });
      return {
        next: async () => {
          if (!pushQueue.length) {
            if (done) {
              return { value: undefined, done: true };
            }
            return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((event2) => event2 ? { value: event2, done: false } : { value: undefined, done: true });
          }
          const event = pushQueue.shift();
          return { value: event, done: false };
        },
        return: async () => {
          this.abort();
          return { value: undefined, done: true };
        }
      };
    }
    async finalResponse() {
      await this.done();
      const response = __classPrivateFieldGet10(this, _ResponseStream_finalResponse, "f");
      if (!response)
        throw new OpenAIError("stream ended without producing a ChatCompletion");
      return response;
    }
  };
});

// node_modules/openai/resources/responses/responses.mjs
var Responses, ResponseItemsPage;
var init_responses = __esm(() => {
  init_ResponsesParser();
  init_input_items();
  init_input_items();
  init_ResponseStream();
  init_pagination2();
  Responses = class Responses extends APIResource2 {
    constructor() {
      super(...arguments);
      this.inputItems = new InputItems(this._client);
    }
    create(body, options) {
      return this._client.post("/responses", { body, ...options, stream: body.stream ?? false })._thenUnwrap((rsp) => {
        if ("object" in rsp && rsp.object === "response") {
          addOutputText(rsp);
        }
        return rsp;
      });
    }
    retrieve(responseId, query = {}, options) {
      return this._client.get(`/responses/${responseId}`, {
        query,
        ...options,
        stream: query?.stream ?? false
      });
    }
    del(responseId, options) {
      return this._client.delete(`/responses/${responseId}`, {
        ...options,
        headers: { Accept: "*/*", ...options?.headers }
      });
    }
    parse(body, options) {
      return this._client.responses.create(body, options)._thenUnwrap((response) => parseResponse(response, body));
    }
    stream(body, options) {
      return ResponseStream.createResponse(this._client, body, options);
    }
    cancel(responseId, options) {
      return this._client.post(`/responses/${responseId}/cancel`, {
        ...options,
        headers: { Accept: "*/*", ...options?.headers }
      });
    }
  };
  ResponseItemsPage = class ResponseItemsPage extends CursorPage {
  };
  Responses.InputItems = InputItems;
});

// node_modules/openai/resources/uploads/parts.mjs
var Parts;
var init_parts = __esm(() => {
  init_core2();
  Parts = class Parts extends APIResource2 {
    create(uploadId, body, options) {
      return this._client.post(`/uploads/${uploadId}/parts`, multipartFormRequestOptions({ body, ...options }));
    }
  };
});

// node_modules/openai/resources/uploads/uploads.mjs
var Uploads;
var init_uploads3 = __esm(() => {
  init_parts();
  init_parts();
  Uploads = class Uploads extends APIResource2 {
    constructor() {
      super(...arguments);
      this.parts = new Parts(this._client);
    }
    create(body, options) {
      return this._client.post("/uploads", { body, ...options });
    }
    cancel(uploadId, options) {
      return this._client.post(`/uploads/${uploadId}/cancel`, options);
    }
    complete(uploadId, body, options) {
      return this._client.post(`/uploads/${uploadId}/complete`, { body, ...options });
    }
  };
  Uploads.Parts = Parts;
});

// node_modules/openai/lib/Util.mjs
var allSettledWithThrow = async (promises) => {
  const results = await Promise.allSettled(promises);
  const rejected = results.filter((result) => result.status === "rejected");
  if (rejected.length) {
    for (const result of rejected) {
      console.error(result.reason);
    }
    throw new Error(`${rejected.length} promise(s) failed - see the above errors`);
  }
  const values = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      values.push(result.value);
    }
  }
  return values;
};

// node_modules/openai/resources/vector-stores/files.mjs
var Files3, VectorStoreFilesPage, FileContentResponsesPage;
var init_files3 = __esm(() => {
  init_core2();
  init_pagination2();
  Files3 = class Files3 extends APIResource2 {
    create(vectorStoreId, body, options) {
      return this._client.post(`/vector_stores/${vectorStoreId}/files`, {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    retrieve(vectorStoreId, fileId, options) {
      return this._client.get(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    update(vectorStoreId, fileId, body, options) {
      return this._client.post(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    list(vectorStoreId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list(vectorStoreId, {}, query);
      }
      return this._client.getAPIList(`/vector_stores/${vectorStoreId}/files`, VectorStoreFilesPage, {
        query,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    del(vectorStoreId, fileId, options) {
      return this._client.delete(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    async createAndPoll(vectorStoreId, body, options) {
      const file = await this.create(vectorStoreId, body, options);
      return await this.poll(vectorStoreId, file.id, options);
    }
    async poll(vectorStoreId, fileId, options) {
      const headers = { ...options?.headers, "X-Stainless-Poll-Helper": "true" };
      if (options?.pollIntervalMs) {
        headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs.toString();
      }
      while (true) {
        const fileResponse = await this.retrieve(vectorStoreId, fileId, {
          ...options,
          headers
        }).withResponse();
        const file = fileResponse.data;
        switch (file.status) {
          case "in_progress":
            let sleepInterval = 5000;
            if (options?.pollIntervalMs) {
              sleepInterval = options.pollIntervalMs;
            } else {
              const headerInterval = fileResponse.response.headers.get("openai-poll-after-ms");
              if (headerInterval) {
                const headerIntervalMs = parseInt(headerInterval);
                if (!isNaN(headerIntervalMs)) {
                  sleepInterval = headerIntervalMs;
                }
              }
            }
            await sleep2(sleepInterval);
            break;
          case "failed":
          case "completed":
            return file;
        }
      }
    }
    async upload(vectorStoreId, file, options) {
      const fileInfo = await this._client.files.create({ file, purpose: "assistants" }, options);
      return this.create(vectorStoreId, { file_id: fileInfo.id }, options);
    }
    async uploadAndPoll(vectorStoreId, file, options) {
      const fileInfo = await this.upload(vectorStoreId, file, options);
      return await this.poll(vectorStoreId, fileInfo.id, options);
    }
    content(vectorStoreId, fileId, options) {
      return this._client.getAPIList(`/vector_stores/${vectorStoreId}/files/${fileId}/content`, FileContentResponsesPage, { ...options, headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers } });
    }
  };
  VectorStoreFilesPage = class VectorStoreFilesPage extends CursorPage {
  };
  FileContentResponsesPage = class FileContentResponsesPage extends Page2 {
  };
  Files3.VectorStoreFilesPage = VectorStoreFilesPage;
  Files3.FileContentResponsesPage = FileContentResponsesPage;
});

// node_modules/openai/resources/vector-stores/file-batches.mjs
var FileBatches;
var init_file_batches = __esm(() => {
  init_core2();
  init_core2();
  init_files3();
  FileBatches = class FileBatches extends APIResource2 {
    create(vectorStoreId, body, options) {
      return this._client.post(`/vector_stores/${vectorStoreId}/file_batches`, {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    retrieve(vectorStoreId, batchId, options) {
      return this._client.get(`/vector_stores/${vectorStoreId}/file_batches/${batchId}`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    cancel(vectorStoreId, batchId, options) {
      return this._client.post(`/vector_stores/${vectorStoreId}/file_batches/${batchId}/cancel`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    async createAndPoll(vectorStoreId, body, options) {
      const batch = await this.create(vectorStoreId, body);
      return await this.poll(vectorStoreId, batch.id, options);
    }
    listFiles(vectorStoreId, batchId, query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.listFiles(vectorStoreId, batchId, {}, query);
      }
      return this._client.getAPIList(`/vector_stores/${vectorStoreId}/file_batches/${batchId}/files`, VectorStoreFilesPage, { query, ...options, headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers } });
    }
    async poll(vectorStoreId, batchId, options) {
      const headers = { ...options?.headers, "X-Stainless-Poll-Helper": "true" };
      if (options?.pollIntervalMs) {
        headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs.toString();
      }
      while (true) {
        const { data: batch, response } = await this.retrieve(vectorStoreId, batchId, {
          ...options,
          headers
        }).withResponse();
        switch (batch.status) {
          case "in_progress":
            let sleepInterval = 5000;
            if (options?.pollIntervalMs) {
              sleepInterval = options.pollIntervalMs;
            } else {
              const headerInterval = response.headers.get("openai-poll-after-ms");
              if (headerInterval) {
                const headerIntervalMs = parseInt(headerInterval);
                if (!isNaN(headerIntervalMs)) {
                  sleepInterval = headerIntervalMs;
                }
              }
            }
            await sleep2(sleepInterval);
            break;
          case "failed":
          case "cancelled":
          case "completed":
            return batch;
        }
      }
    }
    async uploadAndPoll(vectorStoreId, { files, fileIds = [] }, options) {
      if (files == null || files.length == 0) {
        throw new Error(`No \`files\` provided to process. If you've already uploaded files you should use \`.createAndPoll()\` instead`);
      }
      const configuredConcurrency = options?.maxConcurrency ?? 5;
      const concurrencyLimit = Math.min(configuredConcurrency, files.length);
      const client = this._client;
      const fileIterator = files.values();
      const allFileIds = [...fileIds];
      async function processFiles(iterator) {
        for (let item of iterator) {
          const fileObj = await client.files.create({ file: item, purpose: "assistants" }, options);
          allFileIds.push(fileObj.id);
        }
      }
      const workers = Array(concurrencyLimit).fill(fileIterator).map(processFiles);
      await allSettledWithThrow(workers);
      return await this.createAndPoll(vectorStoreId, {
        file_ids: allFileIds
      });
    }
  };
});

// node_modules/openai/resources/vector-stores/vector-stores.mjs
var VectorStores, VectorStoresPage, VectorStoreSearchResponsesPage;
var init_vector_stores = __esm(() => {
  init_core2();
  init_file_batches();
  init_file_batches();
  init_files3();
  init_files3();
  init_pagination2();
  VectorStores = class VectorStores extends APIResource2 {
    constructor() {
      super(...arguments);
      this.files = new Files3(this._client);
      this.fileBatches = new FileBatches(this._client);
    }
    create(body, options) {
      return this._client.post("/vector_stores", {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    retrieve(vectorStoreId, options) {
      return this._client.get(`/vector_stores/${vectorStoreId}`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    update(vectorStoreId, body, options) {
      return this._client.post(`/vector_stores/${vectorStoreId}`, {
        body,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    list(query = {}, options) {
      if (isRequestOptions2(query)) {
        return this.list({}, query);
      }
      return this._client.getAPIList("/vector_stores", VectorStoresPage, {
        query,
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    del(vectorStoreId, options) {
      return this._client.delete(`/vector_stores/${vectorStoreId}`, {
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
    search(vectorStoreId, body, options) {
      return this._client.getAPIList(`/vector_stores/${vectorStoreId}/search`, VectorStoreSearchResponsesPage, {
        body,
        method: "post",
        ...options,
        headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
      });
    }
  };
  VectorStoresPage = class VectorStoresPage extends CursorPage {
  };
  VectorStoreSearchResponsesPage = class VectorStoreSearchResponsesPage extends Page2 {
  };
  VectorStores.VectorStoresPage = VectorStoresPage;
  VectorStores.VectorStoreSearchResponsesPage = VectorStoreSearchResponsesPage;
  VectorStores.Files = Files3;
  VectorStores.VectorStoreFilesPage = VectorStoreFilesPage;
  VectorStores.FileContentResponsesPage = FileContentResponsesPage;
  VectorStores.FileBatches = FileBatches;
});

// node_modules/openai/resources/index.mjs
var init_resources2 = __esm(() => {
  init_audio();
  init_batches2();
  init_beta2();
  init_completions4();
  init_containers();
  init_embeddings();
  init_evals();
  init_files2();
  init_fine_tuning();
  init_graders2();
  init_images();
  init_models();
  init_moderations();
  init_responses();
  init_uploads3();
  init_vector_stores();
  init_chat2();
  init_shared();
});

// node_modules/openai/index.mjs
var exports_openai = {};
__export(exports_openai, {
  toFile: () => toFile3,
  fileFromPath: () => fileFromPath3,
  default: () => openai_default,
  UnprocessableEntityError: () => UnprocessableEntityError2,
  RateLimitError: () => RateLimitError2,
  PermissionDeniedError: () => PermissionDeniedError2,
  OpenAIError: () => OpenAIError,
  OpenAI: () => OpenAI,
  NotFoundError: () => NotFoundError2,
  InternalServerError: () => InternalServerError2,
  ConflictError: () => ConflictError2,
  BadRequestError: () => BadRequestError2,
  AzureOpenAI: () => AzureOpenAI,
  AuthenticationError: () => AuthenticationError2,
  APIUserAbortError: () => APIUserAbortError2,
  APIError: () => APIError2,
  APIConnectionTimeoutError: () => APIConnectionTimeoutError2,
  APIConnectionError: () => APIConnectionError2
});
var _a2, OpenAI, AzureOpenAI, _deployments_endpoints, API_KEY_SENTINEL = "<Missing Key>", openai_default;
var init_openai = __esm(() => {
  init_qs();
  init_core2();
  init_error2();
  init_uploads2();
  init_resources2();
  init_batches2();
  init_completions4();
  init_embeddings();
  init_files2();
  init_images();
  init_models();
  init_moderations();
  init_audio();
  init_beta2();
  init_chat();
  init_containers();
  init_evals();
  init_fine_tuning();
  init_graders2();
  init_responses();
  init_uploads3();
  init_vector_stores();
  init_completions2();
  init_uploads2();
  init_error2();
  OpenAI = class OpenAI extends APIClient2 {
    constructor({ baseURL = readEnv2("OPENAI_BASE_URL"), apiKey = readEnv2("OPENAI_API_KEY"), organization = readEnv2("OPENAI_ORG_ID") ?? null, project = readEnv2("OPENAI_PROJECT_ID") ?? null, ...opts } = {}) {
      if (apiKey === undefined) {
        throw new OpenAIError("The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: 'My API Key' }).");
      }
      const options = {
        apiKey,
        organization,
        project,
        ...opts,
        baseURL: baseURL || `https://api.openai.com/v1`
      };
      if (!options.dangerouslyAllowBrowser && isRunningInBrowser2()) {
        throw new OpenAIError(`It looks like you're running in a browser-like environment.

This is disabled by default, as it risks exposing your secret API credentials to attackers.
If you understand the risks and have appropriate mitigations in place,
you can set the \`dangerouslyAllowBrowser\` option to \`true\`, e.g.,

new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
`);
      }
      super({
        baseURL: options.baseURL,
        timeout: options.timeout ?? 600000,
        httpAgent: options.httpAgent,
        maxRetries: options.maxRetries,
        fetch: options.fetch
      });
      this.completions = new Completions4(this);
      this.chat = new Chat(this);
      this.embeddings = new Embeddings(this);
      this.files = new Files2(this);
      this.images = new Images(this);
      this.audio = new Audio(this);
      this.moderations = new Moderations(this);
      this.models = new Models(this);
      this.fineTuning = new FineTuning(this);
      this.graders = new Graders2(this);
      this.vectorStores = new VectorStores(this);
      this.beta = new Beta2(this);
      this.batches = new Batches2(this);
      this.uploads = new Uploads(this);
      this.responses = new Responses(this);
      this.evals = new Evals(this);
      this.containers = new Containers(this);
      this._options = options;
      this.apiKey = apiKey;
      this.organization = organization;
      this.project = project;
    }
    defaultQuery() {
      return this._options.defaultQuery;
    }
    defaultHeaders(opts) {
      return {
        ...super.defaultHeaders(opts),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project,
        ...this._options.defaultHeaders
      };
    }
    authHeaders(opts) {
      return { Authorization: `Bearer ${this.apiKey}` };
    }
    stringifyQuery(query) {
      return stringify(query, { arrayFormat: "brackets" });
    }
  };
  _a2 = OpenAI;
  OpenAI.OpenAI = _a2;
  OpenAI.DEFAULT_TIMEOUT = 600000;
  OpenAI.OpenAIError = OpenAIError;
  OpenAI.APIError = APIError2;
  OpenAI.APIConnectionError = APIConnectionError2;
  OpenAI.APIConnectionTimeoutError = APIConnectionTimeoutError2;
  OpenAI.APIUserAbortError = APIUserAbortError2;
  OpenAI.NotFoundError = NotFoundError2;
  OpenAI.ConflictError = ConflictError2;
  OpenAI.RateLimitError = RateLimitError2;
  OpenAI.BadRequestError = BadRequestError2;
  OpenAI.AuthenticationError = AuthenticationError2;
  OpenAI.InternalServerError = InternalServerError2;
  OpenAI.PermissionDeniedError = PermissionDeniedError2;
  OpenAI.UnprocessableEntityError = UnprocessableEntityError2;
  OpenAI.toFile = toFile3;
  OpenAI.fileFromPath = fileFromPath3;
  OpenAI.Completions = Completions4;
  OpenAI.Chat = Chat;
  OpenAI.ChatCompletionsPage = ChatCompletionsPage;
  OpenAI.Embeddings = Embeddings;
  OpenAI.Files = Files2;
  OpenAI.FileObjectsPage = FileObjectsPage;
  OpenAI.Images = Images;
  OpenAI.Audio = Audio;
  OpenAI.Moderations = Moderations;
  OpenAI.Models = Models;
  OpenAI.ModelsPage = ModelsPage;
  OpenAI.FineTuning = FineTuning;
  OpenAI.Graders = Graders2;
  OpenAI.VectorStores = VectorStores;
  OpenAI.VectorStoresPage = VectorStoresPage;
  OpenAI.VectorStoreSearchResponsesPage = VectorStoreSearchResponsesPage;
  OpenAI.Beta = Beta2;
  OpenAI.Batches = Batches2;
  OpenAI.BatchesPage = BatchesPage;
  OpenAI.Uploads = Uploads;
  OpenAI.Responses = Responses;
  OpenAI.Evals = Evals;
  OpenAI.EvalListResponsesPage = EvalListResponsesPage;
  OpenAI.Containers = Containers;
  OpenAI.ContainerListResponsesPage = ContainerListResponsesPage;
  AzureOpenAI = class AzureOpenAI extends OpenAI {
    constructor({ baseURL = readEnv2("OPENAI_BASE_URL"), apiKey = readEnv2("AZURE_OPENAI_API_KEY"), apiVersion = readEnv2("OPENAI_API_VERSION"), endpoint, deployment, azureADTokenProvider, dangerouslyAllowBrowser, ...opts } = {}) {
      if (!apiVersion) {
        throw new OpenAIError("The OPENAI_API_VERSION environment variable is missing or empty; either provide it, or instantiate the AzureOpenAI client with an apiVersion option, like new AzureOpenAI({ apiVersion: 'My API Version' }).");
      }
      if (typeof azureADTokenProvider === "function") {
        dangerouslyAllowBrowser = true;
      }
      if (!azureADTokenProvider && !apiKey) {
        throw new OpenAIError("Missing credentials. Please pass one of `apiKey` and `azureADTokenProvider`, or set the `AZURE_OPENAI_API_KEY` environment variable.");
      }
      if (azureADTokenProvider && apiKey) {
        throw new OpenAIError("The `apiKey` and `azureADTokenProvider` arguments are mutually exclusive; only one can be passed at a time.");
      }
      apiKey ?? (apiKey = API_KEY_SENTINEL);
      opts.defaultQuery = { ...opts.defaultQuery, "api-version": apiVersion };
      if (!baseURL) {
        if (!endpoint) {
          endpoint = process.env["AZURE_OPENAI_ENDPOINT"];
        }
        if (!endpoint) {
          throw new OpenAIError("Must provide one of the `baseURL` or `endpoint` arguments, or the `AZURE_OPENAI_ENDPOINT` environment variable");
        }
        baseURL = `${endpoint}/openai`;
      } else {
        if (endpoint) {
          throw new OpenAIError("baseURL and endpoint are mutually exclusive");
        }
      }
      super({
        apiKey,
        baseURL,
        ...opts,
        ...dangerouslyAllowBrowser !== undefined ? { dangerouslyAllowBrowser } : {}
      });
      this.apiVersion = "";
      this._azureADTokenProvider = azureADTokenProvider;
      this.apiVersion = apiVersion;
      this.deploymentName = deployment;
    }
    buildRequest(options, props = {}) {
      if (_deployments_endpoints.has(options.path) && options.method === "post" && options.body !== undefined) {
        if (!isObj(options.body)) {
          throw new Error("Expected request body to be an object");
        }
        const model = this.deploymentName || options.body["model"] || options.__metadata?.["model"];
        if (model !== undefined && !this.baseURL.includes("/deployments")) {
          options.path = `/deployments/${model}${options.path}`;
        }
      }
      return super.buildRequest(options, props);
    }
    async _getAzureADToken() {
      if (typeof this._azureADTokenProvider === "function") {
        const token = await this._azureADTokenProvider();
        if (!token || typeof token !== "string") {
          throw new OpenAIError(`Expected 'azureADTokenProvider' argument to return a string but it returned ${token}`);
        }
        return token;
      }
      return;
    }
    authHeaders(opts) {
      return {};
    }
    async prepareOptions(opts) {
      if (opts.headers?.["api-key"]) {
        return super.prepareOptions(opts);
      }
      const token = await this._getAzureADToken();
      opts.headers ?? (opts.headers = {});
      if (token) {
        opts.headers["Authorization"] = `Bearer ${token}`;
      } else if (this.apiKey !== API_KEY_SENTINEL) {
        opts.headers["api-key"] = this.apiKey;
      } else {
        throw new OpenAIError("Unable to handle auth");
      }
      return super.prepareOptions(opts);
    }
  };
  _deployments_endpoints = new Set([
    "/completions",
    "/chat/completions",
    "/embeddings",
    "/audio/transcriptions",
    "/audio/translations",
    "/audio/speech",
    "/images/generations",
    "/images/edits"
  ]);
  openai_default = OpenAI;
});

// src/providers/index.ts
var exports_providers = {};
__export(exports_providers, {
  registerProvider: () => registerProvider,
  getProvider: () => getProvider,
  estimateTokens: () => estimateTokens,
  detectModelFamily: () => detectModelFamily,
  default: () => providers_default,
  createProvider: () => createProvider,
  calculateCost: () => calculateCost
});
function registerProvider(name, factory) {
  providers.set(name, factory);
}
async function getProvider(name) {
  const factory = providers.get(name);
  if (!factory)
    return null;
  return factory();
}
async function createProvider(config) {
  switch (config.provider) {
    case "anthropic":
      return createAnthropicProvider(config);
    case "openai":
      return createOpenAIProvider(config);
    case "codex":
      return createCodexProvider(config);
    case "openrouter":
      return createOpenRouterProvider(config);
    case "ollama":
      return createOllamaProvider(config);
    case "gemini":
      return createGeminiProvider(config);
    case "groq":
      return createGroqProvider(config);
    case "deepseek":
      return createDeepSeekProvider(config);
    case "mistral":
      return createMistralProvider(config);
    case "lmstudio":
      return createLMStudioProvider(config);
    case "jan":
      return createJanProvider(config);
    case "qwen":
      return createQwenProvider(config);
    case "mlx":
      return createMLXProvider(config);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}
async function createAnthropicProvider(config) {
  const mod = await Promise.resolve().then(() => (init_sdk(), exports_sdk));
  const Anthropic2 = mod.Anthropic ?? mod.default?.Anthropic ?? mod.default;
  return {
    name: "anthropic",
    models: [
      "claude-opus-4-5",
      "claude-sonnet-4-20250514",
      "claude-haiku-4-20250514",
      "claude-3-5-sonnet-latest",
      "claude-3-5-haiku-latest"
    ],
    apiFormat: "anthropic",
    async create(request) {
      const client = new Anthropic2({ apiKey: config.apiKey });
      const systemMessage = request.messages.find((m) => m.role === "system");
      const otherMessages = request.messages.filter((m) => m.role !== "system");
      const anthropicMessages = otherMessages.map((m) => {
        if (m.toolCalls) {
          return {
            role: "assistant",
            content: m.toolCalls.map((tc) => ({
              type: "tool_use",
              id: tc.id,
              name: tc.name,
              input: tc.arguments
            }))
          };
        } else if (m.toolCallId) {
          return {
            role: "user",
            content: [{
              type: "tool_result",
              tool_use_id: m.toolCallId,
              content: m.content
            }]
          };
        } else {
          return {
            role: m.role,
            content: m.content
          };
        }
      });
      const response = await client.messages.create({
        model: request.model ?? config.model ?? "claude-sonnet-4-20250514",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        system: systemMessage?.content,
        messages: anthropicMessages,
        tools: request.tools?.map((t) => ({
          name: t.name,
          description: t.description,
          input_schema: t.inputSchema
        }))
      });
      let content = "";
      const toolCalls = [];
      for (const block of response.content) {
        if (block.type === "text") {
          content += block.text;
        } else if (block.type === "tool_use") {
          toolCalls.push({
            id: block.id,
            name: block.name,
            arguments: block.input
          });
        }
      }
      return {
        content,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        },
        finishReason: response.stop_reason === "end_turn" ? "stop" : "length"
      };
    }
  };
}
async function createOpenAIProvider(config) {
  const OpenAI2 = await Promise.resolve().then(() => (init_openai(), exports_openai));
  return {
    name: config.provider,
    models: [
      "gpt-5.4",
      "gpt-5.4-pro",
      "gpt-5.4-mini",
      "gpt-5.4-nano",
      "gpt-5",
      "gpt-5-mini",
      "gpt-5-nano",
      "gpt-5.2",
      "gpt-5.2-pro",
      "gpt-5-pro",
      "gpt-4.1",
      "gpt-4.1-mini",
      "gpt-4.1-nano",
      "o3-pro",
      "o3",
      "o4-mini",
      "o3-deep-research",
      "o4-mini-deep-research",
      "o1-pro",
      "o1",
      "o3-mini",
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4-turbo",
      "gpt-4",
      "gpt-3.5-turbo",
      "gpt-5-codex",
      "gpt-5.3-codex",
      "gpt-5.2-codex",
      "gpt-5.1-codex",
      "gpt-5.1-codex-max",
      "gpt-5.1-codex-mini"
    ],
    apiFormat: "openai",
    async create(request) {
      const client = new OpenAI2.OpenAI({ apiKey: config.apiKey, baseURL: config.baseUrl });
      const messages = request.messages.map((m) => {
        if (m.toolCalls) {
          return {
            role: "assistant",
            content: m.content || null,
            tool_calls: m.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) }
            }))
          };
        } else if (m.toolCallId) {
          return {
            role: "tool",
            tool_call_id: m.toolCallId,
            content: m.content
          };
        } else {
          return {
            role: m.role,
            content: m.content,
            name: m.name
          };
        }
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages,
        tools: request.tools?.map((t) => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema
          }
        }))
      });
      const choice = response.choices[0];
      const msg = choice.message;
      const toolCalls = [];
      if (msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          if (tc.function) {
            let args = {};
            try {
              args = JSON.parse(tc.function.arguments);
            } catch {}
            toolCalls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: args
            });
          }
        }
      }
      return {
        content: msg.content ?? "",
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    }
  };
}
async function createCodexProvider(config) {
  const { createHash, randomBytes } = await import("crypto");
  const http = await import("http");
  const { URL: URL2 } = await import("url");
  function base64url(buf) {
    return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
  async function generatePKCE() {
    const verifier = base64url(randomBytes(32));
    const hash = createHash("sha256").update(verifier).digest();
    const challenge = base64url(hash);
    return { verifier, challenge };
  }
  function generateState() {
    return base64url(randomBytes(16));
  }
  const CODEX_CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
  const AUTH_URL = "https://auth.openai.com/oauth/authorize";
  const TOKEN_URL = "https://auth.openai.com/oauth/token";
  const REDIRECT_URI = "http://localhost:1455/auth/callback";
  const SCOPE = "openid profile email offline_access";
  const API_BASE = "https://chatgpt.com/backend-api/codex";
  function getTokenPath() {
    const home = process.env.HOME || process.env.USERPROFILE || "~";
    return `${home}/.beast-cli/codex-auth.json`;
  }
  function loadToken() {
    try {
      const { readFileSync, existsSync } = __require("fs");
      const path = getTokenPath();
      if (existsSync(path)) {
        return JSON.parse(readFileSync(path, "utf-8"));
      }
    } catch {}
    return null;
  }
  function saveToken(token) {
    try {
      const { readFileSync, writeFileSync, existsSync, mkdirSync } = __require("fs");
      const path = getTokenPath();
      const dir = __require("path").dirname(path);
      if (!existsSync(dir))
        mkdirSync(dir, { recursive: true });
      writeFileSync(path, JSON.stringify(token, null, 2), { mode: 384 });
    } catch (e) {
      console.error("Failed to save Codex token:", e);
    }
  }
  function isTokenValid(token) {
    return !!(token.accessToken && Date.now() < token.expiresAt - 300000);
  }
  function decodeJWT(token) {
    try {
      const parts = token.split(".");
      if (parts.length < 2)
        return null;
      return JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    } catch {
      return null;
    }
  }
  async function refreshToken(token) {
    try {
      const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
          client_id: CODEX_CLIENT_ID
        })
      });
      if (!res.ok)
        return null;
      const data = await res.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || token.refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000,
        accountId: token.accountId
      };
    } catch {
      return null;
    }
  }
  async function waitForCallback(pkce, state) {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        const url = new URL2(req.url || "/", REDIRECT_URI);
        if (url.pathname === "/auth/callback") {
          const code = url.searchParams.get("code");
          const returnedState = url.searchParams.get("state");
          const error = url.searchParams.get("error");
          res.writeHead(200, { "Content-Type": "text/html" });
          if (error) {
            res.end("<html><body><h1>Auth Error</h1><p>You can close this window.</p></body></html>");
            server.close();
            reject(new Error("OAuth error: " + error));
            return;
          }
          if (code && returnedState === state) {
            res.end("<html><body><h1>Authenticated!</h1><p>You can close this window.</p></body></html>");
            server.close();
            resolve(code);
          } else {
            res.end("<html><body><h1>Invalid state</h1><p>You can close this window.</p></body></html>");
            server.close();
            reject(new Error("Invalid OAuth state"));
          }
        }
      });
      server.listen(1455, () => {
        console.log("   \uD83C\uDF10 Opening browser for ChatGPT OAuth...");
      });
      setTimeout(() => {
        server.close();
        reject(new Error("OAuth timeout"));
      }, 300000);
    });
  }
  async function exchangeCode(code, verifier) {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CODEX_CLIENT_ID,
        code,
        code_verifier: verifier,
        redirect_uri: REDIRECT_URI
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Token exchange failed: ${err}`);
    }
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      accountId: undefined
    };
  }
  async function getValidToken() {
    let token = loadToken();
    if (!token || !isTokenValid(token)) {
      const { verifier, challenge } = await generatePKCE();
      const state = generateState();
      const authUrl = new URL2(AUTH_URL);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", CODEX_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.set("scope", SCOPE);
      authUrl.searchParams.set("code_challenge", challenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
      authUrl.searchParams.set("state", state);
      console.log("   \uD83C\uDF10 Opening browser for ChatGPT Plus/Pro login...");
      console.log("   \uD83D\uDCCB Auth URL:", authUrl.toString());
      const { execSync } = __require("child_process");
      try {
        const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
        execSync(`${opener} "${authUrl.toString()}"`, { stdio: "ignore" });
      } catch {}
      const code = await waitForCallback({ verifier }, state);
      token = await exchangeCode(code, verifier);
      const payload = decodeJWT(token.accessToken);
      if (payload && typeof payload === "object") {
        const auth = payload["https://api.openai.com/auth"];
        if (auth?.chatgpt_account_id) {
          token.accountId = auth.chatgpt_account_id;
        }
      }
      saveToken(token);
      console.log("   \u2705 ChatGPT OAuth authenticated!");
    } else if (token.expiresAt - Date.now() < 600000) {
      const refreshed = await refreshToken(token);
      if (refreshed) {
        token = refreshed;
        saveToken(token);
      }
    }
    return token;
  }
  return {
    name: "codex",
    models: [
      "gpt-5.2-codex",
      "gpt-5.2-codex-low",
      "gpt-5.2-codex-medium",
      "gpt-5.2-codex-high",
      "gpt-5.2-codex-xhigh",
      "gpt-5.2",
      "gpt-5.2-low",
      "gpt-5.2-medium",
      "gpt-5.2-high",
      "gpt-5.2-xhigh",
      "gpt-5.1-codex-max",
      "gpt-5.1-codex",
      "gpt-5.1-codex-mini",
      "gpt-5.1",
      "gpt-5.1-low",
      "gpt-5.1-medium",
      "gpt-5.1-high",
      "gpt-5.1-xhigh",
      "codex",
      "gpt-4o",
      "gpt-4o-mini",
      "o3-mini",
      "o3",
      "o4-mini"
    ],
    apiFormat: "custom",
    async create(request) {
      const token = await getValidToken();
      const systemMessage = request.messages.find((m) => m.role === "system");
      const otherMessages = request.messages.filter((m) => m.role !== "system");
      const conversationParts = [];
      for (const m of otherMessages) {
        if (m.role === "user") {
          conversationParts.push(`User: ${m.content}`);
        } else if (m.role === "assistant") {
          if (m.toolCalls) {
            for (const tc of m.toolCalls) {
              conversationParts.push(`Assistant calls tool ${tc.name}(${JSON.stringify(tc.arguments)})`);
            }
          }
          if (m.content) {
            conversationParts.push(`Assistant: ${m.content}`);
          }
        } else if (m.toolCallId) {
          conversationParts.push(`Tool result: ${m.content}`);
        }
      }
      const conversationText = conversationParts.join(`
`);
      const body = {
        model: request.model || "gpt-5.2-codex",
        instructions: systemMessage?.content || "You are a helpful coding assistant.",
        input: [{ role: "user", content: conversationText || "Hello" }],
        store: false,
        stream: true
      };
      if (request.tools && request.tools.length > 0) {
        const validTools = request.tools.filter((t) => t.name && t.inputSchema);
        console.log("\uD83D\uDCE1 Sending tools:", validTools.map((t) => t.name).join(", "));
        body.tools = validTools.map((t) => ({
          type: "function",
          function: { name: t.name, description: t.description || "", parameters: t.inputSchema }
        }));
      }
      if (request.temperature !== undefined) {
        body.temperature = request.temperature;
      }
      const response = await fetch(`${API_BASE}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.accessToken}`,
          "OpenAI-Beta": "responses=experimental",
          "chatgpt-account-id": token.accountId || ""
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000)
      });
      if (response.status === 401) {
        saveToken({ accessToken: "", refreshToken: "", expiresAt: 0 });
        return this.create(request);
      }
      if (!response.ok || !response.body) {
        const err = await response.text();
        throw new Error(`ChatGPT API error ${response.status}: ${err.slice(0, 200)}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder;
      let buffer = "";
      let content = "";
      let done = false;
      try {
        while (!done) {
          const { done: readerDone, value } = await reader.read();
          done = readerDone;
          if (value) {
            buffer += decoder.decode(value, { stream: !done });
            const lines = buffer.split(`
`);
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]")
                  continue;
                try {
                  const event = JSON.parse(data);
                  const text = event.output_text?.text || event.text?.text || event.content_text || event.delta || "";
                  if (text)
                    content += text;
                } catch {}
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      return {
        content,
        model: request.model || "gpt-5.2-codex",
        usage: undefined,
        finishReason: "stop"
      };
    },
    async* createStream(request) {
      const token = await getValidToken();
      const systemMessage = request.messages.find((m) => m.role === "system");
      const otherMessages = request.messages.filter((m) => m.role !== "system");
      const conversationParts = [];
      for (const m of otherMessages) {
        if (m.role === "user") {
          conversationParts.push(`User: ${m.content}`);
        } else if (m.role === "assistant") {
          if (m.toolCalls) {
            for (const tc of m.toolCalls) {
              conversationParts.push(`Assistant calls tool ${tc.name}(${JSON.stringify(tc.arguments)})`);
            }
          }
          if (m.content) {
            conversationParts.push(`Assistant: ${m.content}`);
          }
        } else if (m.toolCallId) {
          conversationParts.push(`Tool result: ${m.content}`);
        }
      }
      const conversationText = conversationParts.join(`
`);
      const body = {
        model: request.model || "gpt-5.2-codex",
        instructions: systemMessage?.content || "You are a helpful coding assistant.",
        input: [{ role: "user", content: conversationText || "Hello" }],
        stream: true
      };
      if (request.tools && request.tools.length > 0) {
        body.tools = request.tools.map((t) => ({
          type: "function",
          function: { name: t.name, description: t.description, parameters: t.inputSchema }
        }));
      }
      if (request.temperature !== undefined) {
        body.temperature = request.temperature;
      }
      const response = await fetch(`${API_BASE}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.accessToken}`,
          "OpenAI-Beta": "responses=experimental",
          "chatgpt-account-id": token.accountId || ""
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000)
      });
      if (!response.ok || !response.body) {
        const err = await response.text();
        throw new Error(`ChatGPT API error ${response.status}: ${err.slice(0, 200)}`);
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder;
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done)
            break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(`
`);
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]")
                break;
              try {
                const event = JSON.parse(data);
                if (event.output_text?.text) {
                  yield { content: event.output_text.text, model: event.model || request.model };
                }
              } catch {}
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  };
}
async function createOpenRouterProvider(config) {
  const OpenAI2 = await Promise.resolve().then(() => (init_openai(), exports_openai));
  return {
    name: "openrouter",
    models: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-pro", "meta-llama/llama-3-70b-instruct"],
    apiFormat: "openrouter",
    async create(request) {
      const client = new OpenAI2.OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl ?? "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "https://beast-cli.dev",
          "X-Title": "Beast CLI"
        }
      });
      const messages = request.messages.map((m) => {
        if (m.toolCalls) {
          return {
            role: "assistant",
            content: m.content || null,
            tool_calls: m.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) }
            }))
          };
        } else if (m.toolCallId) {
          return {
            role: "tool",
            tool_call_id: m.toolCallId,
            content: m.content
          };
        } else {
          return {
            role: m.role,
            content: m.content,
            name: m.name
          };
        }
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages,
        tools: request.tools?.map((t) => ({
          type: "function",
          function: { name: t.name, description: t.description, parameters: t.inputSchema }
        }))
      });
      const choice = response.choices[0];
      const msg = choice.message;
      const toolCalls = [];
      if (msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          if (tc.function) {
            let args = {};
            try {
              args = JSON.parse(tc.function.arguments);
            } catch {}
            toolCalls.push({ id: tc.id, name: tc.function.name, arguments: args });
          }
        }
      }
      return {
        content: msg.content ?? "",
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    }
  };
}
async function createOllamaProvider(config) {
  return {
    name: "ollama",
    models: [],
    apiFormat: "ollama",
    async create(request) {
      const baseUrl = config.baseUrl ?? "http://localhost:11434";
      const ollamaMessages = [];
      for (const m of request.messages) {
        if (m.toolCalls) {
          const toolCalls2 = m.toolCalls.map((tc) => {
            let argsObj;
            if (typeof tc.arguments === "string") {
              try {
                argsObj = JSON.parse(tc.arguments);
              } catch {
                argsObj = {};
              }
            } else {
              argsObj = tc.arguments ?? {};
            }
            return {
              function: {
                name: tc.name,
                arguments: argsObj
              }
            };
          });
          ollamaMessages.push({ role: "assistant", content: m.content || null, tool_calls: toolCalls2 });
        } else if (m.toolCallId) {
          ollamaMessages.push({ role: "tool", tool_call_id: m.toolCallId, content: m.content });
        } else {
          ollamaMessages.push({ role: m.role, content: m.content });
        }
      }
      const body = {
        model: request.model ?? config.model,
        messages: ollamaMessages,
        stream: false,
        options: {
          temperature: request.temperature ?? config.temperature ?? 0.7,
          num_predict: request.maxTokens ?? config.maxTokens ?? 16384
        }
      };
      if (request.tools && request.tools.length > 0) {
        body.tools = request.tools.map((t) => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema
          }
        }));
      }
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Ollama error ${response.status}: ${error.slice(0, 150)}`);
      }
      let data;
      try {
        data = await response.json();
      } catch {
        const raw = await response.text();
        throw new Error(`Ollama returned invalid JSON. Model may be producing malformed output. Raw: ${raw.slice(0, 200)}`);
      }
      const toolCalls = [];
      try {
        if (data.message?.tool_calls) {
          for (const tc of data.message.tool_calls) {
            let args = {};
            const rawArgs = tc.function?.arguments;
            if (typeof rawArgs === "string") {
              try {
                args = JSON.parse(rawArgs);
              } catch {}
            } else if (rawArgs && typeof rawArgs === "object") {
              args = rawArgs;
            }
            toolCalls.push({
              id: tc.id ?? `ollama_${Date.now()}`,
              name: tc.function?.name ?? "unknown",
              arguments: args
            });
          }
        }
      } catch {}
      return {
        content: data.message?.content ?? "",
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: data.model ?? config.model,
        usage: {
          promptTokens: data.prompt_eval_count ?? 0,
          completionTokens: data.eval_count ?? 0,
          totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0)
        },
        finishReason: data.done ? "stop" : "length"
      };
    }
  };
}
async function createGeminiProvider(config) {
  return {
    name: "gemini",
    models: ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"],
    apiFormat: "custom",
    async create(request) {
      const apiKey = config.apiKey ?? process.env.GEMINI_API_KEY;
      const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${request.model ?? config.model}:generateContent?key=${apiKey}`;
      const systemMessage = request.messages.find((m) => m.role === "system");
      const otherMessages = request.messages.filter((m) => m.role !== "system");
      const response = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: otherMessages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          })),
          systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
          generationConfig: {
            maxOutputTokens: request.maxTokens ?? config.maxTokens ?? 16384,
            temperature: request.temperature ?? config.temperature ?? 0.7
          }
        })
      });
      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      return {
        content,
        model: request.model ?? config.model,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: data.usageMetadata?.totalTokenCount ?? 0
        },
        finishReason: data.candidates?.[0]?.finishReason === "STOP" ? "stop" : "length"
      };
    }
  };
}
async function createGroqProvider(config) {
  return {
    name: "groq",
    models: ["mixtral-8x7b-32768", "llama3-8b-8192", "llama3-70b-8192", "gemma-7b-it"],
    apiFormat: "openai",
    async create(request) {
      const client = new (await Promise.resolve().then(() => (init_openai(), exports_openai))).OpenAI({
        apiKey: config.apiKey,
        baseURL: "https://api.groq.com/openai/v1"
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content }))
      });
      const choice = response.choices[0];
      return {
        content: choice.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    }
  };
}
async function createDeepSeekProvider(config) {
  return {
    name: "deepseek",
    models: ["deepseek-chat", "deepseek-coder"],
    apiFormat: "openai",
    async create(request) {
      const client = new (await Promise.resolve().then(() => (init_openai(), exports_openai))).OpenAI({
        apiKey: config.apiKey,
        baseURL: "https://api.deepseek.com/v1"
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content }))
      });
      const choice = response.choices[0];
      return {
        content: choice.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    }
  };
}
async function createMistralProvider(config) {
  return {
    name: "mistral",
    models: ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest", "codestral-latest"],
    apiFormat: "openai",
    async create(request) {
      const client = new (await Promise.resolve().then(() => (init_openai(), exports_openai))).OpenAI({
        apiKey: config.apiKey,
        baseURL: "https://api.mistral.ai/v1"
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content }))
      });
      const choice = response.choices[0];
      return {
        content: choice.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    }
  };
}
async function createLMStudioProvider(config) {
  return {
    name: "lmstudio",
    models: [],
    apiFormat: "openai",
    async create(request) {
      const client = new (await Promise.resolve().then(() => (init_openai(), exports_openai))).OpenAI({
        apiKey: "lm-studio",
        baseURL: config.baseUrl ?? "http://localhost:1234/v1"
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model ?? "local-model",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content }))
      });
      const choice = response.choices[0];
      return {
        content: choice.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    },
    async* createStream(request) {
      const client = new (await Promise.resolve().then(() => (init_openai(), exports_openai))).OpenAI({
        apiKey: "lm-studio",
        baseURL: config.baseUrl ?? "http://localhost:1234/v1"
      });
      const stream = await client.chat.completions.create({
        model: request.model ?? config.model ?? "local-model",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true
      });
      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (choice.delta?.content) {
          yield {
            content: choice.delta.content,
            model: chunk.model
          };
        }
      }
    }
  };
}
async function createJanProvider(config) {
  return {
    name: "jan",
    models: [],
    apiFormat: "openai",
    async create(request) {
      const client = new (await Promise.resolve().then(() => (init_openai(), exports_openai))).OpenAI({
        apiKey: "jan-key",
        baseURL: config.baseUrl ?? "http://localhost:1337/v1"
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model ?? "local-model",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content }))
      });
      const choice = response.choices[0];
      return {
        content: choice.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    },
    async* createStream(request) {
      const client = new (await Promise.resolve().then(() => (init_openai(), exports_openai))).OpenAI({
        apiKey: "jan-key",
        baseURL: config.baseUrl ?? "http://localhost:1337/v1"
      });
      const stream = await client.chat.completions.create({
        model: request.model ?? config.model ?? "local-model",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
        stream: true
      });
      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (choice.delta?.content) {
          yield {
            content: choice.delta.content,
            model: chunk.model
          };
        }
      }
    }
  };
}
async function createQwenProvider(config) {
  return {
    name: "qwen",
    models: ["qwen-turbo", "qwen-plus", "qwen-max", "qwen-max-longcontext"],
    apiFormat: "openai",
    async create(request) {
      const apiKey = config.apiKey ?? process.env.DASHSCOPE_API_KEY;
      const client = new (await Promise.resolve().then(() => (init_openai(), exports_openai))).OpenAI({
        apiKey,
        baseURL: config.baseUrl ?? "https://dashscope.aliyuncs.com/compatible-mode/v1"
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model ?? "qwen-plus",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 16384,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages: request.messages.map((m) => ({ role: m.role, content: m.content }))
      });
      const choice = response.choices[0];
      return {
        content: choice.message.content ?? "",
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    }
  };
}
async function createMLXProvider(config) {
  return {
    name: "mlx",
    models: [],
    apiFormat: "openai",
    async create(request) {
      const client = new (await Promise.resolve().then(() => (init_openai(), exports_openai))).OpenAI({
        apiKey: "mlx",
        baseURL: config.baseUrl ?? "http://localhost:8080/v1"
      });
      const messages = request.messages.map((m) => {
        if (m.toolCalls) {
          return {
            role: "assistant",
            content: m.content || null,
            tool_calls: m.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) }
            }))
          };
        } else if (m.toolCallId) {
          return {
            role: "tool",
            tool_call_id: m.toolCallId,
            content: m.content
          };
        } else {
          return {
            role: m.role,
            content: m.content,
            name: m.name
          };
        }
      });
      const response = await client.chat.completions.create({
        model: request.model ?? config.model ?? "local-model",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages,
        tools: request.tools?.map((t) => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema
          }
        }))
      });
      const choice = response.choices[0];
      const msg = choice.message;
      const toolCalls = [];
      if (msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          if (tc.function) {
            let args = {};
            try {
              args = JSON.parse(tc.function.arguments);
            } catch {}
            toolCalls.push({
              id: tc.id,
              name: tc.function.name,
              arguments: args
            });
          }
        }
      }
      return {
        content: msg.content ?? "",
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0
        },
        finishReason: choice.finish_reason
      };
    },
    async* createStream(request) {
      const client = new (await Promise.resolve().then(() => (init_openai(), exports_openai))).OpenAI({
        apiKey: "mlx",
        baseURL: config.baseUrl ?? "http://localhost:8080/v1"
      });
      const messages = request.messages.map((m) => {
        if (m.toolCalls) {
          return {
            role: "assistant",
            content: m.content || null,
            tool_calls: m.toolCalls.map((tc) => ({
              id: tc.id,
              type: "function",
              function: { name: tc.name, arguments: JSON.stringify(tc.arguments) }
            }))
          };
        } else if (m.toolCallId) {
          return {
            role: "tool",
            tool_call_id: m.toolCallId,
            content: m.content
          };
        } else {
          return {
            role: m.role,
            content: m.content,
            name: m.name
          };
        }
      });
      const stream = await client.chat.completions.create({
        model: request.model ?? config.model ?? "local-model",
        max_tokens: request.maxTokens ?? config.maxTokens ?? 512,
        temperature: request.temperature ?? config.temperature ?? 0.7,
        messages,
        tools: request.tools?.map((t) => ({
          type: "function",
          function: {
            name: t.name,
            description: t.description,
            parameters: t.inputSchema
          }
        })),
        stream: true
      });
      for await (const chunk of stream) {
        const choice = chunk.choices[0];
        if (choice.delta?.content) {
          yield {
            content: choice.delta.content,
            model: chunk.model
          };
        }
      }
    }
  };
}
function detectModelFamily(model) {
  const lower = model.toLowerCase();
  if (lower.includes("claude-3") || lower.includes("gpt-5") || lower.includes("gemini-1.5") || lower.includes("llama-3.1")) {
    return "next_gen";
  }
  if (lower.includes("gemma") || lower.includes("phi-3") || lower.includes("llama3-8b") || lower.includes("codellama")) {
    return "xs";
  }
  return "generic";
}
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}
function calculateCost(provider, model, usage) {
  const rates = {
    anthropic: {
      "claude-opus-4-5": { input: 15, output: 75 },
      "claude-sonnet-4-20250514": { input: 3, output: 15 },
      "claude-haiku-4-20250514": { input: 0.8, output: 4 },
      "claude-3-5-sonnet-latest": { input: 3, output: 15 }
    },
    openai: {
      "gpt-5.4": { input: 1.25, output: 10 },
      "gpt-5.4-pro": { input: 15, output: 120 },
      "gpt-5.4-mini": { input: 0.25, output: 2 },
      "gpt-5.4-nano": { input: 0.05, output: 0.4 },
      "gpt-5": { input: 1.25, output: 10 },
      "gpt-5-mini": { input: 0.25, output: 2 },
      "gpt-5-nano": { input: 0.05, output: 0.4 },
      "gpt-5.2": { input: 1.25, output: 10 },
      "gpt-5.2-pro": { input: 15, output: 120 },
      "gpt-5-pro": { input: 15, output: 120 },
      "gpt-4.1": { input: 2, output: 8 },
      "gpt-4.1-mini": { input: 0.4, output: 1.6 },
      "gpt-4.1-nano": { input: 0.1, output: 1.4 },
      "o3-pro": { input: 60, output: 400 },
      o3: { input: 15, output: 60 },
      "o4-mini": { input: 3, output: 12 },
      "o1-pro": { input: 60, output: 400 },
      o1: { input: 15, output: 60 },
      "o3-mini": { input: 3, output: 12 },
      "gpt-4o": { input: 5, output: 15 },
      "gpt-4o-mini": { input: 0.15, output: 0.6 },
      "gpt-4-turbo": { input: 10, output: 30 },
      "gpt-4": { input: 30, output: 60 },
      "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
      "gpt-5-codex": { input: 3, output: 15 },
      "gpt-5.1-codex": { input: 3, output: 15 }
    },
    openrouter: {
      default: { input: 0.5, output: 1.5 }
    }
  };
  const modelRates = rates[provider]?.[model] ?? rates[provider]?.["default"] ?? { input: 1, output: 2 };
  const inputCost = usage.promptTokens / 1e6 * modelRates.input;
  const outputCost = usage.completionTokens / 1e6 * modelRates.output;
  return inputCost + outputCost;
}
var providers, providers_default;
var init_providers = __esm(() => {
  providers = new Map;
  providers_default = {
    createProvider,
    registerProvider,
    getProvider,
    detectModelFamily,
    estimateTokens,
    calculateCost
  };
});

// src/native-tools/search.ts
var exports_search = {};
__export(exports_search, {
  searxngSearch: () => searxngSearch,
  searxngHealth: () => searxngHealth,
  searchNews: () => searchNews,
  searchImages: () => searchImages,
  hackernewsTop: () => hackernewsTop,
  hackernewsNew: () => hackernewsNew,
  hackernewsComments: () => hackernewsComments,
  hackernewsBest: () => hackernewsBest
});
async function searxngSearch(query, limit2 = 10, categories, engines, timeRange) {
  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      engines: engines?.join(",") || "",
      categories: categories || "general",
      pageno: "1",
      ...timeRange ? { time_range: timeRange } : {}
    });
    const response = await fetch(`${SEARX_URL}/search?${params}`, {
      headers: {
        "User-Agent": "BeastCLI/1.0",
        Accept: "application/json"
      },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) {
      return { success: false, error: `Search failed: ${response.status}` };
    }
    const data = await response.json();
    const results = [];
    for (const r of (data.results || []).slice(0, limit2)) {
      results.push({
        title: r.title || "",
        url: r.url || r.link || "",
        snippet: r.content || r.snippet || "",
        engine: r.engine || "",
        published: r.published || ""
      });
    }
    return { success: true, results };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
async function searchImages(query, limit2 = 10) {
  return searxngSearch(query, limit2, "images");
}
async function searchNews(query, timeRange) {
  return searxngSearch(query, 10, "news", undefined, timeRange);
}
async function searxngHealth() {
  try {
    const response = await fetch(`${SEARX_URL}/health`, {
      signal: AbortSignal.timeout(5000)
    });
    return { success: response.ok };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
async function hackernewsTop(limit2 = 10) {
  return hackernewsFetch("topstories", limit2);
}
async function hackernewsNew(limit2 = 10) {
  return hackernewsFetch("newstories", limit2);
}
async function hackernewsBest(limit2 = 10) {
  return hackernewsFetch("beststories", limit2);
}
async function hackernewsComments(storyId, limit2 = 20) {
  try {
    const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
    if (!storyRes.ok)
      return { success: false, error: "Story not found" };
    const story = await storyRes.json();
    const comments = [];
    if (story.kids) {
      for (const kid of story.kids.slice(0, limit2)) {
        const commentRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${kid}.json`);
        if (commentRes.ok) {
          const comment = await commentRes.json();
          comments.push({
            title: comment.text || "",
            url: `https://news.ycombinator.com/item?id=${kid}`,
            snippet: (comment.text || "").slice(0, 300)
          });
        }
      }
    }
    return {
      success: true,
      results: [
        {
          title: story.title || "",
          url: story.url || `https://news.ycombinator.com/item?id=${storyId}`,
          snippet: `${story.score || 0} points | ${story.descendants || 0} comments`
        },
        ...comments.map((c2) => ({ title: c2.title, url: c2.url, snippet: c2.snippet }))
      ]
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
async function hackernewsFetch(endpoint, limit2) {
  try {
    const idsRes = await fetch(`https://hacker-news.firebaseio.com/v0/${endpoint}.json`);
    if (!idsRes.ok)
      return { success: false, error: "Failed to fetch stories" };
    const ids = await idsRes.json();
    const results = [];
    for (const id of ids.slice(0, limit2)) {
      const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      if (itemRes.ok) {
        const item = await itemRes.json();
        if (item && item.type === "story") {
          results.push({
            title: item.title || "",
            url: item.url || `https://news.ycombinator.com/item?id=${id}`,
            snippet: `${item.score || 0} points | ${item.descendants || 0} comments | by ${item.by || "unknown"}`
          });
        }
      }
    }
    return { success: true, results };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
var SEARX_URL;
var init_search = __esm(() => {
  SEARX_URL = process.env.SEARX_URL || "https://search.sridharhomelab.in";
});

// src/index.ts
init_providers();

// src/ui/colors.ts
var reset = "\x1B[0m";
var bold = "\x1B[1m";
var dim = "\x1B[2m";
var italic = "\x1B[3m";
var mocha = {
  crust: "\x1B[48;2;17;17;27m",
  mantle: "\x1B[48;2;24;24;37m",
  base: "\x1B[48;2;30;30;46m",
  surface0: "\x1B[48;2;49;49;68m",
  surface1: "\x1B[48;2;69;73;90m",
  surface2: "\x1B[88;91;112m",
  text: "\x1B[38;2;205;214;244m",
  subtext0: "\x1B[38;2;166;173;200m",
  subtext1: "\x1B[38;2;186;190;204m",
  overlay0: "\x1B[38;2;108;112;134m",
  blue: "\x1B[38;2;137;180;250m",
  sapphire: "\x1B[38;2;62;142;204m",
  sky: "\x1B[38;2;106;173;214m",
  teal: "\x1B[38;2;148;226;213m",
  green: "\x1B[38;2;166;227;161m",
  yellow: "\x1B[38;2;249;226;175m",
  peach: "\x1B[38;2;250;179;135m",
  maroon: "\x1B[38;2;209;133;122m",
  red: "\x1B[38;2;243;139;168m",
  mauve: "\x1B[38;2;203;166;247m",
  pink: "\x1B[38;2;245;194;231m",
  flamingo: "\x1B[38;2;242;205;205m",
  lavender: "\x1B[38;2;180;190;254m",
  white: "\x1B[38;2;230;230;250m"
};
var fg = {
  primary: mocha.text,
  secondary: mocha.subtext1,
  muted: mocha.overlay0,
  overlay: mocha.surface2,
  success: mocha.green,
  warning: mocha.yellow,
  error: mocha.red,
  info: mocha.blue,
  user: mocha.green,
  assistant: mocha.mauve,
  system: mocha.sapphire,
  tool: mocha.peach,
  code: mocha.teal,
  link: mocha.sapphire,
  keyword: mocha.mauve,
  function: mocha.blue,
  string: mocha.green,
  number: mocha.peach,
  accent: mocha.mauve,
  accent2: mocha.pink,
  accent3: mocha.lavender,
  peach: mocha.peach,
  mauve: mocha.mauve,
  cyan: mocha.teal,
  purple: mocha.mauve,
  prompt: mocha.green,
  gpPurple: "\x1B[38;2;142;54;255m",
  gpBlue: "\x1B[38;2;70;130;255m",
  gpCyan: "\x1B[38;2;0;200;200m",
  gpGreen: "\x1B[38;2;0;200;100m",
  gpYellow: "\x1B[38;2;255;200;0m",
  gpRed: "\x1B[38;2;255;100;100m"
};
var bg = {
  base: mocha.base,
  surface: mocha.surface0,
  elevated: mocha.surface1,
  overlay: mocha.surface2,
  crust: mocha.crust,
  mantle: mocha.mantle
};
var box = {
  single: { tl: "\u250C", tr: "\u2510", bl: "\u2514", br: "\u2518", h: "\u2500", v: "\u2502" },
  round: { tl: "\u256D", tr: "\u256E", bl: "\u2570", br: "\u256F", h: "\u2500", v: "\u2502" },
  heavy: { tl: "\u250F", tr: "\u2513", bl: "\u2517", br: "\u251B", h: "\u2501", v: "\u2503" },
  dashed: { tl: "\u250C", tr: "\u2510", bl: "\u2514", br: "\u2518", h: "\u2500", v: "\u2502" },
  soft: { tl: "\u256D", tr: "\u256E", bl: "\u256F", br: "\u2570", h: "\u2500", v: "\u2502" },
  light: { tl: "\u250C", tr: "\u2510", bl: "\u2514", br: "\u2518", h: "\u2500", v: "\u2502" }
};
var spinnerFrames = {
  dots: ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"],
  line: ["-", "\\", "|", "/"],
  blocks: ["\u2596", "\u2598", "\u259D", "\u2597"],
  arrow: ["\u2190", "\u2199", "\u2193", "\u2198", "\u2192", "\u2197", "\u2191", "\u2196"],
  star: ["\u22C6", "\u2726", "\u2727", "\u22C6", "\u2727", "\u2726"]
};
var DEFAULT_SPINNER = spinnerFrames.dots;
var icon = {
  prompt: ">",
  userPrefix: ">",
  aiPrefix: "\u25C8",
  success: "\u2713",
  error: "\u2717",
  warning: "!",
  info: "i",
  check: "\u25CF",
  online: "\u25CF",
  offline: "\u25CB",
  emoji: {
    beast: "\uD83D\uDC09",
    spark: "\u2728",
    tool: "\uD83D\uDD27",
    search: "\uD83D\uDD0D",
    code: "\u26A1",
    link: "\uD83D\uDD17",
    star: "\u2B50",
    tip: "\uD83D\uDCA1",
    rocket: "\uD83D\uDE80",
    success: "\u2705",
    error: "\u274C",
    warning: "\u26A0\uFE0F",
    info: "\u2139\uFE0F",
    wave: "\uD83D\uDC4B",
    chat: "\uD83D\uDCAC",
    robot: "\uD83E\uDD16",
    zap: "\u26A1",
    star2: "\uD83C\uDF1F",
    fire: "\uD83D\uDD25",
    gear: "\u2699\uFE0F",
    key: "\uD83D\uDD11",
    world: "\uD83C\uDF10",
    bulb: "\uD83D\uDCA1"
  },
  googlePurple: "\x1B[38;2;142;54;255m",
  googleBlue: "\x1B[38;2;70;130;255m",
  googleCyan: "\x1B[38;2;0;200;200m",
  googleGreen: "\x1B[38;2;0;200;100m",
  googleYellow: "\x1B[38;2;255;200;0m",
  googleRed: "\x1B[38;2;255;100;100m",
  tool: "\u203A",
  run: "\u203A",
  search: "\u2315",
  edit: "\u270E",
  plus: "+",
  minus: "\u2212",
  arrow: "\u2192",
  arrowUp: "\u2191",
  arrowDown: "\u2193",
  bullet: "\xB7",
  separator: "\u2502",
  folder: "\u25B6",
  file: "\u25B7",
  code: "\u25C8",
  link: "\u2197",
  star: "\u2605",
  spark: "\u2726",
  sparkles: "\u204E",
  tokens: "\u26A1",
  messages: "\u2261",
  time: "\u23F1",
  context: "\u25C8",
  clock: "\u23F0",
  ts: "TS",
  js: "JS",
  py: "PY",
  md: "MD",
  json: "{}",
  git: "\u2387",
  thinking: "\u25D0",
  loading: "\u280B",
  line: "\u2500",
  dash: "\u2013",
  dot: "\xB7",
  space: " "
};
var NO_COLOR = process.env.NO_COLOR || process.env.NO_COLOUR;
function isColorEnabled() {
  if (NO_COLOR)
    return false;
  if (process.env.FORCE_COLOR)
    return true;
  if (process.stdout && !process.stdout.isTTY)
    return false;
  return true;
}
function s(text, ...styles) {
  if (!isColorEnabled())
    return text;
  return styles.join("") + text + reset;
}

// src/ui/layout.ts
function renderHeader(config) {
  if (!isColorEnabled()) {
    return `BEAST CLI v${config.version} | ${config.provider} | ${config.model}`;
  }
  const { version, provider, model, toolsCount } = config;
  const b = box.round;
  const gpPurple = "\x1B[38;2;142;54;255m";
  const gpBlue = "\x1B[38;2;70;130;255m";
  const line = [
    s(`${b.tl} `, gpPurple),
    s("\uD83D\uDC09", gpPurple),
    s(" Beast ", gpPurple, bold),
    s("CLI", gpBlue, bold),
    s(` v${version}`, fg.muted),
    s(` ${b.h} `, gpPurple),
    s(icon.check + " ", fg.success),
    s(provider, fg.success),
    s(` ${b.h} `, gpPurple),
    s(icon.code + " ", gpBlue),
    s(model, gpBlue),
    s(` ${b.h} `, gpPurple),
    s(icon.tool + " ", fg.peach),
    s(`${toolsCount} tools`, fg.peach),
    s(` ${b.h}${b.tr}`, gpPurple)
  ].join("");
  return line;
}
function contextBar(stats) {
  const { used, max } = stats;
  const width = 16;
  const pct = Math.min(1, used / max);
  const filled = Math.round(pct * width);
  const empty = width - filled;
  let barColor = fg.success;
  if (pct > 0.75)
    barColor = fg.warning;
  if (pct > 0.9)
    barColor = fg.error;
  const bar = s("\u2588".repeat(filled), barColor) + s("\u2591".repeat(empty), fg.overlay);
  const pctStr = s(`${Math.round(pct * 100)}%`, barColor);
  const usedStr = s(formatTokens(used), fg.muted);
  const maxStr = s(formatTokens(max), fg.muted);
  return [
    s(`  ${icon.context} `, fg.muted),
    bar,
    s(" ", fg.muted),
    pctStr,
    s(" (", fg.muted),
    usedStr,
    s("/", fg.muted),
    maxStr,
    s(")", fg.muted)
  ].join("");
}
function formatTokens(n) {
  if (n >= 1000)
    return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// src/ui/format.ts
function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}
function panel(content, options = {}) {
  const { title, titleColor = fg.accent, width = 70 } = options;
  const b = box.round;
  const rawLines = content.split(`
`);
  const maxLen = rawLines.reduce((m, l) => Math.max(m, stripAnsi(l).length), 0);
  const w = Math.max(width, maxLen + 4);
  let result = b.tl + "\u2500".repeat(w) + b.tr + `
`;
  if (title) {
    const titleLen = stripAnsi(title).length;
    const pad1 = Math.floor((w - titleLen) / 2);
    const pad2 = w - titleLen - pad1;
    result += b.v + " ".repeat(pad1) + title + " ".repeat(pad2) + b.v + `
`;
    result += b.v + "\u2500".repeat(w) + b.v + `
`;
  }
  for (const ln of rawLines) {
    const len = stripAnsi(ln).length;
    const pad = w - len - 2;
    result += b.v + " " + ln + " ".repeat(Math.max(0, pad)) + " " + b.v + `
`;
  }
  result += b.bl + "\u2500".repeat(w) + b.br;
  return s(result, titleColor);
}
function inlineList(items, options = {}) {
  const { iconColor = fg.accent, labelColor = fg.muted, valueColor = fg.primary, separator = " \xB7 " } = options;
  return items.map((item) => {
    const icon2 = item.icon ? s(item.icon + " ", iconColor) : "";
    return icon2 + s(item.label, labelColor) + ": " + s(item.value, valueColor);
  }).join(separator);
}
async function withProgress(label, promise, onTick) {
  const start = Date.now();
  let ticks = 0;
  const ticker = setInterval(() => {
    const elapsed = Date.now() - start;
    const estimated = Math.min(1, elapsed / 1e4);
    ticks++;
    const pct = Math.round(estimated * 100);
    const filled = Math.round(estimated * 24);
    const barColor = pct > 80 ? fg.warning : pct > 50 ? fg.accent : fg.success;
    const bar = s("\u2588".repeat(filled), barColor) + s("\u2591".repeat(24 - filled), fg.muted);
    process.stderr.write(`\r  ${s(label, fg.secondary)} ${bar} ${s(pct + "%", barColor)}   `);
    if (onTick)
      onTick(elapsed);
  }, 300);
  try {
    const result = await promise;
    clearInterval(ticker);
    process.stderr.write("\r" + " ".repeat(60) + "\r");
    process.stderr.write(s("\u2713 ", fg.success) + s(label, fg.secondary) + `
`);
    return result;
  } catch (e) {
    clearInterval(ticker);
    process.stderr.write("\r" + " ".repeat(60) + "\r");
    process.stderr.write(s("\u2717 ", fg.error) + s(label, fg.secondary) + `
`);
    throw e;
  }
}
function helpPanel(commands) {
  const maxCmd = Math.max(...commands.map((c) => stripAnsi(c.cmd).length), 4);
  return commands.map(({ cmd, desc, shortcut }) => {
    const shortcutStr = shortcut ? s(` (${shortcut})`, fg.muted, italic) : "";
    return `  ${s(cmd.padEnd(maxCmd + 2), fg.accent)}${desc}${shortcutStr}`;
  }).join(`
`);
}

// src/ui/tool-renderer.ts
var MAX_RESULT_LINES = 2;
var MAX_LINE_WIDTH = 120;
function truncateResult(content, maxLines = MAX_RESULT_LINES) {
  const lines = content.split(`
`);
  if (lines.length <= maxLines)
    return content;
  const visible = lines.slice(0, maxLines);
  const truncated = visible.map((l) => {
    const stripped = stripAnsi(l);
    if (stripped.length <= MAX_LINE_WIDTH)
      return l;
    return l.slice(0, MAX_LINE_WIDTH - 3) + "...";
  });
  const remaining = lines.length - maxLines;
  return truncated.join(`
`) + `
` + s(`... (${remaining} more lines)`, fg.muted);
}
function renderToolResult(name, result) {
  if (!result.success) {
    return renderError(name, result.error || "Unknown error");
  }
  if (name.startsWith("file_list"))
    return renderFileList(result.content);
  if (name.startsWith("file_read"))
    return renderFileRead(result.content);
  if (name.startsWith("github_search") || name.startsWith("github_repo"))
    return renderGithub(result.content);
  if (name.startsWith("searxng_search"))
    return renderSearch(result.content);
  if (name.startsWith("run_code") || name.startsWith("run_python"))
    return renderCodeOutput(result.content);
  if (name.startsWith("hackernews"))
    return renderHackerNews(result.content);
  if (name.startsWith("youtube"))
    return renderYouTube(result.content);
  if (name.startsWith("fetch_web") || name.startsWith("quick_fetch"))
    return renderWebContent(result.content);
  return renderGeneric(result.content);
}
function renderFileList(content) {
  try {
    const items = JSON.parse(content);
    if (!Array.isArray(items) || items.length === 0) {
      return s("(empty directory)", fg.muted);
    }
    const dirs = items.filter((i) => i.type === "directory");
    const files = items.filter((i) => i.type !== "directory");
    const lines = [];
    if (dirs.length > 0) {
      lines.push(s("\uD83D\uDCC1 Directories", fg.accent));
      lines.push(dirs.map((d) => `  ${s("\uD83D\uDCC1", fg.warning)} ${s(d.name, fg.primary)}`).join(`
`));
      lines.push("");
    }
    if (files.length > 0) {
      lines.push(s("\uD83D\uDCC4 Files", fg.accent));
      lines.push(files.map((f) => {
        const size = f.size ? formatSize(f.size) : "";
        const modified = f.modified ? timeAgo(f.modified) : "";
        return `  ${s("\uD83D\uDCC4", fg.cyan)} ${s(f.name, fg.primary)} ${s(size, fg.muted)} ${s(modified, fg.muted)}`;
      }).join(`
`));
    }
    return lines.join(`
`) + `
${s("(" + items.length + " items)", fg.muted)}`;
  } catch {
    return renderGeneric(content);
  }
}
function renderFileRead(content) {
  return truncateResult(content, MAX_RESULT_LINES);
}
function renderCodeOutput(content) {
  return truncateResult(content, MAX_RESULT_LINES);
}
function renderSearch(content) {
  try {
    const data = JSON.parse(content);
    const results = data.results || [];
    if (results.length === 0) {
      return s("No results found", fg.muted);
    }
    const shown = results.slice(0, MAX_RESULT_LINES);
    const remaining = results.length - shown.length;
    const items = shown.map((r, i) => {
      const title = r.title || s("(no title)", fg.muted);
      const url = r.url || "";
      const snippet = r.snippet || "";
      return [
        s(`${i + 1}. `, fg.accent) + s(truncate(title, 60), fg.bold, fg.primary),
        `   ${s(truncate(snippet, 80), fg.secondary)}`,
        `   ${s(truncate(url, 70), fg.link)}`
      ].join(`
`);
    });
    if (remaining > 0) {
      items.push(s(`... and ${remaining} more results \u2014 use fetch_web for full content`, fg.muted));
    }
    return items.join(`

`);
  } catch {
    return renderGeneric(content);
  }
}
function renderGithub(content) {
  try {
    const data = JSON.parse(content);
    if (data.name) {
      const lines = [
        s(data.name, fg.bold, fg.accent),
        data.description ? s(data.description, fg.primary) : "",
        "",
        s("\u2B50 " + formatNumber(data.stars || data.stargazers_count || 0), fg.warning) + "  " + s("\uD83C\uDF74 " + formatNumber(data.forks_count || 0), fg.cyan) + "  " + s(data.language || "", fg.success),
        "",
        s(data.url || data.html_url || "", fg.link)
      ];
      return lines.filter(Boolean).join(`
`);
    }
    if (Array.isArray(data)) {
      const shown = data.slice(0, MAX_RESULT_LINES);
      const remaining = data.length - shown.length;
      const items = shown.map((r, i) => {
        return [
          s(`${i + 1}. `, fg.accent) + s(r.name || r.full_name, fg.bold, fg.primary),
          r.description ? `   ${s(truncate(r.description, 60), fg.secondary)}` : "",
          `   ${s("\u2B50 " + formatNumber(r.stars || r.stargazers_count || 0), fg.warning)} ${r.language ? s(r.language, fg.success) : ""}`
        ].filter(Boolean).join(`
`);
      });
      if (remaining > 0) {
        items.push(s(`... and ${remaining} more repos`, fg.muted));
      }
      return items.join(`

`);
    }
    return renderGeneric(content);
  } catch {
    return renderGeneric(content);
  }
}
function renderHackerNews(content) {
  try {
    const data = JSON.parse(content);
    const results = data.results || [];
    const shown = results.slice(0, MAX_RESULT_LINES);
    const remaining = results.length - shown.length;
    const items = shown.map((r, i) => {
      const title = r.title || s("(no title)", fg.muted);
      const score = r.score || r.snippet?.match(/(\d+) points/)?.[1] || "0";
      const comments = r.descendants || r.snippet?.match(/(\d+) comments/)?.[1] || "0";
      return [
        s(`${i + 1}. `, fg.accent) + s(truncate(title, 60), fg.bold, fg.primary),
        `   ${s("\u2B50 " + score, fg.warning)} ${s("\uD83D\uDCAC " + comments, fg.cyan)} ${r.url ? s(truncate(r.url, 50), fg.link) : ""}`
      ].join(`
`);
    });
    if (remaining > 0) {
      items.push(s(`... and ${remaining} more stories`, fg.muted));
    }
    return items.join(`

`);
  } catch {
    return renderGeneric(content);
  }
}
function renderYouTube(content) {
  try {
    const data = JSON.parse(content);
    const results = Array.isArray(data) ? data : data.results || [];
    const shown = results.slice(0, MAX_RESULT_LINES);
    const remaining = results.length - shown.length;
    const items = shown.map((r, i) => {
      return [
        s(`${i + 1}. `, fg.accent) + s(r.name || r.full_name || s("(no name)", fg.muted), fg.bold, fg.primary),
        r.description ? `   ${s(truncate(r.description, 60), fg.secondary)}` : "",
        `   ${s("\u2B50 " + formatNumber(r.stars || r.stargazers_count || 0), fg.warning)} ${r.language ? s(r.language, fg.success) : ""}`
      ].filter(Boolean).join(`
`);
    });
    if (remaining > 0) {
      items.push(s(`... and ${remaining} more videos`, fg.muted));
    }
    return items.join(`

`);
  } catch {
    return renderGeneric(content);
  }
}
function renderWebContent(content) {
  return truncateResult(content, MAX_RESULT_LINES);
}
function renderGeneric(content) {
  try {
    const parsed = JSON.parse(content);
    const formatted = JSON.stringify(parsed, null, 2);
    return truncateResult(formatted, MAX_RESULT_LINES);
  } catch {
    return truncateResult(content, MAX_RESULT_LINES);
  }
}
function renderError(toolName, error) {
  return s(`${icon.error} ${toolName}: ${error}`, fg.error);
}
function formatSize(bytes) {
  if (bytes < 1024)
    return bytes + " B";
  if (bytes < 1024 * 1024)
    return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
function formatNumber(n) {
  if (n >= 1e6)
    return (n / 1e6).toFixed(1) + "M";
  if (n >= 1000)
    return (n / 1000).toFixed(1) + "K";
  return String(n);
}
function timeAgo(dateStr) {
  try {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0)
      return days + "d ago";
    if (hours > 0)
      return hours + "h ago";
    if (minutes > 0)
      return minutes + "m ago";
    return "just now";
  } catch {
    return "";
  }
}
function truncate(text, maxLen) {
  const stripped = stripAnsi(text);
  if (stripped.length <= maxLen)
    return text;
  const plain = text.replace(/\x1b\[[0-9;]*m/g, "");
  const truncated = plain.slice(0, maxLen - 3);
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.7) {
    return text.slice(0, text.indexOf(" ", lastSpace)) + "...";
  }
  return text.slice(0, maxLen - 3) + "...";
}

// src/ui/banner.ts
function termWidth() {
  try {
    return process.stdout.columns || 80;
  } catch {
    return 80;
  }
}
var googlePurple = "\x1B[38;2;142;54;255m";
var googleBlue = "\x1B[38;2;70;130;255m";
var FULL_LOGO = `
 ${googlePurple}\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557${reset}` + `
 ${googlePurple}\u2551${reset}  \uD83D\uDC09  ${s("BEAST", googlePurple, bold)}   ${s("CLI", googleBlue, bold)}    ${dim}AI Coding Agent \xB7 45+ Providers \xB7 51+ Tools     ${googlePurple}\u2551${reset}` + `
 ${googlePurple}\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D${reset}
`;
var COMPACT_LOGO = `
 ${googlePurple}\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510${reset}` + `
 ${googlePurple}\u2502${reset}  \uD83D\uDC09  ${s("BEAST", googlePurple, bold)}  ${s("CLI", googleBlue, bold)}  ${dim}AI Coding Agent                  ${googlePurple}\u2502${reset}` + `
 ${googlePurple}\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518${reset}
`;
var TINY_LOGO = ` \uD83D\uDC09 ${s("BEAST CLI", googlePurple, bold)} ${dim}~ 
`;
var googlePurple2 = "\x1B[38;2;142;54;255m";
var googleBlue2 = "\x1B[38;2;70;130;255m";
var TEXT_LOGO = ` ${s("BEAST", googlePurple2, bold)} ${s("CLI", googleBlue2, bold)} `;
var TAGLINE = `${s("\xB7", fg.overlay)} ${s("45+ Providers", fg.muted)} ${s("\xB7", fg.overlay)} ${s("51+ Tools", fg.muted)} ${s("\xB7", fg.overlay)} ${s("Local AI Ready", fg.muted)}`;
function renderCleanBanner() {
  if (!isColorEnabled())
    return "BEAST CLI - AI Coding Agent";
  const width = termWidth();
  let logo;
  if (width >= 60) {
    logo = FULL_LOGO;
  } else if (width >= 40) {
    logo = COMPACT_LOGO;
  } else {
    logo = TINY_LOGO;
  }
  if (width < 50) {
    return logo;
  }
  return logo + TAGLINE + `
`;
}

// src/ui/tips.ts
var TIPS = [
  { cmd: "/model <name>", tip: "Switch models mid-session without restarting", category: "command" },
  { cmd: "/provider <name>", tip: "Jump between Ollama, OpenRouter, Claude instantly", category: "command" },
  { cmd: "/tools", tip: "See all available MCP tools and their descriptions", category: "command" },
  { cmd: "/clear", tip: "Wipe conversation history to reset context window", category: "command" },
  { cmd: "/models", tip: "List all available models for your current provider", category: "command" },
  { cmd: "Tab", tip: "Auto-complete tool names and common commands", category: "command" },
  { cmd: "Up / Down", tip: "Navigate through your command history", category: "command" },
  { cmd: "file_read", tip: "Read any file in the current directory", category: "tool" },
  { cmd: "file_list", tip: "Show directories and files with sizes and times", category: "tool" },
  { cmd: "file_tree", tip: "View your entire project structure at a glance", category: "tool" },
  { cmd: "run_code", tip: "Execute shell commands \u2014 git, npm, docker, anything", category: "tool" },
  { cmd: "run_python", tip: "Run Python code with a sandboxed interpreter", category: "tool" },
  { cmd: "github_search_repos", tip: "Search GitHub by keyword with stars and language", category: "tool" },
  { cmd: "searxng_search", tip: "Web search without leaving the CLI", category: "tool" },
  { cmd: "fetch_web", tip: "Fetch full web page content from any URL", category: "tool" },
  { cmd: "hacker_news", tip: "Get top Hacker News stories and comments", category: "tool" },
  { cmd: "youtube_transcript", tip: "Extract transcripts from YouTube videos", category: "tool" },
  { cmd: "/provider codex", tip: "Use ChatGPT Plus OAuth \u2014 free with your subscription", category: "provider" },
  { cmd: "/provider ollama", tip: "Ollama runs AI models locally \u2014 no internet needed", category: "provider" },
  { cmd: "beast --defaults", tip: "Auto-selects the best available provider", category: "provider" },
  { cmd: "Claude", tip: "Anthropic Claude \u2014 excellent reasoning and long context", category: "provider" },
  { cmd: "Groq", tip: "Ultra-fast inference with a free tier", category: "provider" },
  { cmd: "/compact", tip: "Manually trigger context compaction to free up space", category: "context" },
  { cmd: "Context", tip: "History counts toward your context \u2014 /clear to free it", category: "context" },
  { cmd: "auto-compact", tip: "Context auto-compacts at 95% \u2014 never lose your place", category: "context" },
  { cmd: "--theme claude", tip: "Use --theme claude for warm editorial styling", category: "fun" },
  { cmd: "--theme dracula", tip: "Use --theme dracula for dark mode", category: "fun" }
];
function randomTip() {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  return `${s("\uD83D\uDCA1", fg.warning)} ${s(tip.tip, fg.secondary)} ${s(`(${tip.cmd})`, fg.muted)}`;
}
function tipBanner() {
  return `
` + s("\u2500".repeat(50), fg.muted) + `
` + randomTip() + `
`;
}

// src/native-tools/web.ts
var DEFAULT_TIMEOUT = 15000;
async function fetchWebContent(url, maxTokens = 4000) {
  try {
    const controller = new AbortController;
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BeastCLI/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    clearTimeout(timeout);
    if (!response.ok) {
      return { success: false, content: "", error: `HTTP ${response.status}` };
    }
    const html = await response.text();
    const text = stripHtml(html);
    const title = extractTitle(html);
    const truncated = text.slice(0, maxTokens * 4);
    return {
      success: true,
      content: truncated,
      title,
      url: response.url
    };
  } catch (e) {
    return { success: false, content: "", error: e.message };
  }
}
async function quickFetch(url) {
  const result = await fetchWebContent(url, 1500);
  if (result.success && result.content) {
    const lines = result.content.split(`
`).filter((l) => l.trim().length > 30);
    return { ...result, content: lines.slice(0, 3).join(`

`) };
  }
  return result;
}
async function fetchStructured(url, extractionType, maxTokens = 2000) {
  const result = await fetchWebContent(url, maxTokens);
  if (!result.success)
    return result;
  switch (extractionType) {
    case "article":
      return extractArticle(result.content, url);
    case "product":
      return extractProduct(result.content, url);
    case "table":
      return extractTable(result.content);
    case "links":
      return extractLinks(result.content, url);
    default:
      return result;
  }
}
async function fetchWithSelectors(url, selectors, maxTokens = 2000) {
  const result = await fetchWebContent(url, maxTokens);
  if (!result.success)
    return result;
  const extracted = {};
  for (const [field, selector] of Object.entries(selectors)) {
    if (selector.includes("title"))
      extracted[field] = result.title ?? "";
    if (selector.includes("price")) {
      const priceMatch = result.content.match(/[\\u20B9$]?[\d,]+\.?\d*/);
      if (priceMatch)
        extracted[field] = priceMatch[0];
    }
    if (selector.includes("description") || selector.includes("content")) {
      extracted[field] = result.content.slice(0, 500);
    }
  }
  return {
    success: true,
    content: JSON.stringify(extracted, null, 2),
    url
  };
}
async function scrapeFreedium(url, maxTokens = 4000) {
  const freediumUrl = url.includes("freedium.cfd") ? url : `https://freedium.cfd/${url}`;
  const result = await fetchWebContent(freediumUrl, maxTokens);
  if (!result.success)
    return result;
  return {
    success: true,
    content: result.content,
    title: result.title,
    url: freediumUrl
  };
}
async function webclawExtractArticle(url) {
  return fetchWebContent(url, 4000);
}
async function webclawExtractProduct(url) {
  const result = await fetchWebContent(url, 2000);
  if (!result.success)
    return result;
  const product = {};
  const titleMatch = result.content.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch)
    product.title = titleMatch[1];
  const priceMatch = result.content.match(/price["\s:>]+["\s]*([\u20B9$]?[\d,]+\.?\d*)/i);
  if (priceMatch)
    product.price = priceMatch[1];
  const descMatch = result.content.match(/description["\s:>]+["']([^"']+)["']/i);
  if (descMatch)
    product.description = descMatch[1];
  return {
    success: true,
    content: JSON.stringify(product, null, 2),
    url
  };
}
async function webclawCrawl(url, selectors) {
  return fetchWithSelectors(url, selectors);
}
function stripHtml(html) {
  return html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "").replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "").replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<br\s*\/?>/gi, `
`).replace(/<\/p>/gi, `

`).replace(/<\/div>/gi, `
`).replace(/<\/li>/gi, `
`).replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&[a-z]+;/gi, "").replace(/\n{3,}/g, `

`).replace(/[ \t]+/g, " ").trim();
}
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : "";
}
function extractArticle(content, url) {
  const paragraphs = content.split(`

`).filter((p) => p.length > 100);
  return {
    success: true,
    content: paragraphs.slice(0, 5).join(`

`),
    url
  };
}
function extractProduct(content, url) {
  const product = {};
  const lines = content.split(`
`).filter((l) => l.trim());
  for (const line of lines.slice(0, 20)) {
    if (line.includes(":")) {
      const [key, ...vals] = line.split(":");
      if (key && vals.length)
        product[key.trim()] = vals.join(":").trim().slice(0, 200);
    }
  }
  return {
    success: true,
    content: JSON.stringify(product, null, 2),
    url
  };
}
function extractTable(content) {
  const lines = content.split(`
`).filter((l) => l.includes("|"));
  return {
    success: true,
    content: lines.join(`
`)
  };
}
function extractLinks(content, baseUrl) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({ text: match[1], url: match[2] });
  }
  return {
    success: true,
    content: JSON.stringify(links.slice(0, 20), null, 2),
    url: baseUrl
  };
}

// src/native-tools/files.ts
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "fs";
import { resolve, dirname, extname, join } from "path";
import { execSync } from "child_process";
var MAX_FILE_SIZE = 10 * 1024 * 1024;
var ALLOWED_EXTENSIONS = new Set([
  ".ts",
  ".js",
  ".json",
  ".md",
  ".txt",
  ".yml",
  ".yaml",
  ".xml",
  ".html",
  ".css",
  ".scss",
  ".py",
  ".rs",
  ".go",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".sh",
  ".bash",
  ".zsh",
  ".sql",
  ".csv",
  ".log",
  ".gitignore",
  ".env",
  ".prettierrc",
  ".eslintrc",
  ".babelrc"
]);
var RESTRICTED_PATHS = ["/Users/sridhar/.ssh", "/Users/sridhar/.npm", "/Users/sridhar/.aws"];
async function fileRead(path, maxSize = MAX_FILE_SIZE) {
  try {
    const resolved = resolve(path);
    for (const restricted of RESTRICTED_PATHS) {
      if (resolved.startsWith(restricted)) {
        return { success: false, error: `Access denied: ${restricted}` };
      }
    }
    const stats = statSync(resolved);
    if (stats.size > maxSize) {
      return {
        success: true,
        content: `[File too large: ${stats.size} bytes. Max: ${maxSize}]`,
        path: resolved,
        size: stats.size
      };
    }
    const content = readFileSync(resolved, "utf-8");
    const lines = content.split(`
`).length;
    return {
      success: true,
      content,
      path: resolved,
      size: stats.size,
      lines
    };
  } catch (e) {
    return { success: false, error: e.message, path };
  }
}
async function fileWrite(path, content) {
  try {
    const resolved = resolve(path);
    for (const restricted of RESTRICTED_PATHS) {
      if (resolved.startsWith(restricted)) {
        return { success: false, error: `Access denied: ${restricted}` };
      }
    }
    const dir = dirname(resolved);
    if (!existsSync(dir)) {
      return { success: false, error: `Directory does not exist: ${dir}`, path: resolved };
    }
    writeFileSync(resolved, content, "utf-8");
    const stats = statSync(resolved);
    return {
      success: true,
      path: resolved,
      size: stats.size
    };
  } catch (e) {
    return { success: false, error: e.message, path };
  }
}
async function fileList(dir = ".", maxItems = 100) {
  try {
    const resolved = resolve(dir);
    if (!existsSync(resolved)) {
      return { success: false, items: [], path: resolved, error: "Directory not found" };
    }
    const entries = readdirSync(resolved);
    const items = [];
    for (const entry of entries.slice(0, maxItems)) {
      try {
        const fullPath = join(resolved, entry);
        const stats = statSync(fullPath);
        items.push({
          name: entry,
          type: stats.isDirectory() ? "directory" : "file",
          size: stats.isFile() ? stats.size : undefined,
          modified: stats.mtime.toISOString()
        });
      } catch {}
    }
    items.sort((a, b) => {
      if (a.type !== b.type)
        return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return { success: true, items, path: resolved };
  } catch (e) {
    return { success: false, items: [], path: dir, error: e.message };
  }
}
async function fileSearch(directory, pattern, maxResults = 50) {
  try {
    const resolved = resolve(directory);
    if (!existsSync(resolved)) {
      return { success: false, files: [], error: "Directory not found" };
    }
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cmd = `find "${resolved}" -type f \\( -path "*/node_modules" -o -path "*/.git" -o -path "*/dist" -o -path "*/build" \\) -prune -o -type f -name "*${pattern}*" -print 2>/dev/null | head -${maxResults}`;
    const output = execSync(cmd, { encoding: "utf-8", timeout: 1e4 });
    const files = output.split(`
`).filter(Boolean).map((f) => ({ path: f }));
    return { success: true, files };
  } catch (e) {
    return { success: false, files: [], error: e.message };
  }
}
async function fileGrep(directory, query, maxResults = 50, filePattern = "*") {
  try {
    const resolved = resolve(directory);
    if (!existsSync(resolved)) {
      return { success: false, files: [], error: "Directory not found" };
    }
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const cmd = `grep -rn --include="${filePattern}" -E "${escaped}" "${resolved}" 2>/dev/null | head -${maxResults}`;
    const output = execSync(cmd, { encoding: "utf-8", timeout: 1e4 });
    const files = [];
    for (const line of output.split(`
`).filter(Boolean)) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const pathPart = line.slice(0, colonIdx);
        const rest = line.slice(colonIdx + 1);
        const secondColonIdx = rest.indexOf(":");
        if (secondColonIdx > 0) {
          const lineNum = parseInt(rest.slice(0, secondColonIdx));
          const match = rest.slice(secondColonIdx + 1).trim();
          files.push({
            path: join(resolved, pathPart),
            line: lineNum,
            match: match.slice(0, 200)
          });
        }
      }
    }
    return { success: true, files };
  } catch (e) {
    return { success: true, files: [] };
  }
}
async function fileGlob(directory, patterns, maxResults = 100) {
  try {
    const resolved = resolve(directory);
    const files = [];
    for (const pattern of patterns) {
      const cmd = `find "${resolved}" -type f \\( -path "*/node_modules" -o -path "*/.git" -o -path "*/dist" -o -path "*/build" \\) -prune -o -type f -name "${pattern}" -print 2>/dev/null | head -${maxResults}`;
      const output = execSync(cmd, { encoding: "utf-8", timeout: 1e4 });
      for (const line of output.split(`
`).filter(Boolean)) {
        if (!files.some((f) => f.path === line)) {
          files.push({ path: line });
        }
      }
      if (files.length >= maxResults)
        break;
    }
    return { success: true, files: files.slice(0, maxResults) };
  } catch (e) {
    return { success: false, files: [], error: e.message };
  }
}

// src/native-tools/code.ts
import { spawn } from "child_process";
import { writeFileSync as writeFileSync2, unlinkSync, mkdirSync, existsSync as existsSync2 } from "fs";
import { join as join2 } from "path";
import { randomUUID } from "crypto";
var SANDBOX_DIR = "/tmp/beast-sandbox";
if (!existsSync2(SANDBOX_DIR)) {
  mkdirSync(SANDBOX_DIR, { recursive: true });
}
async function runCode(code, language, timeout = 30) {
  const start = Date.now();
  try {
    switch (language) {
      case "python":
        return runPython(code, timeout, start);
      case "javascript":
        return runJavaScript(code, timeout, start);
      case "bash":
        return runBash(code, timeout, start);
      default:
        return { success: false, output: "", error: `Unsupported language: ${language}` };
    }
  } catch (e) {
    return { success: false, output: "", error: e.message, executionTime: Date.now() - start };
  }
}
async function runPythonSnippet(code, timeout = 30) {
  const start = Date.now();
  const fullCode = `
import json
import math
import re
import datetime
import itertools
from collections import Counter, defaultdict

${code}
`;
  return runPython(fullCode, timeout, start);
}
async function runPython(code, timeout, start) {
  const id = randomUUID();
  const filePath = join2(SANDBOX_DIR, `${id}.py`);
  try {
    writeFileSync2(filePath, code, "utf-8");
    const result = await execProcess("python3", ["-u", filePath], timeout * 1000);
    const executionTime = Date.now() - start;
    return {
      success: !result.error,
      output: result.stdout || result.stderr,
      error: result.error,
      executionTime,
      language: "python"
    };
  } finally {
    try {
      unlinkSync(filePath);
    } catch {}
  }
}
async function runJavaScript(code, timeout, start) {
  const id = randomUUID();
  const filePath = join2(SANDBOX_DIR, `${id}.js`);
  try {
    writeFileSync2(filePath, code, "utf-8");
    const result = await execProcess("node", ["--input-type=module", filePath], timeout * 1000);
    const executionTime = Date.now() - start;
    return {
      success: !result.error,
      output: result.stdout || result.stderr,
      error: result.error,
      executionTime,
      language: "javascript"
    };
  } finally {
    try {
      unlinkSync(filePath);
    } catch {}
  }
}
async function runBash(code, timeout, start) {
  const id = randomUUID();
  const filePath = join2(SANDBOX_DIR, `${id}.sh`);
  try {
    writeFileSync2(filePath, code, "utf-8");
    const result = await execProcess("/bin/bash", ["-c", code], timeout * 1000);
    const executionTime = Date.now() - start;
    return {
      success: !result.error,
      output: result.stdout || result.stderr,
      error: result.error,
      executionTime,
      language: "bash"
    };
  } finally {
    try {
      unlinkSync(filePath);
    } catch {}
  }
}
function execProcess(command, args, timeoutMs) {
  return new Promise((resolve2) => {
    const proc = spawn(command, args, {
      timeout: timeoutMs,
      cwd: SANDBOX_DIR,
      env: {
        ...process.env,
        HOME: SANDBOX_DIR,
        PATH: "/usr/bin:/bin:/usr/local/bin"
      }
    });
    let stdout = "";
    let stderr = "";
    proc.stdout?.on("data", (d) => {
      stdout += d.toString();
    });
    proc.stderr?.on("data", (d) => {
      stderr += d.toString();
    });
    proc.on("error", (e) => resolve2({ stdout, stderr, error: e.message }));
    proc.on("close", (code) => {
      if (code !== 0 && !stderr) {
        resolve2({ stdout, stderr, error: `Exit code: ${code}` });
      } else {
        resolve2({ stdout, stderr, error: code !== 0 ? `Exit code: ${code}` : undefined });
      }
    });
  });
}
async function pandasCreate(data, name = "df") {
  try {
    const parsed = JSON.parse(data);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const keys = Object.keys(rows[0] || {});
    const summary = {
      name,
      rowCount: rows.length,
      columns: keys,
      preview: rows.slice(0, 5)
    };
    return {
      success: true,
      output: JSON.stringify(summary, null, 2)
    };
  } catch (e) {
    return { success: false, output: "", error: `Invalid JSON: ${e.message}` };
  }
}
async function pandasFilter(data, conditions) {
  try {
    const parsedConditions = JSON.parse(conditions);
    const filtered = data.filter((row) => {
      for (const [key, op] of Object.entries(parsedConditions)) {
        const rowVal = row[key];
        if (typeof op === "object") {
          for (const [cmp, val] of Object.entries(op)) {
            switch (cmp) {
              case "$eq":
                if (rowVal !== val)
                  return false;
                break;
              case "$ne":
                if (rowVal === val)
                  return false;
                break;
              case "$gt":
                if (rowVal <= val)
                  return false;
                break;
              case "$gte":
                if (rowVal < val)
                  return false;
                break;
              case "$lt":
                if (rowVal >= val)
                  return false;
                break;
              case "$lte":
                if (rowVal > val)
                  return false;
                break;
              case "$contains":
                if (!String(rowVal).includes(String(val)))
                  return false;
                break;
            }
          }
        } else {
          if (rowVal !== op)
            return false;
        }
      }
      return true;
    });
    return {
      success: true,
      output: JSON.stringify(filtered, null, 2)
    };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}
async function pandasAggregate(data, groupBy, aggregations) {
  try {
    const rows = data;
    const groups = new Map;
    for (const row of rows) {
      const key = groupBy.map((k) => String(row[k])).join("|");
      if (!groups.has(key))
        groups.set(key, []);
      groups.get(key).push(row);
    }
    const results = [];
    for (const [key, groupRows] of groups) {
      const result = {};
      const keyParts = key.split("|");
      groupBy.forEach((k, i) => {
        result[k] = keyParts[i];
      });
      for (const [col, fn] of Object.entries(aggregations)) {
        const values = groupRows.map((r) => Number(r[col])).filter((v) => !isNaN(v));
        switch (fn) {
          case "sum":
            result[`${col}_sum`] = values.reduce((a, b) => a + b, 0);
            break;
          case "avg":
            result[`${col}_avg`] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            break;
          case "count":
            result[`${col}_count`] = values.length;
            break;
          case "min":
            result[`${col}_min`] = Math.min(...values);
            break;
          case "max":
            result[`${col}_max`] = Math.max(...values);
            break;
        }
      }
      results.push(result);
    }
    return { success: true, output: JSON.stringify(results, null, 2) };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}

// src/native-tools/index.ts
init_search();

// src/native-tools/github.ts
var GITHUB_API = "https://api.github.com";
var GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
async function githubFetch(path) {
  try {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "BeastCLI/1.0"
    };
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }
    const response = await fetch(`${GITHUB_API}${path}`, {
      headers,
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) {
      const error = await response.text();
      return { ok: false, data: null, error: `GitHub API ${response.status}: ${error}` };
    }
    const data = await response.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, data: null, error: e.message };
  }
}
async function githubRepo(owner, repo) {
  const result = await githubFetch(`/repos/${owner}/${repo}`);
  if (!result.ok) {
    return { success: false, output: "", error: result.error };
  }
  const r = result.data;
  const repoData = {
    repo_name: r.name,
    full_name: r.full_name,
    description: r.description,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    license: r.license?.name || r.license?.spdx_id || null,
    topics: r.topics || [],
    open_issues: r.open_issues_count,
    watchers: r.watchers_count,
    default_branch: r.default_branch,
    created_at: r.created_at,
    updated_at: r.updated_at,
    homepage: r.homepage
  };
  return { success: true, output: JSON.stringify(repoData, null, 2) };
}
async function githubReadme(owner, repo) {
  const result = await githubFetch(`/repos/${owner}/${repo}/readme`);
  if (!result.ok) {
    return { success: false, output: "", error: result.error };
  }
  const r = result.data;
  const content = Buffer.from(r.content, "base64").toString("utf-8");
  return { success: true, output: content };
}
async function githubIssues(owner, repo, state = "open", limit2 = 20) {
  const result = await githubFetch(`/repos/${owner}/${repo}/issues?state=${state}&per_page=${limit2}`);
  if (!result.ok) {
    return { success: false, output: "", error: result.error };
  }
  const issues = result.data.map((i) => ({
    number: i.number,
    title: i.title,
    state: i.state,
    labels: i.labels?.map((l) => l.name) || [],
    author: i.user?.login,
    created_at: i.created_at,
    url: i.html_url
  }));
  return { success: true, output: JSON.stringify(issues, null, 2) };
}
async function githubCommits(owner, repo, limit2 = 20) {
  const result = await githubFetch(`/repos/${owner}/${repo}/commits?per_page=${limit2}`);
  if (!result.ok) {
    return { success: false, output: "", error: result.error };
  }
  const commits = result.data.map((c2) => ({
    sha: c2.sha?.slice(0, 7),
    message: c2.commit?.message?.split(`
`)[0],
    author: c2.commit?.author?.name,
    date: c2.commit?.author?.date,
    url: c2.html_url
  }));
  return { success: true, output: JSON.stringify(commits, null, 2) };
}
async function githubSearchRepos(query, limit2 = 10) {
  const result = await githubFetch(`/search/repositories?q=${encodeURIComponent(query)}&per_page=${limit2}`);
  if (!result.ok) {
    return { success: false, output: "", error: result.error };
  }
  const data = result.data;
  const repos = (data.items || []).map((r) => ({
    name: r.name,
    owner: r.owner?.login,
    description: r.description,
    stars: r.stargazers_count,
    language: r.language,
    url: r.html_url
  }));
  return { success: true, output: JSON.stringify(repos, null, 2) };
}

// src/native-tools/youtube.ts
async function youtubeTranscript(url) {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return { success: false, output: "", error: "Invalid YouTube URL" };
    }
    const transcriptUrl = `https://youtubetranscript.com/?video=${videoId}`;
    const response = await fetch(transcriptUrl, {
      signal: AbortSignal.timeout(1e4)
    });
    if (response.ok) {
      const text = await response.text();
      return {
        success: true,
        output: text.slice(0, 5000)
      };
    }
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(1e4)
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      const captionMatch = html.match(/"captionTracks":\[([^\]]+)\]/);
      if (captionMatch) {
        return { success: true, output: "Captions available. Use youtube_video_info for details." };
      }
    }
    return {
      success: false,
      output: "",
      error: "Transcript not available. Video may not have captions."
    };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}
async function youtubeVideoInfo(videoId, url) {
  try {
    const id = videoId || (url ? extractVideoId(url) : null);
    if (!id) {
      return { success: false, output: "", error: "Invalid video ID or URL" };
    }
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
    const response = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(1e4)
    });
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        output: JSON.stringify({
          title: data.title,
          author_name: data.author_name,
          author_url: data.author_name,
          thumbnail_url: data.thumbnail_url,
          video_url: `https://www.youtube.com/watch?v=${id}`
        }, null, 2)
      };
    }
    return { success: false, output: "", error: "Could not fetch video info" };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}
async function youtubeSearch(query, limit2 = 10) {
  try {
    const { searxngSearch: searxngSearch2 } = await Promise.resolve().then(() => (init_search(), exports_search));
    const result = await searxngSearch2(`${query} site:youtube.com`, limit2);
    if (result.success && result.results) {
      const videos = result.results.map((r) => ({
        title: r.title,
        url: r.url,
        snippet: r.snippet
      }));
      return { success: true, output: JSON.stringify(videos, null, 2) };
    }
    return { success: false, output: "", error: result.error };
  } catch (e) {
    return { success: false, output: "", error: e.message };
  }
}
async function youtubeSummarize(transcript, maxWords = 500) {
  const sentences = transcript.split(/[.!?]+/).filter((s2) => s2.trim().length > 20);
  const words = transcript.split(/\s+/);
  if (words.length <= maxWords) {
    return { success: true, output: transcript };
  }
  const summaryCount = Math.ceil(sentences.length * 0.3);
  const summary = sentences.slice(0, summaryCount).join(". ").trim();
  return {
    success: true,
    output: summary || transcript.slice(0, maxWords * 5)
  };
}
function extractVideoId(input) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match)
      return match[1];
  }
  return null;
}

// src/engi/indexer.ts
import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
var EXTENSION_LANGUAGE_MAP = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".py": "python",
  ".java": "java",
  ".go": "go",
  ".rs": "rust",
  ".rb": "ruby",
  ".php": "php",
  ".cs": "csharp",
  ".cpp": "cpp",
  ".c": "c",
  ".swift": "swift",
  ".kt": "kotlin",
  ".scala": "scala"
};
var IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".venv",
  "vendor",
  "__pycache__",
  ".next",
  ".nuxt",
  "out"
]);
var TEST_PATTERNS = new Set(["test", "spec", "__tests__", "tests"]);
var TEST_EXTS = new Set([".test.", ".spec."]);
var CONFIG_EXTS = new Set([".json", ".yaml", ".yml", ".toml", ".ini", ".conf"]);
var DOC_PATTERNS = new Set(["readme", "changelog", "contributing", "license", "api", "guide", "docs"]);
var DOC_EXTS = new Set([".md", ".rst", ".adoc"]);
var SOURCE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs"]);
var TS_EXPORT_NAMED = /export\s+(?:const|function|class|interface|type|let|var)\s+(\w+)/g;
var TS_EXPORT_DEFAULT = /export\s+default\s+(\w+)/g;
var TS_EXPORT_BLOCK = /export\s*\{\s*([^}]+)\s*\}/g;
var TS_IMPORT = /import\s+(?:\{\s*[^}]+\s*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
var TS_REQUIRE = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
var TS_FUNC = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
var TS_CLASS = /(?:export\s+)?class\s+(\w+)/g;
var TS_INTERFACE = /(?:export\s+)?interface\s+(\w+)/g;
var TS_CONST = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=/g;
var PY_DEF = /(?:^|\n)\s*(?:def|class)\s+(\w+)/gm;
var PY_IMPORT = /(?:^|\n)\s*import\s+([^\n]+)|(?:^|\n)\s*from\s+([^\n]+)\s+import/gm;

class RepoIndexer {
  index = null;
  indexing = null;
  async indexRepository(rootPath) {
    if (this.indexing)
      return this.indexing;
    this.indexing = this._doIndex(rootPath).finally(() => {
      this.indexing = null;
    });
    return this.indexing;
  }
  getIndex() {
    return this.index;
  }
  clearIndex() {
    this.index = null;
    this.indexing = null;
  }
  async _doIndex(rootPath) {
    if (!fs.existsSync(rootPath)) {
      throw new Error(`Path does not exist: ${rootPath}`);
    }
    const allFiles = await this.scanDirectoryAsync(rootPath);
    const results = await Promise.all(allFiles.map((filePath) => this.processFile(filePath, rootPath)));
    const files = new Map;
    const symbols = new Map;
    const imports = [];
    const tests = [];
    const docs = [];
    for (const result of results) {
      if (!result)
        continue;
      files.set(result.entry.path, result.entry);
      if (result.symbols.length > 0)
        symbols.set(result.entry.path, result.symbols);
      imports.push(...result.imports);
      if (result.test)
        tests.push(result.test);
      if (result.doc)
        docs.push(result.doc);
    }
    this.index = { files, symbols, imports, tests, docs, rootPath, lastIndexed: Date.now() };
    return this.index;
  }
  async processFile(filePath, rootPath) {
    try {
      const stats = await fsPromises.stat(filePath);
      if (!stats.isFile())
        return null;
      const relativePath = path.relative(rootPath, filePath);
      const ext = path.extname(filePath).toLowerCase();
      const language = EXTENSION_LANGUAGE_MAP[ext] || "unknown";
      const baseName = path.basename(filePath).toLowerCase();
      const type = this.classifyFile(baseName, ext);
      let content = "";
      const needsContent = (language === "typescript" || language === "javascript" || language === "python") && (type === "source" || type === "test");
      if (needsContent) {
        content = await fsPromises.readFile(filePath, "utf-8");
      }
      const { exports: fileExports, imports: fileImports } = content ? this.extractExportsImports(content, language) : { exports: [], imports: [] };
      const fileSymbols = content ? this.extractSymbols(content, language, filePath) : [];
      const entry = {
        path: relativePath,
        name: path.basename(filePath, ext),
        extension: ext,
        type,
        language,
        size: stats.size,
        lastModified: stats.mtimeMs,
        exports: fileExports,
        imports: fileImports
      };
      const importEdges = fileImports.map((imp) => ({
        from: relativePath,
        to: imp,
        types: ["import"]
      }));
      const test = type === "test" ? this.createTestEntry(filePath, relativePath) : undefined;
      const doc = type === "doc" ? this.createDocEntry(filePath, relativePath) : undefined;
      return { entry, symbols: fileSymbols, imports: importEdges, test, doc };
    } catch {
      return null;
    }
  }
  async scanDirectoryAsync(dirPath) {
    const results = [];
    try {
      const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
      const subdirs = [];
      for (const entry of entries) {
        if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith("."))
          continue;
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          subdirs.push(this.scanDirectoryAsync(fullPath));
        } else {
          results.push(fullPath);
        }
      }
      const nested = await Promise.all(subdirs);
      for (const sub of nested)
        results.push(...sub);
    } catch {}
    return results;
  }
  classifyFile(baseName, ext) {
    for (const p of TEST_PATTERNS) {
      if (baseName.includes(p))
        return "test";
    }
    for (const p of TEST_EXTS) {
      if (baseName.includes(p))
        return "test";
    }
    if (CONFIG_EXTS.has(ext))
      return "config";
    if (DOC_EXTS.has(ext))
      return "doc";
    for (const p of DOC_PATTERNS) {
      if (baseName.includes(p))
        return "doc";
    }
    if (SOURCE_EXTS.has(ext))
      return "source";
    return "other";
  }
  extractExportsImports(content, language) {
    const exports = [];
    const imports = [];
    if (language === "typescript" || language === "javascript") {
      let rx, match;
      rx = new RegExp(TS_EXPORT_NAMED.source, "g");
      while ((match = rx.exec(content)) !== null)
        exports.push(match[1]);
      rx = new RegExp(TS_EXPORT_DEFAULT.source, "g");
      while ((match = rx.exec(content)) !== null)
        exports.push(match[1]);
      rx = new RegExp(TS_EXPORT_BLOCK.source, "g");
      while ((match = rx.exec(content)) !== null) {
        exports.push(...match[1].split(",").map((s2) => s2.trim()).filter(Boolean));
      }
      rx = new RegExp(TS_IMPORT.source, "g");
      while ((match = rx.exec(content)) !== null) {
        if (match[1])
          imports.push(match[1]);
      }
      rx = new RegExp(TS_REQUIRE.source, "g");
      while ((match = rx.exec(content)) !== null) {
        if (match[1])
          imports.push(match[1]);
      }
    } else if (language === "python") {
      let rx, match;
      rx = new RegExp(PY_DEF.source, "gm");
      while ((match = rx.exec(content)) !== null)
        exports.push(match[1]);
      rx = new RegExp(PY_IMPORT.source, "gm");
      while ((match = rx.exec(content)) !== null) {
        const m = match[1] || match[2];
        if (m)
          imports.push(m);
      }
    }
    return { exports, imports };
  }
  extractSymbols(content, language, filePath) {
    const symbols = [];
    if (language !== "typescript" && language !== "javascript")
      return symbols;
    const push2 = (name, type, idx, exported) => {
      symbols.push({ name, type, file: filePath, line: this.lineAt(content, idx), exported });
    };
    let rx, match;
    rx = new RegExp(TS_FUNC.source, "g");
    while ((match = rx.exec(content)) !== null) {
      push2(match[1], "function", match.index, content.slice(Math.max(0, match.index - 20), match.index).includes("export"));
    }
    rx = new RegExp(TS_CLASS.source, "g");
    while ((match = rx.exec(content)) !== null) {
      push2(match[1], "class", match.index, content.slice(Math.max(0, match.index - 20), match.index).includes("export"));
    }
    rx = new RegExp(TS_INTERFACE.source, "g");
    while ((match = rx.exec(content)) !== null) {
      push2(match[1], "interface", match.index, content.slice(Math.max(0, match.index - 20), match.index).includes("export"));
    }
    rx = new RegExp(TS_CONST.source, "g");
    while ((match = rx.exec(content)) !== null) {
      push2(match[1], "constant", match.index, content.slice(Math.max(0, match.index - 20), match.index).includes("export"));
    }
    return symbols;
  }
  lineAt(content, index) {
    let line = 0;
    for (let i = 0;i < index; i++) {
      if (content[i] === `
`)
        line++;
    }
    return line;
  }
  createTestEntry(filePath, relativePath) {
    const name = path.basename(filePath);
    let type = "unit";
    if (name.includes("integration"))
      type = "integration";
    else if (name.includes("e2e") || name.includes("end-to-end"))
      type = "e2e";
    return { path: relativePath, name, type, targetSymbols: [] };
  }
  createDocEntry(filePath, relativePath) {
    const name = path.basename(filePath).toLowerCase();
    let type = "other";
    if (name.startsWith("readme"))
      type = "readme";
    else if (name.includes("changelog") || name.includes("history"))
      type = "changelog";
    else if (name.includes("api"))
      type = "api";
    else if (name.includes("guide") || name.includes("docs"))
      type = "guide";
    return { path: relativePath, name: path.basename(filePath), type, sections: [] };
  }
}
var indexerInstance = null;
function getIndexer() {
  if (!indexerInstance)
    indexerInstance = new RepoIndexer;
  return indexerInstance;
}
async function indexRepository(rootPath) {
  return getIndexer().indexRepository(rootPath);
}

// src/engi/retrieval.ts
var STOP_WORDS = new Set([
  "function",
  "class",
  "method",
  "variable",
  "const",
  "let",
  "var",
  "return",
  "import",
  "export",
  "async",
  "await",
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "type",
  "interface",
  "new",
  "not"
]);

class RetrievalEngine {
  async findScope(query) {
    const index = getIndexer().getIndex();
    if (!index)
      return { files: [], modules: [], symbols: [], tests: [], docs: [], confidence: 0 };
    const limit2 = query.limit || 10;
    const keywords = this.normalizeKeywords(query.task, query.keywords || []);
    const rankedFiles = this.rankFiles(index.files, keywords, query.taskType);
    const topFiles = rankedFiles.slice(0, limit2).map((r) => r.file);
    const topFilePathSet = new Set(topFiles.map((f) => f.path));
    const topModules = new Set(topFiles.map((f) => f.path.split("/")[0] ?? "root"));
    const [symbols, tests, docs] = [
      this.findRelevantSymbols(index.symbols, keywords, topFilePathSet),
      this.findRelevantTests(index.tests, topFiles, topModules),
      this.findRelevantDocs(index.docs, keywords, topModules)
    ];
    return {
      files: topFiles,
      modules: [...topModules],
      symbols,
      tests,
      docs,
      confidence: this.calculateConfidence(rankedFiles.slice(0, limit2), keywords)
    };
  }
  async findByImport(importPath) {
    const index = getIndexer().getIndex();
    if (!index)
      return null;
    for (const [p, file] of index.files) {
      if (p === importPath || p.endsWith(importPath))
        return file;
    }
    const importName = importPath.split("/").pop() || "";
    for (const [, file] of index.files) {
      if (file.name === importName)
        return file;
    }
    return null;
  }
  async findRelatedTests(filePath) {
    const index = getIndexer().getIndex();
    if (!index)
      return [];
    const baseName = filePath.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
    const dir = filePath.substring(0, filePath.lastIndexOf("/"));
    const seen = new Set;
    const results = [];
    for (const t of index.tests) {
      if (seen.has(t.path))
        continue;
      if (t.targetFile === filePath || t.name.includes(baseName)) {
        results.push(t);
        seen.add(t.path);
      }
    }
    for (const t of index.tests) {
      if (!seen.has(t.path) && t.path.startsWith(dir)) {
        results.push(t);
        seen.add(t.path);
      }
    }
    return results;
  }
  async findDependents(filePath) {
    const index = getIndexer().getIndex();
    if (!index)
      return [];
    const dependents = [];
    for (const [, file] of index.files) {
      if (file.imports.some((imp) => imp === filePath || imp.endsWith(filePath))) {
        dependents.push(file);
      }
    }
    return dependents;
  }
  normalizeKeywords(task, extra) {
    const words = task.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/);
    const combined = new Set;
    for (const w of words) {
      if (w.length > 2 && !STOP_WORDS.has(w))
        combined.add(w);
    }
    for (const k of extra) {
      const kl = k.toLowerCase();
      if (!STOP_WORDS.has(kl))
        combined.add(kl);
    }
    return [...combined];
  }
  rankFiles(files, keywords, taskType) {
    const scored = [];
    const isDocTask = taskType === "documentation";
    const isBugOrFeature = taskType === "bug" || taskType === "feature";
    for (const [filePath, file] of files) {
      if (!isDocTask && file.type !== "source" && file.type !== "test")
        continue;
      let score = 0;
      const reasons = [];
      const lowerPath = filePath.toLowerCase();
      const lowerName = file.name.toLowerCase();
      const lowerExports = file.exports.map((e) => e.toLowerCase());
      for (const kw of keywords) {
        if (lowerPath.includes(kw) || lowerName.includes(kw)) {
          score += 10;
          reasons.push(`path:${kw}`);
        }
        for (const exp of lowerExports) {
          if (exp.includes(kw)) {
            score += 15;
            reasons.push(`export:${kw}`);
            break;
          }
        }
      }
      if (isBugOrFeature && file.type === "source") {
        score += 5;
        reasons.push("source");
      }
      if (taskType === "bug" && file.type === "test") {
        score += 8;
        reasons.push("test");
      }
      if (isDocTask && file.type === "doc") {
        score += 20;
        reasons.push("doc");
      }
      if (score > 0)
        scored.push({ file, score, reason: reasons.join(",") });
    }
    return scored.sort((a, b) => b.score - a.score);
  }
  findRelevantSymbols(symbols, keywords, topFilePathSet) {
    const relevant = [];
    for (const [, fileSymbols] of symbols) {
      for (const sym of fileSymbols) {
        if (!topFilePathSet.has(sym.file))
          continue;
        const lname = sym.name.toLowerCase();
        for (const kw of keywords) {
          if (lname.includes(kw)) {
            relevant.push(sym);
            break;
          }
        }
        if (relevant.length >= 20)
          return relevant;
      }
    }
    return relevant;
  }
  findRelevantTests(tests, topFiles, topModules) {
    const topFilePaths = new Set(topFiles.map((f) => f.path));
    const relevant = [];
    const seen = new Set;
    for (const test of tests) {
      if (seen.has(test.path))
        continue;
      const inScope = test.targetFile && topFilePaths.has(test.targetFile) || topModules.has(test.path.split("/")[0] ?? "");
      if (inScope) {
        relevant.push(test);
        seen.add(test.path);
      }
      if (relevant.length >= 10)
        break;
    }
    return relevant;
  }
  findRelevantDocs(docs, keywords, topModules) {
    const relevant = [];
    const seen = new Set;
    for (const doc of docs) {
      if (seen.has(doc.path))
        continue;
      const lname = doc.name.toLowerCase();
      const lpath = doc.path.toLowerCase();
      const keyMatch = keywords.some((kw) => lname.includes(kw) || lpath.includes(kw));
      const modMatch = topModules.has(doc.path.split("/")[0] ?? "");
      if (keyMatch || modMatch) {
        relevant.push(doc);
        seen.add(doc.path);
      }
      if (relevant.length >= 5)
        break;
    }
    return relevant;
  }
  calculateConfidence(rankedFiles, keywords) {
    if (rankedFiles.length === 0 || keywords.length === 0)
      return 0;
    const avgScore = rankedFiles.reduce((s2, r) => s2 + r.score, 0) / rankedFiles.length;
    const maxPossible = keywords.length * 25;
    return Math.round(Math.min(avgScore / maxPossible, 1) * 100) / 100;
  }
}
var retrievalInstance = null;
function getRetrievalEngine() {
  if (!retrievalInstance)
    retrievalInstance = new RetrievalEngine;
  return retrievalInstance;
}

// src/engi/summarizer.ts
import * as path3 from "path";

// src/engi/rag.ts
import * as fs2 from "fs";
import * as path2 from "path";
var MAX_CHUNK_LINES = 40;
var MAX_SNIPPET_LINES = 12;
var MAX_RESULTS = 5;
var MIN_SCORE = 0.05;
var STOP = new Set([
  "function",
  "class",
  "method",
  "const",
  "let",
  "var",
  "return",
  "import",
  "export",
  "async",
  "await",
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "type",
  "interface",
  "new",
  "not",
  "if",
  "else",
  "try",
  "catch",
  "throw",
  "get",
  "set",
  "public",
  "private",
  "protected",
  "readonly",
  "static",
  "void",
  "any",
  "true",
  "false",
  "null",
  "undefined",
  "string",
  "number",
  "boolean",
  "object",
  "array"
]);
var CHUNK_START_RE = /^(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|class\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(|(?:  |\t)(?:async\s+)?(\w+)\s*\()/;
var chunkCache = null;

class RagEngine {
  retrieve(query, index, options = {}) {
    const chunks = this.getChunks(index);
    const topK = options.topK ?? MAX_RESULTS;
    const fileSet = options.files ? new Set(options.files) : null;
    const queryTerms = extractTerms(query);
    if (queryTerms.size === 0)
      return [];
    const scored = [];
    for (const chunk of chunks) {
      if (fileSet && !fileSet.has(chunk.file))
        continue;
      const { score, reason } = scoreChunk(queryTerms, chunk.terms, chunk.symbol);
      if (score >= MIN_SCORE)
        scored.push({ chunk, score, reason });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map(({ chunk, score, reason }) => ({
      file: chunk.file,
      symbol: chunk.symbol,
      snippet: trimSnippet(chunk.content, MAX_SNIPPET_LINES),
      score: Math.round(score * 100) / 100,
      reason
    }));
  }
  retrieveByLiteral(literals, index, options = {}) {
    const chunks = this.getChunks(index);
    const topK = options.topK ?? MAX_RESULTS;
    const fileSet = options.files ? new Set(options.files) : null;
    const lits = literals.map((l) => l.toLowerCase());
    const scored = [];
    for (const chunk of chunks) {
      if (fileSet && !fileSet.has(chunk.file))
        continue;
      const lower = chunk.content.toLowerCase();
      const hits = lits.filter((l) => lower.includes(l));
      if (hits.length > 0) {
        const score = hits.length / lits.length;
        scored.push({ chunk, score, reason: `literal:${hits.slice(0, 3).join(",")}` });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map(({ chunk, score, reason }) => ({
      file: chunk.file,
      symbol: chunk.symbol,
      snippet: trimSnippet(chunk.content, MAX_SNIPPET_LINES),
      score: Math.round(score * 100) / 100,
      reason
    }));
  }
  getChunks(index) {
    if (chunkCache && chunkCache.indexedAt === index.lastIndexed) {
      return chunkCache.chunks;
    }
    const chunks = buildChunkIndex(index);
    chunkCache = { chunks, indexedAt: index.lastIndexed };
    return chunks;
  }
}
function buildChunkIndex(index) {
  const chunks = [];
  for (const [filePath, file] of index.files) {
    if (file.type !== "source" && file.type !== "test")
      continue;
    if (!["typescript", "javascript", "python", "go"].includes(file.language))
      continue;
    const absPath = path2.join(index.rootPath, filePath);
    let content;
    try {
      content = fs2.readFileSync(absPath, "utf-8");
    } catch {
      continue;
    }
    const fileChunks = extractChunks(content, filePath, file.language);
    chunks.push(...fileChunks);
  }
  return chunks;
}
function extractChunks(content, filePath, language) {
  const lines = content.split(`
`);
  const chunks = [];
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i];
    const match = CHUNK_START_RE.exec(line);
    if (!match)
      continue;
    const symbol = match[1] || match[2] || match[3] || match[4];
    if (!symbol || symbol.length < 2)
      continue;
    const type = line.includes("class ") ? "class" : match[4] ? "method" : line.includes("function") || line.includes("=>") || line.includes("= (") ? "function" : "block";
    const bodyLines = extractBody(lines, i, MAX_CHUNK_LINES);
    if (bodyLines.length < 2)
      continue;
    const chunkContent = bodyLines.join(`
`);
    chunks.push({
      file: filePath,
      symbol,
      type,
      startLine: i + 1,
      content: chunkContent,
      tokens: estimateChunkTokens(chunkContent),
      terms: extractTerms(chunkContent + " " + symbol)
    });
  }
  return chunks;
}
function extractBody(lines, startIdx, maxLines) {
  const body = [lines[startIdx]];
  let depth = 0;
  let started = false;
  for (let i = startIdx;i < Math.min(lines.length, startIdx + maxLines); i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === "{" || ch === "(") {
        depth++;
        started = true;
      } else if (ch === "}" || ch === ")")
        depth--;
    }
    if (i > startIdx)
      body.push(line);
    if (started && depth <= 0)
      break;
  }
  return body;
}
function scoreChunk(queryTerms, chunkTerms, symbol) {
  let score = 0;
  const hits = [];
  const symbolLower = symbol.toLowerCase();
  for (const [term, qFreq] of queryTerms) {
    const cFreq = chunkTerms.get(term) ?? 0;
    if (cFreq > 0) {
      const idfBoost = term.length > 5 ? 1.5 : 1;
      score += Math.min(qFreq, cFreq) * idfBoost;
      hits.push(term);
    }
    if (symbolLower.includes(term) || term.includes(symbolLower)) {
      score += 3;
      if (!hits.includes(term))
        hits.push(`sym:${term}`);
    }
  }
  const normalized = score / Math.max(queryTerms.size, 1);
  return { score: normalized, reason: hits.slice(0, 4).join(",") };
}
function extractTerms(text) {
  const freq = new Map;
  const words = text.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().split(/[^\w]+/);
  for (const w of words) {
    if (w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return freq;
}
function trimSnippet(content, maxLines) {
  const lines = content.split(`
`);
  if (lines.length <= maxLines)
    return content;
  return lines.slice(0, maxLines).join(`
`) + `
  // ...`;
}
function estimateChunkTokens(content) {
  return Math.ceil(content.length / 4);
}
var ragInstance = null;
function getRagEngine() {
  if (!ragInstance)
    ragInstance = new RagEngine;
  return ragInstance;
}

// src/engi/summarizer.ts
var FLOW_MAX_SNIPPETS = 4;
var BUG_MAX_SNIPPETS = 3;
var DOC_MAX_EXAMPLES = 3;
var SNIPPET_MAX_LINES = 10;

class SummarizationEngine {
  async generateFlowSummary(options) {
    const index = getIndexer().getIndex();
    if (!index)
      return this.emptyFlowSummary();
    const files = options.scope ? options.scope.map((p) => index.files.get(p)).filter(Boolean) : Array.from(index.files.values()).filter((f) => f.type === "source").slice(0, 10);
    if (files.length === 0)
      return this.emptyFlowSummary();
    const verbosity = options.verbosity ?? "standard";
    const steps = [];
    const keySymbols = [];
    const scopePaths = files.map((f) => f.path);
    const scopeQuery = scopePaths.map((p) => path3.basename(p, path3.extname(p))).join(" ");
    const ragChunks = getRagEngine().retrieve(scopeQuery, index, {
      files: scopePaths,
      topK: FLOW_MAX_SNIPPETS
    });
    const bestChunk = new Map;
    for (const c2 of ragChunks) {
      if (!bestChunk.has(c2.file))
        bestChunk.set(c2.file, c2.snippet);
    }
    for (let i = 0;i < files.length; i++) {
      const file = files[i];
      const importedBy = this.getFilesImporting(file.path, index);
      const topExports = file.exports.slice(0, 3).join(", ");
      let description;
      if (i === 0) {
        description = `Entry: ${file.name}` + (topExports ? ` \u2014 exports ${topExports}` : "");
      } else if (importedBy.length > 0) {
        description = `${file.name} used by ${importedBy.length} file(s)` + (topExports ? ` \xB7 exports ${topExports}` : "");
      } else {
        description = `${file.name}` + (topExports ? ` \u2014 exports ${topExports}` : "");
      }
      const step = {
        order: i + 1,
        description,
        file: file.path,
        symbol: file.exports[0]
      };
      if (verbosity !== "minimal" && bestChunk.has(file.path)) {
        step.snippet = limitLines(bestChunk.get(file.path), SNIPPET_MAX_LINES);
      }
      steps.push(step);
      const symbols = index.symbols.get(file.path) ?? [];
      for (const sym of symbols.slice(0, 3))
        keySymbols.push(`${sym.name} (${sym.type})`);
    }
    return {
      summary: this.generateSummaryText(steps, verbosity),
      steps,
      keyFiles: files.map((f) => f.path),
      keySymbols: keySymbols.slice(0, 12),
      entryPoint: options.entryPoint ?? files[0]?.path,
      handle: this.generateHandle("flow", scopePaths.join(","))
    };
  }
  async traceBug(symptom, scope) {
    const index = getIndexer().getIndex();
    if (!index)
      return this.emptyBugTrace();
    const symptomLower = symptom.toLowerCase();
    const likelyCauses = [];
    const suspectFiles = new Set;
    const suspectSymbols = [];
    if (symptomLower.match(/null|undefined|cannot read|is not a function/)) {
      likelyCauses.push({
        type: "null_undefined",
        likelihood: 0.85,
        description: "Null/undefined access \u2014 check for missing null guards before dereferencing"
      });
    }
    if (symptomLower.match(/race|timing|async|concurrent|await/)) {
      likelyCauses.push({
        type: "race_condition",
        likelihood: 0.75,
        description: "Race condition or unresolved async \u2014 ensure all async paths are awaited"
      });
    }
    if (symptomLower.match(/type|cast|instanceof|assign/)) {
      likelyCauses.push({
        type: "type_mismatch",
        likelihood: 0.65,
        description: "Type mismatch \u2014 verify type assertions and interface contracts"
      });
    }
    if (symptomLower.match(/loop|infinite|timeout|hang/)) {
      likelyCauses.push({
        type: "logic_error",
        likelihood: 0.7,
        description: "Logic error in loop or termination condition"
      });
    }
    if (symptomLower.match(/state|stale|cache|invalidat/)) {
      likelyCauses.push({
        type: "unsafe_state",
        likelihood: 0.7,
        description: "Stale or incorrectly invalidated state \u2014 check cache write-through and eviction"
      });
    }
    const scopePaths = scope ?? [];
    const keywords = extractKeywords(symptom);
    const ragByLit = getRagEngine().retrieveByLiteral(keywords, index, {
      files: scopePaths.length > 0 ? scopePaths : undefined,
      topK: BUG_MAX_SNIPPETS
    });
    const ragBySem = getRagEngine().retrieve(symptom, index, {
      files: scopePaths.length > 0 ? scopePaths : undefined,
      topK: BUG_MAX_SNIPPETS
    });
    const seen = new Set;
    const topRag = [...ragByLit, ...ragBySem].filter((c2) => {
      const key = `${c2.file}:${c2.symbol}`;
      if (seen.has(key))
        return false;
      seen.add(key);
      return true;
    }).slice(0, BUG_MAX_SNIPPETS);
    for (let i = 0;i < topRag.length; i++) {
      const chunk = topRag[i];
      suspectFiles.add(chunk.file);
      suspectSymbols.push(`${chunk.symbol} in ${chunk.file}`);
      if (i < likelyCauses.length) {
        likelyCauses[i].file = chunk.file;
        likelyCauses[i].symbol = chunk.symbol;
        likelyCauses[i].snippet = limitLines(chunk.snippet, SNIPPET_MAX_LINES);
      } else {
        likelyCauses.push({
          type: "other",
          likelihood: Math.max(0.3, chunk.score),
          description: `Relevant code in ${chunk.symbol} (${chunk.file}) \u2014 ${chunk.reason}`,
          file: chunk.file,
          symbol: chunk.symbol,
          snippet: limitLines(chunk.snippet, SNIPPET_MAX_LINES)
        });
      }
    }
    if (suspectFiles.size === 0) {
      const targetFiles = scope ? scope.map((p) => index.files.get(p)).filter(Boolean) : Array.from(index.files.values()).filter((f) => f.type === "source").slice(0, 20);
      for (const file of targetFiles) {
        if (file.imports.length > 10 || file.exports.length > 10)
          suspectFiles.add(file.path);
      }
    }
    const confidence = Math.min(likelyCauses.length * 0.2 + (topRag.length > 0 ? 0.25 : 0.1), 0.95);
    return {
      likelyCauses,
      suspectFiles: [...suspectFiles].slice(0, 10),
      suspectSymbols: suspectSymbols.slice(0, 10),
      confidence,
      handle: this.generateHandle("bug", symptom)
    };
  }
  async buildDocContext(options) {
    const index = getIndexer().getIndex();
    if (!index)
      return this.emptyDocContext();
    const featureSummary = options.feature ?? "Codebase overview";
    const codeReferences = [];
    const examples = [];
    const targetFiles = options.changedFiles ? options.changedFiles.map((p) => index.files.get(p)).filter(Boolean) : Array.from(index.files.values()).filter((f) => f.type === "source").slice(0, 5);
    for (const file of targetFiles) {
      codeReferences.push({
        file: file.path,
        symbol: file.exports[0],
        description: `${file.exports.length} exports: ${file.exports.slice(0, 4).join(", ")}`
      });
    }
    const ragQuery = featureSummary + " " + (options.changedFiles ?? []).map((f) => path3.basename(f, path3.extname(f))).join(" ");
    const scopePaths = targetFiles.map((f) => f.path);
    const ragChunks = getRagEngine().retrieve(ragQuery, index, {
      files: scopePaths,
      topK: DOC_MAX_EXAMPLES
    });
    for (const chunk of ragChunks) {
      const fileEntry = index.files.get(chunk.file);
      if (!fileEntry)
        continue;
      examples.push({
        title: `${chunk.symbol} \u2014 ${chunk.file}`,
        code: limitLines(chunk.snippet, SNIPPET_MAX_LINES),
        language: fileEntry.language
      });
    }
    const audienceNotes = {};
    const aud = options.audience ?? "developer";
    audienceNotes[aud] = this.generateAudienceNote(aud, codeReferences);
    const totalExports = codeReferences.reduce((s2, r) => {
      const m = r.description.match(/\d+/);
      return s2 + (m ? parseInt(m[0], 10) : 0);
    }, 0);
    return {
      featureSummary,
      currentBehavior: `${targetFiles.length} files \xB7 ${totalExports} total exports${ragChunks.length > 0 ? ` \xB7 ${ragChunks.length} code snippet(s) attached` : ""}`,
      codeReferences,
      examples: examples.slice(0, DOC_MAX_EXAMPLES),
      audienceNotes,
      handle: this.generateHandle("doc", options.feature ?? "overview")
    };
  }
  emptyFlowSummary() {
    return { summary: "No codebase indexed. Use repo_scope_find to index a repository first.", steps: [], keyFiles: [], keySymbols: [], handle: undefined };
  }
  emptyBugTrace() {
    return { likelyCauses: [], suspectFiles: [], suspectSymbols: [], confidence: 0, handle: undefined };
  }
  emptyDocContext() {
    return { featureSummary: "", currentBehavior: "", codeReferences: [], examples: [], audienceNotes: {}, handle: undefined };
  }
  generateSummaryText(steps, verbosity) {
    if (verbosity === "minimal" || steps.length === 0)
      return `${steps.length} files in flow`;
    if (verbosity === "standard")
      return `Flow overview:
${steps.map((s2) => `${s2.order}. ${s2.description}`).join(`
`)}`;
    return `Code flow (${steps.length} files):

${steps.map((s2) => `${s2.order}. ${s2.description}
   ${s2.file}${s2.snippet ? `
` + indent(s2.snippet, "   ") : ""}`).join(`

`)}`;
  }
  getFilesImporting(filePath, index) {
    const importers = [];
    for (const [p, file] of index.files) {
      if (file.imports.some((imp) => imp === filePath || p.endsWith(imp)))
        importers.push(p);
    }
    return importers;
  }
  generateHandle(prefix, data) {
    const hash = data.split("").reduce((acc, ch) => (acc << 5) - acc + ch.charCodeAt(0), 0);
    return `${prefix}_${Math.abs(hash).toString(36)}`;
  }
  generateAudienceNote(audience, refs) {
    switch (audience) {
      case "junior":
        return `Start with: ${refs.slice(0, 2).map((r) => r.file).join(", ")}. Focus on the exported functions.`;
      case "senior":
        return `Key files: ${refs.map((r) => r.file).join(", ")}. Review architecture and side-effects.`;
      case "api":
        return `Public surface: ${refs.flatMap((r) => r.description.replace(/^\d+ exports: /, "").split(", ")).slice(0, 8).join(", ")}`;
      case "pm":
        return `${refs.length} components changed. Each exposes: ${refs.map((r) => r.file.split("/").pop()).join(", ")}`;
      case "qa":
        return `Test entry points: ${refs.map((r) => r.symbol ?? r.file).join(", ")}`;
      default:
        return `${refs.length} main files to review.`;
    }
  }
}
function limitLines(text, max) {
  const lines = text.split(`
`);
  return lines.length <= max ? text : lines.slice(0, max).join(`
`) + `
  // ...`;
}
function indent(text, prefix) {
  return text.split(`
`).map((l) => prefix + l).join(`
`);
}
function extractKeywords(text) {
  const quoted = [...text.matchAll(/'([^']+)'|"([^"]+)"/g)].map((m) => m[1] ?? m[2]);
  const errCodes = text.match(/[A-Z][A-Z0-9_]{3,}/g) ?? [];
  const words = text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 5);
  return [...new Set([...quoted, ...errCodes, ...words])].slice(0, 12);
}
var summarizationInstance = null;
function getSummarizationEngine() {
  if (!summarizationInstance)
    summarizationInstance = new SummarizationEngine;
  return summarizationInstance;
}

// src/engi/memory.ts
import * as fs3 from "fs";

class MemoryStore {
  checkpoints = new Map;
  taskIndex = new Map;
  storagePath = null;
  initialize(options) {
    if (options?.storagePath) {
      this.storagePath = options.storagePath;
      this.load();
    }
  }
  saveCheckpoint(checkpoint) {
    const full = { ...checkpoint, id: this.generateId(), timestamp: Date.now() };
    this.checkpoints.set(full.id, full);
    const ids = this.taskIndex.get(full.taskId) ?? [];
    ids.push(full.id);
    this.taskIndex.set(full.taskId, ids);
    this.persist();
    return full;
  }
  getCheckpoint(id) {
    return this.checkpoints.get(id) ?? null;
  }
  getAllCheckpoints() {
    return [...this.checkpoints.values()];
  }
  getLatestForTask(taskId) {
    const ids = this.taskIndex.get(taskId);
    if (!ids || ids.length === 0)
      return null;
    return this.checkpoints.get(ids[ids.length - 1]) ?? null;
  }
  deleteCheckpoint(id) {
    const cp = this.checkpoints.get(id);
    if (!cp)
      return false;
    this.checkpoints.delete(id);
    const ids = this.taskIndex.get(cp.taskId);
    if (ids) {
      const idx = ids.indexOf(id);
      if (idx !== -1)
        ids.splice(idx, 1);
      if (ids.length === 0)
        this.taskIndex.delete(cp.taskId);
    }
    this.persist();
    return true;
  }
  restore(id) {
    const checkpoint = this.getCheckpoint(id);
    if (!checkpoint)
      return null;
    return {
      checkpoint,
      currentScope: checkpoint.scope,
      progressSummary: this.buildProgressSummary(checkpoint),
      unresolvedItems: [...checkpoint.pendingValidations, ...checkpoint.pendingDocs]
    };
  }
  updateCheckpoint(id, updates) {
    const existing = this.checkpoints.get(id);
    if (!existing)
      return false;
    this.checkpoints.set(id, { ...existing, ...updates });
    this.persist();
    return true;
  }
  clear() {
    this.checkpoints.clear();
    this.taskIndex.clear();
    this.persist();
  }
  generateId() {
    return `cp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  buildProgressSummary(cp) {
    const parts = [
      `Task: ${cp.taskType}`,
      `Files in scope: ${cp.scope.files.length}`,
      `Decisions made: ${cp.decisions.length}`,
      `Risks identified: ${cp.risks.length}`
    ];
    if (cp.pendingValidations.length > 0)
      parts.push(`Pending validations: ${cp.pendingValidations.length}`);
    if (cp.pendingDocs.length > 0)
      parts.push(`Pending docs: ${cp.pendingDocs.length}`);
    return parts.join(" | ");
  }
  persist() {
    if (!this.storagePath)
      return;
    try {
      fs3.writeFileSync(this.storagePath, JSON.stringify([...this.checkpoints.entries()], null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist memory:", err);
    }
  }
  load() {
    if (!this.storagePath || !fs3.existsSync(this.storagePath))
      return;
    try {
      const entries = JSON.parse(fs3.readFileSync(this.storagePath, "utf-8"));
      this.checkpoints = new Map(entries);
      this.taskIndex.clear();
      for (const [id, cp] of this.checkpoints) {
        const ids = this.taskIndex.get(cp.taskId) ?? [];
        ids.push(id);
        this.taskIndex.set(cp.taskId, ids);
      }
    } catch (err) {
      console.error("Failed to load memory:", err);
    }
  }
}
function createCheckpoint(options) {
  return {
    taskId: options.taskId,
    taskType: options.taskType,
    scope: options.scope,
    decisions: options.decisions ?? [],
    risks: options.risks ?? [],
    pendingValidations: options.pendingValidations ?? [],
    pendingDocs: options.pendingDocs ?? [],
    notes: options.notes ?? ""
  };
}
var memoryStoreInstance = null;
function getMemoryStore() {
  if (!memoryStoreInstance)
    memoryStoreInstance = new MemoryStore;
  return memoryStoreInstance;
}

// src/engi/tools.ts
var STOP_WORDS2 = new Set([
  "function",
  "class",
  "method",
  "variable",
  "const",
  "let",
  "var",
  "return",
  "import",
  "export",
  "async",
  "await",
  "the",
  "and",
  "for",
  "with",
  "this",
  "that",
  "from",
  "type",
  "interface",
  "new",
  "not"
]);
async function engiTaskClassify(params) {
  const { task, keywords = [] } = params;
  const taskLower = task.toLowerCase();
  const detectedTypes = [];
  let confidence = 0;
  if (taskLower.includes("bug") || taskLower.includes("fix") || taskLower.includes("error") || taskLower.includes("crash") || taskLower.includes("fail") || taskLower.includes("issue")) {
    detectedTypes.push("bug");
    confidence += 0.8;
  }
  if (taskLower.includes("implement") || taskLower.includes("add") || taskLower.includes("new") || taskLower.includes("feature") || taskLower.includes("create")) {
    detectedTypes.push("feature");
    confidence += 0.7;
  }
  if (taskLower.includes("poc") || taskLower.includes("proof of concept") || taskLower.includes("prototype") || taskLower.includes("mockup")) {
    detectedTypes.push("poc");
    confidence += 0.9;
  }
  if (taskLower.includes("doc") || taskLower.includes("readme") || taskLower.includes("comment") || taskLower.includes("explain") || taskLower.includes("guide")) {
    detectedTypes.push("documentation");
    confidence += 0.8;
  }
  if (taskLower.includes("analyze") || taskLower.includes("understand") || taskLower.includes("how does") || taskLower.includes("what is")) {
    detectedTypes.push("analysis");
    confidence += 0.6;
  }
  if (detectedTypes.length === 0) {
    detectedTypes.push("analysis");
    confidence = 0.5;
  }
  let suggestedMode = "analysis";
  if (detectedTypes.includes("bug") || detectedTypes.includes("feature")) {
    suggestedMode = "planning";
  } else if (detectedTypes.includes("documentation")) {
    suggestedMode = "documentation";
  }
  const nextTools = [];
  if (suggestedMode === "analysis") {
    nextTools.push("engi_repo_scope_find", "engi_flow_summarize");
  } else if (suggestedMode === "planning") {
    nextTools.push("engi_repo_scope_find", "engi_implementation_plan");
  } else if (suggestedMode === "documentation") {
    nextTools.push("engi_doc_context_build", "engi_doc_update_plan");
  }
  confidence = Math.min(confidence, 1);
  return { types: detectedTypes, confidence, suggestedMode, nextTools };
}
async function engiRepoScopeFind(params) {
  const { task, taskType, keywords = [], limit: limit2 = 10, repoPath } = params;
  if (repoPath) {
    await indexRepository(repoPath);
  }
  const retrieval = getRetrievalEngine();
  return retrieval.findScope({ task, taskType, keywords, limit: limit2 });
}
async function engiFlowSummarize(params) {
  const summarizer = getSummarizationEngine();
  return summarizer.generateFlowSummary({
    scope: params.scope,
    entryPoint: params.entryPoint,
    verbosity: params.verbosity
  });
}
async function engiBugTraceCompact(params) {
  const summarizer = getSummarizationEngine();
  return summarizer.traceBug(params.symptom, params.scope);
}
async function engiImplementationPlan(params) {
  const { task, taskType, scope, existingPatterns = [] } = params;
  const steps = [];
  const editTargets = [];
  const requiredTests = [];
  const requiredDocs = [];
  const riskNotes = [];
  for (let i = 0;i < scope.length; i++) {
    const file = scope[i];
    if (taskType === "feature") {
      steps.push({ order: i + 1, description: `Implement in ${file}`, file, action: "modify" });
      editTargets.push({ file, description: `Add new functionality for: ${task}` });
    } else {
      steps.push({ order: i + 1, description: `Fix bug in ${file}`, file, action: "modify" });
      editTargets.push({ file, description: `Address the bug: ${task}` });
      riskNotes.push(`Potential regression risk in ${file}`);
    }
  }
  steps.push({
    order: steps.length + 1,
    description: "Create or update tests",
    file: scope[0] || "test file",
    action: "create",
    dependencies: steps.map((s2) => s2.file)
  });
  requiredTests.push(`${scope[0] || "source"}.test.ts`);
  if (taskType === "feature") {
    steps.push({ order: steps.length + 1, description: "Update documentation", file: "docs", action: "modify" });
    requiredDocs.push("README.md");
  }
  return {
    steps,
    editTargets,
    requiredTests,
    requiredDocs,
    riskNotes,
    handle: `plan_${Date.now()}`
  };
}
async function engiPOCPlan(params) {
  const { goal, constraints = [], existingCode = [] } = params;
  let minimalArchitecture = "Simple Node.js module";
  const filesToCreate = [];
  const shortcutsAllowed = [];
  const excludedScope = [];
  const goalLower = goal.toLowerCase();
  if (goalLower.includes("api") || goalLower.includes("endpoint")) {
    minimalArchitecture = "Simple Express/HTTP handler with minimal routing";
    filesToCreate.push("src/poc/handler.ts");
    shortcutsAllowed.push("Use in-memory storage", "Skip authentication");
    excludedScope.push("Database integration", "Complex validation");
  } else if (goalLower.includes("database") || goalLower.includes("storage")) {
    minimalArchitecture = "In-memory or file-based storage";
    filesToCreate.push("src/poc/storage.ts");
    shortcutsAllowed.push("Skip connection pooling");
    excludedScope.push("Production database");
  } else if (goalLower.includes("ui") || goalLower.includes("interface")) {
    minimalArchitecture = "Minimal UI component";
    filesToCreate.push("src/poc/Component.tsx");
    shortcutsAllowed.push("Skip styling", "Use mock data");
  } else {
    minimalArchitecture = "Simple module with core logic";
    filesToCreate.push("src/poc/index.ts");
    shortcutsAllowed.push("Skip error handling", "Skip logging");
  }
  for (const constraint of constraints) {
    const cLower = constraint.toLowerCase();
    if (cLower.includes("no auth"))
      excludedScope.push("Authentication");
    if (cLower.includes("simple"))
      excludedScope.push("Advanced features");
  }
  return {
    goal,
    minimalArchitecture,
    filesToCreate,
    shortcutsAllowed,
    excludedScope,
    mockStrategy: "Use hardcoded test data and in-memory implementations",
    handle: `poc_${Date.now()}`
  };
}
async function engiImpactAnalyze(params) {
  const { scope, changeType } = params;
  const indexer = getIndexer();
  const index = indexer.getIndex();
  const affectedFiles = [];
  const affectedModules = [];
  const affectedSymbols = [];
  const regressionNotes = [];
  const riskyPoints = [];
  const relatedTests = [];
  const docsImpact = [];
  if (!index) {
    return { affectedFiles: [], affectedModules: [], affectedSymbols: [], regressionNotes: ["No repository indexed"], riskyPoints: [], relatedTests: [], docsImpact: [] };
  }
  const retrieval = getRetrievalEngine();
  for (const filePath of scope) {
    const dependents = await retrieval.findDependents(filePath);
    for (const dep of dependents) {
      if (!affectedFiles.includes(dep.path))
        affectedFiles.push(dep.path);
    }
    const tests = await retrieval.findRelatedTests(filePath);
    for (const test of tests) {
      if (!relatedTests.includes(test.path))
        relatedTests.push(test.path);
    }
    const module = filePath.split("/")[0];
    if (!affectedModules.includes(module))
      affectedModules.push(module);
  }
  for (const file of affectedFiles) {
    const fileType = index.files.get(file)?.type;
    if (fileType === "source")
      regressionNotes.push(`Potential regression in: ${file}`);
  }
  if (changeType === "delete") {
    riskyPoints.push("Removing files may break dependent code", "Check for exposed APIs that depend on deleted code");
  } else if (changeType === "modify") {
    riskyPoints.push("Existing function signatures may affect callers", "Check for breaking changes in public exports");
  }
  for (const file of scope) {
    const module = file.split("/")[0];
    const moduleDocs = index.docs.filter((d) => d.path.startsWith(module) || d.path.includes(module));
    for (const doc of moduleDocs) {
      if (!docsImpact.includes(doc.path))
        docsImpact.push(doc.path);
    }
  }
  return { affectedFiles, affectedModules, affectedSymbols, regressionNotes, riskyPoints, relatedTests, docsImpact };
}
async function engiTestSelect(params) {
  const { scope, changeType = "modify" } = params;
  const retrieval = getRetrievalEngine();
  const requiredTests = [];
  const optionalTests = [];
  for (const filePath of scope) {
    const tests = await retrieval.findRelatedTests(filePath);
    for (const test of tests) {
      const testInfo = {
        path: test.path,
        type: test.type === "other" ? "unit" : test.type,
        targetCoverage: [filePath]
      };
      if (changeType !== "add") {
        if (!requiredTests.some((t) => t.path === test.path))
          requiredTests.push(testInfo);
      } else {
        if (!optionalTests.some((t) => t.path === test.path))
          optionalTests.push(testInfo);
      }
    }
  }
  let reason = `Found ${requiredTests.length} required and ${optionalTests.length} optional tests`;
  if (requiredTests.length === 0 && optionalTests.length === 0) {
    reason = "No direct tests found - consider writing new tests for changes";
  }
  return { requiredTests, optionalTests, reason };
}
async function engiDocContextBuild(params) {
  const summarizer = getSummarizationEngine();
  return summarizer.buildDocContext({
    feature: params.feature,
    changedFiles: params.changedFiles,
    audience: params.audience
  });
}
async function engiDocUpdatePlan(params) {
  const { changedFiles, existingDocs = [] } = params;
  const indexer = getIndexer();
  const index = indexer.getIndex();
  const docsToUpdate = [];
  const docsToCreate = [];
  const sectionsToUpdate = [];
  const examplesNeeded = [];
  if (!index) {
    return { docsToUpdate, docsToCreate, sectionsToUpdate, examplesNeeded };
  }
  const changedModules = new Set(changedFiles.map((f) => f.split("/")[0]));
  for (const doc of index.docs) {
    const docModule = doc.path.split("/")[0];
    if (changedModules.has(docModule) || changedFiles.some((f) => doc.path.includes(f))) {
      docsToUpdate.push({ path: doc.path, reason: `References changed module: ${docModule}` });
      sectionsToUpdate.push(`${doc.name} - ${docModule} section`);
    }
  }
  if (changedFiles.length > 0 && docsToUpdate.length === 0) {
    docsToCreate.push({ path: "docs/CHANGES.md", purpose: "Document changes in changed files" });
  }
  for (const file of changedFiles.slice(0, 3)) {
    const fileName = file.split("/").pop() || "";
    if (fileName && !fileName.includes("test")) {
      examplesNeeded.push(`Example usage of ${fileName.replace(/\.[^.]+$/, "")}`);
    }
  }
  return { docsToUpdate, docsToCreate, sectionsToUpdate, examplesNeeded };
}
async function engiMemoryCheckpoint(params) {
  const memory = getMemoryStore();
  const checkpointData = createCheckpoint({
    taskId: params.taskId,
    taskType: params.taskType,
    scope: {
      files: params.files,
      symbols: params.symbols || [],
      modules: params.modules || []
    },
    decisions: params.decisions?.map((d) => ({ ...d, timestamp: Date.now() })) || [],
    risks: params.risks || [],
    pendingValidations: params.pendingValidations || [],
    pendingDocs: params.pendingDocs || [],
    notes: params.notes || ""
  });
  return memory.saveCheckpoint(checkpointData);
}
async function engiMemoryRestore(params) {
  const memory = getMemoryStore();
  if (params.id) {
    return memory.restore(params.id);
  } else if (params.taskId) {
    const checkpoint = memory.getLatestForTask(params.taskId);
    if (checkpoint)
      return memory.restore(checkpoint.id);
  }
  return null;
}
var engiTools = [
  {
    name: "engi_task_classify",
    description: "Classify an engineering task to determine its type and suggest next steps",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "The engineering task description to classify" },
        keywords: { type: "array", items: { type: "string" }, description: "Optional keywords for context" }
      },
      required: ["task"]
    },
    execute: async (args) => {
      const result = await engiTaskClassify(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_repo_scope_find",
    description: "Identify minimum relevant repository scope for a task",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "The task description" },
        taskType: { type: "string", enum: ["analysis", "feature", "bug", "poc", "documentation", "mixed"], description: "Type of task" },
        keywords: { type: "array", items: { type: "string" }, description: "Additional keywords" },
        limit: { type: "number", description: "Maximum results to return" },
        repoPath: { type: "string", description: "Repository path to index" }
      },
      required: ["task", "taskType"]
    },
    execute: async (args) => {
      const result = await engiRepoScopeFind(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_flow_summarize",
    description: "Explain existing implementation flow",
    inputSchema: {
      type: "object",
      properties: {
        scope: { type: "array", items: { type: "string" }, description: "File paths to include" },
        entryPoint: { type: "string", description: "Entry point file" },
        verbosity: { type: "string", enum: ["minimal", "standard", "detailed"], description: "Verbosity level" }
      }
    },
    execute: async (args) => {
      const result = await engiFlowSummarize(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_bug_trace_compact",
    description: "Trace likely bug causes from symptom description",
    inputSchema: {
      type: "object",
      properties: {
        symptom: { type: "string", description: "Bug symptom description" },
        scope: { type: "array", items: { type: "string" }, description: "Files to investigate" }
      },
      required: ["symptom"]
    },
    execute: async (args) => {
      const result = await engiBugTraceCompact(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_implementation_plan",
    description: "Build implementation plan for new feature or fix",
    inputSchema: {
      type: "object",
      properties: {
        task: { type: "string", description: "Feature or fix description" },
        taskType: { type: "string", enum: ["feature", "bug"], description: "Type of task" },
        scope: { type: "array", items: { type: "string" }, description: "Files in scope" },
        existingPatterns: { type: "array", items: { type: "string" }, description: "Existing patterns to follow" }
      },
      required: ["task", "taskType", "scope"]
    },
    execute: async (args) => {
      const result = await engiImplementationPlan(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_poc_plan",
    description: "Define minimum viable POC implementation",
    inputSchema: {
      type: "object",
      properties: {
        goal: { type: "string", description: "POC goal description" },
        constraints: { type: "array", items: { type: "string" }, description: "Known constraints" },
        existingCode: { type: "array", items: { type: "string" }, description: "Existing code to leverage" }
      },
      required: ["goal"]
    },
    execute: async (args) => {
      const result = await engiPOCPlan(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_impact_analyze",
    description: "Estimate blast radius of change",
    inputSchema: {
      type: "object",
      properties: {
        scope: { type: "array", items: { type: "string" }, description: "Files being changed" },
        changeType: { type: "string", enum: ["add", "modify", "delete"], description: "Type of change" }
      },
      required: ["scope", "changeType"]
    },
    execute: async (args) => {
      const result = await engiImpactAnalyze(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_test_select",
    description: "Choose minimum useful test set",
    inputSchema: {
      type: "object",
      properties: {
        scope: { type: "array", items: { type: "string" }, description: "Files being changed" },
        changeType: { type: "string", enum: ["add", "modify", "delete"], description: "Type of change" }
      },
      required: ["scope"]
    },
    execute: async (args) => {
      const result = await engiTestSelect(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_doc_context_build",
    description: "Build compact context for docs generation",
    inputSchema: {
      type: "object",
      properties: {
        feature: { type: "string", description: "Feature or change to document" },
        changedFiles: { type: "array", items: { type: "string" }, description: "Files that changed" },
        audience: { type: "string", enum: ["junior", "senior", "pm", "qa", "api"], description: "Target audience" }
      }
    },
    execute: async (args) => {
      const result = await engiDocContextBuild(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_doc_update_plan",
    description: "Identify which docs must change",
    inputSchema: {
      type: "object",
      properties: {
        changedFiles: { type: "array", items: { type: "string" }, description: "Files that changed" },
        existingDocs: { type: "array", items: { type: "string" }, description: "Existing docs" }
      },
      required: ["changedFiles"]
    },
    execute: async (args) => {
      const result = await engiDocUpdatePlan(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_memory_checkpoint",
    description: "Store compact task state outside conversation context",
    inputSchema: {
      type: "object",
      properties: {
        taskId: { type: "string", description: "Unique task identifier" },
        taskType: { type: "string", enum: ["analysis", "feature", "bug", "poc", "documentation", "mixed"], description: "Type of task" },
        files: { type: "array", items: { type: "string" }, description: "Files in scope" },
        symbols: { type: "array", items: { type: "string" }, description: "Symbols in scope" },
        modules: { type: "array", items: { type: "string" }, description: "Modules in scope" },
        decisions: { type: "array", items: { type: "object", properties: { description: { type: "string" }, rationale: { type: "string" } } }, description: "Decisions made" },
        risks: { type: "array", items: { type: "string" }, description: "Identified risks" },
        pendingValidations: { type: "array", items: { type: "string" }, description: "Pending validations" },
        pendingDocs: { type: "array", items: { type: "string" }, description: "Pending docs" },
        notes: { type: "string", description: "Additional notes" }
      },
      required: ["taskId", "taskType", "files"]
    },
    execute: async (args) => {
      const result = await engiMemoryCheckpoint(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: "engi_memory_restore",
    description: "Restore compact previously saved task state",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Checkpoint ID to restore" },
        taskId: { type: "string", description: "Task ID to restore latest checkpoint" }
      }
    },
    execute: async (args) => {
      const result = await engiMemoryRestore(args);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  }
];

// src/native-tools/index.ts
var tools = [
  {
    name: "fetch_web_content",
    description: "Fetch URL and extract clean content. Optimized for LLM (strips nav/ads, converts to markdown).",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to fetch" },
        max_tokens: { type: "integer", description: "Max tokens output (default: 4000)" }
      },
      required: ["url"]
    },
    async execute(args) {
      const result = await fetchWebContent(args.url, args.max_tokens || 4000);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "quick_fetch",
    description: "Ultra-fast fetch for quick lookups. Returns title + summary only.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to fetch" }
      },
      required: ["url"]
    },
    async execute(args) {
      const result = await quickFetch(args.url);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "open_in_browser",
    description: "Open URL in default browser. Use when user wants to see results visually or needs interactive web content.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to open in browser" },
        search: { type: "string", description: "Search query to open in Google (alternative to url)" }
      },
      required: []
    },
    async execute(args) {
      try {
        let url = args.url;
        if (!url && args.search) {
          url = `https://www.google.com/search?q=${encodeURIComponent(args.search)}`;
        }
        if (!url) {
          return { success: false, content: "", error: "Provide url or search parameter" };
        }
        const { execSync: execSync2 } = await import("child_process");
        const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
        execSync2(`${opener} "${url}"`, { stdio: "ignore" });
        return { success: true, content: `Opened in browser: ${url}` };
      } catch (e) {
        return { success: false, content: "", error: e.message };
      }
    }
  },
  {
    name: "fetch_structured",
    description: "Fetch and extract structured data (article metadata, product info, tables, links).",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        extraction_type: { type: "string", enum: ["article", "product", "table", "links"] },
        max_tokens: { type: "integer" }
      },
      required: ["url", "extraction_type"]
    },
    async execute(args) {
      const result = await fetchStructured(args.url, args.extraction_type, args.max_tokens);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "fetch_with_selectors",
    description: "Fetch URL and extract using CSS selectors.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        selectors: { type: "object" },
        max_tokens: { type: "integer" }
      },
      required: ["url", "selectors"]
    },
    async execute(args) {
      const result = await fetchWithSelectors(args.url, args.selectors, args.max_tokens);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "scrape_freedium",
    description: "Scrape Medium via Freedium.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string" },
        max_tokens: { type: "integer" }
      },
      required: ["url"]
    },
    async execute(args) {
      const result = await scrapeFreedium(args.url, args.max_tokens);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "webclaw_extract_article",
    description: "Extract article content.",
    inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
    async execute(args) {
      const result = await webclawExtractArticle(args.url);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "webclaw_extract_product",
    description: "Extract e-commerce product info.",
    inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
    async execute(args) {
      const result = await webclawExtractProduct(args.url);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "webclaw_crawl",
    description: "Crawl with CSS selectors.",
    inputSchema: {
      type: "object",
      properties: { url: { type: "string" }, selectors: { type: "object" } },
      required: ["url", "selectors"]
    },
    async execute(args) {
      const result = await webclawCrawl(args.url, args.selectors);
      return { success: result.success, content: result.content, error: result.error };
    }
  },
  {
    name: "searxng_search",
    description: "Web search via SearXNG. Supports categories, engines, time range.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        limit: { type: "integer", description: "Max results (default: 10)" }
      },
      required: ["query"]
    },
    async execute(args) {
      const result = await searxngSearch(args.query, args.limit || 10);
      if (result.success && result.results) {
        return {
          success: true,
          content: JSON.stringify({ results: result.results })
        };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "search_images",
    description: "Image search via SearXNG.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer" }
      },
      required: ["query"]
    },
    async execute(args) {
      const result = await searchImages(args.query, args.limit || 10);
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "search_news",
    description: "News search via SearXNG.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        time_range: { type: "string", enum: ["day", "week", "month", "year"] }
      },
      required: ["query"]
    },
    async execute(args) {
      const result = await searchNews(args.query, args.time_range);
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "searxng_health",
    description: "Check SearXNG health.",
    inputSchema: { type: "object", properties: {} },
    async execute() {
      const result = await searxngHealth();
      return { success: result.success, content: result.success ? "OK" : "DOWN", error: result.error };
    }
  },
  {
    name: "hackernews_top",
    description: "Top HN stories.",
    inputSchema: { type: "object", properties: { limit: { type: "integer" } } },
    async execute(args) {
      const result = await hackernewsTop(args.limit || 10);
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "hackernews_new",
    description: "Newest HN stories.",
    inputSchema: { type: "object", properties: { limit: { type: "integer" } } },
    async execute(args) {
      const result = await hackernewsNew(args.limit || 10);
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "hackernews_best",
    description: "Best HN stories.",
    inputSchema: { type: "object", properties: { limit: { type: "integer" } } },
    async execute(args) {
      const result = await hackernewsBest(args.limit || 10);
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "hackernews_get_comments",
    description: "Get story comments.",
    inputSchema: {
      type: "object",
      properties: { story_id: { type: "integer" }, limit: { type: "integer" } },
      required: ["story_id"]
    },
    async execute(args) {
      const result = await hackernewsComments(args.story_id, args.limit || 20);
      if (result.success && result.results) {
        return { success: true, content: JSON.stringify({ results: result.results }) };
      }
      return { success: false, content: "", error: result.error };
    }
  },
  {
    name: "file_read",
    description: "Read file contents.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path" },
        max_size: { type: "integer", description: "Max bytes (default: 10MB)" }
      },
      required: ["path"]
    },
    async execute(args) {
      const result = await fileRead(args.path, args.max_size);
      return {
        success: result.success,
        content: result.content || "",
        error: result.error
      };
    }
  },
  {
    name: "file_write",
    description: "Write content to a file.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path" },
        content: { type: "string", description: "Content to write" }
      },
      required: ["path", "content"]
    },
    async execute(args) {
      const result = await fileWrite(args.path, args.content);
      return {
        success: result.success,
        content: result.path || "",
        error: result.error
      };
    }
  },
  {
    name: "file_list",
    description: "List directory contents.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Directory path (default: .)" },
        max_items: { type: "integer" }
      }
    },
    async execute(args) {
      const result = await fileList(args.path || ".", args.max_items);
      return {
        success: result.success,
        content: JSON.stringify(result.items),
        error: result.error
      };
    }
  },
  {
    name: "file_search",
    description: "Search files by name pattern.",
    inputSchema: {
      type: "object",
      properties: {
        directory: { type: "string" },
        pattern: { type: "string" },
        max_results: { type: "integer" }
      },
      required: ["directory", "pattern"]
    },
    async execute(args) {
      const result = await fileSearch(args.directory, args.pattern, args.max_results);
      return {
        success: result.success,
        content: JSON.stringify(result.files),
        error: result.error
      };
    }
  },
  {
    name: "file_grep",
    description: "Search within files using grep.",
    inputSchema: {
      type: "object",
      properties: {
        directory: { type: "string" },
        query: { type: "string", description: "Search pattern" },
        max_results: { type: "integer" },
        file_pattern: { type: "string" }
      },
      required: ["directory", "query"]
    },
    async execute(args) {
      const result = await fileGrep(args.directory, args.query, args.max_results, args.file_pattern || "*");
      return {
        success: result.success,
        content: JSON.stringify(result.files),
        error: result.error
      };
    }
  },
  {
    name: "file_glob",
    description: "Find files matching glob patterns.",
    inputSchema: {
      type: "object",
      properties: {
        directory: { type: "string" },
        patterns: { type: "array", items: { type: "string" } },
        max_results: { type: "integer" }
      },
      required: ["directory", "patterns"]
    },
    async execute(args) {
      const result = await fileGlob(args.directory, args.patterns, args.max_results);
      return {
        success: result.success,
        content: JSON.stringify(result.files),
        error: result.error
      };
    }
  },
  {
    name: "run_code",
    description: "Run code sandbox (Python, JS, Bash).",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string" },
        language: { type: "string", enum: ["python", "javascript", "bash"] },
        timeout: { type: "integer" }
      },
      required: ["code", "language"]
    },
    async execute(args) {
      const result = await runCode(args.code, args.language, args.timeout || 30);
      return {
        success: result.success,
        content: result.output,
        error: result.error
      };
    }
  },
  {
    name: "run_python_snippet",
    description: "Run Python with common imports.",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string" },
        timeout: { type: "integer" }
      },
      required: ["code"]
    },
    async execute(args) {
      const result = await runPythonSnippet(args.code, args.timeout);
      return {
        success: result.success,
        content: result.output,
        error: result.error
      };
    }
  },
  {
    name: "run_command",
    description: "Execute shell command. Supports any command with bash shell. Use for file ops, servers, scripts, etc.",
    inputSchema: {
      type: "object",
      properties: {
        command: { type: "string", description: "Shell command to execute (full command with args)" },
        cwd: { type: "string", description: "Working directory (optional, defaults to current)" },
        background: { type: "boolean", description: "Run in background with nohup (default: false)" },
        timeout: { type: "integer", description: "Timeout in seconds (default: 30)" }
      },
      required: ["command"]
    },
    async execute(args) {
      const { execSync: execSync2, spawn: spawn2 } = await import("child_process");
      const cmd = args.command;
      const workingDir = args.cwd || process.cwd();
      const timeout = args.timeout || 30;
      const runBackground = args.background || false;
      const dangerous = ["rm -rf", "dd", "mkfs", ":(){", "fork bomb", "> /dev/", "curl | bash", "wget -O- |"];
      const isDangerous = dangerous.some((d) => cmd.toLowerCase().includes(d));
      if (isDangerous) {
        return { success: false, content: "", error: `\u26A0\uFE0F  Dangerous command detected: "${cmd.slice(0, 50)}..."

To execute dangerous commands, run directly in your terminal.` };
      }
      let fullCmd = cmd;
      if (cmd.startsWith("cd ") && !cmd.includes("&&")) {
        const match = cmd.match(/^cd\s+(.+)$/);
        if (match) {
          const targetDir = match[1].replace(/^~/, process.env.HOME || "~");
          try {
            const { statSync: statSync2 } = await import("fs");
            statSync2(targetDir);
            return { success: true, content: `Directory changed to: ${targetDir}` };
          } catch {
            return { success: false, content: "", error: `Directory not found: ${targetDir}` };
          }
        }
      }
      try {
        if (runBackground || cmd.endsWith(" &")) {
          const cleanCmd = cmd.replace(/\s*&\s*$/, "").trim();
          spawn2(cleanCmd, [], {
            shell: true,
            cwd: workingDir,
            detached: true,
            stdio: "ignore"
          }).unref();
          return { success: true, content: `Started in background: ${cleanCmd}` };
        }
        const output = execSync2(`/bin/bash -c ${JSON.stringify(cmd)}`, {
          encoding: "utf-8",
          timeout: timeout * 1000,
          cwd: workingDir,
          maxBuffer: 10485760
        });
        return { success: true, content: output };
      } catch (e) {
        if (e.killed) {
          return { success: false, content: "", error: `Command timed out after ${timeout}s` };
        }
        return { success: false, content: "", error: e.message };
      }
    }
  },
  {
    name: "github_repo",
    description: "Get repo info.",
    inputSchema: {
      type: "object",
      properties: { owner: { type: "string" }, repo: { type: "string" } },
      required: ["owner", "repo"]
    },
    async execute(args) {
      const result = await githubRepo(args.owner, args.repo);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "github_readme",
    description: "Get repo README.",
    inputSchema: {
      type: "object",
      properties: { owner: { type: "string" }, repo: { type: "string" } },
      required: ["owner", "repo"]
    },
    async execute(args) {
      const result = await githubReadme(args.owner, args.repo);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "github_issues",
    description: "List repo issues.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        state: { type: "string", enum: ["open", "closed", "all"] }
      },
      required: ["owner", "repo"]
    },
    async execute(args) {
      const result = await githubIssues(args.owner, args.repo, args.state || "open");
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "github_commits",
    description: "List recent commits.",
    inputSchema: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        limit: { type: "integer" }
      },
      required: ["owner", "repo"]
    },
    async execute(args) {
      const result = await githubCommits(args.owner, args.repo, args.limit || 20);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "github_search_repos",
    description: "Search repos.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer" }
      },
      required: ["query"]
    },
    async execute(args) {
      const result = await githubSearchRepos(args.query, args.limit || 10);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "youtube_transcript",
    description: "Get transcript from video.",
    inputSchema: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
    async execute(args) {
      const result = await youtubeTranscript(args.url);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "youtube_video_info",
    description: "Get video metadata.",
    inputSchema: {
      type: "object",
      properties: {
        video_id: { type: "string" },
        url: { type: "string" }
      }
    },
    async execute(args) {
      const result = await youtubeVideoInfo(args.video_id, args.url);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "youtube_search",
    description: "Search videos.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "integer" }
      },
      required: ["query"]
    },
    async execute(args) {
      const result = await youtubeSearch(args.query, args.limit || 10);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "youtube_summarize",
    description: "Summarize transcript.",
    inputSchema: {
      type: "object",
      properties: {
        transcript: { type: "string" },
        max_words: { type: "integer" }
      },
      required: ["transcript"]
    },
    async execute(args) {
      const result = await youtubeSummarize(args.transcript, args.max_words || 500);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "pandas_create",
    description: "Create DataFrame from data.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "string", description: "JSON data" },
        name: { type: "string" }
      },
      required: ["data"]
    },
    async execute(args) {
      const result = await pandasCreate(args.data, args.name);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "pandas_filter",
    description: "Filter data.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "array" },
        conditions: { type: "string" }
      },
      required: ["data", "conditions"]
    },
    async execute(args) {
      const result = await pandasFilter(args.data, args.conditions);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "pandas_aggregate",
    description: "Aggregate/group data.",
    inputSchema: {
      type: "object",
      properties: {
        data: { type: "array" },
        group_by: { type: "array", items: { type: "string" } },
        aggregations: { type: "object" }
      },
      required: ["data", "group_by", "aggregations"]
    },
    async execute(args) {
      const result = await pandasAggregate(args.data, args.group_by, args.aggregations);
      return { success: result.success, content: result.output, error: result.error };
    }
  },
  {
    name: "plot_line",
    description: "Generate line plot.",
    inputSchema: {
      type: "object",
      properties: { x: { type: "array" }, y: { type: "array" }, title: { type: "string" } },
      required: ["x", "y"]
    },
    async execute(args) {
      return {
        success: true,
        content: `Line chart: ${args.title || "Plot"}
X: ${args.x.slice(0, 5)}
Y: ${args.y.slice(0, 5)}
(Use run_code with matplotlib to render)`
      };
    }
  },
  {
    name: "plot_bar",
    description: "Generate bar chart.",
    inputSchema: {
      type: "object",
      properties: { categories: { type: "array" }, values: { type: "array" }, title: { type: "string" } },
      required: ["categories", "values"]
    },
    async execute(args) {
      return {
        success: true,
        content: `Bar chart: ${args.title || "Plot"}
Categories: ${args.categories.slice(0, 5)}
Values: ${args.values.slice(0, 5)}
(Use run_code with matplotlib to render)`
      };
    }
  },
  ...engiTools
];
function getTool(name) {
  return tools.find((t) => t.name === name);
}
async function executeTool(name, args) {
  const tool = getTool(name);
  if (!tool) {
    return { success: false, content: "", error: `Unknown tool: ${name}` };
  }
  try {
    return await tool.execute(args);
  } catch (e) {
    return { success: false, content: "", error: e.message };
  }
}
function getFormattedTools() {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema
  }));
}

// src/providers/discover.ts
var CODEX_OAUTH = {
  CLIENT_ID: "app_EMoamEEZ73f0CkXaXp7hrann",
  AUTHORIZE_URL: "https://auth.openai.com/oauth/authorize",
  TOKEN_URL: "https://auth.openai.com/oauth/token",
  REDIRECT_URI: "http://localhost:1455/auth/callback",
  SCOPE: "openid profile email offline_access",
  API_BASE_URL: "https://chatgpt.com/backend-api",
  TOKEN_FILE: ".beast-cli/codex-auth.json"
};
async function fetchOllamaModels(baseUrl = "http://localhost:11434") {
  try {
    const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok)
      return [];
    const data = await res.json();
    return (data.models ?? []).map((m) => m.name ?? "").filter(Boolean);
  } catch {
    return [];
  }
}
async function fetchLMStudioModels(baseUrl = "http://localhost:1234") {
  try {
    const res = await fetch(`${baseUrl}/v1/models`, { signal: AbortSignal.timeout(2000) });
    if (!res.ok)
      return [];
    const data = await res.json();
    return (data.data ?? []).map((m) => m.id ?? "").filter(Boolean);
  } catch {
    return [];
  }
}
async function fetchJanModels(baseUrl = "http://localhost:1337") {
  return fetchLMStudioModels(baseUrl);
}
async function fetchLocalModels(provider) {
  switch (provider) {
    case "ollama":
      return fetchOllamaModels();
    case "lmstudio":
      return fetchLMStudioModels();
    case "jan":
      return fetchJanModels();
    default:
      return [];
  }
}
var API_KEY_ENVS = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  codex: "CODEX_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  groq: "GROQ_API_KEY",
  mistral: "MISTRAL_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  qwen: "DASHSCOPE_API_KEY",
  gemini: "GEMINI_API_KEY"
};
function getApiKeyFromEnv(provider) {
  const envVar = API_KEY_ENVS[provider];
  if (!envVar)
    return null;
  return process.env[envVar] ?? null;
}
function isCloudProvider(provider) {
  return provider in API_KEY_ENVS;
}
var DEFAULT_MODEL = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-5.4",
  openrouter: "qwen/qwen3-32b",
  deepseek: "deepseek-chat",
  groq: "llama-3.3-70b-versatile",
  mistral: "mistral-large-latest",
  qwen: "qwen-plus",
  gemini: "gemini-1.5-pro",
  ollama: "llama3.2:latest",
  lmstudio: "llama3.2:latest",
  jan: "llama3.2:latest"
};
var CLOUD_MODELS = {
  anthropic: [
    "claude-opus-4-5",
    "claude-sonnet-4-20250514",
    "claude-haiku-4-20250514",
    "claude-3-5-sonnet-latest"
  ],
  openai: [
    "gpt-5.4",
    "gpt-5.4-pro",
    "gpt-5.4-mini",
    "gpt-5.4-nano",
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-5.2",
    "gpt-5.2-pro",
    "gpt-5-pro",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "o3-pro",
    "o3",
    "o4-mini",
    "o3-deep-research",
    "o4-mini-deep-research",
    "o1-pro",
    "o1",
    "o3-mini",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4-turbo",
    "gpt-4",
    "gpt-3.5-turbo",
    "gpt-5-codex",
    "gpt-5.3-codex",
    "gpt-5.2-codex",
    "gpt-5.1-codex",
    "gpt-5.1-codex-max",
    "gpt-5.1-codex-mini"
  ],
  openrouter: [
    "qwen/qwen3-32b",
    "qwen/qwen3-14b",
    "qwen/qwen3-8b",
    "openrouter/auto",
    "anthropic/claude-3-opus",
    "openai/gpt-4o",
    "google/gemini-pro-1.5",
    "deepseek/deepseek-chat"
  ],
  deepseek: [
    "deepseek-chat",
    "deepseek-coder",
    "deepseek-reasoner"
  ],
  groq: [
    "llama-3.3-70b-versatile",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
    "llama-3.1-8b-instant"
  ],
  mistral: [
    "mistral-large-latest",
    "mistral-small-latest",
    "codestral-latest",
    "mistral-nemo"
  ],
  qwen: [
    "qwen-plus",
    "qwen-max",
    "qwen2.5-coder-32b",
    "qwq-32b"
  ],
  gemini: [
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp"
  ]
};
async function detectAllProviders() {
  const results = [];
  const [ollamaModels, lmModels, janModels] = await Promise.all([
    fetchOllamaModels(),
    fetchLMStudioModels(),
    fetchJanModels()
  ]);
  if (ollamaModels.length > 0) {
    results.push({
      id: "ollama",
      name: "Ollama",
      shortName: "OLL",
      status: "online",
      models: ollamaModels,
      isCloud: false
    });
  }
  if (lmModels.length > 0) {
    results.push({
      id: "lmstudio",
      name: "LM Studio",
      shortName: "LMS",
      status: "online",
      models: lmModels,
      isCloud: false
    });
  }
  if (janModels.length > 0) {
    results.push({
      id: "jan",
      name: "Jan",
      shortName: "JAN",
      status: "online",
      models: janModels,
      isCloud: false
    });
  }
  const cloudProviders = [
    { id: "anthropic", name: "Claude", shortName: "CLA", status: "offline", models: CLOUD_MODELS["anthropic"], isCloud: true },
    { id: "openai", name: "GPT / OpenAI", shortName: "GPT", status: "offline", models: CLOUD_MODELS["openai"], isCloud: true },
    { id: "codex", name: "ChatGPT Plus", shortName: "CHT", status: "offline", models: CODEX_MODELS, isCloud: true },
    { id: "openrouter", name: "OpenRouter", shortName: "ORR", status: "offline", models: CLOUD_MODELS["openrouter"], isCloud: true },
    { id: "deepseek", name: "DeepSeek", shortName: "DSK", status: "offline", models: CLOUD_MODELS["deepseek"], isCloud: true },
    { id: "groq", name: "Groq", shortName: "GRQ", status: "offline", models: CLOUD_MODELS["groq"], isCloud: true },
    { id: "mistral", name: "Mistral", shortName: "MIS", status: "offline", models: CLOUD_MODELS["mistral"], isCloud: true },
    { id: "qwen", name: "Qwen", shortName: "QWN", status: "offline", models: CLOUD_MODELS["qwen"], isCloud: true },
    { id: "gemini", name: "Gemini", shortName: "GEM", status: "offline", models: CLOUD_MODELS["gemini"], isCloud: true }
  ];
  for (const p of cloudProviders) {
    if (getApiKeyFromEnv(p.id)) {
      p.status = "online";
    } else if (p.id === "codex") {
      const token = loadCodexToken();
      if (token && isCodexTokenValid(token)) {
        p.status = "online";
      }
    }
    results.push(p);
  }
  return results;
}
function getBaseUrl(provider) {
  switch (provider) {
    case "ollama":
      return "http://localhost:11434";
    case "lmstudio":
      return "http://localhost:1234/v1";
    case "jan":
      return "http://localhost:1337/v1";
    case "codex":
      return CODEX_OAUTH.API_BASE_URL;
    default:
      return "";
  }
}
function getCodexTokenPath() {
  const home = process.env.HOME || process.env.USERPROFILE || "~";
  return `${home}/.beast-cli/codex-auth.json`;
}
function loadCodexToken() {
  try {
    const path4 = getCodexTokenPath();
    const fs4 = __require("fs");
    if (fs4.existsSync(path4)) {
      const data = JSON.parse(fs4.readFileSync(path4, "utf-8"));
      return data;
    }
  } catch {}
  return null;
}
function clearCodexToken() {
  try {
    const path4 = getCodexTokenPath();
    const fs4 = __require("fs");
    if (fs4.existsSync(path4)) {
      fs4.unlinkSync(path4);
    }
  } catch {}
}
function isCodexTokenValid(token) {
  if (!token.accessToken)
    return false;
  return Date.now() < token.expiresAt - 5 * 60 * 1000;
}
var CODEX_MODELS = [
  "gpt-5.2-codex",
  "gpt-5.2-codex-low",
  "gpt-5.2-codex-medium",
  "gpt-5.2-codex-high",
  "gpt-5.2-codex-xhigh",
  "gpt-5.2",
  "gpt-5.2-low",
  "gpt-5.2-medium",
  "gpt-5.2-high",
  "gpt-5.2-xhigh",
  "gpt-5.1-codex-max",
  "gpt-5.1-codex",
  "gpt-5.1-codex-mini",
  "gpt-5.1",
  "gpt-5.1-low",
  "gpt-5.1-medium",
  "gpt-5.1-high",
  "gpt-5.1-xhigh",
  "codex",
  "gpt-4o",
  "gpt-4o-mini",
  "o3-mini",
  "o3",
  "o4-mini"
];

// src/config/index.ts
import { readFileSync as readFileSync4, existsSync as existsSync5, writeFileSync as writeFileSync4, mkdirSync as mkdirSync2 } from "fs";
import { resolve as resolve2, dirname as dirname2 } from "path";
function getConfigDir() {
  return resolve2(process.env.HOME ?? "~", ".beast-cli");
}
function getConfigPath() {
  return resolve2(getConfigDir(), "session.json");
}
function saveSession(config) {
  try {
    const dir = getConfigDir();
    if (!existsSync5(dir))
      mkdirSync2(dir, { recursive: true });
    writeFileSync4(getConfigPath(), JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.warn("Failed to save session config:", error);
  }
}
function loadSession() {
  try {
    const path4 = getConfigPath();
    if (!existsSync5(path4))
      return null;
    const data = JSON.parse(readFileSync4(path4, "utf-8"));
    if (!data.provider || !data.model || !data.contextSize || !data.contextMax) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
function parseContextSize(size) {
  const num = parseInt(size.replace(/K|B$/i, ""));
  if (size.toUpperCase().endsWith("K"))
    return num * 1024;
  if (size.toUpperCase().endsWith("B"))
    return num * 1024 * 1024 * 1024;
  return num;
}
var CONTEXT_SIZES = ["8K", "16K", "32K", "64K", "128K"];

// src/index.ts
import readline from "readline";
var VERSION3 = "1.2.8";
function question(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve3) => rl.question(prompt, (answer) => {
    rl.close();
    resolve3(answer);
  }));
}
async function numberedMenu(title, options) {
  console.log(`
${title}`);
  options.forEach((opt, i) => console.log(`  [${i + 1}] ${opt}`));
  while (true) {
    const input = await question("  > ");
    const n = parseInt(input.trim());
    if (n >= 1 && n <= options.length)
      return n - 1;
    console.log("  Invalid selection. Try again.");
  }
}
var currentSpinner = null;
var spinnerStarted = false;
var spinnerFrame = 0;
var spinnerLabel = "";
var spinnerAnimation = [];
var spinnerSpeed = 150;
var THINKING_ANIMS = [
  "(\u25D5\u203F\u25D5)\uD83D\uDC15",
  "(=^\u30FB^=)",
  "(\xA8)\uD83E\uDD8A",
  "( @)\uD83D\uDC38",
  "(*)",
  "(\u25D5\u03C9\u25D5)\uD83D\uDC15",
  "(=^\u30FB\u03C9\u30FB^=)",
  "(\u25D5\u203F\u25D5)\uD83E\uDD8A",
  "(\\/)\uD83D\uDC30",
  " (=\u30FB)"
];
var SEARCH_ANIMS = ["><(((\xBA>", " <(\xBA)>", "><(((\xBA>", "  ~(``)~", "><(((\xBA>"];
var TOOL_ANIMS = ["(\u25D5\u203F\u25D5)\uD83D\uDC15", "(=^\u30FB^=)", "(\xA8)\uD83E\uDD8A", "(*)", "=(\u30FB)"];
var THINKING_DOTS = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834"];
function startFunSpinner(state = "thinking") {
  if (currentSpinner)
    clearInterval(currentSpinner);
  spinnerStarted = true;
  spinnerFrame = 0;
  if (state === "searching") {
    spinnerAnimation = SEARCH_ANIMS;
    spinnerLabel = s("Searching", fg.info);
    spinnerSpeed = 120;
  } else if (state === "tool") {
    spinnerAnimation = TOOL_ANIMS;
    spinnerLabel = s("Running", fg.tool);
    spinnerSpeed = 150;
  } else if (state === "formatting") {
    spinnerAnimation = ["\u2728", "\u2605", "\u2726", "\u2727", "\u2605"];
    spinnerLabel = s("Formatting", fg.success);
    spinnerSpeed = 200;
  } else {
    spinnerAnimation = THINKING_ANIMS;
    spinnerLabel = s("Thinking", fg.accent);
    spinnerSpeed = 150;
  }
  const char = spinnerAnimation[0];
  const dot = THINKING_DOTS[0];
  process.stderr.write(`\r${spinnerLabel} ${char} ${dot}  `);
  currentSpinner = setInterval(() => {
    if (!spinnerStarted)
      return;
    spinnerFrame = (spinnerFrame + 1) % spinnerAnimation.length;
    const animChar = spinnerAnimation[spinnerFrame];
    const dot2 = THINKING_DOTS[spinnerFrame % THINKING_DOTS.length];
    process.stderr.write(`\r${spinnerLabel} ${animChar} ${dot2}  `);
  }, spinnerSpeed);
}
function stopFunSpinner(status = "done") {
  if (currentSpinner) {
    clearInterval(currentSpinner);
    currentSpinner = null;
  }
  spinnerStarted = false;
  process.stderr.write("\r" + " ".repeat(60) + "\r");
  if (status === "done") {
    process.stderr.write(s("\u2713 ", fg.success) + (spinnerLabel || "Done") + `
`);
  } else if (status === "error") {
    process.stderr.write(s("\u2717 ", fg.error) + `Error
`);
  }
}
function streamText(text) {
  process.stdout.write(panel(text, { title: "\uD83E\uDD16 Response", titleColor: fg.assistant, width: 70 }));
  process.stdout.write(`
`);
}
function printUsage(usage) {
  if (!usage)
    return;
  const { promptTokens, completionTokens, totalTokens } = usage;
  process.stdout.write(`${s("\u26A1 ", fg.secondary)}${s(totalTokens.toLocaleString(), fg.mauve)} tokens `);
  process.stdout.write(`(${s("p:" + promptTokens, fg.blue)} ${s("c:" + completionTokens, fg.mauve)})
`);
}
var nativeTools = [];
async function connectMCP() {
  nativeTools = getFormattedTools();
  return nativeTools;
}
async function selectProvider(providers2) {
  const online = providers2.filter((p) => p.status === "online");
  const offline = providers2.filter((p) => p.status === "offline");
  const choices = [];
  const byId = [];
  for (const p of online) {
    const models = `${p.models.length} models`;
    const auth = p.id === "codex" ? " \xB7 OAuth" : "";
    choices.push(`\u25CF ${p.name} (${p.shortName}) \u2014 ${models}${auth}`);
    byId.push(p.id);
  }
  for (const p of offline) {
    const note = p.id === "codex" ? " (needs OAuth login)" : p.isCloud ? " (needs API key)" : " (offline)";
    choices.push(`\u25CB ${p.name} (${p.shortName})${note}`);
    byId.push(p.id);
  }
  const idx = await numberedMenu("\uD83D\uDC09 Select a provider:", choices);
  return byId[idx];
}
async function selectModelForProvider(provider, defaultModel) {
  const isLocal = !isCloudProvider(provider);
  if (isLocal) {
    console.log(dim + "Fetching models from " + provider + "..." + reset);
    const models = await fetchLocalModels(provider);
    if (models.length === 0) {
      console.log("   [WARN] No models found. Is Ollama running?");
      return DEFAULT_MODEL[provider] ?? "llama3.2";
    }
    if (defaultModel) {
      const idx2 = models.indexOf(defaultModel);
      if (idx2 >= 0) {
        console.log(`${dim}Available models (default: ${defaultModel}):${reset}`);
        models.forEach((m, i) => console.log(`  ${i + 1}. ${m}${i === idx2 ? " \u2190" : ""}`));
        const choice = await question(`  Select model number [${idx2 + 1}] > `) || String(idx2 + 1);
        const n2 = parseInt(choice);
        if (n2 >= 1 && n2 <= models.length)
          return models[n2 - 1];
        return models[idx2];
      }
    }
    console.log(`${dim}Available models:${reset}`);
    models.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
    const idx = await question("  Select model number > ");
    const n = parseInt(idx);
    if (n >= 1 && n <= models.length)
      return models[n - 1];
    return models[0];
  } else {
    const models = CLOUD_MODELS[provider] ?? CODEX_MODELS;
    if (defaultModel) {
      const idx2 = models.indexOf(defaultModel);
      if (idx2 >= 0) {
        console.log(`${dim}Available models (default: ${defaultModel}):${reset}`);
        models.forEach((m, i) => console.log(`  ${i + 1}. ${m}${i === idx2 ? " \u2190" : ""}`));
        const choice = await question(`  Select model number [${idx2 + 1}] > `) || String(idx2 + 1);
        const n2 = parseInt(choice);
        if (n2 >= 1 && n2 <= models.length)
          return models[n2 - 1];
        return models[idx2];
      }
    }
    console.log(`${dim}Available models:${reset}`);
    models.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
    const idx = await question("  Select model number > ");
    const n = parseInt(idx);
    if (n >= 1 && n <= models.length)
      return models[n - 1];
    return models[0];
  }
}
async function selectContextSize(defaultSize) {
  console.log(`${dim}Context window size:${reset}`);
  CONTEXT_SIZES.forEach((size2, i) => {
    const marker = defaultSize === size2 ? " \u2190" : "";
    console.log(`  [${i + 1}] ${size2} tokens${marker}`);
  });
  let defaultIdx = defaultSize ? CONTEXT_SIZES.indexOf(defaultSize) : 2;
  if (defaultIdx < 0)
    defaultIdx = 2;
  const ctxIdx = await question(`  > [${defaultIdx + 1}] `) || String(defaultIdx + 1);
  const idx = parseInt(ctxIdx) - 1;
  const size = CONTEXT_SIZES[idx] || "32K";
  return { size, max: parseContextSize(size) };
}
async function promptApiKey(provider) {
  if (provider === "codex") {
    console.log(`
\uD83D\uDD11 ChatGPT Plus: A browser will open for you to sign in.`);
    return "codex-oauth";
  }
  const env = getApiKeyFromEnv(provider);
  if (env)
    return env;
  const providerHelp = {
    anthropic: "https://console.anthropic.com/",
    openai: "https://platform.openai.com/",
    groq: "https://console.groq.com/",
    deepseek: "https://platform.deepseek.com/",
    mistral: "https://console.mistral.ai/",
    openrouter: "https://openrouter.ai/",
    gemini: "https://aistudio.google.com/",
    qwen: "https://dashscope.console.aliyun.com/"
  };
  console.log(`
\u26A0\uFE0F  To use ${provider}, you need a free API key.`);
  console.log(`    1. Visit: ${providerHelp[provider] || "the provider website"}`);
  console.log(`    2. Create an account and get your API key`);
  console.log(`    3. Set it with: export ${provider.toUpperCase()}_API_KEY=your-key-here`);
  return null;
}
async function validateSavedConfig(session) {
  if (session.provider === "codex") {
    const token = loadCodexToken();
    return token !== null && isCodexTokenValid(token);
  }
  if (isCloudProvider(session.provider)) {
    return getApiKeyFromEnv(session.provider) !== null;
  }
  const models = await fetchLocalModels(session.provider);
  return models.includes(session.model);
}
async function interactiveSetup(saved) {
  console.log(`
\uD83D\uDC09 ${s("BEAST", fg.accent, bold)} ${s("CLI", fg.mauve, bold)} ${s(`v${VERSION3}`, fg.muted)} ${s("\xB7", fg.muted)} ${s("45+ Providers", fg.secondary)} ${s("\xB7", fg.muted)} ${s("51+ Tools", fg.secondary)}`);
  const providers2 = await detectAllProviders();
  console.log(`${s("\u2713", fg.success)} MCP: ${nativeTools.length} tools | ${s("\u2713", fg.success)} Ollama: ${providers2.find((p) => p.id === "ollama")?.models.length || 0} models`);
  const provider = await selectProvider(providers2);
  let apiKey;
  if (isCloudProvider(provider)) {
    const key = await promptApiKey(provider);
    if (!key) {
      console.log(`   ${s("!", fg.warning)} No API key`);
      process.exit(1);
    }
    apiKey = key;
  }
  const model = await selectModelForProvider(provider, saved?.model);
  const { size, max } = await selectContextSize(saved?.contextSize);
  console.log(`
${s("\u2713", fg.success)} Provider: ${bold}${provider}${reset}
${s("\u2713", fg.success)} Model: ${bold}${model}${reset}
${s("\u2713", fg.success)} Context: ${bold}${size} tokens${reset}
`);
  return { provider, model, apiKey, baseUrl: getBaseUrl(provider), messages: [], contextMax: max };
}
function buildSessionFromSaved(saved) {
  if (!saved)
    return null;
  return {
    provider: saved.provider,
    model: saved.model,
    apiKey: getApiKeyFromEnv(saved.provider),
    baseUrl: getBaseUrl(saved.provider),
    messages: [],
    contextMax: saved.contextMax
  };
}
function estimateContextUsed(messages) {
  const avgTokensPerMsg = 50 / 4;
  return Math.round(messages.length * avgTokensPerMsg);
}
function printBanner(session) {
  const toolCount = nativeTools.length;
  console.log(renderHeader({
    version: VERSION3,
    provider: session.provider,
    model: session.model,
    toolsCount: toolCount
  }));
  console.log(`
` + inlineList([
    { icon: icon.prompt, label: "Type", value: "your request" },
    { icon: icon.tool, label: toolCount + " tools", value: "available" }
  ]));
  console.log(`
` + s("Commands:", fg.muted));
  console.log(helpPanel([
    { cmd: "/help", desc: "Show all commands" },
    { cmd: "/switch", desc: "Change provider/model/context" },
    { cmd: "/tools", desc: "List available tools" },
    { cmd: "/clear", desc: "Clear chat history" },
    { cmd: "/exit", desc: "Quit Beast CLI" }
  ]));
  console.log("");
}
async function repl(session) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const promptUser = () => rl.question(`
` + s("> ", fg.accent), async (input) => {
    const trimmed = input.trim();
    if (!trimmed) {
      promptUser();
      return;
    }
    if (trimmed === "exit" || trimmed === "quit") {
      console.log(`
` + s("\uD83D\uDC4B Goodbye!", fg.primary) + `
`);
      process.exit(0);
    }
    if (trimmed === "/help") {
      console.log(`
Commands:
  /help           Show this help
  /switch         Reconfigure provider/model/context
  /models         List available models for current provider
  /model          Interactively switch model
  /model <name>   Switch to model by name or number
  /provider       Interactively switch provider
  /provider <name>  Switch directly to provider
  /login          Authenticate ChatGPT Plus (Codex OAuth)
  /logout         Clear ChatGPT Plus authentication
  /tools          List available tools
  /clear          Clear chat history
  /exit           Exit
`);
      promptUser();
      return;
    }
    if (trimmed === "/switch") {
      const newSession = await interactiveSetup();
      Object.assign(session, newSession);
      saveSession({
        provider: session.provider,
        model: session.model,
        contextSize: session.contextMax ? session.contextMax >= 1024 ? Math.round(session.contextMax / 1024) + "K" : String(session.contextMax) : "32K",
        contextMax: session.contextMax || 32768,
        savedAt: Date.now()
      });
      printBanner(session);
      promptUser();
      return;
    }
    if (trimmed === "/login") {
      console.log(`
\uD83D\uDD11 Initiating ChatGPT Plus OAuth login...`);
      const { createProvider: createProvider2 } = await Promise.resolve().then(() => (init_providers(), exports_providers));
      try {
        await createProvider2({ provider: "codex", model: "gpt-5.2-codex" });
        console.log(`
\u2705 ChatGPT Plus authenticated!`);
      } catch (e) {
        console.log(`
\u274C Login failed: ${e.message}`);
      }
      promptUser();
      return;
    }
    if (trimmed === "/logout") {
      clearCodexToken();
      console.log(`
\u2705 ChatGPT Plus logout complete.`);
      promptUser();
      return;
    }
    if (trimmed === "/models") {
      if (session.provider === "codex") {
        console.log(`
Available ChatGPT Plus models (${CODEX_MODELS.length}):`);
        CODEX_MODELS.forEach((m, i) => console.log(`  [${i + 1}] ${m}`));
      } else if (isCloudProvider(session.provider)) {
        const models = CLOUD_MODELS[session.provider] ?? [];
        console.log(`
Available models for ${session.provider}:`);
        models.forEach((m, i) => console.log(`  [${i + 1}] ${m}`));
      } else {
        const models = await fetchLocalModels(session.provider);
        if (models.length === 0) {
          console.log(`
` + s("!", fg.warning) + " Could not fetch models. Is the server running?");
        } else {
          console.log(`
Available models on ${session.provider}:`);
          models.forEach((m, i) => console.log(`  [${i + 1}] ${m}`));
        }
      }
      promptUser();
      return;
    }
    if (trimmed === "/tools") {
      const tools2 = getFormattedTools();
      console.log(`
\uD83D\uDD27 ${tools2.length} native tools available:`);
      tools2.forEach((t) => {
        const desc = t.description ? ` \u2014 ${t.description.slice(0, 60)}` : "";
        console.log(`  \u2022 ${t.name}${desc}`);
      });
      promptUser();
      return;
    }
    if (trimmed === "/model") {
      const model = await selectModelForProvider(session.provider, session.model);
      session.model = model;
      const ctxSize = session.contextMax ? session.contextMax >= 1024 ? Math.round(session.contextMax / 1024) + "K" : String(session.contextMax) : "32K";
      saveSession({ provider: session.provider, model, contextSize: ctxSize, contextMax: session.contextMax || 32768, savedAt: Date.now() });
      console.log(`
\u2705 Model switched to: ${model}`);
      promptUser();
      return;
    }
    if (trimmed.startsWith("/model ")) {
      const target = trimmed.slice(7).trim();
      const models = isCloudProvider(session.provider) ? CLOUD_MODELS[session.provider] ?? CODEX_MODELS : await fetchLocalModels(session.provider);
      const n = parseInt(target);
      if (n >= 1 && n <= models.length)
        session.model = models[n - 1];
      else if (models.includes(target))
        session.model = target;
      else {
        console.log(`
${s("!", fg.warning)} Unknown model: ${target}`);
        console.log(`   Run /models to see available models.`);
        promptUser();
        return;
      }
      const ctxSize = session.contextMax ? session.contextMax >= 1024 ? Math.round(session.contextMax / 1024) + "K" : String(session.contextMax) : "32K";
      saveSession({ provider: session.provider, model: session.model, contextSize: ctxSize, contextMax: session.contextMax || 32768, savedAt: Date.now() });
      console.log(`
\u2705 Model switched to: ${session.model}`);
      promptUser();
      return;
    }
    if (trimmed === "/provider") {
      const providers2 = await detectAllProviders();
      const newProvider = await selectProvider(providers2);
      if (isCloudProvider(newProvider)) {
        const key = await promptApiKey(newProvider);
        if (!key) {
          console.log(`
` + s("!", fg.warning) + " Provider switch cancelled.");
          promptUser();
          return;
        }
        session.apiKey = key;
      }
      const newModel = await selectModelForProvider(newProvider);
      const { size, max } = await selectContextSize();
      session.provider = newProvider;
      session.model = newModel;
      session.baseUrl = getBaseUrl(newProvider);
      session.contextMax = max;
      saveSession({ provider: newProvider, model: newModel, contextSize: size, contextMax: max, savedAt: Date.now() });
      printBanner(session);
      promptUser();
      return;
    }
    if (trimmed.startsWith("/provider ")) {
      const target = trimmed.slice(10).trim();
      const providers2 = await detectAllProviders();
      const found = providers2.find((p) => p.id === target);
      if (!found) {
        console.log(`
${s("!", fg.warning)} Unknown provider: ${target}`);
        console.log("   Run /provider to see available providers.");
        promptUser();
        return;
      }
      if (isCloudProvider(target)) {
        const key = await promptApiKey(target);
        if (!key) {
          console.log(`
` + s("!", fg.warning) + " Provider switch cancelled.");
          promptUser();
          return;
        }
        session.apiKey = key;
      }
      const newModel = await selectModelForProvider(target);
      const { size, max } = await selectContextSize();
      session.provider = target;
      session.model = newModel;
      session.baseUrl = getBaseUrl(target);
      session.contextMax = max;
      saveSession({ provider: target, model: newModel, contextSize: size, contextMax: max, savedAt: Date.now() });
      printBanner(session);
      promptUser();
      return;
    }
    if (trimmed === "/clear") {
      session.messages = [];
      console.log(`
\u2705 Chat history cleared.`);
      promptUser();
      return;
    }
    const REALTIME_KEYWORDS = [
      "price",
      "rate",
      "rates",
      "weather",
      "news",
      "today",
      "current",
      "latest",
      "now",
      "recent",
      "gold",
      "silver",
      "petrol",
      "dollar",
      "rupee",
      "inflation",
      "gdp",
      "stock",
      "market",
      "trending",
      "score",
      "match",
      "result",
      "election",
      "government",
      "policy"
    ];
    function looksLikeRealTimeQuery(query) {
      const lower = query.toLowerCase();
      return REALTIME_KEYWORDS.some((kw) => lower.includes(kw));
    }
    function isApologyOrNoAccess(response) {
      const lower = response.toLowerCase();
      const noDataPhrases = [
        "don't have access",
        "do not have access",
        "no real-time",
        "not have real-time",
        "don't have real-time",
        "can't access",
        "cannot access",
        "don't have current",
        "no up-to-date",
        "don't have up-to-date",
        "don't know current",
        "don't have the ability to",
        "don't have browsing",
        "no browsing ability",
        "only have knowledge",
        "training data",
        "my knowledge"
      ];
      return noDataPhrases.some((phrase) => lower.includes(phrase));
    }
    function providerSupportsNativeTools(sessionProvider) {
      const noNativeToolSupport = ["ollama"];
      return !noNativeToolSupport.includes(sessionProvider);
    }
    const MAX_TOOL_CALLS = 20;
    let toolCallCount = 0;
    const agentMessages = [...session.messages];
    if (nativeTools.length > 0) {
      agentMessages.unshift({
        role: "system",
        content: `You have access to ${nativeTools.length} native tools. Use them to get real-time data, search the web, read/write files, run code, fetch content, etc. Available tools: ${nativeTools.map((t) => `${t.name}: ${t.description ?? "no description"}`).join(", ")}`
      });
    }
    agentMessages.push({ role: "user", content: trimmed });
    startFunSpinner("thinking");
    try {
      const provider = await createProvider({
        provider: session.provider,
        model: session.model,
        apiKey: session.apiKey,
        baseUrl: session.baseUrl || undefined
      });
      while (toolCallCount < MAX_TOOL_CALLS) {
        const tools2 = nativeTools.length > 0 ? nativeTools : undefined;
        const response = await provider.create({
          messages: agentMessages,
          tools: tools2,
          maxTokens: 16384
        });
        stopFunSpinner("done");
        if (toolCallCount === 0) {
          printUsage(response.usage);
        }
        if (!response.toolCalls || response.toolCalls.length === 0) {
          const noNativeTools = !providerSupportsNativeTools(session.provider);
          const needsRealTime = looksLikeRealTimeQuery(trimmed);
          const looksLikeApology = response.content ? isApologyOrNoAccess(response.content) : false;
          if (noNativeTools && needsRealTime && looksLikeApology) {
            console.log(s(`
\uD83D\uDD0D Auto-detected real-time query`, fg.info) + s(" \u2014 fetching live data...", fg.secondary));
            const searchQuery = trimmed;
            const searchResult = await withProgress("Searching", executeTool("searxng_search", { query: searchQuery, limit: 10 }));
            const resultText = searchResult.success ? searchResult.content : `Error: ${searchResult.error}`;
            const truncated = resultText.length > 200 ? resultText.slice(0, 200) + "..." : resultText;
            console.log(s("  \uD83D\uDCE4 Result:", fg.tool) + " " + s(truncated, fg.secondary) + `
`);
            agentMessages.push({ role: "assistant", content: response.content });
            agentMessages.push({
              role: "user",
              content: `Search results for "${searchQuery}":
${resultText}

Please provide a clear, concise answer based on these results.`
            });
            startFunSpinner("formatting");
            const formatted = await provider.create({
              messages: agentMessages,
              tools: undefined,
              maxTokens: 16384
            });
            stopFunSpinner("done");
            if (formatted.content) {
              streamText(formatted.content);
            }
            printUsage(formatted.usage ?? response.usage);
            agentMessages.push({ role: "assistant", content: formatted.content });
            break;
          }
          if (response.content) {
            streamText(response.content);
          }
          agentMessages.push({ role: "assistant", content: response.content });
          break;
        }
        for (const tc of response.toolCalls) {
          toolCallCount++;
          const toolName = tc.name;
          const toolArgs = tc.arguments ?? {};
          process.stdout.write(`
`);
          const argsStr = JSON.stringify(toolArgs);
          const argsDisplay = argsStr.length > 60 ? argsStr.slice(0, 60) + "..." : argsStr;
          process.stdout.write(s("\uD83D\uDD27 " + toolName, fg.tool) + " " + s(argsDisplay, fg.muted) + `
`);
          startFunSpinner("tool");
          const toolResult = await executeTool(toolName, toolArgs);
          stopFunSpinner(toolResult.success ? "done" : "error");
          console.log(renderToolResult(toolName, toolResult));
          agentMessages.push({
            role: "assistant",
            content: response.content,
            toolCalls: [tc]
          });
          agentMessages.push({
            role: "user",
            content: toolResult.content,
            toolCallId: tc.id
          });
        }
      }
      if (toolCallCount >= MAX_TOOL_CALLS) {
        console.log(s(`
\u26A0\uFE0F  Reached tool call limit (${MAX_TOOL_CALLS}). Truncating.`, fg.warning));
      }
      session.messages = agentMessages;
      if (session.messages.length > 40) {
        session.messages = session.messages.slice(-40);
      }
      process.stdout.write(tipBanner());
      if (session.contextMax) {
        const used = estimateContextUsed(agentMessages);
        process.stdout.write(contextBar({ used, max: session.contextMax }) + `
`);
      }
    } catch (e) {
      stopFunSpinner("error");
      console.log(`
\u274C Error: ${e}`);
      if (session.messages.length > 0)
        session.messages.pop();
    }
    try {
      if (!rl.closed)
        promptUser();
    } catch {}
  });
  promptUser();
}
function printHelp() {
  console.log(renderCleanBanner());
  console.log(`
\uD83D\uDC09 BEAST CLI v${VERSION3} - AI Coding Agent

USAGE:
  beast [options]

OPTIONS:
  --provider <name>  LLM provider (ollama, codex, anthropic, openai, etc.)
  --model <name>     Model name
  --defaults         Use saved config or auto-select best option
  --switch           Reconfigure provider/model/context
  --setup            Auto-start MCP server
  --help             Show this help

SESSION COMMANDS:
  /switch        Reconfigure everything (provider, model, context)
  /provider      Switch provider (interactive)
  /provider <name>  Switch to provider by name
  /model         Switch model (interactive)
  /model <name>  Switch to model by name or number
  /models        List available models
  /tools         List available tools
  /clear         Clear chat history
  /help          Show this help
  /exit          Exit

EXAMPLES:
  beast                          # Use saved config or auto-select
  beast --defaults               # Quick start with best option
  beast --switch                 # Reconfigure from scratch
  beast --provider ollama        # Use Ollama with model picker
`);
}
async function main() {
  const args = Bun.argv.slice(2);
  const options = {};
  for (let i = 0;i < args.length; i++) {
    switch (args[i]) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--provider":
        options.provider = args[++i];
        break;
      case "--model":
        options.model = args[++i];
        break;
      case "--test":
        options.test = true;
        break;
      case "--setup":
        options.setup = true;
        break;
      case "--defaults":
        options.defaults = true;
        break;
      case "--switch":
        options.switch = true;
        break;
    }
  }
  if (options.help) {
    printHelp();
    process.exit(0);
  }
  if (options.test) {
    console.log("Running tests...");
    process.exit(0);
  }
  await connectMCP();
  console.log(renderCleanBanner());
  let session;
  const saved = loadSession();
  const savedValid = saved ? await validateSavedConfig(buildSessionFromSaved(saved)) : false;
  if (options.switch) {
    session = await interactiveSetup(saved || undefined);
  } else if (options.provider && options.model) {
    session = {
      provider: options.provider,
      model: options.model,
      apiKey: getApiKeyFromEnv(options.provider),
      baseUrl: getBaseUrl(options.provider),
      messages: [],
      contextMax: 32768
    };
  } else if (options.defaults) {
    const token = loadCodexToken();
    if (token && isCodexTokenValid(token)) {
      session = { provider: "codex", model: "gpt-5.2-codex", apiKey: undefined, baseUrl: "https://chatgpt.com/backend-api", messages: [], contextMax: 128 * 1024 };
      console.log(`\u2705 ChatGPT Plus (logged in)`);
    } else {
      const ollamaModels = await fetchOllamaModels();
      if (ollamaModels.length > 0) {
        session = { provider: "ollama", model: ollamaModels[0], apiKey: undefined, baseUrl: "http://localhost:11434", messages: [], contextMax: 128 * 1024 };
        console.log(`\u2705 Ollama (${ollamaModels[0]}) \u2014 Free & offline`);
      } else {
        session = await interactiveSetup(saved || undefined);
      }
    }
  } else if (saved && savedValid) {
    session = buildSessionFromSaved(saved);
    const ctxStr = saved.contextMax ? saved.contextMax >= 1024 ? Math.round(saved.contextMax / 1024) + "K" : String(saved.contextMax) : "32K";
    console.log(`\u2705 Using saved config: ${session.provider} / ${session.model} / ${ctxStr}`);
  } else {
    session = await interactiveSetup(saved || undefined);
  }
  const ctxSize = session.contextMax ? session.contextMax >= 1024 ? Math.round(session.contextMax / 1024) + "K" : "32K" : "32K";
  saveSession({ provider: session.provider, model: session.model, contextSize: ctxSize, contextMax: session.contextMax || 32768, savedAt: Date.now() });
  await repl(session);
}
main().catch(console.error);
