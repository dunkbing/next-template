import { auth } from "@/auth";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SessionProvider } from "next-auth/react";
import { AbilityProvider } from "@/lib/casl/context";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <AbilityProvider>
        <DashboardLayout>{children}</DashboardLayout>
      </AbilityProvider>
    </SessionProvider>
  );
}
