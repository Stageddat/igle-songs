"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Navbar from "@/components/navbar"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function SongsDatabase() {
	const [songs, setSongs] = useState<string[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedSong, setSelectedSong] = useState<string | null>(null)
	const [images, setImages] = useState<string[]>([])
	const [selectedImages, setSelectedImages] = useState<string[]>([])
	const [adminPassword, setAdminPassword] = useState("")
	const [isMobileView, setIsMobileView] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const t = useTranslations()

	useEffect(() => {
		const checkMobile = () => {
			setIsMobileView(window.innerWidth < 768)
		}

		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	const handleSendSelection = async () => {
		if (isLoading) return

		setIsLoading(true)
		try {
			const res = await fetch("/api/filter-review-image", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${adminPassword}`,
				},
				body: JSON.stringify({
					song: selectedSong,
					slides: selectedImages,
				}),
			})

			if (!res.ok) {
				const errorData = await res.json()
				throw new Error(errorData.message)
			}

			toast.success(t("successMessage"))

			setSongs((prev) => prev.filter((s) => s !== selectedSong))
			setSelectedSong(null)
			setImages([])
			setSelectedImages([])
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t("errorMessage"))
			console.error("failed sending:", error)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetch("/api/review-songs")
			.then((res) => res.json())
			.then(setSongs)
			.catch((error) => {
				console.error("error fetching songs:", error)
				toast.error(t("errorMessage"))
			})
	}, [t])

	useEffect(() => {
		if (selectedSong) {
			fetch(`/api/review-songs/${selectedSong}`)
				.then((res) => res.json())
				.then((imgs) => {
					setImages(imgs)
					setSelectedImages([])
				})
				.catch((error) => {
					console.error("error fetching images:", error)
					toast.error(t("errorMessage"))
				})
		}
	}, [selectedSong, t])

	const filteredSongs = songs.filter(song =>
		song.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const handleSongSelect = (title: string) => {
		setSelectedSong(title)
	}

	const handleBackToList = () => {
		setSelectedSong(null)
	}

	const toggleImageSelection = (img: string) => {
		setSelectedImages((prev) => {
			if (prev.includes(img)) {
				return prev.filter(i => i !== img)
			} else {
				return [...prev, img]
			}
		})
	}

	if (isMobileView) {
		return (
			<div className="dark">
				<div className="flex flex-col h-screen bg-background text-foreground">
					<Navbar />

					<div className="flex-1 relative overflow-hidden">
						<AnimatePresence initial={false}>
							<motion.div
								key="list-view"
								initial={false}
								animate={{
									x: selectedSong ? "-100%" : "0%"
								}}
								transition={{
									type: "spring",
									stiffness: 400,
									damping: 40
								}}
								className="absolute inset-0 bg-card flex flex-col"
							>
								<div className="p-4 border-b border-border shrink-0 space-y-3">
									<Input
										type="text"
										placeholder={t("searchPlaceholder")}
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full"
									/>
									<Input
										type="password"
										placeholder={t("adminPasswordPlaceholder")}
										value={adminPassword}
										onChange={(e) => setAdminPassword(e.target.value)}
										className="w-full"
									/>
								</div>

								<div className="flex-1 min-h-0">
									<ScrollArea className="h-full">
										<motion.div
											className="space-y-2 p-4"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ duration: 0.4 }}
										>
											<AnimatePresence>
												{filteredSongs.map((title) => (
													<motion.div
														key={title}
														initial={{ opacity: 0, y: 10 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: -10 }}
														transition={{ duration: 0.2 }}
													>
														<Button
															variant="ghost"
															className="w-full justify-start h-auto p-4 text-left font-normal border border-border hover:bg-accent hover:border-accent-foreground/20"
															onClick={() => handleSongSelect(title)}
														>
															<div className="font-medium">{title}</div>
														</Button>
													</motion.div>
												))}
											</AnimatePresence>
											{filteredSongs.length === 0 && (
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="px-4 py-8 text-muted-foreground text-center"
												>
													{t("noSongsFound")}
												</motion.div>
											)}
										</motion.div>
									</ScrollArea>
								</div>
							</motion.div>

							{selectedSong && (
								<motion.div
									key="song-view"
									initial={{ x: "100%" }}
									animate={{ x: "0%" }}
									exit={{ x: "100%" }}
									transition={{
										type: "spring",
										stiffness: 400,
										damping: 40
									}}
									className="absolute inset-0 bg-card flex flex-col"
								>
									<div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center gap-3">
										<Button
											variant="ghost"
											size="icon"
											onClick={handleBackToList}
											className="shrink-0"
										>
											<ArrowLeft size={20} />
										</Button>
										<h2 className="text-lg font-bold truncate flex-1">
											{selectedSong}
										</h2>
									</div>

									<div className="flex-1 min-h-0">
										<ScrollArea className="h-full">
											<div className="p-4 pb-20">
												{images.length > 0 ? (
													<div className="flex flex-col gap-4">
														{images.map((img) => {
															const selectedIndex = selectedImages.indexOf(img)
															const isSelected = selectedIndex !== -1

															return (
																<div
																	key={img}
																	className="relative cursor-pointer"
																	onClick={() => toggleImageSelection(img)}
																>
																	<div className={`relative rounded-xl overflow-hidden border-2 transition-all ${isSelected
																		? "border-green-500 ring-2 ring-green-500/30"
																		: "border-border hover:border-accent-foreground/20"
																		}`}>
																		<img
																			src={`/api/review-songs/${selectedSong}/${img}`}
																			alt={img}
																			className="w-full rounded-xl shadow-md"
																		/>
																		{isSelected && (
																			<div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow-lg font-medium">
																				#{selectedIndex + 1}
																			</div>
																		)}
																	</div>
																</div>
															)
														})}
													</div>
												) : (
													<div className="flex items-center justify-center h-64">
														<p className="text-muted-foreground text-center">
															{t("noImagesFound")}
														</p>
													</div>
												)}
											</div>
										</ScrollArea>
									</div>

									<AnimatePresence>
										{selectedImages.length > 0 && (
											<motion.div
												initial={{ y: 100, opacity: 0 }}
												animate={{ y: 0, opacity: 1 }}
												exit={{ y: 100, opacity: 0 }}
												transition={{ duration: 0.3 }}
												className="fixed bottom-6 left-4 right-4 z-20"
											>
												<Button
													onClick={handleSendSelection}
													disabled={isLoading}
													className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg border border-green-500/30 backdrop-blur-sm"
												>
													{isLoading ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															{t("sending")}
														</>
													) : (
														<>
															{t("sendSelection")} ({selectedImages.length})
														</>
													)}
												</Button>
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="dark">
			<div className="flex flex-col h-screen bg-background text-foreground">
				<Navbar />

				<div className="flex flex-1 min-h-0">
					<div className="w-1/2 border-r border-border bg-card flex flex-col min-h-0">
						<div className="p-6 border-b border-border shrink-0 space-y-4">
							<Input
								type="text"
								placeholder={t("searchPlaceholder")}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full"
							/>
							<Input
								type="password"
								placeholder={t("adminPasswordPlaceholder")}
								value={adminPassword}
								onChange={(e) => setAdminPassword(e.target.value)}
								className="w-full"
							/>
						</div>
						<div className="flex-1 min-h-0">
							<ScrollArea className="h-full">
								<motion.div
									className="space-y-2 p-6"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ duration: 0.4 }}
								>
									<AnimatePresence>
										{filteredSongs.map((title) => (
											<motion.div
												key={title}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -10 }}
												transition={{ duration: 0.2 }}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
											>
												<Button
													variant={selectedSong === title ? "default" : "ghost"}
													className={`w-full justify-start h-auto p-4 text-left font-normal border ${selectedSong === title
														? "border-primary"
														: "border-border hover:border-accent-foreground/20"
														}`}
													onClick={() => handleSongSelect(title)}
												>
													{title}
												</Button>
											</motion.div>
										))}
									</AnimatePresence>
									{filteredSongs.length === 0 && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="px-4 py-3 text-muted-foreground text-center"
										>
											{t("noSongsFound")}
										</motion.div>
									)}
								</motion.div>
							</ScrollArea>
						</div>
					</div>

					<div className="w-1/2 bg-card relative">
						<ScrollArea className="h-full">
							<div className="p-6 flex flex-col items-center pb-24">
								<AnimatePresence mode="wait">
									{selectedSong ? (
										<motion.div
											key={selectedSong}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.4 }}
											className="w-full flex flex-col items-center"
										>
											<h2 className="text-2xl font-bold mb-6 text-center">
												{selectedSong}
											</h2>

											{images.length > 0 ? (
												<div className="flex flex-col items-center gap-6">
													{images.map((img) => {
														const selectedIndex = selectedImages.indexOf(img)
														const isSelected = selectedIndex !== -1

														return (
															<div
																key={img}
																className="relative cursor-pointer"
																onClick={() => toggleImageSelection(img)}
															>
																<div className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.01] ${isSelected
																	? "border-green-500 ring-4 ring-green-500/30 scale-[1.02]"
																	: "border-border hover:border-accent-foreground/20"
																	}`}>
																	<img
																		src={`/api/review-songs/${selectedSong}/${img}`}
																		alt={img}
																		className="w-full max-w-[600px] rounded-xl shadow-md"
																	/>
																	{isSelected && (
																		<div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow-lg font-medium">
																			#{selectedIndex + 1}
																		</div>
																	)}
																</div>
															</div>
														)
													})}
												</div>
											) : (
												<p className="text-muted-foreground">
													{t("noImagesFound")}
												</p>
											)}
										</motion.div>
									) : (
										<motion.div
											key="placeholder"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											className="text-center"
										>
											<p className="text-muted-foreground text-lg">
												{t("selectSong")}
											</p>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</ScrollArea>

						<AnimatePresence>
							{selectedSong && selectedImages.length > 0 && (
								<motion.div
									initial={{ y: 100, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: 100, opacity: 0 }}
									transition={{ duration: 0.3 }}
									className="absolute bottom-6 left-6 right-6 z-20"
								>
									<Button
										onClick={handleSendSelection}
										disabled={isLoading}
										className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg border border-green-500/30 backdrop-blur-sm px-6 py-3"
									>
										{isLoading ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												{t("sending")}
											</>
										) : (
											<>
												{t("sendSelection")} ({selectedImages.length})
											</>
										)}
									</Button>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	)
}