// External Editor Support - Open files in $EDITOR
// Inspired by opencode's external editor integration

import { spawn } from 'node:child_process'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdtempSync } from 'node:fs'

export interface EditorOptions {
  /** File extension to use (determines syntax highlighting) */
  extension?: string
  /** Initial content */
  initialContent?: string
  /** Title shown in editor (if supported) */
  title?: string
  /** Wait for editor to close before returning */
  wait?: boolean
  /** Timeout in milliseconds */
  timeout?: number
}

export interface EditorResult {
  /** The content after editing */
  content: string
  /** Whether the user saved (true) or cancelled (false) */
  saved: boolean
  /** Editor that was used */
  editor: string
}

/**
 * Get the user's preferred editor
 */
export function getEditor(): string {
  // Check various environment variables and config
  return (
    process.env.BEAST_EDITOR ||
    process.env.VISUAL ||
    process.env.EDITOR ||
    'vim' // Sensible default
  )
}

/**
 * Parse editor command into program and args
 */
export function parseEditorCommand(command: string): { program: string; args: string[] } {
  // Handle "code --wait" style commands
  const parts = command.split(/\s+/)
  const program = parts[0]
  const args = parts.slice(1)

  return { program, args }
}

/**
 * Open content in external editor, return edited content
 */
export async function editInExternalEditor(
  content: string,
  options: EditorOptions = {}
): Promise<EditorResult> {
  const {
    extension = 'txt',
    initialContent,
    wait = true,
    timeout = 60000, // 1 minute default
  } = options

  const editor = getEditor()
  const { program, args } = parseEditorCommand(editor)

  // Create temporary file
  const tmpDir = mkdtempSync(resolve(tmpdir(), 'beast-edit-'))
  const filePath = resolve(tmpDir, `edit.${extension}`)

  // Write initial content
  writeFileSync(filePath, initialContent ?? content, 'utf-8')

  return new Promise((resolve) => {
    let resolved = false

    const cleanup = () => {
      // Clean up temp file
      try {
        if (existsSync(filePath)) {
          unlinkSync(filePath)
        }
      } catch {}
    }

    const finish = (saved: boolean) => {
      if (resolved) return
      resolved = true

      try {
        let newContent = content
        if (saved && existsSync(filePath)) {
          newContent = readFileSync(filePath, 'utf-8')
        }
        cleanup()
        resolve({ content: newContent, saved, editor })
      } catch (error) {
        cleanup()
        resolve({ content, saved: false, editor })
      }
    }

    // Build editor arguments
    const editorArgs = [
      ...args,
      ...(wait ? (program === 'code' ? ['--wait'] : []) : []),
      filePath,
    ]

    // Spawn editor
    const proc = spawn(program, editorArgs, {
      stdio: 'inherit',
      env: { ...process.env, TERM: process.env.TERM || 'xterm-256color' },
    })

    // Handle timeout
    const timer = setTimeout(() => {
      console.warn('Editor timeout - closing editor')
      proc.kill()
      finish(false)
    }, timeout)

    proc.on('close', (code) => {
      clearTimeout(timer)
      // Code 0 = normal exit, null = killed
      finish(code === 0 || code === null)
    })

    proc.on('error', (error) => {
      clearTimeout(timer)
      console.error('Editor error:', error)
      finish(false)
    })
  })
}

/**
 * Read file content in editor (read-only view)
 */
export async function viewInExternalEditor(
  filePath: string,
  options: EditorOptions = {}
): Promise<{ saved: boolean }> {
  const editor = getEditor()
  const { program, args } = parseEditorCommand(editor)

  return new Promise((resolve) => {
    const proc = spawn(program, [...args, filePath], {
      stdio: 'inherit',
      env: { ...process.env, TERM: process.env.TERM || 'xterm-256color' },
    })

    proc.on('close', () => {
      resolve({ saved: false })
    })

    proc.on('error', (error) => {
      console.error('Editor error:', error)
      resolve({ saved: false })
    })
  })
}

