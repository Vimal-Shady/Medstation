import { getVendingMachineByCode, getMedicines } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import AddMedicineForm from "@/components/add-medicine-form"
import { updateVendingMachineMedicine } from "@/lib/actions"

export default async function VendingMachineDetailPage({ params }: { params: { code: string } }) {
  const machine = await getVendingMachineByCode(params.code)
  const allMedicines = await getMedicines()

  if (!machine) {
    return <div>Vending machine not found</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/vending-machines">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Vending Machine: {machine.machine_code}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Machine Details</CardTitle>
            <CardDescription>Information about this vending machine</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Machine Code</dt>
                <dd className="text-lg">{machine.machine_code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                <dd className="text-lg">{machine.location}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
                <dd>{new Date(machine.created_at).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Medicine Count</dt>
                <dd>{machine.medicines?.length || 0} types</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Medicine</CardTitle>
            <CardDescription>Add a new medicine to this vending machine</CardDescription>
          </CardHeader>
          <CardContent>
            <AddMedicineForm
              machineCode={machine.machine_code}
              medicines={allMedicines.filter(
                (med) => !machine.medicines?.some((m) => m.medicine_id === med.medicine_id),
              )}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Medicine Inventory</CardTitle>
          <CardDescription>Medicines available in this vending machine</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity in Machine</TableHead>
                <TableHead>Main Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {machine.medicines?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No medicines in this vending machine yet
                  </TableCell>
                </TableRow>
              ) : (
                machine.medicines?.map((item) => (
                  <TableRow key={item.medicine_id}>
                    <TableCell>{item.medicine_id}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.stock_quantity}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.quantity < item.stock_quantity * 0.2 ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="outline">In Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={updateVendingMachineMedicine}>
                        <input type="hidden" name="machineCode" value={machine.machine_code} />
                        <input type="hidden" name="medicineId" value={item.medicine_id} />
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            name="quantity"
                            defaultValue={item.quantity}
                            min="0"
                            max={item.stock_quantity}
                            className="w-16 h-8 rounded-md border border-input bg-background px-2 text-sm"
                          />
                          <Button type="submit" size="sm" variant="outline">
                            Update
                          </Button>
                        </div>
                      </form>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
