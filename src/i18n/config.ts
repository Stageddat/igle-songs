export type Locale = (typeof locales)[number];

export const locales = ["es", "en", "ca", "ch"] as const;
export const defaultLocale: Locale = "es";
