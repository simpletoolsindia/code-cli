// Beast CLI - Notification System
// Native desktop notifications with sound for user alerts

import { execSync } from 'child_process'
import { platform } from 'os'

export type NotificationLevel = 'info' | 'warning' | 'error' | 'success'

export interface NotificationOptions {
  title: string
  body?: string
  level?: NotificationLevel
  sound?: boolean
  icon?: 'info' | 'warning' | 'error' | 'success'
}

// Play terminal bell
export function playBell(): void {
  process.stdout.write('\x07')
}

// Play multiple bells for urgency
export function playAlertBeeps(count = 3): void {
  for (let i = 0; i < count; i++) {
    setTimeout(() => process.stdout.write('\x07'), i * 200)
  }
}

// Cross-platform native notification
export async function showNotification(options: NotificationOptions): Promise<void> {
  const { title, body = '', level = 'info', sound = true } = options

  // Play bell sound if enabled
  if (sound) {
    if (level === 'error' || level === 'warning') {
      playAlertBeeps(3)
    } else {
      playBell()
    }
  }

  const os = platform()
  const body2 = body || ''

  try {
    if (os === 'darwin') {
      // macOS: Use osascript for Notification Center
      const icon = level === 'error' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️'
      const script = `display notification "${escapeAppleScript(body2)}" with title "${escapeAppleScript(icon + ' ' + title)}"`
      execSync(`osascript -e '${script}'`, { stdio: 'ignore' })
    } else if (os === 'win32') {
      // Windows: Use PowerShell toast notification
      const psScript = `
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        $template = [Windows.UI.Notifications.ToastTemplateType]::ToastText02
        $xml = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent($template)
        $text = $xml.GetElementsByTagName("text")
        $text[0].AppendChild($xml.CreateTextNode("${escape(title)}")) | Out-Null
        $text[1].AppendChild($xml.CreateTextNode("${escape(body2)}")) | Out-Null
        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("BeastCLI").Show($toast)
      `.replace(/\n/g, ' ')
      execSync(`powershell -Command "${psScript}"`, { stdio: 'ignore' })
    } else {
      // Linux: Use notify-send
      const urgency = level === 'error' ? 'critical' : level === 'warning' ? 'normal' : 'low'
      execSync(`notify-send "${escape(icon)} ${escape(title)}" "${escape(body2)}" --urgency=${urgency} --app-name=BeastCLI`, { stdio: 'ignore' })
    }
  } catch {
    // Silently fail - notification is best-effort
  }
}

// Shortcuts for common notifications
export const notifications = {
  info: (title: string, body?: string) => showNotification({ title, body, level: 'info' }),
  success: (title: string, body?: string) => showNotification({ title, body, level: 'success' }),
  warning: (title: string, body?: string) => showNotification({ title, body, level: 'warning' }),
  error: (title: string, body?: string) => showNotification({ title, body, level: 'error' }),
  // Permission request - important!
  permission: (message: string) => showNotification({
    title: '🔐 Beast CLI - Permission Required',
    body: message,
    level: 'warning',
    sound: true,
  }),
  // Task completed
  done: (task: string) => showNotification({
    title: '✅ ' + task + ' Complete',
    body: 'Task finished. Check your terminal.',
    level: 'success',
    sound: true,
  }),
  // Waiting for user
  waiting: (message: string) => showNotification({
    title: '⏳ Beast CLI Needs Input',
    body: message,
    level: 'info',
    sound: true,
  }),
}

// Helper functions
function escape(str: string): string {
  return str.replace(/"/g, '\\"').replace(/\n/g, ' ')
}

function escapeAppleScript(str: string): string {
  return str.replace(/"/g, '\\"').replace(/'/g, "\\'")
}