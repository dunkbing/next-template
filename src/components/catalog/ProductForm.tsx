"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, createVariant } from "@/app/actions/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Variant = {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  price: string;
  cost: string;
};

export default function ProductForm({
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
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState<Variant[]>([
    {
      id: crypto.randomUUID(),
      sku: "",
      barcode: "",
      name: "",
      price: "",
      cost: "",
    },
  ]);

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: crypto.randomUUID(),
        sku: "",
        barcode: "",
        name: "",
        price: "",
        cost: "",
      },
    ]);
  };

  const removeVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const updateVariant = (id: string, field: keyof Variant, value: string) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create product
      const productResult = await createProduct({
        name,
        description,
        trackStock: true,
        taxClass: "standard",
      });

      if ("error" in productResult) {
        setError(productResult.error || "Failed to create product");
        setLoading(false);
        return;
      }

      const productId = "data" in productResult ? productResult.data.id : 0;

      // Create variants
      for (const variant of variants) {
        const variantResult = await createVariant({
          productId,
          sku: variant.sku,
          barcode: variant.barcode || undefined,
          name: variant.name,
          price: variant.price,
          cost: variant.cost,
          status: "active",
        });

        if ("error" in variantResult) {
          setError(variantResult.error || "Failed to create variant");
          setLoading(false);
          return;
        }
      }

      router.push(`/${lang}/dashboard/catalog/products`);
    } catch (err) {
      setError("Failed to create product");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Info */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <h2 className="text-xl font-semibold">
          {dict.products.form.basicInfo}
        </h2>

        <div>
          <Label htmlFor="name">{dict.products.form.name} *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={dict.products.form.namePlaceholder}
          />
        </div>

        <div>
          <Label htmlFor="description">{dict.products.form.description}</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={dict.products.form.descriptionPlaceholder}
          />
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white p-6 rounded-lg border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {dict.products.form.variants}
            </h2>
            <p className="text-sm text-gray-500">
              {dict.products.form.variantsDescription}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addVariant}>
            <Plus className="mr-2 h-4 w-4" />
            {dict.products.form.addVariant}
          </Button>
        </div>

        {variants.map((variant, index) => (
          <div key={variant.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                {dict.products.form.variant} {index + 1}
              </span>
              {variants.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariant(variant.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{dict.common.name} *</Label>
                <Input
                  value={variant.name}
                  onChange={(e) =>
                    updateVariant(variant.id, "name", e.target.value)
                  }
                  required
                  placeholder={dict.products.form.namePlaceholder}
                />
              </div>

              <div>
                <Label>{dict.products.form.sku} *</Label>
                <Input
                  value={variant.sku}
                  onChange={(e) =>
                    updateVariant(variant.id, "sku", e.target.value)
                  }
                  required
                  placeholder={dict.products.form.skuPlaceholder}
                />
              </div>

              <div>
                <Label>{dict.products.form.barcode}</Label>
                <Input
                  value={variant.barcode}
                  onChange={(e) =>
                    updateVariant(variant.id, "barcode", e.target.value)
                  }
                  placeholder={dict.products.form.barcodePlaceholder}
                />
              </div>

              <div>
                <Label>{dict.products.form.price} *</Label>
                <Input
                  type="number"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(variant.id, "price", e.target.value)
                  }
                  required
                  placeholder="100000"
                  step="1000"
                />
              </div>

              <div>
                <Label>{dict.products.form.cost}</Label>
                <Input
                  type="number"
                  value={variant.cost}
                  onChange={(e) =>
                    updateVariant(variant.id, "cost", e.target.value)
                  }
                  placeholder="50000"
                  step="1000"
                />
              </div>
            </div>
          </div>
        ))}
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
          {loading ? dict.products.form.creating : dict.products.form.create}
        </Button>
      </div>
    </form>
  );
}
