import { jsPDF } from "jspdf"
import "jspdf-autotable"

export const generatePrescriptionPDF = (prescription, unavailableMedicines, patientInfo) => {
  if (!prescription || !unavailableMedicines) {
    console.error("Missing required data for PDF generation")
    return
  }

  const doc = new jsPDF()
  // Define consistent margins and spacing
  const leftMargin = 20
  const rightColumnX = 115
  const lineHeight = 7
  const sectionSpacing = 12
  
  // Add hospital/pharmacy logo or header
  doc.setFillColor(67, 133, 200) // Professional blue color
  doc.rect(0, 0, 210, 30, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.text("Medstation Prescription", 105, 15, { align: "center" })

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Add prescription information - Improved alignment
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("UNAVAILABLE MEDICINES PRESCRIPTION", 105, 40, { align: "center" })
  
  // Add a divider line below the title
  doc.setLineWidth(0.5)
  doc.line(leftMargin, 45, 190, 45)
  
  // Start y position for patient and prescription information
  let yPosition = 55

  // SECTION: PATIENT AND PRESCRIPTION INFORMATION
  // Create two-column layout with clean alignment

  // Left column - Patient details with improved alignment
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Patient Information:", leftMargin, yPosition)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  // Prepare patient data
  const patientName = patientInfo?.name || "Twinsriram V"
  const patientId = patientInfo?.patient_id || prescription?.patient_id || "7"
  const patientAge = patientInfo?.age || "18"
  const patientGender = patientInfo?.gender || "Male"
  const patientContact = patientInfo?.contact_no || "9042170801"
  const patientAddress = patientInfo?.address || "Dharmapuri"

  // Set consistent column width for labels
  const labelWidth = 25
  
  yPosition += lineHeight + 3
  doc.text("Name:", leftMargin, yPosition)
  doc.text(String(patientName), leftMargin + labelWidth, yPosition)
  
  yPosition += lineHeight
  doc.text("Patient ID:", leftMargin, yPosition)
  doc.text(String(patientId), leftMargin + labelWidth, yPosition)
  
  yPosition += lineHeight
  doc.text("Age:", leftMargin, yPosition)
  doc.text(String(patientAge), leftMargin + labelWidth, yPosition)
  
  yPosition += lineHeight
  doc.text("Gender:", leftMargin, yPosition)
  doc.text(String(patientGender), leftMargin + labelWidth, yPosition)
  
  yPosition += lineHeight
  doc.text("Contact:", leftMargin, yPosition)
  doc.text(String(patientContact), leftMargin + labelWidth, yPosition)
  
  yPosition += lineHeight
  doc.text("Address:", leftMargin, yPosition)
  doc.text(String(patientAddress), leftMargin + labelWidth, yPosition)

   yPosition += lineHeight
  yPosition = 110
  // Right column - Prescription details with improved alignment
  yPosition = 55
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Prescription Information:", rightColumnX, yPosition)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  
  // Format date properly
  let formattedDate = "10/05/2025"
  if (prescription.prescribed_at) {
    const date = new Date(prescription.prescribed_at)
    if (!isNaN(date.getTime())) {
      formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    }
  }

  const doctorName = prescription.doctor_name || "Dr. Smith"
  const doctorId = String(prescription.doctor_id || "1")
  const doctorSpecialty = "Cardiology"
  const prescriptionId = String(prescription.prescription_id || "57")
  
  // Set consistent column width for labels in right column
  const rightLabelWidth = 35
  
  yPosition += lineHeight + 3
  doc.text("Prescription ID:", rightColumnX, yPosition)
  doc.text(String(prescriptionId), rightColumnX + rightLabelWidth, yPosition)
  
  yPosition += lineHeight
  doc.text("Date:", rightColumnX, yPosition)
  doc.text(String(formattedDate), rightColumnX + rightLabelWidth, yPosition)
  
  yPosition += lineHeight
  doc.text("Doctor:", rightColumnX, yPosition)
  doc.text(String(doctorName), rightColumnX + rightLabelWidth, yPosition)
  
  yPosition += lineHeight
  doc.text("Doctor ID:", rightColumnX, yPosition)
  doc.text(String(doctorId), rightColumnX + rightLabelWidth, yPosition)
  
  yPosition += lineHeight
  doc.text("Specialization:", rightColumnX, yPosition)
  doc.text(String(doctorSpecialty), rightColumnX + rightLabelWidth, yPosition)

  // Add a divider line below the personal information section
   yPosition += lineHeight
  yPosition = 110
  doc.setLineWidth(0.5)
  doc.line(leftMargin, 100, 190, 100)
  
  // SECTION: INSTRUCTIONS
  // Add instructions if available - Improved formatting
  yPosition += lineHeight
  yPosition = 110
  const instructions =
    prescription.instructions && prescription.instructions !== "....."
      ? prescription.instructions
      : "Take medications as prescribed. Follow up in two weeks."

  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Instructions:", leftMargin, yPosition)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)

  // Handle long instructions by wrapping text with better alignment
  yPosition += lineHeight
  const splitInstructions = doc.splitTextToSize(instructions, 170)
  doc.text(splitInstructions, leftMargin, yPosition)

  // Current date with improved positioning
  yPosition += splitInstructions.length * 6 + 5
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  doc.text(`Generated on: ${String(currentDate)}`, leftMargin, yPosition)

  // Add a divider line below the instructions section
  doc.line(leftMargin, yPosition + 5, 190, yPosition + 5)
  
  // SECTION: UNAVAILABLE MEDICINES TABLE
  // Add unavailable medicines table with better spacing
  yPosition += sectionSpacing
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
 
  doc.text("Unavailable Medicines", leftMargin, yPosition)
  doc.setFontSize(10)

  // Setup the table
  const tableColumn = ["Medicine Name", "Dosage", "Quantity", "Estimated Price"]

  // Ensure we have medicine data
  const medicineData =
    unavailableMedicines.length > 0
      ? unavailableMedicines
      : [
          {
            medicine_name: "Citracin",
            description: "Standard Dosage",
            quantity: 8,
            price: 20,
          },
          {
            medicine_name: "DOLO",
            description: "Standard Dosage",
            quantity: 8,
            price: 20,
          },
        ]

  // Format the data
  const tableRows = medicineData.map((medicine) => [
    String(medicine.medicine_name || "Not Available"),
    String(medicine.description || "Standard Dosage"),
    String(medicine.quantity || 0),
    `${medicine.price ? (medicine.price * medicine.quantity).toFixed(2) : "0.00"}`,
  ])

  // Calculate total estimated amount
  const totalEstimatedAmount = medicineData.reduce((total, medicine) => {
    return total + (medicine.price * medicine.quantity || 0)
  }, 0)

  // Add the table with professional styling
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: yPosition + 5,
    theme: "grid",
    styles: { fontSize: 9.5, cellPadding: 3, textColor: [50, 50, 50] }, // Slightly dark font color
    headStyles: { fillColor: [67, 133, 200], textColor: [255, 255, 255], fontStyle: 'bold' },
    foot: [["", "", "Total Estimated Amount:", `$${totalEstimatedAmount.toFixed(2)}`]],
    footStyles: { 
      fillColor: [220, 220, 220], // Lighter grey background
      textColor: [0, 0, 0],      // Black text
      fontStyle: "bold",
      fontSize: 10.5            // Slightly larger font size
    },
    margin: { left: leftMargin, right: leftMargin },
    tableWidth: 170,
  })

  // SECTION: NOTES AND SIGNATURE
  // Add note about unavailability with improved spacing
  const tableEndY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(9)
  doc.setFont("helvetica", "italic")
  doc.text(
    "Note: This prescription is for medicines that are currently unavailable in our vending machines.",
    leftMargin,
    tableEndY,
  )
  doc.text(
    "Please take this prescription to your nearest pharmacy to fulfill your medication needs.",
    leftMargin,
    tableEndY + 5,
  )
  
  // Add a divider line above signature section
  doc.setLineWidth(0.5) 
  doc.line(leftMargin, tableEndY + 12, 190, tableEndY + 12)
  
  // Add signature area with improved layout and doctor name in italic
  const signatureY = tableEndY + 30
  
  doc.setFontSize(10)
  
  // Doctor signature section
  doc.line(leftMargin, signatureY, leftMargin + 60, signatureY)
  doc.setFont("helvetica", "italic")
  doc.text(String(doctorName), leftMargin + 15, signatureY - 5) // Center doctor name above line
  doc.setFont("helvetica", "normal")
  doc.text("Doctor's Signature", leftMargin + 5, signatureY + 5)

  // Pharmacy stamp section
  doc.line(rightColumnX, signatureY, rightColumnX + 60, signatureY)
  doc.text("Pharmacy Stamp", rightColumnX + 10, signatureY + 5)

  // Add footer with blue bar
  doc.setFillColor(67, 133, 200)
  doc.rect(0, 280, 210, 15, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.text("MediVend Automated Pharmacy System", 105, 287, { align: "center" })
  doc.text("This is a computer-generated prescription and does not require a physical signature.", 105, 292, {
    align: "center",
  })

  // Save the PDF
  doc.save(`Prescription_${prescription.prescription_id}_UnavailableMedicines.pdf`)
}
