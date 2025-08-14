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

    // Get patient details
    const patients = await db.query(
      `SELECT u.id, u.name, u.email, u.personal_id, p.patient_id, p.age, p.gender, p.address, p.contact_no
       FROM users u
       JOIN patients p ON u.id = p.patient_id
       WHERE p.patient_id = ?`,
      [patientId],
    )

    if (!patients || !Array.isArray(patients) || patients.length === 0) {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json({ patient: patients[0] })
  } catch (error) {
    console.error("Error fetching patient details:", error)
    return NextResponse.json({ message: "An error occurred while fetching patient details" }, { status: 500 })
  }
}
