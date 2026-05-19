import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dict, type Locale, type Dict } from "./i18n";

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return v === "ko" || v === "en" ? v : DEFAULT_LOCALE;
}

export async function getT(): Promise<Dict> {
  return dict[await getLocale()];
}
