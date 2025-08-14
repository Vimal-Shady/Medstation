"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import DashboardHeader from "@/components/dashboard-header"
import PrescriptionHistory from "@/components/prescription-history"
import type { Prescription } from "@/types/prescription"

export default function PrescriptionHistoryPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
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
    fetchPrescriptions()
  }, [router])

  const fetchPrescriptions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/doctor/prescriptions")
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data.prescriptions)
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load prescriptions",
          description: "Could not retrieve your prescription history",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching prescriptions",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6 container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Prescription History</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Prescriptions</CardTitle>
            <CardDescription>View and manage all prescriptions you've written for your patients</CardDescription>
          </CardHeader>
          <CardContent>
            <PrescriptionHistory prescriptions={prescriptions} isLoading={isLoading} onRefresh={fetchPrescriptions} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
