"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import Navbar from "@/components/navbar"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Upload, FileText, Image, Loader2, X } from "lucide-react"

export default function AddSong() {
	const [title, setTitle] = useState("")
	const [password, setPassword] = useState("")
	const [files, setFiles] = useState<File[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [dragActive, setDragActive] = useState(false)
	const [uploadMode, setUploadMode] = useState<'pptx' | 'images'>('pptx')
	const fileInputRef = useRef<HTMLInputElement>(null)
	const t = useTranslations()

	const getAcceptedTypes = () => {
		if (uploadMode === 'pptx') {
			return ["application/vnd.openxmlformats-officedocument.presentationml.presentation"]
		} else {
			return ["image/png", "image/jpeg", "image/jpg"]
		}
	}

	const getAcceptString = () => {
		if (uploadMode === 'pptx') {
			return ".pptx"
		} else {
			return ".png,.jpg,.jpeg"
		}
	}

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true)
		} else if (e.type === "dragleave") {
			setDragActive(false)
		}
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(false)

		const droppedFiles = Array.from(e.dataTransfer.files)
		handleFiles(droppedFiles)
	}

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const selectedFiles = Array.from(e.target.files)
			handleFiles(selectedFiles)
		}
	}

	const handleFiles = (newFiles: File[]) => {
		const acceptedTypes = getAcceptedTypes()
		const validFiles = newFiles.filter(file =>
			acceptedTypes.includes(file.type)
		)

		if (validFiles.length !== newFiles.length) {
			if (uploadMode === 'pptx') {
				toast.error(t("onlyPptxAllowed"))
			} else {
				toast.error(t("onlyImagesAllowed"))
			}
		}

		if (uploadMode === 'pptx') {
			if (validFiles.length > 1) {
				toast.error(t("onlyOnePptxAllowed"))
				return
			}
			if (files.length > 0) {
				toast.error(t("pptxAlreadySelected"))
				return
			}
			setFiles(validFiles)
		} else {
			setFiles(prev => [...prev, ...validFiles])
		}
	}

	const removeFile = (index: number) => {
		setFiles(prev => prev.filter((_, i) => i !== index))
	}

	const handleModeChange = (checked: boolean) => {
		const newMode = checked ? 'images' : 'pptx'
		setUploadMode(newMode)
		setFiles([])
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!title.trim()) {
			toast.error(t("titleRequired"))
			return
		}

		if (!password.trim()) {
			toast.error(t("passwordRequired"))
			return
		}

		if (files.length === 0) {
			toast.error(t("filesRequired"))
			return
		}

		setIsLoading(true)

		try {
			const formData = new FormData()
			formData.append("title", title)
			formData.append("mode", uploadMode)

			files.forEach((file) => {
				formData.append("files", file)
			})

			const response = await fetch("/api/add-song", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${password}`
				},
				body: formData,
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.message || t("uploadError"))
			}

			const responseData = await response.json()
			toast.success(t("songAddedSuccess"))

			// resetear form
			setTitle("")
			setPassword("")
			setFiles([])
			if (fileInputRef.current) {
				fileInputRef.current.value = ""
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : t("uploadError"))
			console.error("Error:", error)
		} finally {
			setIsLoading(false)
		}
	}

	const getFileIcon = (file: File) => {
		if (file.type.includes("presentation")) {
			return <FileText className="h-5 w-5 text-blue-500" />
		}
		return <Image className="h-5 w-5 text-green-500" />
	}

	return (
		<div className="dark">
			<div className="min-h-screen bg-card text-foreground">
				<Navbar />

				<div className="flex items-center justify-center p-4 sm:p-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="w-full max-w-2xl"
					>
						<div className="bg-background border border-border rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
							<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
								{/* titulo cancion */}
								<div className="space-y-2">
									<Label htmlFor="title" className="text-sm font-medium">
										{t("songTitle")}
									</Label>
									<Input
										id="title"
										type="text"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder={t("songTitlePlaceholder")}
										className="w-full"
									/>
								</div>

								{/* contra */}
								<div className="space-y-2">
									<Label htmlFor="password" className="text-sm font-medium">
										{t("adminPassword")}
									</Label>
									<Input
										id="password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder={t("adminPasswordPlaceholder")}
										className="w-full"
									/>
								</div>

								{/* boton cambiar */}
								<div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-border">
									<div className="flex items-center space-x-3">
										<FileText className="h-5 w-5 text-blue-500" />
										<span className="text-sm font-medium">
											{uploadMode === 'pptx' ? t("pptxMode") : t("imagesMode")}
										</span>
									</div>
									<div className="flex items-center space-x-3">
										<span className="text-sm text-muted-foreground">PPTX</span>
										<Switch
											checked={uploadMode === 'images'}
											onCheckedChange={handleModeChange}
										/>
										<span className="text-sm text-muted-foreground">{t("images")}</span>
									</div>
								</div>

								{/* area subir */}
								<div className="space-y-2">
									<Label className="text-sm font-medium">
										{uploadMode === 'pptx' ? t("uploadPptx") : t("uploadImages")}
									</Label>
									<div
										className={`border-2 border-dashed rounded-lg p-4 sm:p-6 lg:p-8 text-center transition-all cursor-pointer ${dragActive
											? "border-primary bg-primary/10"
											: "border-border hover:border-accent-foreground/20 hover:bg-accent/50"
											}`}
										onDragEnter={handleDrag}
										onDragLeave={handleDrag}
										onDragOver={handleDrag}
										onDrop={handleDrop}
										onClick={() => fileInputRef.current?.click()}
									>
										<Upload className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-2 sm:mb-3 lg:mb-4 text-muted-foreground" />
										<p className="text-sm sm:text-base lg:text-lg font-medium mb-1 sm:mb-2">
											{t("dragFilesHere")}
										</p>
										<p className="text-xs sm:text-sm text-muted-foreground">
											{uploadMode === 'pptx'
												? t("pptxOnlyDescription")
												: t("imagesOnlyDescription")
											}
										</p>
									</div>
									<input
										ref={fileInputRef}
										type="file"
										multiple={uploadMode === 'images'}
										accept={getAcceptString()}
										onChange={handleFileSelect}
										className="hidden"
									/>
								</div>

								{/* lista archivos */}
								{files.length > 0 && (
									<div className="space-y-2">
										<Label className="text-sm font-medium">
											{t("selectedFiles")} ({files.length})
										</Label>
										<div className="space-y-2 max-h-60 overflow-y-auto">
											{files.map((file, index) => (
												<motion.div
													key={index}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ duration: 0.2 }}
													className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border border-border"
												>
													<div className="flex items-center space-x-3 min-w-0">
														{getFileIcon(file)}
														<div className="min-w-0 flex-1">
															<p className="text-sm font-medium truncate">
																{file.name}
															</p>
															<p className="text-xs text-muted-foreground">
																{(file.size / 1024 / 1024).toFixed(2)} MB
															</p>
														</div>
													</div>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => removeFile(index)}
														className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 shrink-0"
													>
														<X className="h-4 w-4" />
													</Button>
												</motion.div>
											))}
										</div>
									</div>
								)}

								{/* boton enviar */}
								<Button
									type="submit"
									disabled={isLoading}
									className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
								>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											{t("uploading")}
										</>
									) : (
										<>
											<Upload className="mr-2 h-4 w-4" />
											{t("addSong")}
										</>
									)}
								</Button>
							</form>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	)
}