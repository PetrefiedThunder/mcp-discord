#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = "https://discord.com/api/v10";
const RATE_LIMIT_MS = 500;
let last = 0;

function getToken(): string {
  const t = process.env.DISCORD_BOT_TOKEN;
  if (!t) throw new Error("DISCORD_BOT_TOKEN required");
  return t;
}

async function dcFetch(path: string, method = "GET", body?: any): Promise<any> {
  const now = Date.now(); if (now - last < RATE_LIMIT_MS) await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - (now - last)));
  last = Date.now();
  const opts: RequestInit = { method, headers: { Authorization: `Bot ${getToken()}`, "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) throw new Error(`Discord ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

const server = new McpServer({ name: "mcp-discord", version: "1.0.0" });

server.tool("send_message", "Send a message to a Discord channel.", {
  channelId: z.string(), content: z.string(),
}, async ({ channelId, content }) => {
  const d = await dcFetch(`/channels/${channelId}/messages`, "POST", { content });
  return { content: [{ type: "text" as const, text: JSON.stringify({ id: d.id, channelId: d.channel_id }, null, 2) }] };
});

server.tool("get_messages", "Get recent messages from a channel.", {
  channelId: z.string(), limit: z.number().min(1).max(100).default(20),
}, async ({ channelId, limit }) => {
  const d = await dcFetch(`/channels/${channelId}/messages?limit=${limit}`);
  const msgs = d.map((m: any) => ({
    id: m.id, author: m.author?.username, content: m.content?.slice(0, 500),
    timestamp: m.timestamp, attachments: m.attachments?.length || 0,
  }));
  return { content: [{ type: "text" as const, text: JSON.stringify(msgs, null, 2) }] };
});

server.tool("list_channels", "List channels in a guild.", {
  guildId: z.string(),
}, async ({ guildId }) => {
  const d = await dcFetch(`/guilds/${guildId}/channels`);
  const channels = d.map((c: any) => ({
    id: c.id, name: c.name, type: c.type, topic: c.topic, position: c.position,
  }));
  return { content: [{ type: "text" as const, text: JSON.stringify(channels, null, 2) }] };
});

server.tool("get_guild", "Get guild (server) info.", {
  guildId: z.string(),
}, async ({ guildId }) => {
  const d = await dcFetch(`/guilds/${guildId}?with_counts=true`);
  return { content: [{ type: "text" as const, text: JSON.stringify({
    id: d.id, name: d.name, memberCount: d.approximate_member_count,
    onlineCount: d.approximate_presence_count, description: d.description,
  }, null, 2) }] };
});

server.tool("get_user", "Get a user's info.", {
  userId: z.string(),
}, async ({ userId }) => {
  const d = await dcFetch(`/users/${userId}`);
  return { content: [{ type: "text" as const, text: JSON.stringify({
    id: d.id, username: d.username, globalName: d.global_name, bot: d.bot,
  }, null, 2) }] };
});

server.tool("add_reaction", "Add an emoji reaction to a message.", {
  channelId: z.string(), messageId: z.string(),
  emoji: z.string().describe("URL-encoded emoji (e.g. '%F0%9F%91%8D' for 👍, or 'name:id' for custom)"),
}, async ({ channelId, messageId, emoji }) => {
  await dcFetch(`/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, "PUT");
  return { content: [{ type: "text" as const, text: JSON.stringify({ ok: true }) }] };
});

async function main() { const t = new StdioServerTransport(); await server.connect(t); }
main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
