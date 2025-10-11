import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { getRolesByTenant } from "@/app/actions/roles";
import { DashboardLayout } from "@/components/dashboard-layout";
import type { SelectRole } from "@/db/schema";
import { auth } from "@/lib/auth";
import { defineAbilityFor } from "@/lib/casl/ability";
import { AbilityProvider } from "@/lib/casl/context";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const session = await auth();

  if (!session?.user) {
    redirect(`/${lang}/login`);
  }

  const ability = defineAbilityFor(session.user.permissions || []);

  // Load roles if user can edit users
  let roles: SelectRole[] = [];
  if (ability.can("update", "User")) {
    const tenantId = Number.parseInt(session.user.tenantId);
    const rolesResult = await getRolesByTenant(tenantId);
    roles = rolesResult.success ? rolesResult.roles || [] : [];
  }

  return (
    <SessionProvider session={session}>
      <AbilityProvider roles={roles}>
        <DashboardLayout lang={lang as Locale} dict={dict}>
          {children}
        </DashboardLayout>
      </AbilityProvider>
    </SessionProvider>
  );
}
