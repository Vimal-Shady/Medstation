import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = cookies().get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const patientId = params.id

    // Check if the patient is assigned to this doctor
    const assignments = await db.query("SELECT * FROM doctor_patient WHERE doctor_id = ? AND patient_id = ?", [
      userId,
      patientId,
    ])

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ message: "Patient not found or not assigned to you" }, { status: 404 })
    }

    // Get prescriptions for this patient
    const prescriptions = await db.query(
      `SELECT 
        p.prescription_id, 
        p.doctor_id, 
        p.patient_id, 
        p.status, 
        p.prescribed_at, 
        p.instructions,
        GROUP_CONCAT(CONCAT(m.name, ' (', pi.quantity, ')') SEPARATOR ', ') as medicines
      FROM prescriptions p
      JOIN prescription_items pi ON p.prescription_id = pi.prescription_id
      JOIN medicines m ON pi.medicine_id = m.medicine_id
      WHERE p.doctor_id = ? AND p.patient_id = ?
      GROUP BY p.prescription_id
      ORDER BY p.prescribed_at DESC`,
      [userId, patientId],
    )

    // Get detailed prescription items
    for (const prescription of prescriptions) {
      const items = await db.query(
        `SELECT 
          pi.item_id,
          pi.medicine_id,
          pi.quantity,
          m.name as medicine_name,
          m.description as medicine_description
        FROM prescription_items pi
        JOIN medicines m ON pi.medicine_id = m.medicine_id
        WHERE pi.prescription_id = ?`,
        [prescription.prescription_id],
      )

      prescription.items = items
    }

    return NextResponse.json({ prescriptions })
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    return NextResponse.json({ message: "An error occurred while fetching prescriptions" }, { status: 500 })
  }
}
