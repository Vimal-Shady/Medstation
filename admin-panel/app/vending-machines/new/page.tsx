import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createVendingMachine } from "@/lib/actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewVendingMachinePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/vending-machines">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add New Vending Machine</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Vending Machine Details</CardTitle>
          <CardDescription>Create a new vending machine with a unique machine code</CardDescription>
        </CardHeader>
        <form action={createVendingMachine}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="machineCode">Machine Code</Label>
              <Input id="machineCode" name="machineCode" placeholder="e.g., VM001" required />
              <p className="text-sm text-muted-foreground">Enter a unique identifier for this vending machine</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="e.g., Main Hospital, Floor 2" required />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/vending-machines">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Create Vending Machine</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
