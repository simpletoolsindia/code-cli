// Repo Indexer - Lightweight, parallel indexing for code repositories
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import {
  RepositoryIndex,
  FileIndexEntry,
  SymbolIndexEntry,
  ImportEdge,
  TestIndexEntry,
  DocIndexEntry
} from '../types.ts';

// ─── Constants ───────────────────────────────────────────────────────────────

const EXTENSION_LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript', '.tsx': 'typescript',
  '.js': 'javascript', '.jsx': 'javascript',
  '.py': 'python',     '.java': 'java',
  '.go': 'go',         '.rs': 'rust',
  '.rb': 'ruby',       '.php': 'php',
  '.cs': 'csharp',     '.cpp': 'cpp',
  '.c': 'c',           '.swift': 'swift',
  '.kt': 'kotlin',     '.scala': 'scala'
};

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage',
  '.venv', 'vendor', '__pycache__', '.next', '.nuxt', 'out'
]);

const TEST_PATTERNS = new Set(['test', 'spec', '__tests__', 'tests']);
const TEST_EXTS    = new Set(['.test.', '.spec.']);
const CONFIG_EXTS  = new Set(['.json', '.yaml', '.yml', '.toml', '.ini', '.conf']);
const DOC_PATTERNS = new Set(['readme', 'changelog', 'contributing', 'license', 'api', 'guide', 'docs']);
const DOC_EXTS     = new Set(['.md', '.rst', '.adoc']);
const SOURCE_EXTS  = new Set(['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs']);

// ─── Pre-compiled regexes ─────────────────────────────────────────────────────

const TS_EXPORT_NAMED   = /export\s+(?:const|function|class|interface|type|let|var)\s+(\w+)/g;
const TS_EXPORT_DEFAULT = /export\s+default\s+(\w+)/g;
const TS_EXPORT_BLOCK   = /export\s*\{\s*([^}]+)\s*\}/g;
const TS_IMPORT         = /import\s+(?:\{\s*[^}]+\s*\}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
const TS_REQUIRE        = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const TS_FUNC           = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
const TS_CLASS          = /(?:export\s+)?class\s+(\w+)/g;
const TS_INTERFACE      = /(?:export\s+)?interface\s+(\w+)/g;
const TS_CONST          = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=/g;
const PY_DEF            = /(?:^|\n)\s*(?:def|class)\s+(\w+)/gm;
const PY_IMPORT         = /(?:^|\n)\s*import\s+([^\n]+)|(?:^|\n)\s*from\s+([^\n]+)\s+import/gm;

// ─── RepoIndexer class ─────────────────────────────────────────────────────────

export class RepoIndexer {
  private index: RepositoryIndex | null = null;
  private indexing: Promise<RepositoryIndex> | null = null;

  async indexRepository(rootPath: string): Promise<RepositoryIndex> {
    if (this.indexing) return this.indexing;

    this.indexing = this._doIndex(rootPath).finally(() => {
      this.indexing = null;
    });
    return this.indexing;
  }

  getIndex(): RepositoryIndex | null {
    return this.index;
  }

  clearIndex(): void {
    this.index = null;
    this.indexing = null;
  }

  // ── Core indexing logic ─────────────────────────────────────────────────────

  private async _doIndex(rootPath: string): Promise<RepositoryIndex> {
    if (!fs.existsSync(rootPath)) {
      throw new Error(`Path does not exist: ${rootPath}`);
    }

    const allFiles = await this.scanDirectoryAsync(rootPath);

    const results = await Promise.all(
      allFiles.map(filePath => this.processFile(filePath, rootPath))
    );

    const files   = new Map<string, FileIndexEntry>();
    const symbols = new Map<string, SymbolIndexEntry[]>();
    const imports: ImportEdge[] = [];
    const tests:   TestIndexEntry[] = [];
    const docs:    DocIndexEntry[]  = [];

    for (const result of results) {
      if (!result) continue;
      files.set(result.entry.path, result.entry);
      if (result.symbols.length > 0) symbols.set(result.entry.path, result.symbols);
      imports.push(...result.imports);
      if (result.test)  tests.push(result.test);
      if (result.doc)   docs.push(result.doc);
    }

    this.index = { files, symbols, imports, tests, docs, rootPath, lastIndexed: Date.now() };
    return this.index;
  }

