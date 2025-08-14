import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const userId = cookies().get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get doctor profile
    const profiles = await db.query(
      `SELECT u.id, u.name, u.email, u.personal_id, u.created_at, 
       d.specialization, d.contact_no
       FROM users u
       JOIN doctors d ON u.id = d.doctor_id
       WHERE u.id = ?`,
      [userId],
    )

    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
      return NextResponse.json({ message: "Doctor profile not found" }, { status: 404 })
    }

    return NextResponse.json({ profile: profiles[0] })
  } catch (error) {
    console.error("Error fetching doctor profile:", error)
    return NextResponse.json({ message: "An error occurred while fetching profile" }, { status: 500 })
  }
}
