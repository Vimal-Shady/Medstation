import { NextResponse } from "next/server"
import { getRecentPrescriptions } from "@/lib/data"

export async function GET() {
  try {
    const data = await getRecentPrescriptions(5)

    // Ensure we're returning an array
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error("Error in recent prescriptions API:", error)
    return NextResponse.json([], { status: 500 })
  }
}
