"use client";

import { useEffect, useState } from "react";
import { userClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError("");

      // Use Hono RPC client to call the API with full type safety
      const response = await userClient.me.$get();

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return;
      }
    } catch (err) {
      setError("An error occurred while fetching profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchUserProfile} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile (via RPC)</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Name</dt>
            <dd className="text-sm">{user.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Email</dt>
            <dd className="text-sm">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Role</dt>
            <dd className="text-sm">{user.role?.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Tenant ID
            </dt>
            <dd className="text-sm">{user.tenantId}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
