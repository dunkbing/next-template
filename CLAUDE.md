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

## Implemented Features

### Multi-Tenancy Architecture
- **Tenant Isolation**: Complete tenant-based separation with slug-based identification
- **Tenant Management**: CRUD operations for tenants via server actions (`src/app/actions/tenants.ts`)
- **Schema**: `tenants` table with name, slug, and timestamps (`src/db/schema/tenants.ts`)

### Role-Based Access Control (RBAC)
- **Roles**: Tenant-scoped roles with flexible permissions system
- **Permissions**: JSON-based permissions stored per role
- **Role Management**: Full CRUD operations for roles (`src/app/actions/roles.ts`)
- **Schema**: `roles` table with tenant relationship (`src/db/schema/roles.ts`)
- **Available Permissions**:
  - User: `create:User`, `read:User`, `update:User`, `delete:User`, `invite:User`
  - Tenant: `read:Tenant`, `update:Tenant`
  - Role: `create:Role`, `read:Role`, `update:Role`, `delete:Role`
  - Dashboard: `read:Dashboard`
  - Settings: `read:Settings`, `update:Settings`
  - Admin: `manage:all`

### Permission System with CASL
- **CASL Integration**: Attribute-based access control using @casl/ability (`src/lib/casl/ability.ts`)
- **Permission Types**: Action-based permissions (create, read, update, delete, manage, invite)
- **Custom Permissions**: Users can have custom permissions that extend role permissions
- **Permission Merging**: Role permissions + custom permissions = final user permissions
- **Authorization**: Session includes user permissions for client and server-side checks

### User Management
- **User Schema**: Users belong to tenants and have assigned roles (`src/db/schema/users.ts`)
- **Custom Permissions**: Per-user permission overrides stored as JSON array
- **User Operations**: Full CRUD via server actions (`src/app/actions/users.ts`)
  - Create user with role and custom permissions
  - Update user role and permissions
  - Delete user
  - Fetch users by tenant
- **User Relations**: Each user has tenant and role relationships

### Authentication System
- **NextAuth v5 (beta)**: Credentials-based authentication with bcrypt password hashing
- **Auth configuration split**: `src/auth.config.ts` (edge-compatible) and `src/auth.ts` (Node.js features)
- **Protected routes**: Routes under `/dashboard` require authentication
- **Session Enhancement**: Session includes tenant ID, role ID, role name, and merged permissions
- **Server Actions**: `login` and `register` actions with loading states (`src/app/actions/auth.ts`)
- **Password Hashing**: Uses `bcrypt-ts` (Edge runtime compatible)

### Registration Flow
- **Company Setup**: New registrations create tenant + admin role + user
- **Default Admin Role**: Auto-created with all available permissions
- **Validation**: Checks for existing users and duplicate tenant slugs
- **Error Handling**: User-friendly error messages for registration failures

### Pages & UI
- **Landing Page** (`src/app/page.tsx`): Public home page with sign-in redirect for authenticated users
- **Login Page** (`src/app/login/page.tsx`): Client component with loading states and error handling
- **Register Page** (`src/app/register/page.tsx`): Multi-step registration with company setup
- **Dashboard** (`src/app/dashboard/page.tsx`): Protected dashboard with user greeting
- **Users Management** (`src/app/dashboard/users/page.tsx`): 
  - Lists all users in tenant
  - Permission-gated (requires `read:User`)
  - Invite user functionality (requires `create:User`)
  - User table with role display
- **Loading States**: All forms use `useActionState` hook with pending states and disabled inputs

### Components
- **Users Table** (`src/components/users-table.tsx`): Display and manage tenant users
- **Invite User Dialog** (`src/components/invite-user-dialog.tsx`): Permission-gated user invitation
- **Page Loader** (`src/components/page-loader.tsx`): Loading UI for suspense boundaries
- **shadcn/ui**: Card, Button, Input, Label, Dialog, Table, and more

## Architecture

### Authentication Flow
- User logs in via credentials provider
- Password verified with bcrypt
- User data fetched with role and tenant
- Permissions merged (role + custom)
- Session populated with user ID, tenant ID, role info, and permissions
- Protected routes check authentication via middleware (`src/auth.config.ts:14`)

### Permission Flow
1. User assigned to role with base permissions
2. User can have custom permissions (additions or overrides)
3. Login merges role permissions + custom permissions
4. Permissions stored in session JWT
5. CASL ability builder creates permission checker from session permissions
6. Pages/components check permissions using `ability.can(action, subject)`

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL (using `node-postgres`)
- **Database client**: Located in `src/db/index.ts` with schema auto-loaded
- **Schema location**: All schema files in `src/db/schema/`
  - `tenants.ts`: Multi-tenant organizations
  - `roles.ts`: Role definitions with permissions
  - `users.ts`: Users with tenant and role relationships
- **Configuration**: `drizzle.config.ts` points to `./drizzle` for migrations and `./src/db/schema` for schema files
- **Relations**: Drizzle relations for tenant -> roles, tenant -> users, role -> users

### Project Structure
- **Server Actions**: Located in `src/app/actions/`
  - `auth.ts`: Login, register, sign out actions
  - `users.ts`: User CRUD operations
  - `roles.ts`: Role CRUD operations and permission helpers
  - `tenants.ts`: Tenant CRUD operations
- **API Routes**: NextAuth handlers at `src/app/api/auth/[...nextauth]/route.ts`
- **Components**: UI components in `src/components/` with shadcn/ui components in `src/components/ui/`
- **Configuration**: Centralized in `src/lib/configs.ts` for environment variables
- **Auth Config**: Split between `src/auth.config.ts` (edge) and `src/auth.ts` (full)
- **CASL**: Permission system in `src/lib/casl/ability.ts`

### Path Aliases
TypeScript path alias `@/*` maps to `src/*` (configured in `tsconfig.json`)

### UI Components
- **shadcn/ui**: Configured with "new-york" style, RSC, and Lucide icons
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Component installation**: Use `bunx shadcn@latest add <component-name>`
- **Icons**: Lucide React (e.g., Loader2 for loading spinners)

## Important Development Notes

### Code Style & Patterns
- Always use server actions (marked with `"use server"`) for database operations
- Put database related functions in the actions folder (`src/app/actions`), don't use `db` and `"use server"` directly in pages
- Create type inference from Drizzle schemas when needed first (if not there yet) instead of making custom types
- Don't use `any` type - use proper TypeScript types
- Use `useActionState` hook for forms with loading states
- Biome is used for both linting and formatting, not ESLint/Prettier

### Database & Schema
- Just push the db changes directly with `bunx drizzle-kit push`, no need to make migrations
- All schemas export `Select*` and `Insert*` types for type inference
- Use Drizzle relations for querying related data
- Password hashing uses `bcrypt-ts` (Edge runtime compatible)

### Form Handling
- Use `useActionState` for form operations with loading states
- Server actions should return `{ error: string }` for validation errors
- All form inputs and buttons should be disabled during pending state
- Use Lucide icons for loading spinners (`<Loader2 className="animate-spin" />`)

### Validation
- Use Zod for schema validation
- Use drizzle-zod for creating Zod schemas from Drizzle tables

### Permissions
- Check permissions server-side before rendering protected content
- Use CASL's `ability.can(action, subject)` pattern
- Store permissions in session for both client and server access
- Custom permissions can override role permissions

### Next.js Specifics
- Next.js 15 uses App Router exclusively (no Pages Router)
- Protected routes configured in middleware via `src/auth.config.ts`
- Use `redirect()` for server-side redirects after mutations
- Authenticated users accessing root (`/`) are redirected to `/dashboard`
