import { getDoctors } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, PlusCircle } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

export default async function DoctorsPage() {
  const doctors = await getDoctors()

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
          <Link href="/doctors/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Doctor Performance</CardTitle>
            <CardDescription>View doctor details and prescription history</CardDescription>
            <div className="flex w-full max-w-sm items-center space-x-2 pt-4">
              <Input type="search" placeholder="Search doctors..." />
              <Button type="submit" size="icon" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead>Prescriptions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No doctors found.
                    </TableCell>
                  </TableRow>
                ) : (
                  doctors.map((doctor) => (
                    <TableRow key={doctor.doctor_id}>
                      <TableCell>{doctor.doctor_id}</TableCell>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>{doctor.contact_no}</TableCell>
                      <TableCell>{doctor.patientCount || 0}</TableCell>
                      <TableCell>{doctor.prescriptionCount || 0}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/doctors/${doctor.doctor_id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
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
