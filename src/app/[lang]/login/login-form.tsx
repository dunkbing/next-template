"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/get-dictionary";

export default function LoginForm({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: Locale;
}) {
  const [state, formAction, pending] = useActionState(login, {
    error: "",
  });

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dict.auth.login.title}</CardTitle>
          <CardDescription>{dict.auth.login.description}</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <input type="hidden" name="locale" value={lang} />
            {state?.error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{dict.common.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@acme.com"
                autoComplete="email"
                disabled={pending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{dict.common.password}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                disabled={pending}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {dict.auth.login.button}...
                </>
              ) : (
                dict.auth.login.button
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {dict.auth.login.noAccount}{" "}
              <Link
                href={`/${lang}/register`}
                className="font-semibold hover:underline"
              >
                {dict.auth.login.signUp}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
