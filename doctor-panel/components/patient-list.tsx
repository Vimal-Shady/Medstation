"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import type { Patient } from "@/types/patient"
import { Eye, FileText } from "lucide-react"

interface PatientListProps {
  patients: Patient[]
  isLoading: boolean
  onRefresh: () => void
  showDetailedView?: boolean
}

export default function PatientList({ patients, isLoading, onRefresh, showDetailedView = false }: PatientListProps) {
  const router = useRouter()
  const { toast } = useToast()

  const viewPatientDetails = (patientId: string) => {
    router.push(`/patient/${patientId}`)
  }

  const createPrescription = (patientId: string) => {
    router.push(`/prescribe?patient=${patientId}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <p>Loading patients...</p>
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">No patients found</p>
        <Button onClick={() => router.push("/dashboard?tab=add")}>Add a Patient</Button>
      </Card>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>ID</TableHead>
            {showDetailedView && (
              <>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Contact</TableHead>
              </>
            )}
            <TableHead>Prescriptions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.patient_id}>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{patient.personal_id}</TableCell>
              {showDetailedView && (
                <>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.contact_no}</TableCell>
                </>
              )}
              <TableCell>
                {patient.pendingPrescriptions > 0 ? (
                  <Badge>{patient.pendingPrescriptions} active</Badge>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => viewPatientDetails(patient.patient_id.toString())}
                    title="View patient details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => createPrescription(patient.patient_id.toString())}
                    title="Create prescription"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
