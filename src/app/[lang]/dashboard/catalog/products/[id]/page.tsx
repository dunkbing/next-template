import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import ProductForm from "@/components/catalog/ProductForm";
import { getProduct } from "@/app/actions/catalog";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang as Locale);

  // Check if this is the "new" page
  const isNew = id === "new";

  // Fetch product data if editing
  let product = null;
  if (!isNew) {
    const result = await getProduct(Number.parseInt(id));
    if ("data" in result) {
      product = result.data;
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link href={`/${lang}/dashboard/catalog/products`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            {isNew ? dict.products.createProduct : dict.products.editProduct}
          </h1>
        </div>
        <p className="text-gray-500 ml-14">{dict.products.description}</p>
      </div>

      <ProductForm dict={dict} lang={lang} product={product} />
    </div>
  );
}
