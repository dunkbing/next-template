# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application with authentication using NextAuth v5, PostgreSQL database with Drizzle ORM, and shadcn/ui components. The project uses Biome for linting/formatting instead of ESLint/Prettier.

## Development Commands

```bash
# Start development server with Turbopack
bun --bun dev

# Build for production (with Turbopack)
bun run build

# Start production server
bun start

# Lint code with Biome
bun run lint

# Format code with Biome
bun run format
```

## Database Commands

```bash
# Push schema changes to database (development)
bunx drizzle-kit push
```

## Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: NextAuth secret (generate with `openssl rand -base64 32`)

## Architecture

### Authentication Flow

- **NextAuth v5 (beta)**: Credentials-based authentication with bcrypt password hashing
- **Auth configuration split**: `src/auth.config.ts` (edge-compatible) and `src/auth.ts` (Node.js features)
- **Protected routes**: Routes under `/protected` require authentication (configured in `src/auth.config.ts:14`)
- **Redirect logic**: Authenticated users accessing root are redirected to `/protected`

### Database Layer

- **ORM**: Drizzle ORM with PostgreSQL (using `node-postgres`)
- **Database client**: Located in `src/db/index.ts` with schema auto-loaded
- **Schema location**: All schema files in `src/db/schema/` (currently `users.ts`)
- **Configuration**: `drizzle.config.ts` points to `./drizzle` for migrations and `./src/db/schema` for schema files

### Project Structure

- **Server Actions**: Located in `src/app/actions/` (e.g., `users.ts` for user operations)
- **API Routes**: NextAuth handlers at `src/app/api/auth/[...nextauth]/route.ts`
- **Components**: UI components in `src/components/` with shadcn/ui components in `src/components/ui/`
- **Configuration**: Centralized in `src/lib/configs.ts` for environment variables

### Path Aliases

TypeScript path alias `@/*` maps to `src/*` (configured in `tsconfig.json`)

### UI Components

- **shadcn/ui**: Configured with "new-york" style, RSC, and Lucide icons
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Component installation**: Use `bunx shadcn@latest add <component-name>`

## Important Notes

- Always use server actions (marked with `"use server"`) for database operations
- Password hashing uses `bcrypt-ts` (Edge runtime compatible)
- Biome is used for both linting and formatting, not ESLint/Prettier
- Next.js 15 uses App Router exclusively (no Pages Router)
- Don't use `any` type
- Just push the db changes directly, no need to make migration
- Put the database related functions to the actions folder (src/app/actions), don't just use the `db` and `user server` directly.
- Create the type inference from the drizzle schemas when needed first (if not there yet) instead of making custom types.
- Use react-hook form for form operation
- Use zod and drizzle-zod for schema validation
