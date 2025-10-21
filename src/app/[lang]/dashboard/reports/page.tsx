import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{dict.reports.title}</h1>
        <p className="text-gray-500">{dict.reports.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">
            {dict.reports.salesSummary}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {dict.reports.salesSummaryDescription}
          </p>
          <div className="text-3xl font-bold text-blue-600">Coming Soon</div>
        </div>

        <div className="p-6 bg-white border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">
            {dict.reports.inventoryValuation}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {dict.reports.inventoryValuationDescription}
          </p>
          <div className="text-3xl font-bold text-green-600">Coming Soon</div>
        </div>

        <div className="p-6 bg-white border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">
            {dict.reports.topProducts}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {dict.reports.topProductsDescription}
          </p>
          <div className="text-3xl font-bold text-purple-600">Coming Soon</div>
        </div>

        <div className="p-6 bg-white border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">X/Z Reports</h3>
          <p className="text-gray-500 text-sm mb-4">
            Register session closeout reports
          </p>
          <div className="text-3xl font-bold text-orange-600">Coming Soon</div>
        </div>

        <div className="p-6 bg-white border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">
            {dict.reports.lowStock}
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            {dict.reports.lowStockDescription}
          </p>
          <div className="text-3xl font-bold text-red-600">Coming Soon</div>
        </div>
      </div>
    </div>
  );
}
