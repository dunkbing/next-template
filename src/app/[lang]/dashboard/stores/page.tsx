import { listStores } from "@/app/actions/stores";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import StoresTable from "@/components/stores/StoresTable";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function StoresPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const result = await listStores();

  if ("error" in result) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error: {result.error}</div>
      </div>
    );
  }

  const stores = "data" in result ? result.data : [];

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.stores.title}</h1>
          <p className="text-gray-500">{dict.stores.description}</p>
        </div>
        <Link href={`/${lang}/dashboard/stores/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {dict.stores.createStore}
          </Button>
        </Link>
      </div>

      <StoresTable stores={stores} dict={dict} />
    </div>
  );
}
