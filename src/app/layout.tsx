"use client";

import React from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { t } = useTranslation();

	return (
		<html>
			<head>
				<title>{t("metaDataTitle")}</title>
				<meta name="description" content={t("metaDataDescription")} />
			</head>
			<body>
				<Toaster position="bottom-left" richColors />

				{children}
			</body>
		</html>
	);
}