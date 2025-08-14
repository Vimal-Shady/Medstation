"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import DashboardHeader from "@/components/dashboard-header"
import PrescriptionList from "@/components/prescription-list"
import type { Patient } from "@/types/patient"
import type { Prescription } from "@/types/prescription"

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const patientId = params.id

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
    fetchPatientDetails()
    fetchPrescriptions()
  }, [patientId, router])

  const fetchPatientDetails = async () => {
    try {
      const response = await fetch(`/api/patients/${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setPatient(data.patient)
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load patient",
          description: "Could not retrieve patient details",
        })
        router.push("/patients")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching patient details",
      })
      router.push("/patients")
    }
  }

  const fetchPrescriptions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/prescriptions/patient/${patientId}`)
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data.prescriptions)
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load prescriptions",
          description: "Could not retrieve prescription history",
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

  if (!patient) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 container mx-auto">
          <div className="flex justify-center items-center h-full">
            <p>Loading patient details...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6 container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Patient Details</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/patients")}>
              Back to Patients
            </Button>
            <Button onClick={() => router.push(`/prescribe?patient=${patientId}`)}>Create Prescription</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{patient.name}</CardTitle>
              <CardDescription>Patient ID: {patient.personal_id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p>{patient.age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p>{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact</p>
                  <p>{patient.contact_no}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{patient.email}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p>{patient.address}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm font-medium text-primary">Total Prescriptions</p>
                  <p className="text-2xl font-bold">{prescriptions.length}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm font-medium text-primary">Active Prescriptions</p>
                  <p className="text-2xl font-bold">{prescriptions.filter((p) => p.status === "pending").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prescription History</CardTitle>
            <CardDescription>View and manage patient prescriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <PrescriptionList prescriptions={prescriptions} isLoading={isLoading} onRefresh={fetchPrescriptions} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
