"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface AddPatientFormProps {
  onAddPatient: () => void
}

export default function AddPatientForm({ onAddPatient }: AddPatientFormProps) {
  const [patientId, setPatientId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!patientId.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter a patient ID",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/doctor/add-patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message || "Patient added successfully",
        })
        setPatientId("")
        onAddPatient()
      } else {
        toast({
          variant: "destructive",
          title: "Failed to add patient",
          description: data.message || "An error occurred",
        })
      }
    } catch (error) {
      console.error("Error adding patient:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect to the server",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Add Patient to Your List</CardTitle>
          <CardDescription>Enter the patient ID to add them to your patient list</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              placeholder="Enter patient ID (e.g., PID1234)"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">
              Enter the patient's personal ID (e.g., PID1234) to add them to your patient list.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Patient"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
