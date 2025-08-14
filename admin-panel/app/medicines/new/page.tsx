import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createMedicine } from "@/lib/actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewMedicinePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/medicines">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Medicine</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Medicine Details</CardTitle>
          <CardDescription>Enter information about the new medicine</CardDescription>
        </CardHeader>
        <form action={createMedicine}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medicine Name</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock Quantity</Label>
                <Input id="stock" name="stock" type="number" min="0" defaultValue="0" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue="0.00" required />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/medicines">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Create Medicine</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
