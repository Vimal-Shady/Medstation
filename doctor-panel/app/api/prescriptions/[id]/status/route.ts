import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = cookies().get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const prescriptionId = params.id
    const { status } = await request.json()

    if (status !== "pending" && status !== "purchased") {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    // Check if the prescription exists and belongs to this doctor
    const prescriptions = await db.query("SELECT * FROM prescriptions WHERE prescription_id = ? AND doctor_id = ?", [
      prescriptionId,
      userId,
    ])

    if (!prescriptions || !Array.isArray(prescriptions) || prescriptions.length === 0) {
      return NextResponse.json({ message: "Prescription not found or not authorized" }, { status: 404 })
    }

    return await db.transaction(async (connection) => {
      // Update the prescription status
      await connection.execute("UPDATE prescriptions SET status = ? WHERE prescription_id = ?", [
        status,
        prescriptionId,
      ])

      // Update the corresponding purchase history records
      const paymentStatus = status === "purchased" ? "completed" : "pending"
      await connection.execute("UPDATE purchase_history SET payment_status = ? WHERE prescription_id = ?", [
        paymentStatus,
        prescriptionId,
      ])

      return NextResponse.json({
        message: "Status updated successfully",
        details: "Both prescription and payment status have been updated",
      })
    })
  } catch (error) {
    console.error("Error updating prescription status:", error)
    return NextResponse.json({ message: "An error occurred while updating the status" }, { status: 500 })
  }
}
