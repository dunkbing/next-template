import { auth, signIn } from "@/auth";
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
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export default async function Login(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  const searchParams = await props.searchParams;

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Use your email and password to sign in
          </CardDescription>
        </CardHeader>
        <form
          action={async (formData: FormData) => {
            "use server";
            try {
              await signIn("credentials", {
                redirectTo: "/dashboard",
                email: formData.get("email") as string,
                password: formData.get("password") as string,
              });
            } catch (error) {
              if (error instanceof AuthError) {
                return redirect(`/login?error=Invalid credentials`);
              }
              throw error;
            }
          }}
        >
          <CardContent className="space-y-4">
            {searchParams.error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {searchParams.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@acme.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full">
              Sign in
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/register" className="font-semibold hover:underline">
                Sign up
              </Link>
              {" for free."}
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
