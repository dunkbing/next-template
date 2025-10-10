import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { defineAbilityFor } from "@/lib/casl/ability";
import { getUsersByTenant } from "@/app/actions/users";
import { UsersTable } from "@/components/users-table";
import { InviteUserDialog } from "@/components/invite-user-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";
import { PageLoader } from "@/components/page-loader";
import { Dictionary, getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

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
  const session = await auth();
  const ability = defineAbilityFor(session?.user?.permissions || []);

  if (!ability.can("read", "User")) {
    redirect(`/${lang}/dashboard`);
  }

  const tenantId = Number.parseInt(session?.user?.tenantId || "0");
  const canCreateUser = ability.can("create", "User");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.users.title}</h1>
          <p className="text-muted-foreground">{dict.users.description}</p>
        </div>
        {canCreateUser && (
          <InviteUserDialog
            tenantId={tenantId}
            dict={dict}
            lang={lang as Locale}
          />
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
          <Suspense fallback={<PageLoader />}>
            <UsersTableWrapper tenantId={tenantId} dict={dict} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
