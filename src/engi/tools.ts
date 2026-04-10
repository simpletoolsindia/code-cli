// Engi Tools - Software Engineering Intelligence as Native Tools
// Converts MCP tools to local implementations - no Docker/MCP server needed

import { getIndexer, indexRepository } from './indexer.ts';
import { getRetrievalEngine } from './retrieval.ts';
import { getSummarizationEngine } from './summarizer.ts';
import { getMemoryStore, createCheckpoint } from './memory.ts';
import {
  TaskClassification,
  TaskType,
  ScopedResult,
  FlowSummary,
  BugTraceResult,
  ImplementationPlan,
  POCPlan,
  ImpactAnalysis,
  TestSelection,
  DocContext,
  DocUpdatePlan,
  MemoryCheckpoint,
  MemoryRestoreResult,
  MemoryDecision,
  MemoryScope
} from './types.ts';

// Stop words for keyword extraction
const STOP_WORDS = new Set([
  'function', 'class', 'method', 'variable', 'const', 'let', 'var',
  'return', 'import', 'export', 'async', 'await', 'the', 'and', 'for',
  'with', 'this', 'that', 'from', 'type', 'interface', 'new', 'not'
]);

// ============================================================================
// TASK CLASSIFY
// ============================================================================

export async function engiTaskClassify(params: {
  task: string;
  keywords?: string[];
}): Promise<TaskClassification> {
  const { task, keywords = [] } = params;
  const taskLower = task.toLowerCase();

  const detectedTypes: TaskType[] = [];
  let confidence = 0;

  if (taskLower.includes('bug') || taskLower.includes('fix') || taskLower.includes('error') ||
      taskLower.includes('crash') || taskLower.includes('fail') || taskLower.includes('issue')) {
    detectedTypes.push('bug');
    confidence += 0.8;
  }

  if (taskLower.includes('implement') || taskLower.includes('add') || taskLower.includes('new') ||
      taskLower.includes('feature') || taskLower.includes('create')) {
    detectedTypes.push('feature');
    confidence += 0.7;
  }

  if (taskLower.includes('poc') || taskLower.includes('proof of concept') ||
      taskLower.includes('prototype') || taskLower.includes('mockup')) {
    detectedTypes.push('poc');
    confidence += 0.9;
  }

  if (taskLower.includes('doc') || taskLower.includes('readme') || taskLower.includes('comment') ||
      taskLower.includes('explain') || taskLower.includes('guide')) {
    detectedTypes.push('documentation');
    confidence += 0.8;
  }

  if (taskLower.includes('analyze') || taskLower.includes('understand') ||
      taskLower.includes('how does') || taskLower.includes('what is')) {
    detectedTypes.push('analysis');
    confidence += 0.6;
  }

  if (detectedTypes.length === 0) {
    detectedTypes.push('analysis');
    confidence = 0.5;
  }

  let suggestedMode: TaskClassification['suggestedMode'] = 'analysis';
  if (detectedTypes.includes('bug') || detectedTypes.includes('feature')) {
    suggestedMode = 'planning';
  } else if (detectedTypes.includes('documentation')) {
    suggestedMode = 'documentation';
  }

  const nextTools: string[] = [];
  if (suggestedMode === 'analysis') {
    nextTools.push('engi_repo_scope_find', 'engi_flow_summarize');
  } else if (suggestedMode === 'planning') {
    nextTools.push('engi_repo_scope_find', 'engi_implementation_plan');
  } else if (suggestedMode === 'documentation') {
    nextTools.push('engi_doc_context_build', 'engi_doc_update_plan');
  }

  confidence = Math.min(confidence, 1);

  return { types: detectedTypes, confidence, suggestedMode, nextTools };
}

// ============================================================================
// REPO SCOPE FIND
// ============================================================================

export async function engiRepoScopeFind(params: {
  task: string;
  taskType: TaskType;
  keywords?: string[];
  limit?: number;
  repoPath?: string;
}): Promise<ScopedResult> {
  const { task, taskType, keywords = [], limit = 10, repoPath } = params;

  if (repoPath) {
    await indexRepository(repoPath);
  }

  const retrieval = getRetrievalEngine();

  return retrieval.findScope({ task, taskType, keywords, limit });
}

// ============================================================================
// FLOW SUMMARIZE
// ============================================================================

