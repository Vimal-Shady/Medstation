import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createDoctor } from "@/lib/actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

export default function NewDoctorPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link href="/doctors">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Add New Doctor</h1>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Doctor Details</CardTitle>
            <CardDescription>Enter information about the new doctor</CardDescription>
          </CardHeader>
          <form action={createDoctor}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Doctor Name</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" name="specialization" placeholder="e.g., Cardiology" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNo">Contact Number</Label>
                <Input id="contactNo" name="contactNo" type="tel" placeholder="e.g., 9876543210" required />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/doctors">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit">Create Doctor</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