/**
 * Multi-file editor session - open multiple files at once
 */
export async function editMultipleFiles(
  files: Array<{ path: string; content: string }>,
  options: EditorOptions = {}
): Promise<Map<string, string>> {
  const editor = getEditor()
  const { program, args } = parseEditorCommand(editor)

  const results = new Map<string, string>()
  const tmpDir = mkdtempSync(resolve(tmpdir(), 'beast-multi-'))
  const tmpFiles: string[] = []

  // Write temp files
  for (const file of files) {
    const tmpPath = resolve(tmpDir, `${Date.now()}_${file.path.split('/').pop()}`)
    writeFileSync(tmpPath, file.content, 'utf-8')
    tmpFiles.push(tmpPath)
    results.set(file.path, file.content) // Default to original
  }

  return new Promise((resolve) => {
    const proc = spawn(program, [...args, ...tmpFiles], {
      stdio: 'inherit',
      env: { ...process.env, TERM: process.env.TERM || 'xterm-256color' },
    })

    proc.on('close', () => {
      // Read back modified files
      for (let i = 0; i < files.length; i++) {
        try {
          const content = readFileSync(tmpFiles[i], 'utf-8')
          results.set(files[i].path, content)
        } catch {}
      }

      // Clean up
      for (const tmp of tmpFiles) {
        try {
          unlinkSync(tmp)
        } catch {}
      }
      try {
        unlinkSync(tmpDir)
      } catch {}

      resolve(results)
    })
  })
}

/**
 * Editor capabilities check
 */
export function getEditorCapabilities(): {
  supportsWait: boolean
  supportsTitle: boolean
  isGui: boolean
} {
  const editor = getEditor().toLowerCase()

  return {
    // Editors that support --wait
    supportsWait: ['vim', 'nvim', 'nano', 'emacs', 'code', 'subl', 'atom'].some(
      (e) => editor.includes(e)
    ),
    // Editors that show window title
    supportsTitle: !editor.includes('nano') && !editor.includes('emacs'),
    // GUI editors
    isGui: ['code', 'subl', 'atom', 'idea', 'vscode', 'cursor', 'vim', 'nvim'].some(
      (e) => editor.includes(e)
    ),
  }
}

/**
 * Quick editor prompt - edit a single line/value
 */
export async function quickEdit(
  initialValue: string,
  prompt: string = 'Enter value'
): Promise<{ value: string; saved: boolean }> {
  const content = `# ${prompt}
# Edit the value below and save/exit
${initialValue}
`

  const result = await editInExternalEditor(content, {
    extension: 'txt',
    title: prompt,
  })

  if (!result.saved) {
    return { value: initialValue, saved: false }
  }

  // Extract first non-comment, non-empty line
  const lines = result.content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      return { value: trimmed, saved: true }
    }
  }

  return { value: initialValue, saved: false }
}

/**
 * Create a diff/patch file and open in editor
 */
export async function reviewPatch(
  patch: string,
  originalFile: string
): Promise<boolean> {
  const patchFile = resolve(tmpdir(), `patch-${Date.now()}.diff`)

  const content = `# Review changes for: ${originalFile}
# If the changes look correct, save and exit.
# To reject changes, delete the content and save.
#
# --- Original
# +++ Modified
${patch}
`

  writeFileSync(patchFile, content, 'utf-8')

  return new Promise((resolve) => {
    const editor = getEditor()
    const { program, args } = parseEditorCommand(editor)

    const proc = spawn(program, [...args, patchFile], {
      stdio: 'inherit',
    })

    proc.on('close', (code) => {
      // Clean up
      try {
        unlinkSync(patchFile)
      } catch {}

      // Check if user saved (code 0) vs cancelled
      resolve(code === 0)
    })
  })
}

export default {
  getEditor,
  editInExternalEditor,
  viewInExternalEditor,
  editMultipleFiles,
  quickEdit,
  reviewPatch,
  getEditorCapabilities,
}
