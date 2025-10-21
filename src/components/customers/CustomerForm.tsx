"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer } from "@/app/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export default function CustomerForm({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createCustomer({
        name,
        email: email || "",
        phone,
        address,
        loyaltyPoints: 0,
      });

      if ("error" in result) {
        setError(result.error || "Failed to create customer");
      } else {
        router.push(`/${lang}/dashboard/customers`);
      }
    } catch (err) {
      setError("Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h3 className="text-lg font-semibold">
          {dict.customers.form.personalInfo}
        </h3>

        <div>
          <Label htmlFor="name">{dict.customers.form.name} *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={dict.customers.form.namePlaceholder}
          />
        </div>

        <div>
          <Label htmlFor="email">{dict.customers.form.email}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={dict.customers.form.emailPlaceholder}
          />
        </div>

        <div>
          <Label htmlFor="phone">{dict.customers.form.phone}</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={dict.customers.form.phonePlaceholder}
          />
        </div>

        <div>
          <Label htmlFor="address">{dict.customers.form.address}</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={dict.customers.form.addressPlaceholder}
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          {dict.common.cancel}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? dict.customers.form.creating : dict.customers.form.create}
        </Button>
      </div>
    </form>
  );
}
