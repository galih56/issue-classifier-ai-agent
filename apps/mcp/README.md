# MCP Server

Model Context Protocol (MCP) server built with FastMCP that exposes tools for interacting with the Resource Server API.

## Features

- **FastMCP Framework**: Modern, feature-rich MCP server implementation
- **HTTP Streaming Transport**: Network-accessible via HTTP streaming protocol
- **JWT Passthrough Authentication**: Clients provide JWTs via HTTP headers
- **Resource API Integration**: Tools call Resource Server endpoints
- **Session-based Auth**: Automatic JWT extraction from client requests
- **Error Mapping**: HTTP errors mapped to MCP error responses
- **Type-safe**: TypeScript with environment validation

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Resource Server running (`apps/api`)
- Valid JWT token for protected endpoints (provided by MCP client)

### Installation

```bash
# From repo root
pnpm install

# Copy environment template
cd apps/mcp
cp .env.example .env

# Edit .env with your Resource Server URL
```

### Environment Variables

```env
# Required: Base URL of the Resource Server (must end with /)
RESOURCE_BASE_URL=http://localhost:3010/api/v1/resource/

# Required: HTTP server port for MCP protocol
MCP_SERVER_PORT=7411

# Optional: Fallback JWT for stdio/local mode only
# When running HTTP transport, JWT is passed through from client requests
MCP_AUTH_JWT=
```

### Development

```bash
# From repo root
pnpm --filter @repo/mcp-server dev

# Or from apps/mcp
pnpm dev
```

Server runs on HTTP streaming at `http://localhost:7411/mcp` (SSE fallback at `http://localhost:7411/sse`).

## Available Tools

### 1. get_public_status

Get the public status from the resource server (no authentication required).

**Input**: None

**Calls**: `GET /api/v1/resource/public`

**Response**:
```json
{
  "status": "ok"
}
```

### 2. get_time

Get the current server time (requires JWT authentication via client HTTP headers).

**Input**: None

**Calls**: `GET /api/v1/resource/time`

**Response**:
```json
{
  "epoch": 1734200000,
  "iso": "2025-10-14T12:00:00.000Z"
}
```

**Error** (401):
```json
{
  "error": "unauthorized",
  "message": "Invalid or expired token",
  "statusCode": 401
}
```

## Usage

### Using an MCP Client

FastMCP supports HTTP streaming transport. Connect using HTTP headers for authentication:

#### With StreamableHTTPClientTransport (Primary)

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:7411/mcp"),
  {
    requestInit: {
      headers: {
        Authorization: "Bearer <your-jwt-token>", // Required for protected tools
      },
    },
  }
);

const client = new Client({
  name: "example-client",
  version: "1.0.0",
});

await client.connect(transport);

// List tools
const tools = await client.listTools();

// Call tools (get_time requires JWT in headers)
await client.callTool({ name: "get_public_status" });
await client.callTool({ name: "get_time" });
```

#### With SSEClientTransport (Fallback)

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

const transport = new SSEClientTransport(new URL("http://localhost:7411/sse"));
const client = new Client({
  name: "example-client",
  version: "1.0.0",
});

await client.connect(transport);
```

### Authentication

**HTTP Transport Mode** (Recommended):
- JWT provided by MCP client via `Authorization: Bearer <token>` HTTP header
- Each client session authenticated as the JWT owner
- No shared credentials in server environment

**Stdio Transport Mode** (Legacy):
- Uses `MCP_AUTH_JWT` environment variable
- Single shared identity for all requests
- Not recommended for production

### Token Management

- **Client responsibility**: MCP clients manage JWT lifecycle
- **Short-lived tokens**: 15-30 minutes as per constitution
- **Automatic forwarding**: Server extracts JWT from HTTP headers and forwards to Resource API
- **No storage**: Server doesn't persist tokens, uses them per-request

## Development

### Project Structure

```
apps/mcp/
├── src/
│   ├── index.ts           # FastMCP server entry point
│   ├── env.ts             # Environment validation
│   ├── lib/
│   │   └── client.ts      # HTTP client for Resource API
│   └── tools/
│       ├── get_public_status.ts  # Public endpoint tool
│       └── get_time.ts           # Protected endpoint tool
├── package.json
├── tsconfig.json
└── .env.example
```

