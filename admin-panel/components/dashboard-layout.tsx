"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check login status
    const checkAuth = () => {
      const loginStatus = localStorage.getItem("isLoggedIn") === "true"
      setIsLoggedIn(loginStatus)
      setIsLoading(false)

      if (!loginStatus && pathname !== "/login") {
        router.push("/login")
      }
    }

    checkAuth()

    // Add event listener for storage changes (in case of logout in another tab)
    window.addEventListener("storage", checkAuth)

    return () => {
      window.removeEventListener("storage", checkAuth)
    }
  }, [router, pathname])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  // If not logged in, don't render anything (will redirect)
  if (!isLoggedIn && pathname !== "/login") {
    return null
  }

  // If logged in, render the layout with sidebar
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">{children}</div>
    </div>
  )
}
