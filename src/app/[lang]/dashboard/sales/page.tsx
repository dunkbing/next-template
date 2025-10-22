import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { listSales, getSalesStats } from "@/app/actions/sales";
import { redirect } from "next/navigation";
import SalesTable from "@/components/sales/SalesTable";
import { Card } from "@/components/ui/card";

export default async function SalesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  const result = await listSales();

  if ("error" in result) {
    return (
      <div className="p-8">
        <div className="text-red-600">{result.error}</div>
      </div>
    );
  }

  const statsResult = await getSalesStats();
  const stats = "stats" in statsResult ? statsResult.stats : null;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{dict.sales.title}</h1>
        <p className="text-gray-500">{dict.sales.description}</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="text-sm text-gray-500">
              {dict.sales.stats.totalOrders}
            </div>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-500">
              {dict.sales.stats.totalRevenue}
            </div>
            <div className="text-2xl font-bold">
              {Number(stats.totalRevenue).toLocaleString("vi-VN")} ₫
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-500">{dict.sales.stats.paid}</div>
            <div className="text-2xl font-bold">{stats.paidSales}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-500">Average Order</div>
            <div className="text-2xl font-bold">
              {Number(stats.averageOrderValue).toLocaleString("vi-VN")} ₫
            </div>
          </Card>
        </div>
      )}

      {/* Sales Table */}
      <SalesTable sales={result.sales} dict={dict} lang={lang} />
    </div>
  );
}
