import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getUserById, getUsersByTenant } from "@/app/actions/users";
import { PageLoader } from "@/components/page-loader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UsersTable } from "@/components/users-table";
import { auth } from "@/lib/auth";
import { defineAbilityFor } from "@/lib/casl/ability";
import type { Locale } from "@/lib/i18n/config";
import { type Dictionary, getDictionary } from "@/lib/i18n/get-dictionary";

async function UsersTableWrapper({
  tenantId,
  dict,
}: {
  tenantId: number;
  dict: Dictionary;
}) {
  const usersResult = await getUsersByTenant(tenantId);
  const users = usersResult.success ? usersResult.users || [] : [];
  return <UsersTable users={users} dict={dict} />;
}

export default async function UsersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  // Get session using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(`/${lang}/login`);
  }

  // Get full user data with permissions
  const userData = await getUserById(session.user.id);

  if (!userData || !userData.tenantId || !userData.roleId) {
    // User exists but doesn't have tenant/role assigned (incomplete registration)
    redirect(`/${lang}/login`);
  }

  // Parse custom permissions from JSON string
  const customPermissions = JSON.parse(
    userData.customPermissions || "[]",
  ) as string[];

  // Merge role permissions with custom permissions
  const allPermissions = [
    ...(userData.role?.permissions || []),
    ...customPermissions,
  ];

  const ability = defineAbilityFor(allPermissions);

  if (!ability.can("read", "User")) {
    redirect(`/${lang}/dashboard`);
  }

  const tenantId = userData.tenantId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.users.title}</h1>
          <p className="text-muted-foreground">{dict.users.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            View and manage users in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PageLoader />}>
            <UsersTableWrapper tenantId={tenantId} dict={dict} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
