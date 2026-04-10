// Beast CLI - Notification System
// Hook-based notification system inspired by Claude Code's approach
// Supports: permission requests, task completion, user input prompts, errors

import { execSync } from 'child_process'
import { platform } from 'os'

export type NotificationLevel = 'info' | 'warning' | 'error' | 'success'
export type NotificationType = 'permission' | 'task_complete' | 'user_input' | 'error' | 'idle'

export interface NotificationOptions {
  title: string
  body?: string
  level?: NotificationLevel
  sound?: boolean
  type?: NotificationType
}

// Environment variable control
const NOTIFY_ENABLED = process.env.BEAST_NOTIFY !== 'false'
const NOTIFY_SOUND = process.env.BEAST_NOTIFY_SOUND !== 'false'

// Play terminal bell (universally supported)
export function playBell(): void {
  if (NOTIFY_ENABLED && NOTIFY_SOUND) {
    process.stdout.write('\x07')
  }
}

// Play multiple bells for urgent notifications
export function playAlertBeeps(count = 3): void {
  if (!NOTIFY_ENABLED || !NOTIFY_SOUND) return
  for (let i = 0; i < count; i++) {
    setTimeout(() => process.stdout.write('\x07'), i * 200)
  }
}

// Cross-platform native notification with sound
export async function showNotification(options: NotificationOptions): Promise<void> {
  if (!NOTIFY_ENABLED) return

  const { title, body = '', level = 'info', type = 'info' } = options
  const body2 = body || ''

  // Play appropriate sound based on type/level
  if (NOTIFY_SOUND) {
    if (type === 'permission' || level === 'warning' || level === 'error') {
      playAlertBeeps(3)
    } else {
      playBell()
    }
  }

  const os = platform()

  try {
    if (os === 'darwin') {
      // macOS: Native Notification Center via osascript
      const icon = type === 'permission' ? '🔐' : type === 'task_complete' ? '✅' : level === 'error' ? '⚠️' : 'ℹ️'
      const script = `display notification "${escapeAppleScript(body2)}" with title "${escapeAppleScript(icon + ' ' + title)}" sound name "Glass"`
      execSync(`osascript -e '${script}'`, { stdio: 'ignore' })
    } else if (os === 'win32') {
      // Windows: PowerShell toast notification
      const escapedTitle = escape(title)
      const escapedBody = escape(body2)
      const ps = `[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime] | Out-Null; $t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02); $t.GetElementsByTagName("text")[0].AppendChild($t.CreateTextNode("${escapedTitle}")) | Out-Null; $t.GetElementsByTagName("text")[1].AppendChild($t.CreateTextNode("${escapedBody}")) | Out-Null; [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("BeastCLI").Show([Windows.UI.Notifications.ToastNotification]::new($t))`
      execSync(`powershell -Command "${ps}"`, { stdio: 'ignore' })
    } else {
      // Linux: notify-send with urgency
      const urgency = level === 'error' || type === 'permission' ? 'critical' : level === 'warning' ? 'normal' : 'low'
      const appIcon = type === 'permission' ? '🔐' : type === 'task_complete' ? '✅' : '🐉'
      execSync(`notify-send "${appIcon} ${escape(title)}" "${escape(body2)}" --urgency=${urgency} --app-name=BeastCLI --icon=dialog-information`, { stdio: 'ignore' })
    }
  } catch {
    // Best-effort - silently fail if notification fails
  }
}

// Pre-defined notification shortcuts (inspired by Claude Code hooks)
export const notifications = {
  // Permission request - fires when LLM needs user approval
  permission: (message: string, action?: string) => showNotification({
    title: '🔐 Permission Required',
    body: action ? `${message}\nAction: ${action}` : message,
    level: 'warning',
    type: 'permission',
    sound: true,
  }),

  // Task completion - fires when long task finishes
  taskComplete: (task: string, details?: string) => showNotification({
    title: '✅ Task Complete',
    body: details || `${task} finished successfully`,
    level: 'success',
    type: 'task_complete',
    sound: true,
  }),

  // User input needed - fires when awaiting response
  userInput: (prompt: string, context?: string) => showNotification({
    title: '⏳ Input Needed',
    body: context ? `${prompt}\n\nContext: ${context.slice(0, 100)}` : prompt,
    level: 'info',
    type: 'user_input',
    sound: true,
  }),

  // Error occurred
  error: (message: string, details?: string) => showNotification({
    title: '⚠️ Error',
    body: details ? `${message}\n${details}` : message,
    level: 'error',
    type: 'error',
    sound: true,
  }),

  // Idle notification - when waiting too long
  idle: (message: string) => showNotification({
    title: '🐉 Beast Idle',
    body: message,
    level: 'info',
    type: 'idle',
    sound: true,
  }),

  // Generic shortcuts
  info: (title: string, body?: string) => showNotification({ title, body, level: 'info' }),
  success: (title: string, body?: string) => showNotification({ title, body, level: 'success' }),
  warning: (title: string, body?: string) => showNotification({ title, body, level: 'warning' }),
  error2: (title: string, body?: string) => showNotification({ title, body, level: 'error' }),
}

// Helper: notify on permission check point
export function onPermissionRequest(tool: string, action: string): void {
  notifications.permission(
    `${tool} wants to execute`,
    action.slice(0, 50)
  )
}

// Helper: notify on task completion
export function onTaskComplete(task: string): void {
  notifications.taskComplete(task)
}

// Helper: notify on response ready
export function onResponseReady(): void {
  playBell()
}

// Helper: notify on error
export function onError(error: string, context?: string): void {
  notifications.error(error, context)
}

// Helper: notify waiting for input
export function onWaitingForInput(prompt: string): void {
  notifications.userInput(prompt)
}

// Control functions
export function disableNotifications(): void {
  process.env.BEAST_NOTIFY = 'false'
}

export function enableNotifications(): void {
  process.env.BEAST_NOTIFY = 'true'
}

export function disableSound(): void {
  process.env.BEAST_NOTIFY_SOUND = 'false'
}

export function enableSound(): void {
  process.env.BEAST_NOTIFY_SOUND = 'true'
}

// Escape helpers
function escape(str: string): string {
  return str.replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\r/g, '')
}

function escapeAppleScript(str: string): string {
  return str.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\n/g, ' ')
}