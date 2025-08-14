import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = cookies().get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const prescriptionId = params.id

    // Check if the prescription exists and belongs to this doctor
    const prescriptions = await db.query(
      `SELECT 
        p.prescription_id, 
        p.doctor_id, 
        p.patient_id, 
        p.status, 
        p.prescribed_at, 
        p.instructions,
        u.name as patient_name
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.patient_id
      JOIN users u ON pt.patient_id = u.id
      WHERE p.prescription_id = ? AND p.doctor_id = ?`,
      [prescriptionId, userId],
    )

    if (!prescriptions || !Array.isArray(prescriptions) || prescriptions.length === 0) {
      return NextResponse.json({ message: "Prescription not found or not authorized" }, { status: 404 })
    }

    const prescription = prescriptions[0]

    // Get prescription items
    const items = await db.query(
      `SELECT 
        pi.item_id,
        pi.medicine_id,
        pi.quantity,
        m.name as medicine_name,
        m.description as medicine_description,
        m.price
      FROM prescription_items pi
      JOIN medicines m ON pi.medicine_id = m.medicine_id
      WHERE pi.prescription_id = ?`,
      [prescriptionId],
    )

    prescription.items = items

    return NextResponse.json({ prescription })
  } catch (error) {
    console.error("Error fetching prescription details:", error)
    return NextResponse.json({ message: "An error occurred while fetching prescription details" }, { status: 500 })
  }
}
