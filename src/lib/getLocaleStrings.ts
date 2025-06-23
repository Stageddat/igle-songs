export async function getLocaleStrings(): Promise<Record<string, string>> {
  if (typeof window !== "undefined") {
    let locale = localStorage.getItem("locale");

    if (!locale) {
      locale = "es";
      localStorage.setItem("locale", "es");
    }

    try {
      const messages = await import(`@/i18n/${locale}.json`);
      return messages.default;
    } catch (e) {
      console.warn(`Language not found: ${locale}, using 'es'`);
      localStorage.setItem("locale", "es");
      const fallback = await import("@/i18n/es.json");
      return fallback.default;
    }
  }

  const fallback = await import("@/i18n/es.json");
  return fallback.default;
}
