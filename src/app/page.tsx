"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Navbar from "@/components/navbar"
import { useTranslation } from "react-i18next"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function HomePage() {
	const [songs, setSongs] = useState<string[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedSong, setSelectedSong] = useState<string | null>(null)
	const [images, setImages] = useState<string[]>([])
	const { t } = useTranslation()

	useEffect(() => {
		fetch("/api/songs")
			.then((res) => res.json())
			.then(setSongs)
			.catch(() => toast.error("Error al cargar canciones"))
	}, [])

	useEffect(() => {
		if (selectedSong) {
			fetch(`/api/songs/${encodeURIComponent(selectedSong)}`)
				.then((res) => res.json())
				.then(setImages)
				.catch(() => toast.error("No se pudieron cargar las imágenes"))
		}
	}, [selectedSong])

	const filteredSongs = songs.filter(song =>
		song.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const copyToClipboard = async (url: string) => {
		try {
			await navigator.clipboard.writeText(url)
			toast.success("Copiado al portapapeles")
		} catch {
			toast.error("No se pudo copiar")
		}
	}

	return (
		<div className="dark">
			<div className="flex flex-col h-screen bg-background text-foreground">
				<Navbar />

				<div className="flex flex-1 min-h-0">
					{/* Lista de canciones */}
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
										{filteredSongs.map((title) => (
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

					{/* Panel derecho con imágenes */}
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

										{images.length > 0 ? (
											<div className="flex flex-col items-center gap-6">
												{images.map((img) => (
													<div
														key={img}
														className="relative cursor-pointer"
														onClick={() => copyToClipboard(img)}
													>
														<img
															src={img}
															alt="slide"
															className="w-full max-w-[600px] rounded-xl shadow-md border transition-transform hover:scale-[1.01]"
														/>
													</div>
												))}
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
