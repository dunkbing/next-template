import "server-only";
import type { Locale } from "./config";

// Define dictionary type based on the English dictionary structure
export type Dictionary = typeof import("./dictionaries/en.json");

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  vi: () => import("./dictionaries/vi.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale]?.() ?? dictionaries.en();
};

// Helper function to interpolate variables in translation strings
export function interpolate(
  text: string,
  params: Record<string, string>,
): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] ?? match;
  });
}
