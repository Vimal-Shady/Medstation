"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Pill } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("twinsriramv2005@gmail.com")
  const [password, setPassword] = useState("admin123")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simple login check with hardcoded credentials
    if (email === "twinsriramv2005@gmail.com" && password === "admin123") {
      // Store login state in localStorage
      localStorage.setItem("isLoggedIn", "true")

      // Set a cookie for server-side auth checks
      document.cookie = "isLoggedIn=true; path=/; max-age=86400" // 24 hours

      // Show success toast
      toast({
        title: "Login successful",
        description: "Welcome to Medico Admin Panel",
      })

      // Redirect to dashboard
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } else {
      // Show error toast
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Pill className="h-10 w-10 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Medico Admin Panel</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access the admin panel</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="twinsriramv2005@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Default: twinsriramv2005@gmail.com</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Default: admin123</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
