"use client";

import React, { useEffect, useState } from "react";
import {
	NavigationMenu,
	NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
}
	from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Menu, Globe, ChevronDown } from "lucide-react";

export default function Navbar() {
	const { t } = useTranslation();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [currentLang, setCurrentLang] = useState("");
	const [isSheetOpen, setIsSheetOpen] = useState(false);

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
		<div className="flex justify-between items-center px-4 sm:px-6 py-4 bg-zinc-950 border-b border-zinc-800 shadow-lg">
			<h1 className="text-xl sm:text-2xl font-semibold text-zinc-100">
				{t("navTitle")}
			</h1>

			<div className="hidden md:flex items-center space-x-6">
				<NavigationMenu className="space-x-6">
					<NavigationMenuLink
						href="/"
						className="text-lg font-medium text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50 transition px-3 py-2 rounded-md"
					>
						{t("navSong")}
					</NavigationMenuLink>
					<NavigationMenuLink
						href="/review"
						className="text-lg font-medium text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50 transition px-3 py-2 rounded-md"
					>
						{t("navReview")}
					</NavigationMenuLink>
				</NavigationMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="outline"
							className="bg-zinc-800 text-zinc-50 hover:bg-zinc-700 border-zinc-700 hover:border-zinc-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md shadow-sm"
						>
							<Globe className="w-4 h-4 mr-2 text-zinc-300" />
							{languages.find(lang => lang.code === currentLang)?.name}
							<ChevronDown className="w-4 h-4 ml-2 text-zinc-300" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-lg rounded-md"
						align="center"
					>
						{languages.map((lang) => (
							<DropdownMenuItem
								key={lang.code}
								onClick={() => handleLanguageChange(lang.code)}
								className={currentLang === lang.code ? "bg-zinc-700 text-zinc-50 rounded-sm" : "hover:bg-zinc-700 hover:text-zinc-50 rounded-sm"}
							>
								{lang.name}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<div className="md:hidden">
				<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
					<SheetTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="text-zinc-100 hover:bg-zinc-800 rounded-md"
						>
							<Menu className="h-6 w-6" />
						</Button>
					</SheetTrigger>
					<SheetContent side="right"
						className="w-80 bg-zinc-900 border-zinc-800 text-zinc-100"
					>
						<SheetHeader>
							<SheetTitle className="text-zinc-100">{t("navTitle")}</SheetTitle>
							<SheetDescription className="text-zinc-400">
								{t("navDescription")}
							</SheetDescription>
						</SheetHeader>

						<div className="flex flex-col space-y-4 mt-6">
							<div className="space-y-2">
								<Button
									variant="ghost"
									className="w-full justify-start text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50 rounded-md"
									asChild
								>
									<a href="/" onClick={() => setIsSheetOpen(false)}>
										{t("navSong")}
									</a>
								</Button>
								<Button
									variant="ghost"
									className="w-full justify-start text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50 rounded-md"
									asChild
								>
									<a href="/review" onClick={() => setIsSheetOpen(false)}>
										{t("navReview")}
									</a>
								</Button>
							</div>

							<div className="pt-4 border-t border-zinc-800 px-4">
								<h3 className="text-sm font-medium text-zinc-400 mb-3">
									{t("navLanguage")}
								</h3>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="w-full justify-between bg-zinc-800 text-zinc-50 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md shadow-sm"
										>
											<div className="flex items-center">
												<Globe className="w-4 h-4 mr-2 text-zinc-300" />
												{languages.find(lang => lang.code === currentLang)?.name}
											</div>
											<ChevronDown className="w-4 h-4 text-zinc-300" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className="min-w-[var(--radix-dropdown-menu-trigger-width)] bg-zinc-800 border border-zinc-700 text-zinc-100 shadow-lg rounded-md"
										align="center"
									>
										{languages.map((lang) => (
											<DropdownMenuItem
												key={lang.code}
												onClick={() => handleLanguageChange(lang.code)}
												className={currentLang === lang.code ? "bg-zinc-700 text-zinc-50 rounded-sm" : "hover:bg-zinc-700 hover:text-zinc-50 rounded-sm"}
											>
												{lang.name}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	);
}
