# API Server (Resource Server)

Minimal Resource API with documented, read-only endpoints and interactive OpenAPI explorer.

## Features

- **JWT Authentication**: Verifies short-lived tokens via JWKS
- **OpenAPI Documentation**: Interactive Scalar UI
- **Standardized Errors**: 401 vs 403 semantics with machine-readable bodies
- **Type-safe**: TypeScript with Zod schema validation
- **Hono Framework**: Lightweight, fast, and modern
- **Modular Routing**: API endpoints mounted under configurable base path

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Auth server running (for JWT issuance and JWKS)

### Installation

```bash
# From repo root
pnpm install

# Copy environment template
cd apps/api
cp .env.example .env

# Edit .env with your auth server URLs
```

### Environment Variables

```env
PORT=3010
RESOURCE_API_BASE_PATH=/api/v1/resource
JWKS_URL=http://localhost:3001/api/v1/auth/jwks
JWT_ISSUER=http://localhost:3001
JWT_AUDIENCE=http://localhost:3001
OPENAPI_SERVER_URLS=http://localhost:3010,https://api.example.com
```

### Development

```bash
# From repo root
pnpm --filter @repo/api dev

# Or from apps/api
pnpm dev
```

Server starts at `http://localhost:3010`

### API Documentation

**Scalar UI**: `http://localhost:3010/api/v1/resource/reference`

Interactive API documentation with request/response examples.

**LLM Documentation**: `http://localhost:3010/api/v1/resource/llms.txt`

Markdown-formatted API documentation suitable for LLMs.

## API Endpoints

All resource endpoints are mounted under `/api/v1/resource/**`.

### Health Check

**GET** `/health`

Returns server health status. No authentication required.

```bash
curl http://localhost:3010/health
```

Response:
```json
{ "status": "healthy" }
```

### Public Status

**GET** `/api/v1/resource/public`

Returns public status. No authentication required.

```bash
curl http://localhost:3010/api/v1/resource/public
```

Response:
```json
{ "status": "ok" }
```

### Server Time (Protected)

**GET** `/api/v1/resource/time`

Returns current server time. Requires a valid JWT.

```bash
TOKEN="<your-jwt-token>"
curl http://localhost:3010/api/v1/resource/time \
  -H "Authorization: Bearer $TOKEN"
```

Response (200):
```json
{
  "epoch": 1734200000,
  "iso": "2025-10-14T12:00:00.000Z"
}
```

Error (401):
```json
{
  "code": "unauthorized",
  "message": "Invalid or expired token"
}
```

Error (403):
```json
{
  "code": "forbidden",
  "message": "Insufficient permissions"
}
```

## Authentication

### Getting a JWT Token

Obtain a short-lived JWT from the auth server:

```bash
# Example using auth server
curl -X POST http://localhost:3001/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{ "email": "user@example.com", "password": "password" }'
```

### Using the Token

Include the JWT in the `Authorization` header:

```bash
curl http://localhost:3010/api/v1/resource/time \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Error Semantics

- **401 Unauthorized**: Authentication failures (expired token, invalid signature, missing token)
- **403 Forbidden**: Authorization failures (valid token but insufficient scope/permissions)
- **404 Not Found**: Route not found

All error responses follow the standardized format:

```json
{
  "code": "error_code",
  "message": "Human-readable message",
  "details": { /* optional */ }
}
```

## Development

### Project Structure

```
apps/api/
├── src/
│   ├── index.ts          # Server entry point
│   ├── env.ts            # Environment validation
│   ├── docs/
│   │   ├── config.ts     # OpenAPI configuration
│   │   ├── llm.ts        # LLM documentation endpoint
│   │   └── scalar.ts     # OpenAPI + Scalar UI setup
│   ├── lib/
│   │   ├── errors.ts     # Standardized error responses
│   │   └── jwt.ts        # JWT verification middleware
│   └── routes/
│       ├── public.ts     # Public endpoint
│       └── time.ts       # Protected endpoint
├── package.json
├── tsconfig.json
└── .env.example
```

### Adding New Routes

1. Create a route file in `src/routes/`
2. Define the route using `createRoute` from `@hono/zod-openapi`
3. Define request/response schemas with Zod
4. Register the route in `src/index.ts`

Example:

```typescript
import { createRoute, z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";

const ResponseSchema = z
  .object({
    data: z.string(),
  })
  .openapi("MyResponse", { example: { data: "hello" } });

const myRoute = createRoute({
  method: "get",
  path: "/my-endpoint",
  tags: ["custom"],
  summary: "My custom endpoint",
  responses: {
    200: {
      description: "Success",
      content: {
        "application/json": {
          schema: ResponseSchema,
        },
      },
    },
  },
});

export function registerMyRoutes(app: OpenAPIHono) {
  app.openapi(myRoute, (c) => {
    return c.json({ data: "hello" }, 200);
  });
}
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

## Architecture

### JWT Verification

- Uses `jose` library with `createRemoteJWKSet` for offline verification
- Verifies `iss`, `aud`, `exp`, and signature
- Caches JWKS; re-fetches on unknown `kid` or cache expiry
- Supports key rotation without downtime

### Middleware Flow

1. Request arrives
2. JWT middleware extracts and verifies token (if protected route)
3. Parsed claims attached to context
4. Route handler executes
5. Response returned

### Constitution Compliance

Aligns with project constitution v1.1.0 (Authentication & Token Security):
- Short-lived tokens (15–30 minutes)
- JWKS caching and offline verification
- Standardized 401 vs 403 error semantics
- Least-privilege scope enforcement (ready)

## Related Documentation

- [Feature Spec](/specs/003-i-want-to/spec.md)
- [Quickstart Guide](/specs/003-i-want-to/quickstart.md)
- [OpenAPI Contract](/specs/003-i-want-to/contracts/openapi.yaml)
- [Auth Server](/apps/auth/README.md)
