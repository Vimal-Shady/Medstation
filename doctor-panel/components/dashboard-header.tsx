"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { User, LogOut, Menu, X, FileText } from "lucide-react"

export default function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) {
        toast({ title: "Logged out", description: "You have been logged out successfully" })
        router.push("/login")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during logout",
      })
    }
  }

  const medstationStyle: React.CSSProperties = {
    fontWeight: "bold",
    fontSize: "1.25rem",
    background: "linear-gradient(90deg, #facc15, #fb923c, #facc15)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "glow 2s ease-in-out infinite alternate",
    textShadow: "0 0 8px #facc15, 0 0 12px #fde68a, 0 0 20px #fcd34d",
  }

  const navLinkStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    fontWeight: 500,
    transition: "all 0.3s ease",
    color: "inherit",
    textDecoration: "none",
  }

  const glowHoverStyle: React.CSSProperties = {
    color: "#facc15",
    textShadow: "0 0 6px #facc15, 0 0 10px #fde68a, 0 0 15px #fcd34d",
  }

  return (
    <>
      <style jsx>{`
        @keyframes glow {
          0% {
            text-shadow: 0 0 5px #facc15, 0 0 10px #fcd34d, 0 0 15px #fde68a;
          }
          100% {
            text-shadow: 0 0 10px #facc15, 0 0 20px #fb923c, 0 0 30px #facc15;
          }
        }
      `}</style>

      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2 p-8 font-[10px]">
              <span style={medstationStyle}>Medstation</span>
            </Link>
          </div>

          <button className="block md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/patients", label: "Patients" },
              { href: "/prescribe", label: "Prescribe" },
              { href: "/history", label: "History" },
            ].map((link, i) => (
              <Link
                key={i}
                href={link.href}
                style={navLinkStyle}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, glowHoverStyle)}
                onMouseLeave={(e) => Object.assign(e.currentTarget.style, navLinkStyle)}
              >
                {link.label}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {isMenuOpen && (
            <div className="fixed inset-0 top-16 z-50 bg-background md:hidden">
              <nav className="flex flex-col gap-4 p-4">
                {[
                  { href: "/dashboard", label: "Dashboard" },
                  { href: "/patients", label: "Patients" },
                  { href: "/prescribe", label: "Prescribe" },
                  { href: "/history", label: "Prescription History" },
                  { href: "/profile", label: "Profile" },
                ].map((link, i) => (
                  <Link
                    key={i}
                    href={link.href}
                    className="text-sm font-medium p-2 rounded"
                    style={navLinkStyle}
                    onClick={() => setIsMenuOpen(false)}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, glowHoverStyle)}
                    onMouseLeave={(e) => Object.assign(e.currentTarget.style, navLinkStyle)}
                  >
                    {link.href === "/history" ? (
                      <>
                        <FileText className="h-4 w-4 mr-2 inline-block" />
                        {link.label}
                      </>
                    ) : (
                      link.label
                    )}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium p-2 rounded text-left"
                  style={navLinkStyle}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, glowHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, navLinkStyle)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