export async function engiFlowSummarize(params: {
  scope?: string[];
  entryPoint?: string;
  verbosity?: 'minimal' | 'standard' | 'detailed';
}): Promise<FlowSummary> {
  const summarizer = getSummarizationEngine();

  return summarizer.generateFlowSummary({
    scope: params.scope,
    entryPoint: params.entryPoint,
    verbosity: params.verbosity
  });
}

// ============================================================================
// BUG TRACE COMPACT
// ============================================================================

export async function engiBugTraceCompact(params: {
  symptom: string;
  scope?: string[];
}): Promise<BugTraceResult> {
  const summarizer = getSummarizationEngine();

  return summarizer.traceBug(params.symptom, params.scope);
}

// ============================================================================
// IMPLEMENTATION PLAN
// ============================================================================

export async function engiImplementationPlan(params: {
  task: string;
  taskType: 'feature' | 'bug';
  scope: string[];
  existingPatterns?: string[];
}): Promise<ImplementationPlan> {
  const { task, taskType, scope, existingPatterns = [] } = params;

  const steps = [];
  const editTargets = [];
  const requiredTests: string[] = [];
  const requiredDocs: string[] = [];
  const riskNotes: string[] = [];

  for (let i = 0; i < scope.length; i++) {
    const file = scope[i];

    if (taskType === 'feature') {
      steps.push({ order: i + 1, description: `Implement in ${file}`, file, action: 'modify' as const });
      editTargets.push({ file, description: `Add new functionality for: ${task}` });
    } else {
      steps.push({ order: i + 1, description: `Fix bug in ${file}`, file, action: 'modify' as const });
      editTargets.push({ file, description: `Address the bug: ${task}` });
      riskNotes.push(`Potential regression risk in ${file}`);
    }
  }

  steps.push({
    order: steps.length + 1,
    description: 'Create or update tests',
    file: scope[0] || 'test file',
    action: 'create',
    dependencies: steps.map(s => s.file)
  });

  requiredTests.push(`${scope[0] || 'source'}.test.ts`);

  if (taskType === 'feature') {
    steps.push({ order: steps.length + 1, description: 'Update documentation', file: 'docs', action: 'modify' as const });
    requiredDocs.push('README.md');
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

// ============================================================================
// POC PLAN
// ============================================================================

export async function engiPOCPlan(params: {
  goal: string;
  constraints?: string[];
  existingCode?: string[];
}): Promise<POCPlan> {
  const { goal, constraints = [], existingCode = [] } = params;

  let minimalArchitecture = 'Simple Node.js module';
  const filesToCreate: string[] = [];
  const shortcutsAllowed: string[] = [];
  const excludedScope: string[] = [];

  const goalLower = goal.toLowerCase();

  if (goalLower.includes('api') || goalLower.includes('endpoint')) {
    minimalArchitecture = 'Simple Express/HTTP handler with minimal routing';
    filesToCreate.push('src/poc/handler.ts');
    shortcutsAllowed.push('Use in-memory storage', 'Skip authentication');
    excludedScope.push('Database integration', 'Complex validation');
  } else if (goalLower.includes('database') || goalLower.includes('storage')) {
    minimalArchitecture = 'In-memory or file-based storage';
    filesToCreate.push('src/poc/storage.ts');
    shortcutsAllowed.push('Skip connection pooling');
    excludedScope.push('Production database');
  } else if (goalLower.includes('ui') || goalLower.includes('interface')) {
    minimalArchitecture = 'Minimal UI component';
    filesToCreate.push('src/poc/Component.tsx');
    shortcutsAllowed.push('Skip styling', 'Use mock data');
  } else {
    minimalArchitecture = 'Simple module with core logic';
    filesToCreate.push('src/poc/index.ts');
    shortcutsAllowed.push('Skip error handling', 'Skip logging');
  }

  for (const constraint of constraints) {
    const cLower = constraint.toLowerCase();
    if (cLower.includes('no auth')) excludedScope.push('Authentication');
    if (cLower.includes('simple')) excludedScope.push('Advanced features');
  }

  return {
    goal,
    minimalArchitecture,
    filesToCreate,
    shortcutsAllowed,
    excludedScope,
    mockStrategy: 'Use hardcoded test data and in-memory implementations',
    handle: `poc_${Date.now()}`
  };
}

// ============================================================================
// IMPACT ANALYZE
// ============================================================================

export async function engiImpactAnalyze(params: {
  scope: string[];
  changeType: 'add' | 'modify' | 'delete';
}): Promise<ImpactAnalysis> {
  const { scope, changeType } = params;

  const indexer = getIndexer();
  const index = indexer.getIndex();

  const affectedFiles: string[] = [];
  const affectedModules: string[] = [];
  const affectedSymbols: string[] = [];
  const regressionNotes: string[] = [];
  const riskyPoints: string[] = [];
  const relatedTests: string[] = [];
  const docsImpact: string[] = [];

  if (!index) {
    return { affectedFiles: [], affectedModules: [], affectedSymbols: [], regressionNotes: ['No repository indexed'], riskyPoints: [], relatedTests: [], docsImpact: [] };
  }

  const retrieval = getRetrievalEngine();

  for (const filePath of scope) {
    const dependents = await retrieval.findDependents(filePath);
    for (const dep of dependents) {
      if (!affectedFiles.includes(dep.path)) affectedFiles.push(dep.path);
    }

    const tests = await retrieval.findRelatedTests(filePath);
    for (const test of tests) {
      if (!relatedTests.includes(test.path)) relatedTests.push(test.path);
    }

    const module = filePath.split('/')[0];
    if (!affectedModules.includes(module)) affectedModules.push(module);
  }

  for (const file of affectedFiles) {
    const fileType = index.files.get(file)?.type;
    if (fileType === 'source') regressionNotes.push(`Potential regression in: ${file}`);
  }

  if (changeType === 'delete') {
    riskyPoints.push('Removing files may break dependent code', 'Check for exposed APIs that depend on deleted code');
  } else if (changeType === 'modify') {
    riskyPoints.push('Existing function signatures may affect callers', 'Check for breaking changes in public exports');
  }

  for (const file of scope) {
    const module = file.split('/')[0];
    const moduleDocs = index.docs.filter(d => d.path.startsWith(module) || d.path.includes(module));
    for (const doc of moduleDocs) {
      if (!docsImpact.includes(doc.path)) docsImpact.push(doc.path);
    }
  }

  return { affectedFiles, affectedModules, affectedSymbols, regressionNotes, riskyPoints, relatedTests, docsImpact };
}

// ============================================================================
// TEST SELECT
// ============================================================================

export async function engiTestSelect(params: {
  scope: string[];
  changeType?: 'add' | 'modify' | 'delete';
}): Promise<TestSelection> {
  const { scope, changeType = 'modify' } = params;

  const retrieval = getRetrievalEngine();
  const requiredTests = [];
  const optionalTests = [];

  for (const filePath of scope) {
    const tests = await retrieval.findRelatedTests(filePath);

    for (const test of tests) {
      const testInfo = {
        path: test.path,
        type: test.type === 'other' ? 'unit' : test.type as 'unit' | 'integration' | 'e2e',
        targetCoverage: [filePath]
      };

      if (changeType !== 'add') {
        if (!requiredTests.some((t: any) => t.path === test.path)) requiredTests.push(testInfo);
      } else {
        if (!optionalTests.some((t: any) => t.path === test.path)) optionalTests.push(testInfo);
      }
    }
  }

  let reason = `Found ${requiredTests.length} required and ${optionalTests.length} optional tests`;
  if (requiredTests.length === 0 && optionalTests.length === 0) {
    reason = 'No direct tests found - consider writing new tests for changes';
  }

  return { requiredTests, optionalTests, reason };
}

// ============================================================================
// DOC CONTEXT BUILD
// ============================================================================

export async function engiDocContextBuild(params: {
  feature?: string;
  changedFiles?: string[];
  audience?: 'junior' | 'senior' | 'pm' | 'qa' | 'api';
}): Promise<DocContext> {
  const summarizer = getSummarizationEngine();

  return summarizer.buildDocContext({
    feature: params.feature,
    changedFiles: params.changedFiles,
    audience: params.audience
  });
}

// ============================================================================
// DOC UPDATE PLAN
// ============================================================================

export async function engiDocUpdatePlan(params: {
  changedFiles: string[];
  existingDocs?: string[];
}): Promise<DocUpdatePlan> {
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

  const changedModules = new Set(changedFiles.map(f => f.split('/')[0]));

  for (const doc of index.docs) {
    const docModule = doc.path.split('/')[0];
    if (changedModules.has(docModule) || changedFiles.some(f => doc.path.includes(f))) {
      docsToUpdate.push({ path: doc.path, reason: `References changed module: ${docModule}` });
      sectionsToUpdate.push(`${doc.name} - ${docModule} section`);
    }
  }

  if (changedFiles.length > 0 && docsToUpdate.length === 0) {
    docsToCreate.push({ path: 'docs/CHANGES.md', purpose: 'Document changes in changed files' });
  }

  for (const file of changedFiles.slice(0, 3)) {
    const fileName = file.split('/').pop() || '';
    if (fileName && !fileName.includes('test')) {
      examplesNeeded.push(`Example usage of ${fileName.replace(/\.[^.]+$/, '')}`);
    }
  }

  return { docsToUpdate, docsToCreate, sectionsToUpdate, examplesNeeded };
}

// ============================================================================
// MEMORY CHECKPOINT
// ============================================================================

export async function engiMemoryCheckpoint(params: {
  taskId: string;
  taskType: TaskType;
  files: string[];
  symbols?: string[];
  modules?: string[];
  decisions?: { description: string; rationale: string }[];
  risks?: string[];
  pendingValidations?: string[];
  pendingDocs?: string[];
  notes?: string;
}): Promise<MemoryCheckpoint> {
  const memory = getMemoryStore();

  const checkpointData = createCheckpoint({
    taskId: params.taskId,
    taskType: params.taskType,
    scope: {
      files: params.files,
      symbols: params.symbols || [],
      modules: params.modules || []
    },
    decisions: params.decisions?.map(d => ({ ...d, timestamp: Date.now() })) || [],
    risks: params.risks || [],
    pendingValidations: params.pendingValidations || [],
    pendingDocs: params.pendingDocs || [],
    notes: params.notes || ''
  });

  return memory.saveCheckpoint(checkpointData);
}

// ============================================================================
// MEMORY RESTORE
// ============================================================================

export async function engiMemoryRestore(params: {
  id?: string;
  taskId?: string;
}): Promise<MemoryRestoreResult | null> {
  const memory = getMemoryStore();

  if (params.id) {
    return memory.restore(params.id);
  } else if (params.taskId) {
    const checkpoint = memory.getLatestForTask(params.taskId);
    if (checkpoint) return memory.restore(checkpoint.id);
  }

  return null;
}

// ============================================================================
// Tool Registry
// ============================================================================

export const engiTools = [
  {
    name: 'engi_task_classify',
    description: 'Classify an engineering task to determine its type and suggest next steps',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'The engineering task description to classify' },
        keywords: { type: 'array', items: { type: 'string' }, description: 'Optional keywords for context' }
      },
      required: ['task']
    },
    execute: async (args: Record<string, unknown>) => {
      const result = await engiTaskClassify(args as any);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: 'engi_repo_scope_find',
    description: 'Identify minimum relevant repository scope for a task',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'The task description' },
        taskType: { type: 'string', enum: ['analysis', 'feature', 'bug', 'poc', 'documentation', 'mixed'], description: 'Type of task' },
        keywords: { type: 'array', items: { type: 'string' }, description: 'Additional keywords' },
        limit: { type: 'number', description: 'Maximum results to return' },
        repoPath: { type: 'string', description: 'Repository path to index' }
      },
      required: ['task', 'taskType']
    },
    execute: async (args: Record<string, unknown>) => {
      const result = await engiRepoScopeFind(args as any);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: 'engi_flow_summarize',
    description: 'Explain existing implementation flow',
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'array', items: { type: 'string' }, description: 'File paths to include' },
        entryPoint: { type: 'string', description: 'Entry point file' },
        verbosity: { type: 'string', enum: ['minimal', 'standard', 'detailed'], description: 'Verbosity level' }
      }
    },
    execute: async (args: Record<string, unknown>) => {
      const result = await engiFlowSummarize(args as any);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: 'engi_bug_trace_compact',
    description: 'Trace likely bug causes from symptom description',
    inputSchema: {
      type: 'object',
      properties: {
        symptom: { type: 'string', description: 'Bug symptom description' },
        scope: { type: 'array', items: { type: 'string' }, description: 'Files to investigate' }
      },
      required: ['symptom']
    },
    execute: async (args: Record<string, unknown>) => {
      const result = await engiBugTraceCompact(args as any);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: 'engi_implementation_plan',
    description: 'Build implementation plan for new feature or fix',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'Feature or fix description' },
        taskType: { type: 'string', enum: ['feature', 'bug'], description: 'Type of task' },
        scope: { type: 'array', items: { type: 'string' }, description: 'Files in scope' },
        existingPatterns: { type: 'array', items: { type: 'string' }, description: 'Existing patterns to follow' }
      },
      required: ['task', 'taskType', 'scope']
    },
    execute: async (args: Record<string, unknown>) => {
      const result = await engiImplementationPlan(args as any);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: 'engi_poc_plan',
    description: 'Define minimum viable POC implementation',
    inputSchema: {
      type: 'object',
      properties: {
        goal: { type: 'string', description: 'POC goal description' },
        constraints: { type: 'array', items: { type: 'string' }, description: 'Known constraints' },
        existingCode: { type: 'array', items: { type: 'string' }, description: 'Existing code to leverage' }
      },
      required: ['goal']
    },
    execute: async (args: Record<string, unknown>) => {
      const result = await engiPOCPlan(args as any);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: 'engi_impact_analyze',
    description: 'Estimate blast radius of change',
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'array', items: { type: 'string' }, description: 'Files being changed' },
        changeType: { type: 'string', enum: ['add', 'modify', 'delete'], description: 'Type of change' }
      },
      required: ['scope', 'changeType']
    },
    execute: async (args: Record<string, unknown>) => {
      const result = await engiImpactAnalyze(args as any);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: 'engi_test_select',
    description: 'Choose minimum useful test set',
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'array', items: { type: 'string' }, description: 'Files being changed' },
        changeType: { type: 'string', enum: ['add', 'modify', 'delete'], description: 'Type of change' }
      },
      required: ['scope']
    },
    execute: async (args: Record<string, unknown>) => {
      const result = await engiTestSelect(args as any);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: 'engi_doc_context_build',
    description: 'Build compact context for docs generation',
    inputSchema: {
      type: 'object',
      properties: {
        feature: { type: 'string', description: 'Feature or change to document' },
        changedFiles: { type: 'array', items: { type: 'string' }, description: 'Files that changed' },
        audience: { type: 'string', enum: ['junior', 'senior', 'pm', 'qa', 'api'], description: 'Target audience' }
      }
    },
    execute: async (args: Record<string, unknown>) => {
      const result = await engiDocContextBuild(args as any);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: 'engi_doc_update_plan',
    description: 'Identify which docs must change',
    inputSchema: {
      type: 'object',
      properties: {
        changedFiles: { type: 'array', items: { type: 'string' }, description: 'Files that changed' },
        existingDocs: { type: 'array', items: { type: 'string' }, description: 'Existing docs' }
      },
      required: ['changedFiles']
    },
    execute: async (args: Record<string, unknown>) => {
      const result = await engiDocUpdatePlan(args as any);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: 'engi_memory_checkpoint',
    description: 'Store compact task state outside conversation context',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Unique task identifier' },
        taskType: { type: 'string', enum: ['analysis', 'feature', 'bug', 'poc', 'documentation', 'mixed'], description: 'Type of task' },
        files: { type: 'array', items: { type: 'string' }, description: 'Files in scope' },
        symbols: { type: 'array', items: { type: 'string' }, description: 'Symbols in scope' },
        modules: { type: 'array', items: { type: 'string' }, description: 'Modules in scope' },
        decisions: { type: 'array', items: { type: 'object', properties: { description: { type: 'string' }, rationale: { type: 'string' } } }, description: 'Decisions made' },
        risks: { type: 'array', items: { type: 'string' }, description: 'Identified risks' },
        pendingValidations: { type: 'array', items: { type: 'string' }, description: 'Pending validations' },
        pendingDocs: { type: 'array', items: { type: 'string' }, description: 'Pending docs' },
        notes: { type: 'string', description: 'Additional notes' }
      },
      required: ['taskId', 'taskType', 'files']
    },
    execute: async (args: Record<string, unknown>) => {
      const result = await engiMemoryCheckpoint(args as any);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  },
  {
    name: 'engi_memory_restore',
    description: 'Restore compact previously saved task state',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Checkpoint ID to restore' },
        taskId: { type: 'string', description: 'Task ID to restore latest checkpoint' }
      }
    },
    execute: async (args: Record<string, unknown>) => {
      const result = await engiMemoryRestore(args as any);
      return { success: true, content: JSON.stringify(result, null, 2) };
    }
  }
];
