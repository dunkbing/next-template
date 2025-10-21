import { listProducts } from "@/app/actions/catalog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import ProductsTable from "@/components/catalog/ProductsTable";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const result = await listProducts();

  if ("error" in result) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error: {result.error}</div>
      </div>
    );
  }

  const products = "data" in result ? result.data : [];

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.products.title}</h1>
          <p className="text-gray-500">{dict.products.description}</p>
        </div>
        <Link href={`/${lang}/dashboard/catalog/products/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {dict.products.createProduct}
          </Button>
        </Link>
      </div>

      <ProductsTable products={products} dict={dict} />
    </div>
  );
}
