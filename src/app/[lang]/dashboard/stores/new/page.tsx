import StoreFormClient from "@/components/stores/StoreFormClient";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function NewStorePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{dict.stores.createStore}</h1>
        <p className="text-gray-500">{dict.stores.description}</p>
      </div>

      <StoreFormClient dict={dict} lang={lang} />
    </div>
  );
}
