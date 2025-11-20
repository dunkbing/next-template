"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAvailablePermissions } from "@/app/actions/roles";
import { updateUserPermissions, updateUserRole } from "@/app/actions/users";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { UserWithRole } from "@/db/schema";
import { useRoles } from "@/lib/casl/context";

interface EditUserDialogProps {
  user: UserWithRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
}: EditUserDialogProps) {
  const router = useRouter();
  const { roles } = useRoles();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(
    user.roleId?.toString() || "",
  );
  const [availablePermissions, setAvailablePermissions] = useState<string[]>(
    [],
  );
  const [customPermissions, setCustomPermissions] = useState<string[]>(
    typeof user.customPermissions === "string"
      ? JSON.parse(user.customPermissions)
      : user.customPermissions || [],
  );

  // Load available permissions
  useEffect(() => {
    async function loadPermissions() {
      const perms = await getAvailablePermissions();
      setAvailablePermissions(perms);
    }
    loadPermissions();
  }, []);

  // Get role permissions
  const selectedRole = roles.find((r) => r.id.toString() === selectedRoleId);
  const rolePermissions = selectedRole?.permissions || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Update role if changed
      if (Number.parseInt(selectedRoleId) !== user.roleId) {
        const roleResult = await updateUserRole(
          user.id,
          Number.parseInt(selectedRoleId),
        );
        if (!roleResult.success) {
          setError(roleResult.error || "Failed to update role");
          setIsLoading(false);
          return;
        }
      }

      // Update custom permissions
      const permResult = await updateUserPermissions(
        user.id,
        customPermissions,
      );
      if (!permResult.success) {
        setError(permResult.error || "Failed to update permissions");
        setIsLoading(false);
        return;
      }

      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError("Failed to update user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (permission: string) => {
    setCustomPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission],
    );
  };

  const isPermissionChecked = (permission: string) => {
    return customPermissions.includes(permission);
  };

  const isPermissionFromRole = (permission: string) => {
    return rolePermissions.includes(permission);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user role and custom permissions for {user.email}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={user.name || "—"} disabled />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Role permissions are automatically inherited
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Custom Permissions</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Add or remove additional permissions beyond the role. Checked
                items in{" "}
                <span className="text-muted-foreground opacity-50">gray</span>{" "}
                are from the role.
              </p>
              <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                <div className="space-y-3">
                  {availablePermissions.map((permission) => {
                    const fromRole = isPermissionFromRole(permission);
                    const isChecked = isPermissionChecked(permission);
                    const effectivelyEnabled = fromRole || isChecked;

                    return (
                      <div
                        key={permission}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={permission}
                          checked={effectivelyEnabled}
                          disabled={fromRole}
                          onCheckedChange={() => togglePermission(permission)}
                        />
                        <label
                          htmlFor={permission}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed ${
                            fromRole
                              ? "text-muted-foreground opacity-50"
                              : "cursor-pointer"
                          }`}
                        >
                          {permission}
                          {fromRole && (
                            <span className="ml-2 text-xs">(from role)</span>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
