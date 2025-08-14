"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import DashboardHeader from "@/components/dashboard-header"
import PatientList from "@/components/patient-list"
import AddPatientForm from "@/components/add-patient-form"
import type { Patient } from "@/types/patient"
import { FileText, Users, Clock, BadgeIcon as IdCard } from "lucide-react"

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [recentPrescriptions, setRecentPrescriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(true)
  const [doctorProfile, setDoctorProfile] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get the tab from URL query params or default to "patients"
  const defaultTab = searchParams.get("tab") || "patients"

  useEffect(() => {
    fetchPatients()
    fetchRecentPrescriptions()
    fetchDoctorProfile()
  }, [])

  const fetchDoctorProfile = async () => {
    try {
      const response = await fetch("/api/doctor/profile")
      if (response.ok) {
        const data = await response.json()
        setDoctorProfile(data.profile)
      }
    } catch (error) {
      console.error("Error fetching doctor profile:", error)
    }
  }

  const fetchPatients = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/doctor/patients")
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients || [])
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

  const fetchRecentPrescriptions = async () => {
    setIsLoadingPrescriptions(true)
    try {
      const response = await fetch("/api/doctor/prescriptions?limit=5")
      if (response.ok) {
        const data = await response.json()
        setRecentPrescriptions(data.prescriptions || [])
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load recent prescriptions",
          description: "Could not retrieve your recent prescriptions",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching recent prescriptions",
      })
    } finally {
      setIsLoadingPrescriptions(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6 container mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            {doctorProfile && (
              <div className="flex items-center gap-2 text-sm bg-primary/10 px-3 py-1.5 rounded-md">
                <IdCard className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Doctor ID:</span>
                <span>{doctorProfile.personal_id}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Your practice at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-primary/10 p-4 rounded-lg flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium text-primary">Total Patients</h3>
                      <p className="text-3xl font-bold">{patients.length}</p>
                    </div>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium text-primary">Pending Prescriptions</h3>
                      <p className="text-3xl font-bold">
                        {patients.reduce((count, patient) => count + (patient.pendingPrescriptions || 0), 0)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg flex items-center gap-3">
                    <Clock className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium text-primary">Recent Activity</h3>
                      <p className="text-3xl font-bold">{recentPrescriptions.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button onClick={() => router.push("/prescribe")}>Create New Prescription</Button>
                <Button variant="outline" onClick={() => router.push("/patients")}>
                  View All Patients
                </Button>
                <Button variant="outline" onClick={() => router.push("/history")}>
                  View Prescription History
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Prescriptions</CardTitle>
              <CardDescription>Your latest 5 prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPrescriptions ? (
                <p>Loading recent prescriptions...</p>
              ) : recentPrescriptions.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Patient</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
                          Medicines
                        </th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPrescriptions.map((prescription) => (
                        <tr key={prescription.prescription_id} className="border-b">
                          <td className="p-4">{new Date(prescription.prescribed_at).toLocaleDateString()}</td>
                          <td className="p-4 font-medium">{prescription.patient_name}</td>
                          <td className="p-4">
                            <div className="max-w-xs truncate" title={prescription.medicines}>
                              {prescription.medicines}
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                prescription.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {prescription.status === "pending" ? "Pending" : "Purchased"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No recent prescriptions found</p>
              )}
              {recentPrescriptions.length > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => router.push("/history")}>
                    View All Prescriptions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="patients">My Patients</TabsTrigger>
              <TabsTrigger value="add">Add Patient</TabsTrigger>
            </TabsList>
            <TabsContent value="patients" className="mt-6">
              <PatientList patients={patients} isLoading={isLoading} onRefresh={fetchPatients} />
            </TabsContent>
            <TabsContent value="add" className="mt-6">
              <AddPatientForm onAddPatient={fetchPatients} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
