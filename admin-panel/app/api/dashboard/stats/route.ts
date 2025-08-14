import { NextResponse } from "next/server"
import { getMedicineStats, getDoctorStats, getVendingMachineStats } from "@/lib/data"

export async function GET() {
  try {
    const medicineStats = await getMedicineStats()
    const doctorStats = await getDoctorStats()
    const vendingMachineStats = await getVendingMachineStats()

    return NextResponse.json({
      medicines: medicineStats,
      doctors: doctorStats,
      vendingMachines: vendingMachineStats,
    })
  } catch (error) {
    console.error("Error in dashboard stats API:", error)
    return NextResponse.json(
      {
        medicines: { totalMedicines: 0, lowStockCount: 0 },
        doctors: { totalDoctors: 0, totalPrescriptions: 0 },
        vendingMachines: { totalMachines: 0, lowStockMachines: 0 },
      },
      { status: 500 },
    )
  }
}
