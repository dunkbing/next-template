# RBAC Implementation Guide

This boilerplate includes a complete Role-Based Access Control (RBAC) system using CASL.

## Database Schema

### Tenants (Companies)
Each tenant represents a company/organization with isolated data.

**Table: `tenants`**
- `id` - Auto-incrementing primary key
- `name` - Company name
- `slug` - Unique URL-friendly identifier
- `created_at`, `updated_at` - Timestamps

### Roles
Each tenant can have multiple roles with different permission sets.

**Table: `roles`**
- `id` - Auto-incrementing primary key
- `tenantId` - Foreign key to tenants
- `name` - Role name (e.g., "Admin", "Manager", "Viewer")
- `description` - Role description
- `permissions` - JSON array of permission strings
- `created_at`, `updated_at` - Timestamps

### Users
Users belong to a tenant and are assigned a role. They can also have custom permissions.

**Table: `users`**
- `id` - Auto-incrementing primary key
- `tenantId` - Foreign key to tenants
- `roleId` - Foreign key to roles
- `email` - Unique email address
- `password` - Hashed password
- `name` - User's full name
- `customPermissions` - JSON array of custom permission strings (overrides role permissions)
- `created_at`, `updated_at` - Timestamps

## Permission Format

Permissions follow the format: `action:subject`

### Available Actions
- `create` - Create new resources
- `read` - Read/view resources
- `update` - Update existing resources
- `delete` - Delete resources
- `manage` - All actions (admin)
- `invite` - Custom action for inviting users

### Available Subjects
- `User` - User management
- `Tenant` - Tenant/company settings
- `Role` - Role management
- `Dashboard` - Dashboard access
- `Settings` - Settings access
- `all` - All subjects (admin)

### Example Permissions
```typescript
[
  "read:Dashboard",      // Can view dashboard
  "create:User",         // Can create users
  "update:User",         // Can update users
  "delete:User",         // Can delete users
  "manage:all",          // Can do everything (admin)
  "read:Settings",       // Can view settings
  "update:Settings",     // Can modify settings
]
```

## Usage Examples

### Server-Side Authorization

Check permissions in server actions:

```typescript
import { auth } from "@/auth";
import { defineAbilityFor } from "@/lib/casl/ability";

export async function deleteUser(userId: number) {
  const session = await auth();
  const ability = defineAbilityFor(session?.user?.permissions || []);

  if (!ability.can("delete", "User")) {
    return { success: false, error: "Unauthorized" };
  }

  // Proceed with deletion
  // ...
}
```

### Client-Side Authorization

Use the `Can` component to conditionally render UI:

```typescript
"use client";

import { Can } from "@/lib/casl/context";

export function UserManagement() {
  return (
    <div>
      <h1>Users</h1>

      <Can I="create" a="User">
        <button>Add User</button>
      </Can>

      <Can I="delete" a="User">
        <button>Delete User</button>
      </Can>
    </div>
  );
}
```

Use the `useAbility` hook for programmatic checks:

```typescript
"use client";

import { useAbility } from "@/lib/casl/context";

export function MyComponent() {
  const ability = useAbility();

  if (ability.can("update", "Settings")) {
    // Show settings editor
  }

  return <div>...</div>;
}
```

## Registration Flow

When a user registers:

1. A new **tenant** is created with the company name
2. A default **"Admin" role** is created with all permissions
3. The user is created and assigned to the Admin role
4. The user can then invite other users and create additional roles

## Managing Roles & Permissions

### Creating a Role

```typescript
import { createRole } from "@/app/actions/roles";

await createRole({
  tenantId: 1,
  name: "Manager",
  description: "Can manage users and view reports",
  permissions: [
    "read:Dashboard",
    "read:User",
    "create:User",
    "update:User",
    "read:Settings",
  ],
});
```

### Updating Role Permissions

```typescript
import { updateRole } from "@/app/actions/roles";

await updateRole(roleId, {
  permissions: [
    "read:Dashboard",
    "read:User",
    "update:User",
  ],
});
```

### Setting Custom User Permissions

Users can have custom permissions that override their role:

```typescript
import { updateUserPermissions } from "@/app/actions/users";

await updateUserPermissions(userId, [
  "read:Dashboard",
  "read:User",
  "delete:User", // Custom permission not in role
]);
```

## Available Server Actions

### Tenant Actions (`@/app/actions/tenants`)
- `createTenant(data)` - Create a new tenant
- `getTenantById(id)` - Get tenant by ID
- `getTenantBySlug(slug)` - Get tenant by slug
- `updateTenant(id, data)` - Update tenant
- `getAllTenants()` - Get all tenants

### Role Actions (`@/app/actions/roles`)
- `createRole(data)` - Create a new role
- `getRoleById(id)` - Get role by ID
- `getRolesByTenant(tenantId)` - Get all roles for a tenant
- `updateRole(id, data)` - Update role
- `deleteRole(id)` - Delete role
- `getAvailablePermissions()` - Get list of all available permissions

### User Actions (`@/app/actions/users`)
- `createUser(data)` - Create a new user
- `getUser(email)` - Get user by email
- `getUserById(id)` - Get user by ID
- `getUsersByTenant(tenantId)` - Get all users in a tenant
- `updateUserPermissions(userId, permissions)` - Update custom permissions

## Database Migrations

After setting up the schemas, push to database:

```bash
bunx drizzle-kit push
```

This will create the following tables:
- `tenants`
- `roles`
- `users` (updated with new fields)

## Session Data

After authentication, the session contains:

```typescript
session.user = {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roleId: string;
  roleName: string;
  permissions: string[]; // Combined role + custom permissions
}
```

## Best Practices

1. **Always check permissions server-side** - Client-side checks are for UX only
2. **Use role permissions as defaults** - Custom permissions for exceptions
3. **Grant least privilege** - Only give permissions that are needed
4. **Regular audits** - Review and update role permissions regularly
5. **Tenant isolation** - Always filter queries by tenantId for multi-tenancy

## Example: Creating a Protected Page

```typescript
// app/settings/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { defineAbilityFor } from "@/lib/casl/ability";

export default async function SettingsPage() {
  const session = await auth();
  const ability = defineAbilityFor(session?.user?.permissions || []);

  if (!ability.can("read", "Settings")) {
    redirect("/dashboard");
  }

  const canUpdate = ability.can("update", "Settings");

  return (
    <div>
      <h1>Settings</h1>
      {canUpdate ? (
        <SettingsForm />
      ) : (
        <p>You can only view settings</p>
      )}
    </div>
  );
}
```
