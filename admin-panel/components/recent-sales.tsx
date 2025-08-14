"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Prescription {
  prescription_id: number
  patient_name: string
  medicine_name: string
  quantity: number
  price: number
}

export function RecentSales() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentPrescriptions() {
      try {
        const response = await fetch("/api/prescriptions/recent")
        if (!response.ok) {
          throw new Error("Failed to fetch recent prescriptions")
        }
        const data = await response.json()
        setPrescriptions(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching recent prescriptions:", error)
        setPrescriptions([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecentPrescriptions()
  }, [])

  if (loading) {
    return <div>Loading recent prescriptions...</div>
  }

  if (prescriptions.length === 0) {
    return <div>No recent prescriptions found</div>
  }

  return (
    <div className="space-y-8">
      {prescriptions.map((prescription) => (
        <div key={prescription.prescription_id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`/placeholder.svg?height=36&width=36`} alt="Avatar" />
            <AvatarFallback>
              {prescription.patient_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{prescription.patient_name}</p>
            <p className="text-sm text-muted-foreground">
              {prescription.medicine_name} x{prescription.quantity}
            </p>
          </div>
          <div className="ml-auto font-medium">${(prescription.price * prescription.quantity).toFixed(2)}</div>
        </div>
      ))}
    </div>
  )
}
