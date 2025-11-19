# AI Classification Service

## Conceptual Overview
This project provides a generalized service for AI-assisted classification.
It is designed to support multiple use cases — such as issue categorization, salary structure suggestions, or any workflow that requires interpreting unstructured input and mapping it into structured categories.

The goal of this repository is to build in the open and document the conceptual architecture, the flow, and the thinking behind the system.

1. Core Idea
  The service receives an input text (e.g., user description, request, problem statement, employee profile) and classifies it into predefined categories based on curated domain knowledge.

  Examples of category sets:
    Issue categories for IT operations
    Salary structure tiers
    HR policy classifications
    Performance or KPI categories

  Each category can include:
    Description
    Criteria
    Notes or contextual constraints
    Severity or level (optional)

  The AI model uses this information to decide:
    Which category best matches the input
    Why it matches
    How confident the classification is

2. High-Level Flow

  Step 1 — Input Received
    - The API receives a raw text input from any client:
    - Web app
    - Internal tool
    - Script
    - HR system
    - Browser extension
    - Command-line tool

  Step 2 — Preparation of Domain Context
    - Before classification, the system prepares structured context:
    - List of categories
    - Definitions & descriptions
    - Criteria
    - Constraints
    - Use-case specific rules
    - This gives the model a controlled environment so it produces consistent structured output.

  Step 3 — AI Classification Request
    The system sends a single structured prompt to an AI provider.
    This prompt includes:
    - The input text
    - The curated categories
    - Instructions on how to analyze and compare
    - The expected structured output format

  Step 4 — Model Output
    The model returns:
    - Category name
    - Reasoning/explanation
    - Confidence score (model-generated probability-like judgment)

    This enables:
      Transparent decisions
      Auditable outputs
      Higher trust from HR/operations teams

  Step 5 — API Response to Client
    The client receives a structured JSON object, ready to be displayed or stored.


3. Conceptual Architecture
  This repository follows a modular architecture:

  1. Input Layer
    Handles all incoming user inputs (text, forms, API requests).

  2. Knowledge & Category Store
    Contains:
      The curated category sets
      Descriptions
      Criteria
      Domain rules

    Update tracking
    This part acts like a mini “domain knowledge base”.

  3. AI Connector Layer
    Responsible for:
      Packing the prompt
      Sending it to different AI providers
      Handling model responses
      Error management
      This keeps the system provider-agnostic.

  4. Classification Core
    Applies the logic for:
      Preparing category context
      Mapping input into categories
      Enforcing output schema
      Normalizing model responses

  5. Client Layer
    Any UI, dashboard, or external integration that consumes the classification results.

  4. Uses Beyond Issue Classification
    This architecture is flexible enough to support multiple HR and business use cases:
    Salary range suggestion
    Employee leveling
    Performance notes classification
    Training recommendation categorization
    Job description parser
    KPI summary classification
    HR document routing
    Each use case simply swaps out the category set and adds relevant criteria.

  5. Philosophy of the Project
    Avoid over-engineering
    Keep the system deterministic and inspectable
    Use AI only for interpretation and mapping, not business logic
    Allow organizations to define their own domain knowledge
    Build in the open and iterate naturally


Diagrams
1. High-Level Flow Diagram
flowchart TD
  A[User Input] --> B[API Endpoint]
  B --> C[Prepare Category Context]
  C --> D[Build Structured Prompt]
  D --> E[Send to AI Provider]
  E --> F[Model Processes Input]
  F --> G[Model Returns Structured Output]
  G --> H[Normalize & Validate Response]
  H --> I[Return JSON to Client]

2. Conceptual Architecture Diagram
graph LR
  subgraph Input Layer
      U[User]
      API[API Gateway]
  end

  subgraph Knowledge Base
      CAT[Categories & Descriptions]
      CRT[Criteria & Rules]
  end

  subgraph AI Connector Layer
      PROMPT[Prompt Builder]
      PROVIDER[AI Provider<br>(OpenAI/OpenRouter/etc.)]
  end

  subgraph Classification Core
      PREP[Context Preparator]
      MAP[Classification Logic]
      NORM[Response Normalizer]
  end

  subgraph Clients
      FE[Frontend UI]
      EXT[Internal Tools]
      INT[Integrations]
  end

  U --> API
  API --> PREP
  CAT --> PREP
  CRT --> PREP

  PREP --> PROMPT
  PROMPT --> PROVIDER
  PROVIDER --> MAP
  MAP --> NORM

  NORM --> FE
  NORM --> EXT
  NORM --> INT

3. Prompt Construction (Concept Logic)
flowchart TB
  A[Domain Knowledge Loaded] --> B[Generate Category Descriptions]
  B --> C[Insert Rules & Constraints]
  C --> D[Format Expected Output Schema]
  D --> E[Inject User Input]
  E --> F[Final Structured Prompt Sent to Model]

4. Model Output Schema Overview
classDiagram
  class ClassificationResult {
      string category
      string explanation
      number confidence
      object metadata
  }
  
  class Metadata {
      string matchedCriteria
      string modelVersion
      string timestamp
  }
  
  ClassificationResult --> Metadata





## Technical stuff

# Starter Kit

Since i never use javascript on backend for production level system. I decided to use my friend's monorepo starter-kit to begin with. Thanks a lot to Yuris Aryansiah for creating the starter-kit monorepo! It provides modern techstack with simple setup and good docs. This is my first time work with monorepo. So that helps a lot for me. You can check out this link below :

https://github.com/yurisasc/starter-kit
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