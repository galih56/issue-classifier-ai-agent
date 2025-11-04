# Starter Kit

A full-stack monorepo starter kit for building modern applications with TypeScript, featuring authentication, database integration, and developer tooling.

## Features

- Authentication server with JWT validation and Better Auth
- REST API server built with Hono
- Documentation site with interactive API docs
- MCP server for AI agent integration
- PostgreSQL database with Drizzle ORM
- Monorepo structure with Turborepo and pnpm workspaces
- Docker development environment

## Tech Stack

- **Backend**: Hono, FastMCP, Better Auth
- **Database**: PostgreSQL with Drizzle ORM
- **Frontend**: React with Fumadocs UI
- **Build**: Turborepo with pnpm workspaces
- **Dev Tools**: Docker, Drizzle Studio, Scalar

## Quick Start

### Prerequisites
- Node.js (v18+)
- pnpm (v9.0.0+)
- Docker

### Installation

```bash
git clone https://github.com/yurisasc/starter-kit.git
cd starter-kit
pnpm install
```

### Setup

```bash
# Automated environment setup
pnpm setup:env

# Start PostgreSQL database
docker run -d \
  --name auth-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=auth_db \
  -p 5432:5432 \
  postgres:18

# Setup database schema
pnpm db:setup

# Start development servers
pnpm dev
```

**Visit:**
- **Docs**: http://localhost:3000
- **Auth Server**: http://localhost:3001
- **API Server**: http://localhost:3010
- **Drizzle Studio**: https://local.drizzle.studio

## Project Structure

```
├── apps/
│   ├── api/          # REST API server (Hono)
│   ├── auth/         # Authentication server (Better Auth)
│   ├── docs/         # Documentation site (Fumadocs)
│   └── mcp/          # MCP server for AI integration
├── packages/
│   ├── biome-config/ # Shared linting/formatting config
│   ├── database/     # Database client & migrations
│   └── typescript-config/ # Shared TypeScript config
└── specs/            # Feature specifications & documentation
```

## Documentation

Documentation is available [here](https://starter.yuris.dev) or at http://localhost:3000 once the development servers are running.

- Installation Guide
- Tech Stack Overview
- Monorepo Structure
- Reference Guide

## Development

This project emphasizes:
- Type safety at compile time and runtime
- Version-controlled database schemas
- Clear separation between applications and shared libraries
- Documentation-driven development