import { getDoctorById, getDoctorPrescriptions } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

export default async function DoctorDetailPage({ params }: { params: { id: string } }) {
  const doctor = await getDoctorById(Number.parseInt(params.id))
  const prescriptions = await getDoctorPrescriptions(Number.parseInt(params.id))

  if (!doctor) {
    return (
      <DashboardLayout>
        <div>Doctor not found</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link href="/doctors">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Dr. {doctor.name}</h1>
          <div className="ml-auto">
            <Link href={`/doctors/${doctor.doctor_id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Doctor
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Details</CardTitle>
              <CardDescription>Personal and professional information</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Doctor ID</dt>
                  <dd className="text-lg">{doctor.doctor_id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                  <dd className="text-lg">{doctor.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Specialization</dt>
                  <dd>{doctor.specialization}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Contact</dt>
                  <dd>{doctor.contact_no}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd>{doctor.email || "Not provided"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Total Patients</dt>
                  <dd>{doctor.patientCount || 0}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Total Prescriptions</dt>
                  <dd>{doctor.prescriptionCount || 0}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Doctor's activity and prescription statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Prescription Frequency</h3>
                  <div className="mt-2 h-4 w-full rounded-full bg-muted">
                    <div
                      className="h-4 rounded-full bg-primary"
                      style={{ width: `${Math.min(doctor.prescriptionCount || 0, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Based on average prescriptions per doctor</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Patient Engagement</h3>
                  <div className="mt-2 h-4 w-full rounded-full bg-muted">
                    <div
                      className="h-4 rounded-full bg-primary"
                      style={{ width: `${Math.min(doctor.patientCount ? doctor.patientCount * 10 : 0, 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Based on number of patients under care</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prescription History</CardTitle>
            <CardDescription>Medicines prescribed by this doctor</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Instructions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No prescriptions found for this doctor
                    </TableCell>
                  </TableRow>
                ) : (
                  prescriptions.map((prescription) => (
                    <TableRow key={prescription.prescription_id}>
                      <TableCell>{prescription.prescription_id}</TableCell>
                      <TableCell className="font-medium">{prescription.patient_name}</TableCell>
                      <TableCell>{prescription.medicine_name}</TableCell>
                      <TableCell>{prescription.quantity}</TableCell>
                      <TableCell>
                        {prescription.status === "pending" ? (
                          <Badge variant="outline">Pending</Badge>
                        ) : (
                          <Badge variant="success">Purchased</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(prescription.prescribed_at).toLocaleDateString()}</TableCell>
                      <TableCell>{prescription.instructions}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
