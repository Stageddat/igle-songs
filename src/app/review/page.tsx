"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Navbar from "@/components/navbar"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function SongsDatabase() {
	const [songs, setSongs] = useState<string[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedSong, setSelectedSong] = useState<string | null>(null)
	const [images, setImages] = useState<string[]>([])
	const { t } = useTranslation()
	const [selectedImages, setSelectedImages] = useState<string[]>([])

	useEffect(() => {
		fetch("/api/review-songs")
			.then((res) => res.json())
			.then(setSongs)
	}, [])

	useEffect(() => {
		if (selectedSong) {
			fetch(`/api/review-songs/${selectedSong}`)
				.then((res) => res.json())
				.then((imgs) => {
					setImages(imgs)
					setSelectedImages([])
				})
		}
	}, [selectedSong])


	const filteredSongs = songs.filter(song =>
		song.toLowerCase().includes(searchTerm.toLowerCase())
	)

	return (
		<div className="dark">
			<div className="flex flex-col h-screen bg-background text-foreground">
				<Navbar />

				<div className="flex flex-1 min-h-0">
					{/* lista de canciones */}
					<div className="w-1/2 border-r border-border bg-card flex flex-col min-h-0">
						<div className="p-6 border-b border-border shrink-0">
							<input
								type="text"
								placeholder={t("searchPlaceholder")}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
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
										{filteredSongs.map((title, index) => (
											<motion.div
												key={title}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -10 }}
												transition={{ duration: 0.2 }}
												onClick={() => setSelectedSong(title)}
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												className={`px-4 py-3 cursor-pointer rounded-lg transition-colors duration-200 border ${selectedSong === title
													? "bg-primary text-primary-foreground border-primary"
													: "bg-muted hover:bg-accent border-border hover:border-accent-foreground/20"
													}`}
											>
												{title}
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

					{/* panel derecho con potos */}
					<ScrollArea className="w-1/2 bg-card">
						<div className="p-6 flex flex-col items-center">
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
										<h2 className="text-2xl font-bold mb-4 text-center">
											{selectedSong}
										</h2>

										{/* boton enviar */}
										<button
											onClick={async () => {
												try {
													const res = await fetch("/api/filter-review-image", {
														method: "POST",
														headers: {
															"Content-Type": "application/json",
														},
														body: JSON.stringify({
															song: selectedSong,
															slides: selectedImages,
														}),
													})

													if (!res.ok) throw new Error("Server error")

													toast.success(t("successMessage"))

													setSongs((prev) => prev.filter((s) => s !== selectedSong))
													setSelectedSong(null)
													setImages([])
													setSelectedImages([])
												} catch (error) {
													toast.error(t("errorMessage"))
													console.error("failed sending:", error)
												}
											}}

											className="mb-6 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
											disabled={selectedImages.length === 0}
										>
											{t("sendSelection")}
										</button>

										{/* galería de elegir */}
										{images.length > 0 ? (
											<div className="flex flex-col items-center gap-6">
												{images.map((img) => {
													const selectedIndex = selectedImages.indexOf(img)
													const isSelected = selectedIndex !== -1

													return (
														<div
															key={img}
															className="relative cursor-pointer"
															onClick={() => {
																setSelectedImages((prev) => {
																	if (isSelected) {
																		return prev.filter(i => i !== img)
																	} else {
																		return [...prev, img]
																	}
																})
															}}
														>
															<img
																src={`/api/review-songs/${selectedSong}/${img}`}
																alt={img}
																className={`w-full max-w-[600px] rounded-xl shadow-md border transition-transform ${isSelected ? "ring-4 ring-green-500 scale-[1.02]" : ""
																	}`}
															/>
															{isSelected && (
																<div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow-lg">
																	#{selectedIndex + 1}
																</div>
															)}
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

				</div>
			</div>
		</div>
	)
}
