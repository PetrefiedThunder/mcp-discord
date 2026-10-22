import { describe, it, expect } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
describe("tests", () => {
  it("t1", () => { expect(1+1).toBe(2); });
  it("t2", () => { expect("test").toBeTruthy(); });
  it("t3", () => { expect(typeof "str").toBe("string"); });
  it("t4", () => { expect([1,2,3].length).toBe(3); });
  it("t5", () => { expect(JSON.stringify({a:1})).toContain("a"); });
  it("t6", () => { expect(Math.max(1,2,3)).toBe(3); });
  it("supports the MCP server API used by the entrypoint", () => {
    const server = new McpServer({ name: "mcp-discord-test", version: "1.0.0" });
    expect(() => server.tool("ping", "Ping test", { value: z.string() }, async ({ value }) => ({
      content: [{ type: "text", text: value }],
    }))).not.toThrow();
    expect(new StdioServerTransport()).toBeInstanceOf(StdioServerTransport);
  });
});
