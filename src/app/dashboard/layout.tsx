import { auth } from "@/auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SessionProvider } from "next-auth/react";
import { AbilityProvider } from "@/lib/casl/context";
import { getRolesByTenant } from "@/app/actions/roles";
import { defineAbilityFor } from "@/lib/casl/ability";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const ability = defineAbilityFor(session?.user?.permissions || []);

  // Load roles if user can edit users
  let roles: any[] = [];
  if (ability.can("update", "User")) {
    const tenantId = Number.parseInt(session?.user?.tenantId || "0");
    const rolesResult = await getRolesByTenant(tenantId);
    roles = rolesResult.success ? rolesResult.roles || [] : [];
  }

  return (
    <SessionProvider session={session}>
      <AbilityProvider roles={roles}>
        <DashboardLayout>{children}</DashboardLayout>
      </AbilityProvider>
    </SessionProvider>
  );
}
