import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { SelectSale, SelectCustomer, SelectStore } from "@/db/schema";

type SaleWithRelations = SelectSale & {
  customer: SelectCustomer | null;
  store: SelectStore;
  cashier: { id: number; name: string | null; email: string };
  items: any[];
  payments: any[];
};

export default function SalesTable({
  sales,
  dict,
  lang,
}: {
  sales: SaleWithRelations[];
  dict: Dictionary;
  lang: string;
}) {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string | number) => {
    return Number(amount).toLocaleString("vi-VN") + " ₫";
  };

  if (sales.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <p className="text-gray-500">No sales found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>{dict.sales.table.customer}</TableHead>
            <TableHead>{dict.sales.table.store}</TableHead>
            <TableHead>Cashier</TableHead>
            <TableHead>{dict.sales.table.status}</TableHead>
            <TableHead className="text-right">
              {dict.sales.table.total}
            </TableHead>
            <TableHead>{dict.sales.table.date}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>
                <Link
                  href={`/${lang}/dashboard/sales/${sale.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  #{sale.id}
                </Link>
              </TableCell>
              <TableCell>
                {sale.customer ? (
                  <div>
                    <div className="font-medium">{sale.customer.name}</div>
                    <div className="text-sm text-gray-500">
                      {sale.customer.phone}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400">Walk-in</span>
                )}
              </TableCell>
              <TableCell>{sale.store.name}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {sale.cashier.name || sale.cashier.email}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(sale.status)}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(sale.grandTotal)}
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDate(sale.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
