"use client"

import { ReactNode } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Navbar from "@/components/navbar"

interface DesktopLayoutProps {
	leftPanel: ReactNode
	rightPanel: ReactNode
}

export default function TwoPanelLayout({ leftPanel, rightPanel }: DesktopLayoutProps) {
	return (
		<div className="dark">
			<div className="flex flex-col h-screen bg-background text-foreground">
				<Navbar />

				<div className="flex flex-1 min-h-0">
					{/* Left panel */}
					<div className="w-1/2 border-r border-border bg-card flex flex-col min-h-0">
						{leftPanel}
					</div>

					{/* Right panel */}
					<ScrollArea className="w-1/2 bg-card">
						{rightPanel}
					</ScrollArea>
				</div>
			</div>
		</div>
	)
}