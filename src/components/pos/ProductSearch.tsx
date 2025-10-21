"use client";

import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { findVariantByBarcode } from "@/app/actions/catalog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

export default function ProductSearch() {
  const { dispatch } = useCart();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setError("");

    try {
      const result = await findVariantByBarcode(search.trim());

      if ("error" in result) {
        setError(result.error || "Product not found");
      } else if ("data" in result) {
        // Add to cart
        dispatch({
          type: "ADD",
          payload: {
            variantId: result.data.id,
            productName: result.data.product.name,
            variantName: result.data.name,
            sku: result.data.sku,
            qty: 1,
            price: Number.parseFloat(result.data.price),
            discount: 0,
            tax: 0,
          },
        });
        setSearch("");
      }
    } catch (err) {
      setError("Failed to search product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Search Products</h2>

      <form onSubmit={handleSearch} className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Scan barcode or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
            autoFocus
          />
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </form>

      <div className="text-sm text-gray-500">
        <p>• Use a barcode scanner to add items quickly</p>
        <p>• Or type the product barcode and press Enter</p>
      </div>
    </div>
  );
}
