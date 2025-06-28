"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import MasterDetailLayout from "@/components/layout/MasterDetailLayout"
import TwoPanelLayout from "@/components/layout/TwoPanelLayout"
import ImageGallery from "@/components/ImageGallery"
import { useMobileView } from "@/hooks/useMobileView"
import SongList from "@/components/SongList"

export default function HomePage() {
	const [songs, setSongs] = useState<string[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [selectedSong, setSelectedSong] = useState<string | null>(null)
	const [images, setImages] = useState<string[]>([])
	const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
	const isMobileView = useMobileView()
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

	const handleSongSelect = (title: string) => {
		setSelectedSong(title)
	}

	const handleBackToList = () => {
		setSelectedSong(null)
	}

	const songListComponent = (
		<SongList
			songs={songs}
			searchTerm={searchTerm}
			onSearchChange={setSearchTerm}
			selectedSong={selectedSong}
			onSongSelect={handleSongSelect}
			isMobile={isMobileView}
		/>
	)

	const imageGalleryComponent = (
		<ImageGallery
			selectedSong={selectedSong}
			images={images}
			onImageClick={copyToClipboard}
			getImageUrl={getSmartImageUrl}
			onImageError={handleImageError}
			isMobile={isMobileView}
		/>
	)

	if (isMobileView) {
		return (
			<MasterDetailLayout
				selectedItem={selectedSong}
				onBack={handleBackToList}
				detailView={imageGalleryComponent}
			>
				{songListComponent}
			</MasterDetailLayout>
		)
	}

	return (
		<TwoPanelLayout
			leftPanel={songListComponent}
			rightPanel={imageGalleryComponent}
		/>
	)
}