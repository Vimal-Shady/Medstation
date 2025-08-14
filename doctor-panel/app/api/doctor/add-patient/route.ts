import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const userId = cookies().get("user_id")?.value
    const { patientId } = await request.json()

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!patientId) {
      return NextResponse.json({ message: "Patient ID is required" }, { status: 400 })
    }

    // Check if the patient exists by personal_id
    const patients = await db.query("SELECT id FROM users WHERE personal_id = ? AND role = 'patient'", [patientId])

    if (!patients || !Array.isArray(patients) || patients.length === 0) {
      return NextResponse.json({ message: "Patient not found with this ID" }, { status: 404 })
    }

    const patientUserId = patients[0].id

    // Check if patient has an entry in the patients table
    const patientRecords = await db.query("SELECT patient_id FROM patients WHERE patient_id = ?", [patientUserId])

    // If no patient record exists, create one
    if (!patientRecords || !Array.isArray(patientRecords) || patientRecords.length === 0) {
      await db.query(
        "INSERT INTO patients (patient_id, age, gender, address, contact_no) VALUES (?, 0, 'Unknown', 'Unknown', 'Unknown')",
        [patientUserId],
      )
    }

    // Check if the patient is already assigned to this doctor
    const assignments = await db.query("SELECT * FROM doctor_patient WHERE doctor_id = ? AND patient_id = ?", [
      userId,
      patientUserId,
    ])

    if (assignments && Array.isArray(assignments) && assignments.length > 0) {
      return NextResponse.json({ message: "Patient is already assigned to you" }, { status: 400 })
    }

    // Assign the patient to the doctor
    await db.query("INSERT INTO doctor_patient (doctor_id, patient_id) VALUES (?, ?)", [userId, patientUserId])

    return NextResponse.json({
      success: true,
      message: "Patient added successfully",
      patientId: patientUserId,
    })
  } catch (error) {
    console.error("Error adding patient:", error)
    return NextResponse.json({ message: "An error occurred while adding the patient" }, { status: 500 })
  }
}
