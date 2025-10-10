"use client";

import Link from "next/link";
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
import { useActionState } from "react";
import { register } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

type Dictionary = {
  common: {
    email: string;
    password: string;
    name: string;
    companyName: string;
  };
  auth: {
    register: {
      title: string;
      description: string;
      button: string;
      hasAccount: string;
      signIn: string;
    };
  };
};

export default function RegisterForm({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: Locale;
}) {
  const [state, formAction, pending] = useActionState(register, {
    error: "",
  });

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dict.auth.register.title}</CardTitle>
          <CardDescription>{dict.auth.register.description}</CardDescription>
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
              <Label htmlFor="companyName">{dict.common.companyName}</Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="Acme Inc"
                disabled={pending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{dict.common.name}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                disabled={pending}
                required
              />
            </div>
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
                  {dict.auth.register.button}...
                </>
              ) : (
                dict.auth.register.button
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {dict.auth.register.hasAccount}{" "}
              <Link
                href={`/${lang}/login`}
                className="font-semibold hover:underline"
              >
                {dict.auth.register.signIn}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
