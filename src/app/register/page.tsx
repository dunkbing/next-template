import Link from "next/link";
import { redirect } from "next/navigation";
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
import { createUser, getUser } from "../actions/users";
import { createTenant, getTenantBySlug } from "../actions/tenants";
import { createRole } from "../actions/roles";
import { getAvailablePermissions } from "../actions/roles";

export default function Login() {
  async function register(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const companyName = formData.get("companyName") as string;
    const companySlug = companyName.toLowerCase().replace(/\s+/g, "-");

    // Check if user already exists
    const existingUser = await getUser(email);
    if (existingUser) {
      // TODO: Handle errors with useFormStatus
      return;
    }

    // Check if tenant already exists
    const existingTenant = await getTenantBySlug(companySlug);
    if (existingTenant.tenant) {
      // TODO: Handle errors with useFormStatus
      return;
    }

    // Create tenant
    const tenantResult = await createTenant({
      name: companyName,
      slug: companySlug,
    });

    if (!tenantResult.success || !tenantResult.tenant) {
      // TODO: Handle errors
      return;
    }

    // Create default admin role with all permissions
    const allPermissions = await getAvailablePermissions();
    const roleResult = await createRole({
      tenantId: tenantResult.tenant.id,
      name: "Admin",
      description: "Administrator with full access",
      permissions: allPermissions,
    });

    if (!roleResult.success || !roleResult.role) {
      // TODO: Handle errors
      return;
    }

    // Create user with admin role
    await createUser({
      email,
      password,
      name,
      tenantId: tenantResult.tenant.id,
      roleId: roleResult.role.id,
      customPermissions: [],
    });

    redirect("/login");
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your company account</CardDescription>
        </CardHeader>
        <form action={register}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="Acme Inc"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
              />
            </div>
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
              Sign Up
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {"Already have an account? "}
              <Link href="/login" className="font-semibold hover:underline">
                Sign in
              </Link>
              {" instead."}
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
