import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const userId = cookies().get("user_id")?.value
    const url = new URL(request.url)
    const limit = url.searchParams.get("limit") ? Number.parseInt(url.searchParams.get("limit") as string) : undefined

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Build the query with optional limit
    let query = `
      SELECT 
        p.prescription_id, 
        p.doctor_id, 
        p.patient_id, 
        p.status, 
        p.prescribed_at, 
        p.instructions,
        u.name as patient_name,
        GROUP_CONCAT(CONCAT(m.name, ' (', pi.quantity, ')') SEPARATOR ', ') as medicines
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.patient_id
      JOIN users u ON pt.patient_id = u.id
      JOIN prescription_items pi ON p.prescription_id = pi.prescription_id
      JOIN medicines m ON pi.medicine_id = m.medicine_id
      WHERE p.doctor_id = ?
      GROUP BY p.prescription_id
      ORDER BY p.prescribed_at DESC`

    const params = [userId]

    if (limit) {
      query += " LIMIT ?"
      params.push(limit)
    }

    // Get prescriptions for this doctor
    const prescriptions = await db.query(query, params)

    return NextResponse.json({ prescriptions })
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    return NextResponse.json({ message: "An error occurred while fetching prescriptions" }, { status: 500 })
  }
}
