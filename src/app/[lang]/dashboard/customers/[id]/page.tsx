import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import CustomerForm from "@/components/customers/CustomerForm";

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getDictionary(lang as Locale);

  // Check if this is the "new" page
  const isNew = id === "new";

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link href={`/${lang}/dashboard/customers`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            {isNew ? dict.customers.createCustomer : "Edit Customer"}
          </h1>
        </div>
        <p className="text-gray-500 ml-14">{dict.customers.description}</p>
      </div>

      <CustomerForm dict={dict} lang={lang} />
    </div>
  );
}
