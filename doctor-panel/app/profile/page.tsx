"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import DashboardHeader from "@/components/dashboard-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Stethoscope, Mail, Phone, Calendar, BadgeIcon as IdCard } from "lucide-react"

interface DoctorProfile {
  id: number
  name: string
  email: string
  personal_id: string
  specialization: string
  contact_no: string
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check")
        if (!response.ok) {
          router.push("/login")
        }
      } catch (error) {
        router.push("/login")
      }
    }

    checkAuth()
    fetchProfile()
  }, [router])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/doctor/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load profile",
          description: "Could not retrieve your profile information",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching profile",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6 container mx-auto">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Doctor Profile</h1>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <p>Loading profile...</p>
            </div>
          ) : profile ? (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                  <Avatar className="h-24 w-24 border">
                    <AvatarFallback className="text-2xl">{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center md:text-left">
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <CardDescription className="flex items-center justify-center md:justify-start gap-1 mt-1">
                      <Stethoscope className="h-4 w-4" />
                      {profile.specialization}
                    </CardDescription>
                    <div className="flex items-center justify-center md:justify-start gap-1 mt-1 text-sm text-muted-foreground">
                      <IdCard className="h-4 w-4" />
                      <span>ID: {profile.personal_id}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Contact</p>
                        <p>{profile.contact_no}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Joined</p>
                      <p>{new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Profile information not available</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
