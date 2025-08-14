"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import DashboardHeader from "@/components/dashboard-header"
import PatientList from "@/components/patient-list"
import type { Patient } from "@/types/patient"

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
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
    fetchPatients()
  }, [router])

  const fetchPatients = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/doctor/patients")
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients)
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load patients",
          description: "Could not retrieve your patient list",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching patients",
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
          <h1 className="text-3xl font-bold">My Patients</h1>
          <Button onClick={() => router.push("/dashboard?tab=add")}>Add New Patient</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient List</CardTitle>
            <CardDescription>Manage your patients and their prescriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientList patients={patients} isLoading={isLoading} onRefresh={fetchPatients} showDetailedView />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
