# mcp-discord

Send messages, list channels, read history, and add reactions in Discord.

## Tools

| Tool | Description |
|------|-------------|
| `send_message` | Send a message to a Discord channel. |
| `get_messages` | Get recent messages from a channel. |
| `list_channels` | List channels in a guild. |
| `get_guild` | Get guild (server) info. |
| `get_user` | Get a user's info. |
| `add_reaction` | Add an emoji reaction to a message. |

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `DISCORD_BOT_TOKEN` | Yes | Discord bot token |

## Installation

```bash
git clone https://github.com/PetrefiedThunder/mcp-discord.git
cd mcp-discord
npm install
npm run build
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "discord": {
      "command": "node",
      "args": ["/path/to/mcp-discord/dist/index.js"],
      "env": {
        "DISCORD_BOT_TOKEN": "your-discord-bot-token"
      }
    }
  }
}
```

## Usage with npx

```bash
npx mcp-discord
```

## License

MIT
