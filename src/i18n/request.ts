import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "@/hooks/useLocale";

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  return {
    locale,
    messages: (await import(`@/i18n/locales/${locale}.json`)).default,
  };
});
