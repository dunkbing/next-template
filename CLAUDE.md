# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application with authentication using Better Auth, PostgreSQL database with Drizzle ORM, Hono for API routes, and shadcn/ui components. The project uses Biome for linting/formatting instead of ESLint/Prettier.

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
- `BETTER_AUTH_SECRET`: Better Auth secret (generate with `openssl rand -base64 32`)
- `BETTER_AUTH_URL`: Base URL for Better Auth (e.g., `http://localhost:3000`)
- `NEXT_PUBLIC_APP_URL`: Public app URL for client-side auth (e.g., `http://localhost:3000`)

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
- **User Schema**: Users belong to tenants and have assigned roles (`src/db/schema/auth.ts`)
- **Custom Permissions**: Per-user permission overrides stored as JSON string
- **User Operations**: CRUD via server actions (`src/app/actions/users.ts`)
  - User creation handled by Better Auth's `signUpEmail` API
  - Update user role and permissions
  - Delete user
  - Fetch users by tenant
- **User Relations**: Each user has tenant and role relationships

### Authentication System
- **Better Auth**: Modern authentication library with email/password support
- **Auth Configuration**:
  - Server: `src/lib/auth.ts` - Better Auth instance with Drizzle adapter
  - Client: `src/lib/auth-client.ts` - React hooks and client methods
- **Protected Routes**: Routes under `/dashboard` require authentication with session checks
- **Session Management**: Better Auth handles session cookies and tokens automatically
- **Custom Fields**: User schema extended with `tenantId`, `roleId`, and `customPermissions`
- **Server Actions**: `login` and `register` actions with loading states (`src/app/actions/auth.ts`)
- **Password Hashing**: Better Auth handles password hashing securely
- **API Routes**: Better Auth handler at `/api/auth/[...all]` for authentication endpoints

### Registration Flow
- **Transaction-Based**: Manual rollback ensures data consistency
- **Company Setup**: New registrations create tenant + admin role + user atomically
- **Flow**:
  1. Create tenant
  2. Create admin role with all permissions
  3. Create user via Better Auth (handles password hashing)
  4. Update user with tenant and role information
- **Rollback**: If any step fails, all created resources are cleaned up (user, account, role, tenant)
- **Default Admin Role**: Auto-created with all available permissions
- **Validation**: Checks for existing users and duplicate tenant slugs
- **Error Handling**: User-friendly error messages with automatic cleanup

### Internationalization (i18n)
- **Supported Languages**: English (en), Vietnamese (vi), French (fr)
- **Locale Detection**: Automatic detection from browser preferences and cookies
- **Routing**: All routes prefixed with locale (e.g., `/en/dashboard`, `/vi/login`)
- **Dictionary Files**: JSON translation files in `src/lib/i18n/dictionaries/`
- **Language Switcher**: Globe icon dropdown in dashboard header
- **Configuration**: `src/lib/i18n/config.ts` for locale settings
- **Utilities**: `getDictionary()` for server-side translations, `interpolate()` for dynamic strings

### Pages & UI
- **Landing Page** (`src/app/[lang]/page.tsx`): Public home page with sign-in redirect for authenticated users
- **Login Page** (`src/app/[lang]/login/page.tsx`): Client component with loading states and error handling
- **Register Page** (`src/app/[lang]/register/page.tsx`): Multi-step registration with company setup
- **Dashboard** (`src/app/[lang]/dashboard/page.tsx`): Protected dashboard with user greeting
- **Users Management** (`src/app/[lang]/dashboard/users/page.tsx`):
  - Lists all users in tenant
  - Permission-gated (requires `read:User`)
  - Invite user functionality (requires `create:User`)
  - User table with role display
- **Loading States**: All forms use `useActionState` hook with pending states and disabled inputs

### API Routes with Hono
- **Hono Integration**: Fast, lightweight web framework for Edge runtime
- **API Base Path**: All API routes under `/api` via catch-all route handler
- **Route Handler**: `src/app/api/[[...route]]/route.ts` handles all HTTP methods
- **Validation**: Zod schema validation with `@hono/zod-validator`
- **Example Endpoints**:
  - `GET /api/health` - Health check endpoint
  - `POST /api/users` - Create user with JSON validation

### Components
- **Users Table** (`src/components/users-table.tsx`): Display and manage tenant users
- **Invite User Dialog** (`src/components/invite-user-dialog.tsx`): Permission-gated user invitation
- **Language Switcher** (`src/components/language-switcher.tsx`): Dropdown for switching languages
- **Page Loader** (`src/components/page-loader.tsx`): Loading UI for suspense boundaries
- **shadcn/ui**: Card, Button, Input, Label, Dialog, Table, and more

