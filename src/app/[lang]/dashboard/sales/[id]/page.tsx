import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { getSale } from "@/app/actions/sales";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang as Locale);

  const result = await getSale(Number.parseInt(id));

  if ("error" in result) {
    return (
      <div className="p-8">
        <div className="text-red-600">{result.error}</div>
      </div>
    );
  }

  const { sale } = result;

  const formatCurrency = (amount: string | number) => {
    return Number(amount).toLocaleString("vi-VN") + " ₫";
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      PAID: "default",
      REFUNDED: "destructive",
      PARTIAL_REFUND: "secondary",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {dict.sales.status[
          status.toLowerCase() as keyof typeof dict.sales.status
        ] || status}
      </Badge>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${lang}/dashboard/sales`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {dict.sales.orderDetails} #{sale.id}
            </h1>
            <p className="text-gray-500">{formatDate(sale.createdAt)}</p>
          </div>
        </div>
        <Button variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          {dict.sales.actions.print}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {dict.sales.details.items}
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dict.sales.details.product}</TableHead>
                  <TableHead className="text-right">
                    {dict.sales.details.quantity}
                  </TableHead>
                  <TableHead className="text-right">
                    {dict.sales.details.price}
                  </TableHead>
                  <TableHead className="text-right">
                    {dict.sales.details.lineTotal}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {item.variant.product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.variant.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.lineTotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {dict.sales.details.subtotal}
                </span>
                <span>{formatCurrency(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {dict.sales.details.taxTotal}
                </span>
                <span>{formatCurrency(sale.taxTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {dict.sales.details.discountTotal}
                </span>
                <span className="text-red-600">
                  -{formatCurrency(sale.discountTotal)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>{dict.sales.details.grandTotal}</span>
                <span>{formatCurrency(sale.grandTotal)}</span>
              </div>
            </div>
          </Card>

          {/* Payments */}
          {sale.payments.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payments</h2>
              <div className="space-y-3">
                {sale.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{payment.method}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </div>
                    </div>
                    <div className="font-bold">
                      {formatCurrency(payment.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sale Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Sale Information</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">
                  {dict.sales.details.status}
                </div>
                <div className="mt-1">{getStatusBadge(sale.status)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">
                  {dict.sales.details.store}
                </div>
                <div className="font-medium">{sale.store.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Cashier</div>
                <div className="font-medium">
                  {sale.cashier.name || sale.cashier.email}
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {dict.sales.details.customer}
            </h2>
            {sale.customer ? (
              <div className="space-y-2">
                <div className="font-medium">{sale.customer.name}</div>
                {sale.customer.phone && (
                  <div className="text-sm text-gray-600">
                    {sale.customer.phone}
                  </div>
                )}
                {sale.customer.email && (
                  <div className="text-sm text-gray-600">
                    {sale.customer.email}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Walk-in customer</p>
            )}
          </Card>

          {/* Notes */}
          {sale.notes && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {dict.sales.details.notes}
              </h2>
              <p className="text-sm text-gray-600">{sale.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
