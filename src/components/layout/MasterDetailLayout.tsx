"use client"

import { ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Navbar from "@/components/navbar"

interface MobileLayoutProps {
	children: ReactNode
	selectedItem: string | null
	onBack: () => void
	detailView: ReactNode
	listTitle?: string
}

export default function MasterDetailLayout({
	children,
	selectedItem,
	onBack,
	detailView,
	listTitle
}: MobileLayoutProps) {
	return (
		<div className="dark">
			<div className="flex flex-col h-screen bg-background text-foreground">
				<Navbar />

				<div className="flex-1 relative overflow-hidden">
					<AnimatePresence initial={false}>
						{/* List view - always present but moves left when item selected */}
						<motion.div
							key="list-view"
							initial={false}
							animate={{
								x: selectedItem ? "-100%" : "0%"
							}}
							transition={{
								type: "spring",
								stiffness: 400,
								damping: 40
							}}
							className="absolute inset-0 bg-card flex flex-col"
						>
							{children}
						</motion.div>

						{/* Detail view - slides in from right */}
						{selectedItem && (
							<motion.div
								key="detail-view"
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
								{/* Header with back button */}
								<div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center gap-3">
									<Button
										variant="ghost"
										size="icon"
										onClick={onBack}
										className="shrink-0"
									>
										<ArrowLeft size={20} />
									</Button>
									<h2 className="text-lg font-bold truncate flex-1">
										{selectedItem}
									</h2>
								</div>

								{detailView}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	)
}