## Architecture

### Authentication Flow
- User logs in via Better Auth's `signInEmail` API
- Password verified by Better Auth
- Session created with user ID, email, and name
- Protected pages fetch full user data (tenant, role, permissions)
- Permissions merged (role permissions + custom permissions)
- Protected routes check authentication using `auth.api.getSession()`
- Session includes user ID but full permissions loaded on-demand for security

### Permission Flow
1. User assigned to role with base permissions
2. User can have custom permissions (additions or overrides)
3. Login merges role permissions + custom permissions
4. Permissions stored in session JWT
5. CASL ability builder creates permission checker from session permissions
6. Pages/components check permissions using `ability.can(action, subject)`

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL (using `bun-sql`)
- **Database client**: Located in `src/db/index.ts` with schema auto-loaded
- **Schema location**: All schema files in `src/db/schema/`
  - `auth.ts`: Better Auth tables (user, session, account, verification) with custom fields
  - `tenants.ts`: Multi-tenant organizations
  - `roles.ts`: Role definitions with permissions
- **Better Auth Tables**:
  - `user`: Core user table with custom fields (tenantId, roleId, customPermissions)
  - `session`: Active sessions with tokens and expiration
  - `account`: Stores passwords and OAuth tokens
  - `verification`: Email verification and password reset tokens
- **Configuration**: `drizzle.config.ts` points to `./drizzle` for migrations and `./src/db/schema` for schema files
- **Relations**: Drizzle relations for tenant -> roles, tenant -> users, role -> users

### Project Structure
- **Server Actions**: Located in `src/app/actions/`
  - `auth.ts`: Login, register, sign out actions with i18n support and rollback logic
  - `users.ts`: User query operations (creation via Better Auth)
  - `roles.ts`: Role CRUD operations and permission helpers
  - `tenants.ts`: Tenant CRUD operations
- **API Routes**:
  - Hono API: `src/app/api/[[...route]]/route.ts` - Main API handler with health check
  - Better Auth: `src/app/api/auth/[...all]/route.ts` - Auth handlers (GET, POST)
- **Components**: UI components in `src/components/` with shadcn/ui components in `src/components/ui/`
- **Configuration**: Centralized in `src/lib/configs.ts` for environment variables
- **Auth Config**:
  - Server: `src/lib/auth.ts` - Better Auth instance with Drizzle adapter and nextCookies plugin
  - Client: `src/lib/auth-client.ts` - React client with useSession hook
- **CASL**: Permission system in `src/lib/casl/ability.ts`
- **i18n**: Configuration in `src/lib/i18n/config.ts`, dictionaries in `src/lib/i18n/dictionaries/`

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
- Password hashing is handled by Better Auth automatically
- User IDs are strings (text) in Better Auth, not integers
- Custom fields (tenantId, roleId) are nullable in DB but required after signup

### Form Handling
- Use `useActionState` for form operations with loading states
- Server actions should return `{ error: string }` for validation errors
- All form inputs and buttons should be disabled during pending state
- Use Lucide icons for loading spinners (`<Loader2 className="animate-spin" />`)

### Validation
- Use Zod for schema validation
- Use drizzle-zod for creating Zod schemas from Drizzle tables
- For API routes, use `@hono/zod-validator` with Hono

### API Development with Hono
- All API routes go in `src/app/api/[[...route]]/route.ts`
- Use `.basePath('/api')` to set the base path for all routes
- Export HTTP method handlers: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Use `zValidator('json', schema)` for request validation
- Return JSON with `c.json({ data }, statusCode)`
- Access query params: `c.req.query('param')`
- Access path params: `c.req.param('id')`

### Permissions
- Check permissions server-side before rendering protected content
- Use CASL's `ability.can(action, subject)` pattern
- Store permissions in session for both client and server access
- Custom permissions can override role permissions

### Next.js Specifics
- Next.js 15 uses App Router exclusively (no Pages Router)
- Protected routes check session using `auth.api.getSession({ headers: await headers() })`
- Use `redirect()` for server-side redirects after mutations
- Root path (`/`) redirects to default locale (`/en`)
- Session management uses Better Auth's cookie-based system

### Better Auth Specifics
- Server-side session: Use `auth.api.getSession({ headers: await headers() })`
- Client-side session: Use `useSession()` hook from `@/lib/auth-client`
- Sign in: Use `auth.api.signInEmail({ body: { email, password } })`
- Sign up: Use `auth.api.signUpEmail({ body: { email, password, name } })`
- Sign out: Clear Better Auth session cookie and redirect
- User updates: Direct database updates via Drizzle (Better Auth doesn't support custom field updates via API)
