import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const userId = cookies().get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get all patients assigned to this doctor
    const patients = await db.query(
      `SELECT u.id, u.name, u.email, u.personal_id, p.patient_id, 
       COALESCE(p.age, 0) as age, 
       COALESCE(p.gender, 'Unknown') as gender, 
       COALESCE(p.address, 'Unknown') as address, 
       COALESCE(p.contact_no, 'Unknown') as contact_no,
       (SELECT COUNT(*) FROM prescriptions WHERE doctor_id = ? AND patient_id = p.patient_id AND status = 'pending') as pendingPrescriptions
       FROM users u
       JOIN patients p ON u.id = p.patient_id
       JOIN doctor_patient dp ON p.patient_id = dp.patient_id
       WHERE dp.doctor_id = ?
       ORDER BY u.name`,
      [userId, userId],
    )

    return NextResponse.json({ patients })
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ message: "An error occurred while fetching patients" }, { status: 500 })
  }
}
