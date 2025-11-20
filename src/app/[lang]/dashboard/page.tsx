import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary, interpolate } from "@/lib/i18n/get-dictionary";

export default async function DashboardPage({
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.title}</h1>
        <p className="text-muted-foreground">
          {interpolate(dict.dashboard.welcome, {
            name: session?.user?.name || session?.user?.email || "User",
          })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Start building your application</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This is a Next.js 15 boilerplate with authentication, PostgreSQL
            database with Drizzle ORM, and shadcn/ui components.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
