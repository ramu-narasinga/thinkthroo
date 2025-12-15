# GitHub Copilot Instructions for CodeArc

## Project Overview

CodeArc is a codebase architecture validation tool built as a monorepo using Turborepo, Next.js, and LangGraph.

### Key Components

1. **Platform (Next.js Client)** - `apps/platform/`
   - User authentication via GitHub OAuth
   - Repository access and management
   - Codebase architecture rules definition (stored as markdown in Supabase)
   - UI components built with shadcn/ui and React

2. **Architecture Validator (LangGraph)** - Backend validation service
   - Indexes codebase architecture from Supabase
   - Validates code changes against architecture rules using RAG
   - Provides focused feedback on architecture violations only
   - Avoids AI noise by confining context to user-defined rules

3. **CodeArc Bot** - `apps/codearc-bot/`
   - GitHub App that comments validation feedback on PRs
   - Integrates with Architecture Validator API

4. **Shared Packages** - `packages/`
   - `@repo/editor` - Editor components
   - `@repo/ui` - Shared UI component library
   - `@repo/eslint-config` - ESLint configurations
   - `@repo/typescript-config` - TypeScript configurations
   - `@repo/model-bank` - Model-related utilities

### Technology Stack

- **Monorepo**: Turborepo with pnpm workspaces
- **Frontend**: Next.js 14+ with App Router, React, TypeScript
- **UI**: shadcn/ui components, Tailwind CSS
- **Database**: Supabase (PostgreSQL with RLS policies)
- **State Management**: Zustand (see `apps/platform/store/`)
- **Backend**: LangGraph for AI/RAG workflows
- **API Layer**: Next.js API routes in `apps/platform/app/(backend)/`
- **Authentication**: GitHub OAuth
- **Package Manager**: pnpm

## Development Guidelines

### Code Style & Patterns

1. **TypeScript First**: All code should be fully typed. Use `type.ts` files for type definitions.

2. **File Organization**:
   - Place API routes in `app/(backend)/api/`
   - Place UI components in `components/` with subdirectories for related components
   - Use `hooks/` for custom React hooks
   - Use `lib/` for utility functions and external integrations
   - Use `service/` for business logic and data fetching
   - Use `database/` for database schemas and migrations

3. **Component Structure**: Follow the patterns in `docs/development/components-structure/`

4. **API Layer**: Follow the patterns documented in `docs/development/api-layer/`

5. **State Management**: Use Zustand stores in `apps/platform/store/` for global state

6. **Database Patterns**:
   - Use Drizzle ORM for database operations
   - Define schemas in `database/schemas/`
   - Keep models in `database/models/`
   - Follow RLS policies defined in `supabase-rls-policies.sql`

### Naming Conventions

- **Components**: PascalCase (e.g., `AppSidebar.tsx`)
- **Utilities**: camelCase (e.g., `generateGithubAppJwt.ts`)
- **Types**: PascalCase interfaces/types (e.g., `InstallationType`)
- **Constants**: UPPER_SNAKE_CASE for true constants, camelCase for config objects
- **Hooks**: camelCase with `use` prefix (e.g., `useInstallation.ts`)

### Import Paths

- Use absolute imports with `@/` prefix for platform code
- Use `@repo/*` for shared packages
- Example: `import { Button } from '@/components/ui/button'`

### Architecture Validation Focus

When working on the validation system:
- Keep feedback focused on architecture violations only
- Use RAG to retrieve only relevant documentation sections
- Avoid generic AI suggestions not related to defined architecture rules
- Code changes and retrieved architecture context should be the only inputs to LLM

### Testing

- Use Vitest for unit tests (configured in `vitest.config.ts`)
- Place tests in `test/` directories adjacent to source code

### Documentation

- Reference `context.md` for project feature overview
- Check `docs/development/` for architectural patterns
- Update documentation when adding new patterns or features

### GitHub Integration

- The bot operates as a GitHub App with installation-based access
- Use proper JWT generation for GitHub App authentication
- Follow GitHub's API rate limits and best practices

## Key Files to Reference

- `context.md` - Project features and architecture overview
- `apps/platform/middleware.ts` - Authentication and routing middleware
- `apps/platform/drizzle.config.ts` - Database configuration
- `apps/platform/features.json` - Feature flags
- `turbo.json` - Monorepo build configuration
- `pnpm-workspace.yaml` - Workspace package definitions

## Current Branch

Working on: `feat/rag` - RAG (Retrieval-Augmented Generation) implementation for architecture validation
