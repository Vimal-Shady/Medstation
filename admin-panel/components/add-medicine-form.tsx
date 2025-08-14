"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { addMedicineToVendingMachine } from "@/lib/actions"

interface Medicine {
  medicine_id: number
  name: string
  stock_quantity: number
}

export default function AddMedicineForm({
  machineCode,
  medicines,
}: {
  machineCode: string
  medicines: Medicine[]
}) {
  const [selectedMedicine, setSelectedMedicine] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(0)
  const [maxQuantity, setMaxQuantity] = useState<number>(0)

  const handleMedicineChange = (value: string) => {
    setSelectedMedicine(value)
    const medicine = medicines.find((m) => m.medicine_id.toString() === value)
    if (medicine) {
      setMaxQuantity(medicine.stock_quantity)
      setQuantity(Math.min(10, medicine.stock_quantity))
    }
  }

  return (
    <form action={addMedicineToVendingMachine} className="space-y-4">
      <input type="hidden" name="machineCode" value={machineCode} />

      <div className="space-y-2">
        <Label htmlFor="medicineId">Select Medicine</Label>
        <Select name="medicineId" value={selectedMedicine} onValueChange={handleMedicineChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a medicine" />
          </SelectTrigger>
          <SelectContent>
            {medicines.length === 0 ? (
              <SelectItem value="none" disabled>
                No medicines available
              </SelectItem>
            ) : (
              medicines.map((medicine) => (
                <SelectItem key={medicine.medicine_id} value={medicine.medicine_id.toString()}>
                  {medicine.name} (Stock: {medicine.stock_quantity})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          max={maxQuantity}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
        />
        {maxQuantity > 0 && <p className="text-xs text-muted-foreground">Maximum available: {maxQuantity}</p>}
      </div>

      <Button type="submit" disabled={!selectedMedicine || medicines.length === 0} className="w-full">
        Add to Vending Machine
      </Button>
    </form>
  )
}
