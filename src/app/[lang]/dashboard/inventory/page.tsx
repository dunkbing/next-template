import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{dict.inventory.title}</h1>
        <p className="text-gray-500">{dict.inventory.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href={`/${lang}/dashboard/inventory/stock`}
          className="p-6 bg-white border rounded-lg hover:border-gray-400 transition"
        >
          <h3 className="text-xl font-semibold mb-2">
            {dict.inventory.stockLevels}
          </h3>
          <p className="text-gray-500 text-sm">
            {dict.inventory.stockLevelsDescription}
          </p>
        </a>

        <a
          href={`/${lang}/dashboard/inventory/purchase-orders`}
          className="p-6 bg-white border rounded-lg hover:border-gray-400 transition"
        >
          <h3 className="text-xl font-semibold mb-2">
            {dict.inventory.purchaseOrders}
          </h3>
          <p className="text-gray-500 text-sm">
            {dict.inventory.purchaseOrdersDescription}
          </p>
        </a>

        <a
          href={`/${lang}/dashboard/inventory/suppliers`}
          className="p-6 bg-white border rounded-lg hover:border-gray-400 transition"
        >
          <h3 className="text-xl font-semibold mb-2">
            {dict.inventory.suppliers}
          </h3>
          <p className="text-gray-500 text-sm">
            {dict.inventory.suppliersDescription}
          </p>
        </a>
      </div>
    </div>
  );
}
