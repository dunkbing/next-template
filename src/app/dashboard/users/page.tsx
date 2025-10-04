import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { defineAbilityFor } from "@/lib/casl/ability";
import { getUsersByTenant } from "@/app/actions/users";
import { getRolesByTenant } from "@/app/actions/roles";
import { UsersTable } from "@/components/users-table";
import { InviteUserDialog } from "@/components/invite-user-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function UsersPage() {
  const session = await auth();
  const ability = defineAbilityFor(session?.user?.permissions || []);

  if (!ability.can("read", "User")) {
    redirect("/dashboard");
  }

  const tenantId = Number.parseInt(session?.user?.tenantId || "0");
  const usersResult = await getUsersByTenant(tenantId);
  const rolesResult = await getRolesByTenant(tenantId);

  const users = usersResult.success ? usersResult.users || [] : [];
  const roles = rolesResult.success ? rolesResult.roles || [] : [];
  const canCreateUser = ability.can("create", "User");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage users in your organization
          </p>
        </div>
        {canCreateUser && (
          <InviteUserDialog tenantId={tenantId} roles={roles} />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            View and manage users in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} roles={roles} />
        </CardContent>
      </Card>
    </div>
  );
}
