"use client";

import React, { useEffect, useState } from "react";
import {
	NavigationMenu,
	NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

export default function Navbar() {
	const { t } = useTranslation();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [currentLang, setCurrentLang] = useState("");

	useEffect(() => {
		setCurrentLang(i18n.language);
	}, []);

	const languages = [
		{ code: "es", name: "Español" },
		{ code: "en", name: "English" },
		{ code: "ca", name: "Català" },
		{ code: "ch", name: "中文" },
	];

	const handleLanguageChange = (newLocale: string) => {
		i18n.changeLanguage(newLocale);
		localStorage.setItem("i18nextLng", newLocale);
		setCurrentLang(newLocale);
		setIsDropdownOpen(false);
	};

	return (
		<div className="flex justify-between items-center px-6 py-4 bg-sidebar border-b border-sidebar-border shadow-md">
			<h1 className="text-2xl font-semibold text-sidebar-foreground">
				{t("navTitle")}
			</h1>
			<div className="flex items-center space-x-6">
				<NavigationMenu className="space-x-6">
					<NavigationMenuLink
						href="/"
						className="text-lg font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition px-3 py-2 rounded"
					>
						{t("navSong")}
					</NavigationMenuLink>
					<NavigationMenuLink
						href="/"
						className="text-lg font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition px-3 py-2 rounded"
					>
						{t("navReview")}
					</NavigationMenuLink>
				</NavigationMenu>

				<div className="relative">
					<button
						onClick={() => setIsDropdownOpen(!isDropdownOpen)}
						className="px-4 py-2 bg-sidebar-foreground text-sidebar rounded-lg shadow hover:bg-sidebar-foreground/90 transition-colors duration-200"
					>
						{languages.find((lang) => lang.code === currentLang)?.name ||
							currentLang?.toUpperCase()}
					</button>
					{isDropdownOpen && (
						<div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg z-10">
							{languages.map((lang) => (
								<button
									key={lang.code}
									onClick={() => handleLanguageChange(lang.code)}
									className={`block w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200 ${currentLang === lang.code
										? "bg-accent text-accent-foreground"
										: "text-foreground"
										}`}
								>
									{lang.name}
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}