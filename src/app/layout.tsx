// app/layout.tsx
"use client";

import React from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n"; // Import your i18n configuration here to ensure it's initialized

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// const { i18n: i18nextInstance } = useTranslation();

	// const primaryLang = i18nextInstance.language;
	const { t } = useTranslation();

	return (
		<html>
			<head>
				<title>{t("metaDataTitle")}</title>
				<meta name="description" content={t("metaDataDescription")} />
			</head>
			<body>
				<Toaster position="top-center" richColors />

				{children}
			</body>
		</html>
	);
}