"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"

interface ImageGalleryProps {
	selectedSong: string | null
	images: string[]
	onImageClick: (img: string) => void
	getImageUrl: (img: string) => string
	onImageError?: (img: string) => void
	selectedImages?: string[]
	actionButton?: React.ReactNode
	isMobile?: boolean
}

export default function ImageGallery({
	selectedSong,
	images,
	onImageClick,
	getImageUrl,
	onImageError,
	selectedImages = [],
	actionButton,
	isMobile = false
}: ImageGalleryProps) {
	const { t } = useTranslation()

	const contentClass = isMobile ? "p-4" : "p-6"

	if (isMobile) {
		return (
			<>
				{/* Action button for mobile */}
				{actionButton && (
					<div className="p-4 border-b border-border">
						{actionButton}
					</div>
				)}

				{/* Images */}
				<div className="flex-1 min-h-0">
					<ScrollArea className="h-full">
						<div className={contentClass}>
							{images.length > 0 ? (
								<div className="flex flex-col gap-4">
									{images.map((img) => {
										const selectedIndex = selectedImages.indexOf(img)
										const isSelected = selectedIndex !== -1

										return (
											<div
												key={img}
												className="relative cursor-pointer"
												onClick={() => onImageClick(img)}
											>
												<div className={`relative rounded-xl overflow-hidden border-2 transition-all ${isSelected
														? "border-green-500 ring-2 ring-green-500/30"
														: "border-border hover:border-accent-foreground/20"
													}`}>
													<img
														src={getImageUrl(img)}
														alt="slide"
														className="w-full rounded-xl shadow-md"
														onError={() => onImageError?.(img)}
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
			</>
		)
	}

	return (
		<div className={`${contentClass} flex flex-col items-center`}>
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

						{/* Action button for desktop */}
						{actionButton && (
							<div className="mb-6">
								{actionButton}
							</div>
						)}

						{images.length > 0 ? (
							<div className="flex flex-col items-center gap-6">
								{images.map((img) => {
									const selectedIndex = selectedImages.indexOf(img)
									const isSelected = selectedIndex !== -1

									return (
										<div
											key={img}
											className="relative cursor-pointer"
											onClick={() => onImageClick(img)}
										>
											<div className={`relative rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.01] ${isSelected
													? "border-green-500 ring-4 ring-green-500/30 scale-[1.02]"
													: "border-border hover:border-accent-foreground/20"
												}`}>
												<img
													src={getImageUrl(img)}
													alt="slide"
													className="w-full max-w-[600px] rounded-xl shadow-md"
													onError={() => onImageError?.(img)}
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
	)
}