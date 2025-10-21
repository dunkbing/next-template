import { listCustomers } from "@/app/actions/customers";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import CustomersTable from "@/components/customers/CustomersTable";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const result = await listCustomers();

  if ("error" in result) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error: {result.error}</div>
      </div>
    );
  }

  const customers = "data" in result ? result.data : [];

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.customers.title}</h1>
          <p className="text-gray-500">{dict.customers.description}</p>
        </div>
        <Link href={`/${lang}/dashboard/customers/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {dict.customers.createCustomer}
          </Button>
        </Link>
      </div>

      <CustomersTable customers={customers} dict={dict} lang={lang} />
    </div>
  );
}
