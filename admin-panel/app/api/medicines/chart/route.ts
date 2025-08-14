import { NextResponse } from "next/server"
import { getMedicineChartData } from "@/lib/data"

export async function GET() {
  try {
    const data = await getMedicineChartData()

    // Ensure we're returning an array
    return NextResponse.json(Array.isArray(data) ? data : [])
  } catch (error) {
    console.error("Error in medicine chart API:", error)
    return NextResponse.json([], { status: 500 })
  }
}
