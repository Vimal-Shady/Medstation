import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const userId = cookies().get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get all medicines
    const medicines = await db.query(
      "SELECT medicine_id, name, description, stock_quantity, price FROM medicines ORDER BY name",
    )

    return NextResponse.json({ medicines })
  } catch (error) {
    console.error("Error fetching medicines:", error)
    return NextResponse.json({ message: "An error occurred while fetching medicines" }, { status: 500 })
  }
}
