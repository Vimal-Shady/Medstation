import { getMedicineById } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateMedicine } from "@/lib/actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

export default async function EditMedicinePage({ params }: { params: { id: string } }) {
  const medicine = await getMedicineById(Number.parseInt(params.id))

  if (!medicine) {
    return (
      <DashboardLayout>
        <div>Medicine not found</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Link href="/medicines">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Medicine</h1>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Medicine Details</CardTitle>
            <CardDescription>Update medicine information, stock quantity, and pricing</CardDescription>
          </CardHeader>
          <form action={updateMedicine}>
            <CardContent className="space-y-4">
              <input type="hidden" name="medicineId" value={medicine.medicine_id} />

              <div className="space-y-2">
                <Label htmlFor="name">Medicine Name</Label>
                <Input id="name" name="name" defaultValue={medicine.name} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={medicine.description || ""} rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    defaultValue={medicine.stock_quantity}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={medicine.price}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/medicines">
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
