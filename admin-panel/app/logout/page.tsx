"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function LogoutPage() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Clear login state from localStorage
    localStorage.removeItem("isLoggedIn")

    // Clear the cookie
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    // Show toast
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })

    // Redirect to login page
    router.push("/login")
  }, [router, toast])

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Logging out...</p>
    </div>
  )
}
