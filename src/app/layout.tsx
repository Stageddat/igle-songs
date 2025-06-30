import React from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const locale = await getLocale();
	const t = await getTranslations();

	return (
		<html lang={locale}>
			<head>
				<title>{t("metaDataTitle")}</title>
				<meta name="description" content={t("metaDataDescription")} />
			</head>
			<body>
				<Toaster position="bottom-left" richColors />

				<NextIntlClientProvider>{children}</NextIntlClientProvider>
			</body>
		</html>
	);
}