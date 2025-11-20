import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getRolesByTenant } from "@/app/actions/roles";
import { DashboardLayout } from "@/components/dashboard-layout";
import type { SelectRole } from "@/db/schema";
import { auth } from "@/lib/auth";
import { defineAbilityFor } from "@/lib/casl/ability";
import { AbilityProvider } from "@/lib/casl/context";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getUserById } from "@/app/actions/users";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
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

  // Get full user data with tenant and role
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

  // Load roles if user can edit users
  let roles: SelectRole[] = [];
  if (ability.can("update", "User")) {
    const rolesResult = await getRolesByTenant(userData.tenantId);
    roles = rolesResult.success ? rolesResult.roles || [] : [];
  }

  return (
    <AbilityProvider roles={roles} permissions={allPermissions}>
      <DashboardLayout lang={lang as Locale} dict={dict}>
        {children}
      </DashboardLayout>
    </AbilityProvider>
  );
}