### Adding New Tools

1. Create a tool file in `src/tools/`
2. Define the tool using FastMCP API
3. Register with `server.addTool()`
4. Access session data (including JWT) in tool execution

Example:

```typescript
// src/tools/my_tool.ts
import { callResourceAPI, ResourceClientError } from "../lib/client.js";

export async function handleMyTool(jwt?: string) {
  try {
    const result = await callResourceAPI<{ data: string }>(
      "my-endpoint",
      { jwt }
    );
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof ResourceClientError) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: error.code || "api_error",
                message: error.message,
                statusCode: error.statusCode,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  }
}
```

Then register in `src/index.ts`:

```typescript
import { handleMyTool } from "./tools/my_tool.js";

server.addTool({
  name: "my_tool",
  description: "Description of my tool",
  async execute(_args, { session }) {
    const jwt = (session as { jwt?: string })?.jwt;
    return await handleMyTool(jwt);
  },
});
```

### Type Checking

```bash
pnpm typecheck
```

### Linting

```bash
pnpm lint
pnpm lint:fix
```

## Error Handling

The MCP server maps HTTP errors from the Resource API to MCP error responses:

- **401 Unauthorized**: Authentication failures (missing/invalid/expired token)
- **403 Forbidden**: Authorization failures (insufficient permissions)
- **Other errors**: Network failures, parsing errors, unknown errors

Error format:
```json
{
  "error": "error_code",
  "message": "Human-readable message",
  "statusCode": 401
}
```

## Architecture

### FastMCP Framework

- **HTTP Streaming**: Primary transport using FastMCP's `httpStream` option
- **Session Management**: Each client connection gets a dedicated session
- **Authentication**: `authenticate` function extracts JWT from HTTP headers
- **Tool Authorization**: `canAccess` function controls tool visibility based on JWT presence

### HTTP Client

The `callResourceAPI` helper in `src/lib/client.ts`:
- Reads `RESOURCE_BASE_URL` from environment (must end with `/`)
- Accepts JWT from tool execution context
- Maps HTTP errors to `ResourceClientError`
- Provides type-safe request/response handling

### Authentication Flow

1. MCP client connects with `Authorization: Bearer <jwt>` header
2. FastMCP `authenticate` extracts JWT and stores in session
3. Tool execution accesses JWT from session context
4. HTTP client forwards JWT to Resource API
5. Resource API verifies JWT via JWKS

### Constitution Compliance

Aligns with project constitution v1.1.0 (Authentication & Token Security):
- Short-lived tokens (15–30 minutes, client-managed)
- JWT passthrough without server-side storage
- Standardized 401/403 error semantics
- Least-privilege scope enforcement ready

## Related Documentation

- [Feature Spec](/specs/003-i-want-to/spec.md)
- [Quickstart Guide](/specs/003-i-want-to/quickstart.md)
- [Resource Server](/apps/api/README.md)
- [FastMCP Documentation](https://github.com/punkpeye/fastmcp)
- [MCP Protocol Documentation](https://modelcontextprotocol.io)

## Testing

Use an MCP client to test the server:

1. Start the Resource Server: `pnpm --filter @repo/api dev`
2. Get a valid JWT from the Auth Server
3. Start the MCP server: `pnpm --filter @repo/mcp-server dev`
4. Connect with an MCP client using HTTP transport

Expected behavior:
- `get_public_status` works without JWT
- `get_time` requires valid JWT in HTTP headers
- Invalid/expired token returns 401 error
- FastMCP inspector shows tools correctly

### Inspecting with FastMCP Inspector

FastMCP includes a built-in inspector for testing and debugging your MCP server:

```bash
# From apps/mcp directory
pnpm dlx fastmcp inspect src/index.ts
```

This will:
- Start the MCP server in inspection mode
- Provide a web interface to list available tools
- Allow you to test tool calls interactively
- Show detailed request/response information
- Display authentication status and session information

The inspector runs on a local port (typically 6274) and provides both a web UI and API endpoints for testing.

**Note**: Make sure your Resource Server is running before using the inspector, as tools will make actual API calls.