  // ── Process a single file ──────────────────────────────────────────────────

  private async processFile(filePath: string, rootPath: string): Promise<{
    entry:   FileIndexEntry;
    symbols: SymbolIndexEntry[];
    imports: ImportEdge[];
    test?:   TestIndexEntry;
    doc?:    DocIndexEntry;
  } | null> {
    try {
      const stats = await fsPromises.stat(filePath);
      if (!stats.isFile()) return null;

      const relativePath = path.relative(rootPath, filePath);
      const ext          = path.extname(filePath).toLowerCase();
      const language     = EXTENSION_LANGUAGE_MAP[ext] || 'unknown';
      const baseName     = path.basename(filePath).toLowerCase();
      const type = this.classifyFile(baseName, ext);

      let content = '';
      const needsContent = (language === 'typescript' || language === 'javascript' || language === 'python')
        && (type === 'source' || type === 'test');

      if (needsContent) {
        content = await fsPromises.readFile(filePath, 'utf-8');
      }

      const { exports: fileExports, imports: fileImports } =
        content ? this.extractExportsImports(content, language) : { exports: [], imports: [] };

      const fileSymbols = content ? this.extractSymbols(content, language, filePath) : [];

      const entry: FileIndexEntry = {
        path:         relativePath,
        name:         path.basename(filePath, ext),
        extension:    ext,
        type,
        language,
        size:         stats.size,
        lastModified: stats.mtimeMs,
        exports:      fileExports,
        imports:      fileImports
      };

      const importEdges: ImportEdge[] = fileImports.map(imp => ({
        from:  relativePath,
        to:    imp,
        types: ['import' as const]
      }));

      const test = type === 'test' ? this.createTestEntry(filePath, relativePath) : undefined;
      const doc  = type === 'doc'  ? this.createDocEntry(filePath, relativePath)  : undefined;

      return { entry, symbols: fileSymbols, imports: importEdges, test, doc };
    } catch {
      return null;
    }
  }

  // ── Directory scan ─────────────────────────────────────────────────────────

  private async scanDirectoryAsync(dirPath: string): Promise<string[]> {
    const results: string[] = [];
    try {
      const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });
      const subdirs: Promise<string[]>[] = [];

