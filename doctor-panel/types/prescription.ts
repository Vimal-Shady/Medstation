export interface Prescription {
  prescription_id: number
  doctor_id: number
  patient_id: number
  prescribed_at: string
  status: "pending" | "purchased"
  instructions?: string | null
  patient_name?: string
}

export interface PrescriptionItem {
  item_id: number
  prescription_id: number
  medicine_id: number
  quantity: number
  medicine_name: string
  medicine_description: string
}
