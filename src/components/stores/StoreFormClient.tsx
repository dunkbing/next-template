"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStore } from "@/app/actions/stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

export default function StoreFormClient({
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
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createStore({
        name,
        code,
        address,
        phone,
        timezone: "UTC",
      });

      if ("error" in result) {
        setError(result.error || "Failed to create store");
      } else {
        router.push(`/${lang}/dashboard/stores`);
      }
    } catch (err) {
      setError("Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h3 className="text-lg font-semibold">{dict.stores.form.storeInfo}</h3>

        <div>
          <Label htmlFor="name">{dict.stores.form.name} *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={dict.stores.form.namePlaceholder}
          />
        </div>

        <div>
          <Label htmlFor="code">{dict.stores.form.code} *</Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            placeholder={dict.stores.form.codePlaceholder}
          />
        </div>

        <div>
          <Label htmlFor="address">{dict.stores.form.address}</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={dict.stores.form.addressPlaceholder}
          />
        </div>

        <div>
          <Label htmlFor="phone">{dict.stores.form.phone}</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={dict.stores.form.phonePlaceholder}
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
          {loading ? dict.stores.form.creating : dict.stores.form.create}
        </Button>
      </div>
    </form>
  );
}
