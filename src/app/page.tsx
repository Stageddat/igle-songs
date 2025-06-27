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
			.catch(() => toast.error(t("loadSongsError")))
	}, [t])

	useEffect(() => {
		if (selectedSong) {
			fetch(`/api/songs/${encodeURIComponent(selectedSong)}`)
				.then((res) => res.json())
				.then(setImages)
				.catch(() => toast.error(t("loadImagesError")))
		}
	}, [selectedSong, t])

	const filteredSongs = songs.filter(song =>
		song.toLowerCase().includes(searchTerm.toLowerCase())
	)

	const smartFetch = async (url: string): Promise<Response> => {
		try {
			const response = await fetch(url, {
				mode: 'cors',
				headers: {
					'Accept': 'image/*',
				}
			})

			if (response.ok) {
				console.log('direct fetch successful')
				return response
			}
			throw new Error(`direct fetch failed: ${response.status}`)
		} catch (directError) {
			console.error('direct fetch failed, trying proxy...', directError)

			const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`
			const response = await fetch(proxyUrl)

			if (!response.ok) {
				throw new Error(`proxy fetch also failed: ${response.status}`)
			}

			console.log('proxy fetch successful')
			return response
		}
	}

	const copyToClipboard = async (url: string) => {
		try {
			const response = await smartFetch(url)
			const blob = await response.blob()
			const imageBitmap = await createImageBitmap(blob)

			const canvas = document.createElement("canvas")
			canvas.width = imageBitmap.width
			canvas.height = imageBitmap.height

			const ctx = canvas.getContext("2d")
			if (!ctx) throw new Error("Canvas context not available")
			ctx.drawImage(imageBitmap, 0, 0)

			canvas.toBlob(async (pngBlob) => {
				if (!pngBlob) throw new Error("Failed to convert image to PNG")

				await navigator.clipboard.write([
					new ClipboardItem({ "image/png": pngBlob }),
				])

				toast.success(t("copySuccess"))
			}, "image/png")
		} catch (err) {
			console.error("Failed to copy image:", err)
			toast.error(t("copyError"))
		}
	}

	const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

	const getSmartImageUrl = (originalUrl: string) => {
		if (imageErrors.has(originalUrl)) {
			return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`
		}
		return originalUrl
	}

	const handleImageError = (originalUrl: string) => {
		console.log('image failed, switching to proxy for:', originalUrl)
		setImageErrors(prev => new Set([...prev, originalUrl]))
	}

	return (
		<div className="dark">
			<div className="flex flex-col h-screen bg-background text-foreground">
				<Navbar />

				<div className="flex flex-1 min-h-0">
					{/* canciones */}
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

					{/* panel imagenes */}
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
															src={getSmartImageUrl(img)}
															alt="slide"
															className="w-full max-w-[600px] rounded-xl shadow-md border transition-transform hover:scale-[1.01]"
															onError={() => handleImageError(img)}
															key={`${img}-${imageErrors.has(img) ? 'proxy' : 'direct'}`}
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