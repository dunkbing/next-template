"use client";

import { useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
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
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { loginUserSchema } from "@/db/schema/auth";
import { FieldError } from "@/components/ui/field";
import { redirect } from "next/navigation";

export default function LoginForm({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: Locale;
}) {
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: { onSubmit: loginUserSchema },
    onSubmit: async ({ value }) => {
      setError("");

      const result = await login(value);

      if (result?.error) {
        setError(result.error);
      } else {
        redirect(`${lang}/dashboard`);
      }
    },
  });
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dict.auth.login.title}</CardTitle>
          <CardDescription>{dict.auth.login.description}</CardDescription>
        </CardHeader>
        <form
          id="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form.Field
              name="email"
              validators={{
                onChange: loginUserSchema.shape.email,
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>{dict.common.email}</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      placeholder="user@acme.com"
                      autoComplete="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={form.state.isSubmitting}
                      aria-invalid={
                        field.state.meta.errors.length > 0 ? "true" : "false"
                      }
                      data-invalid={field.state.meta.errors.length > 0}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </div>
                );
              }}
            />

            <form.Field
              name="password"
              validators={{
                onChange: loginUserSchema.shape.password,
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>{dict.common.password}</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={form.state.isSubmitting}
                      aria-invalid={
                        field.state.meta.errors.length > 0 ? "true" : "false"
                      }
                      data-invalid={field.state.meta.errors.length > 0}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </div>
                );
              }}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {form.state.isSubmitting ? (
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
