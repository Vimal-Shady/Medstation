import { getVendingMachines } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"

export default async function VendingMachinesPage() {
  const machines = await getVendingMachines()

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Vending Machines</h1>
          <Link href="/vending-machines/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vending Machine
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vending Machine Management</CardTitle>
            <CardDescription>View and manage all vending machines and their inventory</CardDescription>
            <div className="flex w-full max-w-sm items-center space-x-2 pt-4">
              <Input type="search" placeholder="Search machines..." />
              <Button type="submit" size="icon" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Medicines</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No vending machines found. Create your first one!
                    </TableCell>
                  </TableRow>
                ) : (
                  machines.map((machine) => (
                    <TableRow key={machine.machine_code}>
                      <TableCell className="font-medium">{machine.machine_code}</TableCell>
                      <TableCell>{machine.location}</TableCell>
                      <TableCell>{machine.medicineCount || 0}</TableCell>
                      <TableCell>
                        {machine.hasLowStock ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(machine.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/vending-machines/${machine.machine_code}`}>
                          <Button variant="outline" size="sm">
                            Manage
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
