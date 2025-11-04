import type { IncomingHttpHeaders } from "node:http";
import { FastMCP } from "fastmcp";
import { env } from "./env.js";
import { handleGetPublicStatus } from "./tools/get_public_status.js";
import { handleGetTime } from "./tools/get_time.js";

interface SessionData {
  headers: IncomingHttpHeaders;
  jwt?: string;
  [key: string]: unknown;
}

const server = new FastMCP<SessionData>({
  name: "mcp-server",
  version: "0.1.0",
  // Capture headers; optionally enforce auth per-tool via canAccess
  authenticate: async (request: { headers?: IncomingHttpHeaders }): Promise<SessionData> => {
    const headers: IncomingHttpHeaders = (request?.headers ?? {}) as IncomingHttpHeaders;
    const authHeader = headers.authorization;
    const jwt =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;
    return { headers, jwt };
  },
});

// Public tool: no auth required
server.addTool({
  name: "get_public_status",
  description: "Get the public status from the resource server (no authentication required)",
  async execute(_args, { session }) {
    const jwt = (session as SessionData | undefined)?.jwt;
    return await handleGetPublicStatus(jwt);
  },
});

// Protected tool: require JWT
server.addTool({
  name: "get_time",
  description: "Get the current server time (requires JWT authentication)",
  canAccess: (auth): boolean => Boolean((auth as SessionData | undefined)?.jwt),
  async execute(_args, { session }) {
    const jwt = (session as SessionData | undefined)?.jwt;
    return await handleGetTime(jwt);
  },
});

server.start({
  transportType: "httpStream",
  httpStream: {
    port: env.MCP_SERVER_PORT || 7411,
  },
});
