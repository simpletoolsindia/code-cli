// RAG Engine — Retrieval-Augmented Generation for code summaries
// Chunks file content into function/class bodies, scores by keyword overlap
import * as fs from 'fs';
import * as path from 'path';
import { RepositoryIndex } from '../types.ts';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CodeChunk {
  file: string;
  symbol: string;
  type: 'function' | 'class' | 'method' | 'block';
  startLine: number;
  content: string;
  tokens: number;
  terms: Map<string, number>;
}

export interface RetrievedChunk {
  file: string;
  symbol: string;
  snippet: string;
  score: number;
  reason: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const MAX_CHUNK_LINES   = 40;
const MAX_SNIPPET_LINES = 12;
const MAX_RESULTS       = 5;
const MIN_SCORE         = 0.05;

const STOP = new Set([
  'function','class','method','const','let','var','return','import','export',
  'async','await','the','and','for','with','this','that','from','type',
  'interface','new','not','if','else','try','catch','throw','get','set',
  'public','private','protected','readonly','static','void','any','true','false',
  'null','undefined','string','number','boolean','object','array',
]);

const CHUNK_START_RE = /^(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|class\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\(|(?:  |\t)(?:async\s+)?(\w+)\s*\()/;

interface CacheEntry { chunks: CodeChunk[]; indexedAt: number }
let chunkCache: CacheEntry | null = null;

// ── RagEngine class ────────────────────────────────────────────────────────────

export class RagEngine {

  retrieve(
    query: string,
    index: RepositoryIndex,
    options: { files?: string[]; topK?: number } = {},
  ): RetrievedChunk[] {
    const chunks  = this.getChunks(index);
    const topK    = options.topK ?? MAX_RESULTS;
    const fileSet = options.files ? new Set(options.files) : null;

    const queryTerms = extractTerms(query);
    if (queryTerms.size === 0) return [];

    const scored: Array<{ chunk: CodeChunk; score: number; reason: string }> = [];

    for (const chunk of chunks) {
      if (fileSet && !fileSet.has(chunk.file)) continue;
      const { score, reason } = scoreChunk(queryTerms, chunk.terms, chunk.symbol);
      if (score >= MIN_SCORE) scored.push({ chunk, score, reason });
    }

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK).map(({ chunk, score, reason }) => ({
      file:    chunk.file,
      symbol:  chunk.symbol,
      snippet: trimSnippet(chunk.content, MAX_SNIPPET_LINES),
      score:   Math.round(score * 100) / 100,
      reason,
    }));
  }

  retrieveByLiteral(
    literals: string[],
    index: RepositoryIndex,
    options: { files?: string[]; topK?: number } = {},
  ): RetrievedChunk[] {
    const chunks  = this.getChunks(index);
    const topK    = options.topK ?? MAX_RESULTS;
    const fileSet = options.files ? new Set(options.files) : null;
    const lits    = literals.map(l => l.toLowerCase());

    const scored: Array<{ chunk: CodeChunk; score: number; reason: string }> = [];

    for (const chunk of chunks) {
      if (fileSet && !fileSet.has(chunk.file)) continue;
      const lower  = chunk.content.toLowerCase();
      const hits   = lits.filter(l => lower.includes(l));
      if (hits.length > 0) {
        const score  = hits.length / lits.length;
        scored.push({ chunk, score, reason: `literal:${hits.slice(0,3).join(',')}` });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, topK).map(({ chunk, score, reason }) => ({
      file:    chunk.file,
      symbol:  chunk.symbol,
      snippet: trimSnippet(chunk.content, MAX_SNIPPET_LINES),
      score:   Math.round(score * 100) / 100,
      reason,
    }));
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private getChunks(index: RepositoryIndex): CodeChunk[] {
    if (chunkCache && chunkCache.indexedAt === index.lastIndexed) {
      return chunkCache.chunks;
    }
    const chunks = buildChunkIndex(index);
    chunkCache = { chunks, indexedAt: index.lastIndexed };
    return chunks;
  }
}

// ── Chunk building ────────────────────────────────────────────────────────────

function buildChunkIndex(index: RepositoryIndex): CodeChunk[] {
  const chunks: CodeChunk[] = [];

  for (const [filePath, file] of index.files) {
    if (file.type !== 'source' && file.type !== 'test') continue;
    if (!['typescript', 'javascript', 'python', 'go'].includes(file.language)) continue;

    const absPath = path.join(index.rootPath, filePath);
    let content: string;
    try { content = fs.readFileSync(absPath, 'utf-8'); }
    catch { continue; }

    const fileChunks = extractChunks(content, filePath, file.language);
    chunks.push(...fileChunks);
  }

  return chunks;
}

function extractChunks(content: string, filePath: string, language: string): CodeChunk[] {
  const lines   = content.split('\n');
  const chunks: CodeChunk[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line  = lines[i];
    const match = CHUNK_START_RE.exec(line);
    if (!match) continue;

    const symbol = match[1] || match[2] || match[3] || match[4];
    if (!symbol || symbol.length < 2) continue;

    const type: CodeChunk['type'] =
      line.includes('class ')    ? 'class'
      : match[4]                 ? 'method'
      : line.includes('function') || line.includes('=>') || line.includes('= (') ? 'function'
      : 'block';

    const bodyLines = extractBody(lines, i, MAX_CHUNK_LINES);
    if (bodyLines.length < 2) continue;

    const chunkContent = bodyLines.join('\n');
    chunks.push({
      file:      filePath,
      symbol,
      type,
      startLine: i + 1,
      content:   chunkContent,
      tokens:    estimateChunkTokens(chunkContent),
      terms:     extractTerms(chunkContent + ' ' + symbol),
    });
  }

  return chunks;
}

function extractBody(lines: string[], startIdx: number, maxLines: number): string[] {
  const body: string[] = [lines[startIdx]];
  let depth = 0;
  let started = false;

  for (let i = startIdx; i < Math.min(lines.length, startIdx + maxLines); i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '{' || ch === '(') { depth++; started = true; }
      else if (ch === '}' || ch === ')') depth--;
    }
    if (i > startIdx) body.push(line);
    if (started && depth <= 0) break;
  }

  return body;
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreChunk(
  queryTerms: Map<string, number>,
  chunkTerms: Map<string, number>,
  symbol: string,
): { score: number; reason: string } {
  let score = 0;
  const hits: string[] = [];
  const symbolLower = symbol.toLowerCase();

  for (const [term, qFreq] of queryTerms) {
    const cFreq = chunkTerms.get(term) ?? 0;
    if (cFreq > 0) {
      const idfBoost = term.length > 5 ? 1.5 : 1.0;
      score += Math.min(qFreq, cFreq) * idfBoost;
      hits.push(term);
    }
    if (symbolLower.includes(term) || term.includes(symbolLower)) {
      score += 3.0;
      if (!hits.includes(term)) hits.push(`sym:${term}`);
    }
  }

  const normalized = score / Math.max(queryTerms.size, 1);
  return { score: normalized, reason: hits.slice(0, 4).join(',') };
}

// ── Term extraction ───────────────────────────────────────────────────────────

function extractTerms(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  const words = text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^\w]+/);

  for (const w of words) {
    if (w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)) {
      freq.set(w, (freq.get(w) ?? 0) + 1);
    }
  }
  return freq;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function trimSnippet(content: string, maxLines: number): string {
  const lines = content.split('\n');
  if (lines.length <= maxLines) return content;
  return lines.slice(0, maxLines).join('\n') + '\n  // ...';
}

function estimateChunkTokens(content: string): number {
  return Math.ceil(content.length / 4);
}

// ── Singleton ─────────────────────────────────────────────────────────────────

let ragInstance: RagEngine | null = null;
export function getRagEngine(): RagEngine {
  if (!ragInstance) ragInstance = new RagEngine();
  return ragInstance;
}
