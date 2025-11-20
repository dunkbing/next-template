import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function Home({
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
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {dict.landing.welcome}
          </h1>
          <p className="text-lg text-muted-foreground">
            {dict.landing.description}
          </p>
        </div>

        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          {session?.user ? (
            <Button asChild size="lg">
              <Link href={`/${lang}/dashboard`}>Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link href={`/${lang}/login`}>{dict.landing.signIn}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/${lang}/register`}>
                  {dict.landing.getStarted}
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
