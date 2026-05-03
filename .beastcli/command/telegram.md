---
description: Configure Telegram notifications for beastcli sessions
---

Help the user configure Telegram notifications for beastcli.

## Default Behavior

macOS native notifications are enabled by default — no configuration required. You will receive native desktop notifications for session events.

Telegram notifications are optional. Follow the steps below to add them.

## Telegram Setup (Optional)

1. Ask the user for their Telegram Bot Token (from @BotFather)
2. Ask the user for their Telegram Chat ID
3. If either value is missing, guide them through obtaining it:
   - Bot Token: Create a bot via [@BotFather](https://t.me/BotFather) on Telegram
   - Chat ID: Send a message to the bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates` to find the `chat.id`

4. Once you have both values, write the notifier config to the global config file:

The config file should be written to: `~/.config/beastcli/notifier.json`

Use this template (replace BOT_TOKEN and CHAT_ID with actual values):

```json
{
  "enabled": true,
  "locale": "en",
  "channels": {
    "macos": {
      "enabled": true
    },
    "telegram": {
      "enabled": true,
      "botToken": "BOT_TOKEN",
      "chatId": "CHAT_ID"
    }
  }
}
```

5. After writing the config, verify it by reading the file back
6. Send a test notification using curl:

```bash
curl -s -X POST "https://api.telegram.org/bot<BOT_TOKEN>/sendMessage" \
  -d "chat_id=<CHAT_ID>" \
  -d "text=beastcli notifications are now configured!" \
  -d "parse_mode=HTML"
```

7. Confirm to the user that notifications are enabled

## Event Configuration

By default, all events are enabled. The user can customize which events trigger notifications by adding an `events` section:

```json
{
  "enabled": true,
  "events": {
    "sessionStarted": { "enabled": true },
    "sessionCompleted": { "enabled": true },
    "sessionError": { "enabled": true },
    "toolExecuting": { "enabled": false },
    "toolCompleted": { "enabled": false }
  }
}
```

Available event keys:
- `sessionStarted` - When a session starts (busy state)
- `sessionCompleted` - When a session completes (idle state)
- `sessionError` - When an error occurs
- `sessionCompacted` - When session is compacted
- `toolExecuting` - When a tool starts executing
- `toolCompleted` - When a tool completes
- `permissionRequested` - When permission is requested
- `decisionNeeded` - When user input is needed
- `subagentStarted` - When a subagent starts
- `subagentCompleted` - When a subagent completes

## Disable Notifications

To disable all notifications, set `enabled: false` in the config. To disable only macOS notifications, set `channels.macos.enabled: false`. Removing the config file restores defaults (macOS only).
