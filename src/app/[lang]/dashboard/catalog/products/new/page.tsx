import ProductForm from "@/components/catalog/ProductForm";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{dict.products.createProduct}</h1>
        <p className="text-gray-500">{dict.products.description}</p>
      </div>

      <ProductForm dict={dict} lang={lang} />
    </div>
  );
}
