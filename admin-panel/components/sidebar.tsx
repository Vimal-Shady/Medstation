"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Pill, ShoppingCart, Users, Bell, Settings, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const routes = [
    { href: "/", icon: LayoutDashboard, title: "Dashboard" },
    { href: "/medicines", icon: Pill, title: "Medicines" },
    { href: "/vending-machines", icon: ShoppingCart, title: "Vending Machines" },
    { href: "/doctors", icon: Users, title: "Doctors" },
    { href: "/notifications", icon: Bell, title: "Notifications" },
    { href: "/settings", icon: Settings, title: "Settings" },
  ]

  const handleLogout = () => {
    // Clear login state
    localStorage.removeItem("isLoggedIn")

    // Clear the cookie
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    // Show toast notification
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })

    // Redirect to login page
    router.push("/login")
  }

  return (
    <div className="flex h-full w-[250px] flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4">
        {/* Medstation brand glow and larger font */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-amber-400 hover:text-amber-500 text-2xl glow-effect"
        >
          <Pill className="h-6 w-6" />
          <span>Medstation</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-amber-400 hover:border-amber-400 hover:scale-105", // Glow and border color change on hover
                pathname === route.href && "bg-muted text-foreground",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4">
        {/* Button border and text color change on hover */}
        <Button
          variant="outline"
          className="w-full justify-start border-amber-400 text-amber-400 hover:border-amber-500 hover:text-amber-500 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  )
}
