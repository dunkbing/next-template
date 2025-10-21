"use client";

import { useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
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
import { FieldError } from "@/components/ui/field";
import type { Locale } from "@/lib/i18n/config";
import { registerUserSchema } from "@/db/schema/users";
import { Dictionary } from "@/lib/i18n/get-dictionary";
import { redirect } from "next/navigation";

export default function RegisterForm({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: Locale;
}) {
  const [error, setError] = useState("");

  const form = useForm({
    defaultValues: {
      companyName: "",
      name: "",
      email: "",
      password: "",
    },
    validators: { onSubmit: registerUserSchema },
    onSubmit: async ({ value }) => {
      setError("");

      const result = await register(value);

      if (result?.error) {
        setError(result.error);
      } else {
        redirect(`/${lang}/login`);
      }
    },
  });
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{dict.auth.register.title}</CardTitle>
          <CardDescription>{dict.auth.register.description}</CardDescription>
        </CardHeader>
        <form
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
              name="companyName"
              validators={{
                onChange: registerUserSchema.shape.companyName,
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>
                      {dict.common.companyName}
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="Acme Inc"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isSubmitting}
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
              name="name"
              validators={{
                onChange: registerUserSchema.shape.name,
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>{dict.common.name}</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="text"
                      placeholder="John Doe"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isSubmitting}
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
              name="email"
              validators={{
                onChange: registerUserSchema.shape.email,
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
                      disabled={isSubmitting}
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
                onChange: registerUserSchema.shape.password,
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
                      disabled={isSubmitting}
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
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
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
