# @repo/auth-server

Authentication server built with [Better Auth](https://www.better-auth.com/) and [Hono](https://hono.dev/).

## Features

- 🔐 **Email/Password Authentication** - Secure user registration and login
- 🍪 **Session Management** - Cookie-based sessions with automatic refresh
- 🗄️ **PostgreSQL Database** - Drizzle ORM for type-safe database access
- ✅ **Type-Safe Environment** - Runtime validation with @t3-oss/env-core
- 🚀 **Hono Framework** - Lightweight, fast HTTP server
- 📝 **Request Logging** - Built-in request/response logging
- 🔄 **CORS Support** - Cross-origin resource sharing enabled
- ⚡ **Hot Reload** - Fast development with tsx watch mode

## Tech Stack

- **Framework**: [Hono](https://hono.dev/) - Ultra-fast web framework
- **Auth**: [Better Auth](https://www.better-auth.com/) - Type-safe authentication
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/) for schema validation
- **Runtime**: Node.js with TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 9+
- PostgreSQL database (local or remote)

### Environment Variables

Create a `.env` file in this directory (see `.env.example`):

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/auth_db

# Better Auth
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-secret-key-minimum-32-characters-long
BETTER_AUTH_URL=http://localhost:3000

# Server
PORT=3000
NODE_ENV=development
```

**Important:** 
- `BETTER_AUTH_SECRET` must be at least 32 characters
- Generate a secure secret: `openssl rand -base64 32`
- Never commit `.env` to version control

### Installation

From the repository root:

```bash
# Install dependencies
pnpm install

# Generate database schema
pnpm db:schema

# Create and apply migrations
pnpm db:generate
pnpm db:migrate
```

### Development

```bash
# Start development server with hot reload
pnpm dev

# Server will start on http://localhost:3000
```

The server will automatically:
- Load and validate environment variables
- Connect to the database
- Start listening on the configured PORT
- Reload on file changes

### Production

```bash
# Build TypeScript to JavaScript
pnpm build

# Start production server
pnpm start
```

## API Endpoints

### Health Check

**GET** `/health`

Check if the server is running.

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-14T12:00:00.000Z",
  "environment": "development"
}
```

### API Documentation

**Swagger UI**: `http://localhost:3001/api/auth/reference`

Interactive API documentation with request/response examples.

### Authentication Endpoints

All auth endpoints are mounted under `/api/auth/**` and handled by Better Auth.

#### Sign Up

**POST** `/api/auth/sign-up/email`

Register a new user with email and password.

```bash
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  },
  "session": {
    "id": "...",
    "token": "...",
    "expiresAt": "..."
  }
}
```

#### Sign In

**POST** `/api/auth/sign-in/email`

Authenticate with email and password.

```bash
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "token": "...",
    "expiresAt": "..."
  }
}
```

Sets a session cookie: `better-auth.session_token`

#### Get Session

**GET** `/api/auth/get-session`

Get the current authenticated user's session.

```bash
curl http://localhost:3001/api/auth/get-session \
  -H "Cookie: better-auth.session_token=..."
```

**Response (authenticated):**
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "id": "...",
    "expiresAt": "..."
  }
}
```

**Response (not authenticated):**
```json
{
  "user": null,
  "session": null
}
```

#### Sign Out

**POST** `/api/auth/sign-out`

Invalidate the current session.

```bash
curl -X POST http://localhost:3001/api/auth/sign-out \
  -H "Cookie: better-auth.session_token=..."
```

## Project Structure

```
apps/auth/
├── src/
│   ├── index.ts              # Hono server entry point
│   ├── env.ts                # Environment validation
│   └── lib/
│       ├── auth.ts           # Better Auth instance
│       └── db.ts             # Database client
├── .env                      # Local environment (gitignored)
├── .env.example              # Environment template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build TypeScript to JavaScript |
| `pnpm start` | Start production server |
| `pnpm lint` | Check code style with Biome |
| `pnpm lint:fix` | Fix code style issues |
| `pnpm typecheck` | Check TypeScript types |
| `pnpm auth:generate` | Generate Drizzle schema from better-auth config |

## Database Schema

