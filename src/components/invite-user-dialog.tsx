"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { createUser } from "@/app/actions/users";
import { useRoles } from "@/lib/casl/context";
import type { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/get-dictionary";

interface InviteUserDialogProps {
  tenantId: number;
  dict?: Dictionary;
  lang?: Locale;
}

export function InviteUserDialog({
  tenantId,
  dict,
  lang,
}: InviteUserDialogProps) {
  const { roles } = useRoles();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError("");

    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const roleId = formData.get("roleId") as string;

    if (!email || !password || !roleId) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    try {
      await createUser({
        email,
        password,
        name,
        tenantId,
        roleId: Number.parseInt(roleId),
        customPermissions: [],
      });

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError("Failed to create user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          {dict?.users.inviteUser || "Create User"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dict?.users.invite.title || "Create User"}</DialogTitle>
          <DialogDescription>
            {dict?.users.invite.description ||
              "Add a new user to your organization. They will receive login credentials."}
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{dict?.common.email || "Email"} *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={
                  dict?.users.invite.emailPlaceholder || "user@example.com"
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">{dict?.common.name || "Name"}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={dict?.users.invite.namePlaceholder || "John Doe"}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">
                {dict?.common.password || "Password"} *
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="roleId">Role *</Label>
              <Select name="roleId" required>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      dict?.users.invite.selectRole || "Select a role"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              {dict?.common.cancel || "Cancel"}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? `${dict?.users.invite.button || "Create User"}...`
                : dict?.users.invite.button || "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
