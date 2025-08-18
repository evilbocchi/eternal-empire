---
title: Leaderboard Webhooks
---

# Leaderboard Webhooks

The server sends Discord webhook notifications when its empire's leaderboard position changes.

## Setup

1. Create a Discord webhook in your desired channel:
   - Go to Server Settings → Integrations → Webhooks
   - Click "New Webhook"
   - Set the name and channel
   - Copy the webhook URL

2. Set the environment variable:
   - Set `LEADERBOARD_WEBHOOK` to your Discord webhook URL
   - This follows the same pattern as the existing `PROGRESSION_WEBHOOK`

## How It Works

- Checks leaderboard positions every 60 seconds
- Monitors all leaderboards: TimePlayed, Funds, Power, Skill, Donated
- Stores current positions in empire data (`empireData.leaderboardPositions`)
- Sends webhook notifications when:
  - Empire enters top 100 for the first time
  - Empire's position changes while in top 100
  - Position improves (moves up) or declines (moves down)

## Webhook Message Format

The webhook sends rich embeds with:
- **Title**: Indicates direction of change (📈 enter, ⬆️ up, ⬇️ down)
- **Description**: Summary of the change
- **Fields**: Empire name, owner, leaderboard, previous/current positions
- **Colors**: Green for improvements, orange for declines
- **Timestamp**: When the change was detected

## Example Messages

```
📈 Leaderboard Position Change
TestEmpire (PlayerName) entered the leaderboard at position #45 on the Funds leaderboard!

⬆️ Leaderboard Position Change  
MyEmpire (OwnerName) moved up from #67 to #52 on the TimePlayed leaderboard!

⬇️ Leaderboard Position Change
SomeEmpire (UserName) moved down from #23 to #31 on the Power leaderboard!
```

## Notes

- Only empires in the top 100 trigger notifications
- Banned users are excluded from tracking
- Service is disabled in Sandbox mode and Studio (unless explicitly enabled)
- Failed webhook calls are logged but don't interrupt the monitoring
- Position data persists in empire profiles across server restarts