The auth server uses the following tables (managed by Better Auth):

- **user** - User accounts (id, email, name, emailVerified, image)
- **session** - Active sessions (id, token, userId, expiresAt, ipAddress, userAgent)
- **account** - Auth methods (id, userId, provider, providerAccountId)
- **verification** - Email verification tokens (id, identifier, value, expiresAt)

Schema is generated by Better Auth and can be customized in `src/lib/auth.ts`.

### Adding Custom Fields

You can extend the user table with custom fields in `src/lib/auth.ts`:

```typescript
export const auth = betterAuth({
  // ... other config
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
      onboardingCompleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      bio: {
        type: "string",
        required: false,
      },
    },
  },
});
```

After adding custom fields, regenerate the schema and create a migration:

```bash
# From repository root
pnpm db:schema      # Regenerate auth schema from Better Auth config
pnpm db:generate    # Create migration for new fields
pnpm db:migrate     # Apply migration to database
```

The new fields will be:
- ✅ Type-safe in TypeScript
- ✅ Available in Drizzle queries
- ✅ Included in Better Auth session data
- ✅ Automatically migrated to the database

### Using Custom Fields in Code

Once you've added custom fields, you can use them in your code:

```typescript
import { db } from "./lib/db";
import { user } from "@repo/database/schema";
import { eq } from "drizzle-orm";

// Query with custom fields
const users = await db
  .select()
  .from(user)
  .where(eq(user.role, "admin"));

// Update custom fields
await db
  .update(user)
  .set({ onboardingCompleted: true })
  .where(eq(user.id, userId));
```

## Development Tips

### Testing with cURL

```bash
# 1. Sign up a new user
SIGNUP_RESPONSE=$(curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}' \
  -c cookies.txt)

# 2. Sign in (saves session cookie)
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  -c cookies.txt

# 3. Get session (uses saved cookie)
curl http://localhost:3001/api/auth/get-session -b cookies.txt

# 4. Sign out
curl -X POST http://localhost:3001/api/auth/sign-out -b cookies.txt
```

### View Database with Drizzle Studio

```bash
# From repository root
pnpm db:studio

# Opens at https://local.drizzle.studio
```

### Regenerate Schema

If you modify the auth configuration:

```bash
# From repository root
pnpm db:schema      # Regenerate Drizzle schema
pnpm db:generate    # Create migration
pnpm db:migrate     # Apply to database
```

## Troubleshooting

### "Invalid environment variables" on startup

**Problem:** Environment variables are missing or invalid.

**Solution:** 
1. Copy `.env.example` to `.env`
2. Fill in all required values
3. Ensure `BETTER_AUTH_SECRET` is at least 32 characters

### "connection refused" to database

**Problem:** PostgreSQL isn't running.

**Solution:**
```bash
# Start PostgreSQL with Docker
docker start auth-postgres

# Or create new container
docker run -d \
  --name auth-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=auth_db \
  -p 5432:5432 \
  postgres:18
```

### Hot reload not working

**Problem:** Server doesn't restart on file changes.

**Solution:**
- Ensure you're using `pnpm dev` (not `pnpm start`)
- Check that `tsx` is installed in devDependencies
- Verify no syntax errors in TypeScript files

### Session not persisting

**Problem:** Session cookie not set or cleared immediately.

**Solution:**
- Check `BETTER_AUTH_URL` matches your server URL
- Ensure cookies are enabled in your client
- Verify session exists in database: `pnpm db:studio`

## Security Considerations

- ✅ Environment variables validated at startup
- ✅ Session tokens are httpOnly and secure (production)
- ✅ Passwords are hashed with bcrypt
- ✅ CSRF protection built into Better Auth
- ✅ SQL injection prevented by Drizzle ORM
- ⚠️ Always use HTTPS in production
- ⚠️ Set secure CORS origins in production
- ⚠️ Rotate `BETTER_AUTH_SECRET` periodically

## Related Documentation

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Hono Documentation](https://hono.dev/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- `../../packages/database/README.md` - Database package
- `../../DATABASE_WORKFLOW.md` - Database workflow guide

## License

Private - Part of starter-kit monorepo
