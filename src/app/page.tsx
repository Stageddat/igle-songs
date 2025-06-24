"use client"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Navbar from "@/components/navbar"

// canciones test
const songs = [
	"Bohemian Rhapsody", "Stairway to Heaven", "Hotel California",
	"Imagine", "Like a Rolling Stone", "Billie Jean", "Sweet Child O' Mine",
	"Purple Haze", "What's Going On", "Respect", "Good Vibrations",
	"Johnny B. Goode", "I Want to Hold Your Hand", "Smells Like Teen Spirit",
	"What's Love Got to Do with It", "Superstition", "Dancing Queen",
	"Don't Stop Believin'", "Thriller", "Born to Run", "Yesterday",
	"My Girl", "Georgia on My Mind", "Heartbreak Hotel", "Rock and Roll",
	"Wonderwall", "Creep", "Come As You Are", "Black", "Tears in Heaven",
	"Nothing Else Matters", "Enter Sandman", "Sweet Caroline", "Mr. Brightside",
	"Seven Nation Army", "Zombie", "Paranoid", "Smoke on the Water"
]

export default function SongsDatabase() {
	const [searchTerm, setSearchTerm] = useState("")

	const filteredSongs = songs.filter(song =>
		song.toLowerCase().includes(searchTerm.toLowerCase())
	)

	return (
		<div className="dark">
			<div className="flex flex-col h-screen bg-background text-foreground">
				<Navbar />
				<div className="flex flex-1 min-h-0">
					{/* lista cancion */}
					<div className="w-1/2 border-r border-border bg-card flex flex-col min-h-0">
						<div className="p-6 border-b border-border shrink-0">
							<input
								type="text"
								placeholder="Buscar canción..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
							/>
						</div>
						<div className="flex-1 min-h-0">
							<ScrollArea className="h-full">
								<div className="space-y-2 p-6">
									{filteredSongs.map((title, index) => (
										<div
											key={index}
											className="px-4 py-3 bg-muted hover:bg-accent cursor-pointer rounded-lg transition-colors duration-200 border border-border hover:border-accent-foreground/20"
										>
											{title}
										</div>
									))}
								</div>
							</ScrollArea>
						</div>
					</div>

					{/* ver cancion */}
					<div className="w-1/2 p-6 flex items-center justify-center bg-card text-muted-foreground text-lg">
						Selecciona una canción para empezar
					</div>
				</div>
			</div>
		</div>
	)
}