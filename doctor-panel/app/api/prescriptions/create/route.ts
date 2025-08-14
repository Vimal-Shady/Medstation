import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const userId = cookies().get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { patientId, medicines, instructions } = await request.json()

    if (!patientId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if the patient is assigned to this doctor
    const assignments = await db.query("SELECT * FROM doctor_patient WHERE doctor_id = ? AND patient_id = ?", [
      userId,
      patientId,
    ])

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ message: "Patient not found or not assigned to you" }, { status: 404 })
    }

    // Validate all medicines exist
    for (const item of medicines) {
      if (!item.medicineId || !item.quantity) {
        return NextResponse.json({ message: "Invalid medicine data" }, { status: 400 })
      }

      const medicineExists = await db.query("SELECT * FROM medicines WHERE medicine_id = ?", [item.medicineId])
      if (!medicineExists || !Array.isArray(medicineExists) || medicineExists.length === 0) {
        return NextResponse.json({ message: `Medicine with ID ${item.medicineId} not found` }, { status: 404 })
      }
    }

    return await db.transaction(async (connection) => {
      // Create the prescription
      const [prescriptionResult] = await connection.execute(
        "INSERT INTO prescriptions (doctor_id, patient_id, instructions, status) VALUES (?, ?, ?, 'pending')",
        [userId, patientId, instructions || ""],
      )

      const prescriptionId = prescriptionResult.insertId

      // Add each medicine as a prescription item
      for (const item of medicines) {
        const medicine = await db.query("SELECT * FROM medicines WHERE medicine_id = ?", [item.medicineId])

        // Insert prescription item
        await connection.execute(
          "INSERT INTO prescription_items (prescription_id, medicine_id, quantity) VALUES (?, ?, ?)",
          [prescriptionId, item.medicineId, item.quantity],
        )

        // Calculate the amount based on medicine price and quantity
        const amount = medicine[0].price * item.quantity

        // Create an entry in purchase_history for each medicine
        await connection.execute(
          "INSERT INTO purchase_history (patient_id, medicine_id, quantity, amount, prescription_id, payment_status) VALUES (?, ?, ?, ?, ?, 'pending')",
          [patientId, item.medicineId, item.quantity, amount, prescriptionId],
        )
      }

      return NextResponse.json({
        success: true,
        message: "Prescription created successfully",
        prescriptionId: prescriptionId,
      })
    })
  } catch (error) {
    console.error("Error creating prescription:", error)
    return NextResponse.json({ message: "An error occurred while creating the prescription" }, { status: 500 })
  }
}
