"use client"

import React, { useEffect, useState } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import { getLocaleStrings } from "@/lib/getLocaleStrings"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const [strings, setStrings] = useState<{ [key: string]: string }>({})

	useEffect(() => {
		getLocaleStrings().then((res) => {
			setStrings(res)
			document.title = res.metaDataTitle
			const desc = document.querySelector('meta[name="description"]')
			if (desc) desc.setAttribute("content", res.metaDataDescription)
		})
	}, [])

	return (
		<html lang={strings.language}>
			<body className={inter.className}>
				{children}
				<Toaster theme="dark" position="top-right" richColors />
			</body>
		</html>
	)
}
