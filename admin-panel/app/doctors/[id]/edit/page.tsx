import { getDoctorById } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateDoctor } from "@/lib/actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

export default async function EditDoctorPage({ params }: { params: { id: string } }) {
  const doctor = await getDoctorById(Number.parseInt(params.id))

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
          <Link href={`/doctors/${params.id}`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Doctor</h1>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Doctor Details</CardTitle>
            <CardDescription>Update doctor information</CardDescription>
          </CardHeader>
          <form action={updateDoctor}>
            <CardContent className="space-y-4">
              <input type="hidden" name="doctorId" value={doctor.doctor_id} />

              <div className="space-y-2">
                <Label htmlFor="name">Doctor Name</Label>
                <Input id="name" name="name" defaultValue={doctor.name} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={doctor.email || ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" name="specialization" defaultValue={doctor.specialization || ""} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNo">Contact Number</Label>
                <Input id="contactNo" name="contactNo" type="tel" defaultValue={doctor.contact_no || ""} required />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/doctors/${params.id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit">Save Changes</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
