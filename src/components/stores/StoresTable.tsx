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
import { Pencil } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Store = {
  id: number;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
};

export default function StoresTable({
  stores,
  dict,
}: {
  stores: Store[];
  dict: Dictionary;
}) {
  if (stores.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No stores found. Add your first store to get started.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.stores.table.name}</TableHead>
            <TableHead>{dict.stores.table.code}</TableHead>
            <TableHead>{dict.stores.table.address}</TableHead>
            <TableHead>{dict.stores.table.phone}</TableHead>
            <TableHead className="text-right">
              {dict.stores.table.actions}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((store) => (
            <TableRow key={store.id}>
              <TableCell className="font-medium">{store.name}</TableCell>
              <TableCell>{store.code}</TableCell>
              <TableCell>{store.address || "-"}</TableCell>
              <TableCell>{store.phone || "-"}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
