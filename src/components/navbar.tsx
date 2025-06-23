import {
	NavigationMenu,
	NavigationMenuLink,
} from "@/components/ui/navigation-menu"

export default function Navbar() {
	return (
		<div className="flex justify-between items-center px-6 py-4 bg-sidebar border-b border-sidebar-border shadow-md">
			<h1 className="text-2xl font-semibold text-sidebar-foreground">
				Base de datos de canciones
			</h1>
			<NavigationMenu className="space-x-6">
				<NavigationMenuLink
					href="/"
					className="text-lg font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition px-3 py-2 rounded"
				>
					Canciones
				</NavigationMenuLink>
				<NavigationMenuLink
					href="/"
					className="text-lg font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition px-3 py-2 rounded"
				>
					Revisión
				</NavigationMenuLink>
			</NavigationMenu>
		</div>
	)
}
