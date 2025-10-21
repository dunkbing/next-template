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

type Customer = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  loyaltyPoints: number;
};

export default function CustomersTable({
  customers,
  dict,
  lang,
}: {
  customers: Customer[];
  dict: Dictionary;
  lang: string;
}) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No customers found. Add your first customer to get started.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.customers.table.name}</TableHead>
            <TableHead>{dict.customers.table.email}</TableHead>
            <TableHead>{dict.customers.table.phone}</TableHead>
            <TableHead>{dict.customers.table.loyaltyPoints}</TableHead>
            <TableHead className="text-right">
              {dict.customers.table.actions}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>{customer.email || "-"}</TableCell>
              <TableCell>{customer.phone || "-"}</TableCell>
              <TableCell>{customer.loyaltyPoints}</TableCell>
              <TableCell className="text-right space-x-2">
                <Link href={`/${lang}/dashboard/customers/${customer.id}`}>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