      for (const entry of entries) {
        if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          subdirs.push(this.scanDirectoryAsync(fullPath));
        } else {
          results.push(fullPath);
        }
      }

      const nested = await Promise.all(subdirs);
      for (const sub of nested) results.push(...sub);
    } catch { /* ignore permission errors */ }
    return results;
  }

  // ── File classification ──────────────────────────────────────────────────────

  private classifyFile(baseName: string, ext: string): FileIndexEntry['type'] {
    for (const p of TEST_PATTERNS) {
      if (baseName.includes(p)) return 'test';
    }
    for (const p of TEST_EXTS) {
      if (baseName.includes(p)) return 'test';
    }
    if (CONFIG_EXTS.has(ext)) return 'config';
    if (DOC_EXTS.has(ext)) return 'doc';
    for (const p of DOC_PATTERNS) {
      if (baseName.includes(p)) return 'doc';
    }
    if (SOURCE_EXTS.has(ext)) return 'source';
    return 'other';
  }

  // ── Export / Import extraction ─────────────────────────────────────────────

  private extractExportsImports(content: string, language: string): { exports: string[]; imports: string[] } {
    const exports: string[] = [];
    const imports: string[] = [];

    if (language === 'typescript' || language === 'javascript') {
      let rx: RegExp, match: RegExpExecArray | null;

      rx = new RegExp(TS_EXPORT_NAMED.source, 'g');
      while ((match = rx.exec(content)) !== null) exports.push(match[1]);

      rx = new RegExp(TS_EXPORT_DEFAULT.source, 'g');
      while ((match = rx.exec(content)) !== null) exports.push(match[1]);

      rx = new RegExp(TS_EXPORT_BLOCK.source, 'g');
      while ((match = rx.exec(content)) !== null) {
        exports.push(...match[1].split(',').map(s => s.trim()).filter(Boolean));
      }

      rx = new RegExp(TS_IMPORT.source, 'g');
      while ((match = rx.exec(content)) !== null) { if (match[1]) imports.push(match[1]); }

      rx = new RegExp(TS_REQUIRE.source, 'g');
      while ((match = rx.exec(content)) !== null) { if (match[1]) imports.push(match[1]); }

    } else if (language === 'python') {
      let rx: RegExp, match: RegExpExecArray | null;

      rx = new RegExp(PY_DEF.source, 'gm');
      while ((match = rx.exec(content)) !== null) exports.push(match[1]);

      rx = new RegExp(PY_IMPORT.source, 'gm');
      while ((match = rx.exec(content)) !== null) { const m = match[1] || match[2]; if (m) imports.push(m); }
    }

    return { exports, imports };
  }

  // ── Symbol extraction ───────────────────────────────────────────────────────

  private extractSymbols(content: string, language: string, filePath: string): SymbolIndexEntry[] {
    const symbols: SymbolIndexEntry[] = [];
    if (language !== 'typescript' && language !== 'javascript') return symbols;

    const push = (name: string, type: SymbolIndexEntry['type'], idx: number, exported: boolean) => {
      symbols.push({ name, type, file: filePath, line: this.lineAt(content, idx), exported });
    };

    let rx: RegExp, match: RegExpExecArray | null;

    rx = new RegExp(TS_FUNC.source, 'g');
    while ((match = rx.exec(content)) !== null) {
      push(match[1], 'function', match.index, content.slice(Math.max(0, match.index - 20), match.index).includes('export'));
    }

    rx = new RegExp(TS_CLASS.source, 'g');
    while ((match = rx.exec(content)) !== null) {
      push(match[1], 'class', match.index, content.slice(Math.max(0, match.index - 20), match.index).includes('export'));
    }

    rx = new RegExp(TS_INTERFACE.source, 'g');
    while ((match = rx.exec(content)) !== null) {
      push(match[1], 'interface', match.index, content.slice(Math.max(0, match.index - 20), match.index).includes('export'));
    }

    rx = new RegExp(TS_CONST.source, 'g');
    while ((match = rx.exec(content)) !== null) {
      push(match[1], 'constant', match.index, content.slice(Math.max(0, match.index - 20), match.index).includes('export'));
    }

    return symbols;
  }

  private lineAt(content: string, index: number): number {
    let line = 0;
    for (let i = 0; i < index; i++) {
      if (content[i] === '\n') line++;
    }
    return line;
  }

  // ── Test / Doc entry builders ────────────────────────────────────────────────

  private createTestEntry(filePath: string, relativePath: string): TestIndexEntry {
    const name = path.basename(filePath);
    let type: TestIndexEntry['type'] = 'unit';
    if (name.includes('integration')) type = 'integration';
    else if (name.includes('e2e') || name.includes('end-to-end')) type = 'e2e';
    return { path: relativePath, name, type, targetSymbols: [] };
  }

  private createDocEntry(filePath: string, relativePath: string): DocIndexEntry {
    const name = path.basename(filePath).toLowerCase();
    let type: DocIndexEntry['type'] = 'other';
    if (name.startsWith('readme'))                              type = 'readme';
    else if (name.includes('changelog') || name.includes('history')) type = 'changelog';
    else if (name.includes('api'))                             type = 'api';
    else if (name.includes('guide') || name.includes('docs')) type = 'guide';
    return { path: relativePath, name: path.basename(filePath), type, sections: [] };
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let indexerInstance: RepoIndexer | null = null;

export function getIndexer(): RepoIndexer {
  if (!indexerInstance) indexerInstance = new RepoIndexer();
  return indexerInstance;
}

export async function indexRepository(rootPath: string): Promise<RepositoryIndex> {
  return getIndexer().indexRepository(rootPath);
}
