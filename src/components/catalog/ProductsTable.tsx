"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Product = {
  id: number;
  name: string;
  description: string | null;
  category: { name: string } | null;
  variants: Array<{
    id: number;
    sku: string;
    price: string;
    status: string;
  }>;
};

export default function ProductsTable({
  products,
  dict,
}: {
  products: Product[];
  dict: Dictionary;
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No products found. Add your first product to get started.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.products.table.name}</TableHead>
            <TableHead>{dict.products.table.category}</TableHead>
            <TableHead>{dict.products.table.variants}</TableHead>
            <TableHead>Price Range</TableHead>
            <TableHead className="text-right">
              {dict.products.table.actions}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const prices = product.variants.map((v) =>
              Number.parseFloat(v.price),
            );
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category?.name || "-"}</TableCell>
                <TableCell>{product.variants.length} variant(s)</TableCell>
                <TableCell>
                  {minPrice === maxPrice
                    ? `₫${minPrice.toLocaleString()}`
                    : `₫${minPrice.toLocaleString()} - ₫${maxPrice.toLocaleString()}`}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/dashboard/catalog/products/${product.id}`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
