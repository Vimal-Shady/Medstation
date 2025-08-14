"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import DashboardHeader from "@/components/dashboard-header"
import type { Patient } from "@/types/patient"
import type { Medicine } from "@/types/medicine"
import { Plus, Trash2 } from "lucide-react"

export default function PrescribePage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [instructions, setInstructions] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [prescriptionItems, setPrescriptionItems] = useState<
    {
      id: string
      medicineId: string
      quantity: string
    }[]
  >([{ id: crypto.randomUUID(), medicineId: "", quantity: "1" }])

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Get patient ID from URL if provided
  const patientIdFromUrl = searchParams.get("patient")

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
    fetchMedicines()
  }, [router])

  // Set the selected patient from URL parameter if available
  useEffect(() => {
    if (patientIdFromUrl && patients.length > 0) {
      setSelectedPatient(patientIdFromUrl)
    }
  }, [patientIdFromUrl, patients])

  const fetchPatients = async () => {
    try {
      const response = await fetch("/api/doctor/patients")
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients || [])
      } else {
        const errorData = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to load patients",
        })
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load patients",
      })
    }
  }

  const fetchMedicines = async () => {
    try {
      const response = await fetch("/api/medicines")
      if (response.ok) {
        const data = await response.json()
        setMedicines(data.medicines || [])
      } else {
        const errorData = await response.json()
        toast({
          variant: "destructive",
          title: "Error",
          description: errorData.message || "Failed to load medicines",
        })
      }
    } catch (error) {
      console.error("Error fetching medicines:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load medicines",
      })
    }
  }

  const addMedicineItem = () => {
    setPrescriptionItems([...prescriptionItems, { id: crypto.randomUUID(), medicineId: "", quantity: "1" }])
  }

  const removeMedicineItem = (id: string) => {
    if (prescriptionItems.length > 1) {
      setPrescriptionItems(prescriptionItems.filter((item) => item.id !== id))
    }
  }

  const updateMedicineItem = (id: string, field: "medicineId" | "quantity", value: string) => {
    setPrescriptionItems(prescriptionItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatient) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a patient",
      })
      return
    }

    // Validate all medicine items
    const invalidItems = prescriptionItems.filter(
      (item) => !item.medicineId || !item.quantity || Number(item.quantity) <= 0,
    )

    if (invalidItems.length > 0) {
      toast({
        variant: "destructive",
        title: "Invalid medicine information",
        description: "Please select a medicine and enter a valid quantity for all items",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/prescriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: selectedPatient,
          medicines: prescriptionItems.map((item) => ({
            medicineId: item.medicineId,
            quantity: Number.parseInt(item.quantity),
          })),
          instructions,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Prescription created",
          description: "The prescription has been created successfully",
        })

        // Clear form fields
        setSelectedPatient("")
        setPrescriptionItems([{ id: crypto.randomUUID(), medicineId: "", quantity: "1" }])
        setInstructions("")

        // Add a small delay before redirecting to ensure the toast is visible
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        toast({
          variant: "destructive",
          title: "Failed to create prescription",
          description: data.message || "An error occurred",
        })
      }
    } catch (error) {
      console.error("Error creating prescription:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while creating the prescription",
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
          <h1 className="text-3xl font-bold mb-6">Create Prescription</h1>

          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>New Prescription</CardTitle>
                <CardDescription>Create a new prescription for your patient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient} required>
                    <SelectTrigger id="patient">
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.patient_id} value={patient.patient_id.toString()}>
                          {patient.name} ({patient.personal_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Medicines</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMedicineItem}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add Medicine
                    </Button>
                  </div>

                  {prescriptionItems.map((item, index) => (
                    <div key={item.id} className="flex gap-4 items-end">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor={`medicine-${item.id}`}>Medicine {index + 1}</Label>
                        <Select
                          value={item.medicineId}
                          onValueChange={(value) => updateMedicineItem(item.id, "medicineId", value)}
                          required
                        >
                          <SelectTrigger id={`medicine-${item.id}`}>
                            <SelectValue placeholder="Select a medicine" />
                          </SelectTrigger>
                          <SelectContent>
                            {medicines.map((medicine) => (
                              <SelectItem key={medicine.medicine_id} value={medicine.medicine_id.toString()}>
                                {medicine.name} - ${medicine.price} ({medicine.stock_quantity} in stock)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-24 space-y-2">
                        <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateMedicineItem(item.id, "quantity", e.target.value)}
                          required
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMedicineItem(item.id)}
                        disabled={prescriptionItems.length <= 1}
                        className="mb-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Enter instructions for the patient"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Prescription"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
