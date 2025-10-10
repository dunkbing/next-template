import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <Image
            className="dark:invert mx-auto mb-4"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <CardTitle className="text-2xl">{dict.landing.welcome}</CardTitle>
          <CardDescription>{dict.landing.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 justify-center flex-col sm:flex-row">
            <Button asChild>
              <Link href={`/${lang}/login`}>{dict.landing.signIn}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/${lang}/register`}>{dict.landing.getStarted}</Link>
            </Button>
          </div>
          <div className="flex gap-6 justify-center flex-wrap">
            <Button asChild variant="ghost" size="sm">
              <a
                href="https://nextjs.org/learn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/file.svg"
                  alt="File icon"
                  width={16}
                  height={16}
                />
                Learn
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a
                href="https://vercel.com/templates?framework=next.js"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/window.svg"
                  alt="Window icon"
                  width={16}
                  height={16}
                />
                Examples
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  aria-hidden
                  src="/globe.svg"
                  alt="Globe icon"
                  width={16}
                  height={16}
                />
                Go to nextjs.org →
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
