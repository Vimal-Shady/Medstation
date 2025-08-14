"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye } from "lucide-react"

interface PrescriptionListProps {
  prescriptions: any[]
  isLoading: boolean
  onRefresh: () => void
}

export default function PrescriptionList({ prescriptions, isLoading, onRefresh }: PrescriptionListProps) {
  const { toast } = useToast()
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [prescriptionDetails, setPrescriptionDetails] = useState<any>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const updatePrescriptionStatus = async (prescriptionId: number, status: string) => {
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Status updated",
          description: data.details || "Prescription status has been updated",
        })
        onRefresh()
      } else {
        const errorData = await response.json()
        toast({
          variant: "destructive",
          title: "Failed to update status",
          description: errorData.message || "Could not update prescription status",
        })
      }
    } catch (error) {
      console.error("Error updating prescription status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while updating the status",
      })
    }
  }

  const fetchPrescriptionDetails = async (prescriptionId: number) => {
    setIsLoadingDetails(true)
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}/details`)
      if (response.ok) {
        const data = await response.json()
        setPrescriptionDetails(data.prescription)
      } else {
        toast({
          variant: "destructive",
          title: "Failed to load prescription details",
          description: "Could not retrieve prescription details",
        })
      }
    } catch (error) {
      console.error("Error fetching prescription details:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching prescription details",
      })
    } finally {
      setIsLoadingDetails(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <p>Loading prescriptions...</p>
      </div>
    )
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No prescriptions found</p>
      </Card>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Medicines</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.map((prescription) => (
            <TableRow key={prescription.prescription_id}>
              <TableCell>{formatDate(prescription.prescribed_at)}</TableCell>
              <TableCell>
                <div className="max-w-xs truncate" title={prescription.medicines}>
                  {prescription.medicines}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={prescription.status === "pending" ? "outline" : "default"}>
                  {prescription.status === "pending" ? "Pending" : "Purchased"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedPrescription(prescription)
                          fetchPrescriptionDetails(prescription.prescription_id)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Prescription Details</DialogTitle>
                        <DialogDescription>
                          Prescribed on {prescriptionDetails && formatDate(prescriptionDetails.prescribed_at)}
                        </DialogDescription>
                      </DialogHeader>

                      {isLoadingDetails ? (
                        <div className="py-6 text-center">Loading details...</div>
                      ) : prescriptionDetails ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Status</h4>
                            <Badge variant={prescriptionDetails.status === "pending" ? "outline" : "default"}>
                              {prescriptionDetails.status === "pending" ? "Pending" : "Purchased"}
                            </Badge>
                          </div>

                          {prescriptionDetails.instructions && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Instructions</h4>
                              <p className="text-sm">{prescriptionDetails.instructions}</p>
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-medium mb-1">Medicines</h4>
                            <div className="rounded-md border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Medicine</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Price</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {prescriptionDetails.items?.map((item: any) => (
                                    <TableRow key={item.item_id}>
                                      <TableCell>
                                        <div>
                                          <p className="font-medium">{item.medicine_name}</p>
                                          <p className="text-xs text-muted-foreground">{item.medicine_description}</p>
                                        </div>
                                      </TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>${item.price * item.quantity}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-muted-foreground">
                          Failed to load prescription details
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {prescription.status === "pending" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePrescriptionStatus(prescription.prescription_id, "purchased")}
                    >
                      Mark as Purchased
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updatePrescriptionStatus(prescription.prescription_id, "pending")}
                    >
                      Mark as Pending
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
