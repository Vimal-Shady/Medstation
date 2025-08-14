import mysql from "mysql2/promise"

// Database connection
async function getConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "medico",
  })
}

// Get medicine statistics
export async function getMedicineStats() {
  try {
    const connection = await getConnection()
    const [rows] = (await connection.execute("SELECT * FROM medicines")) as [any[], any]
    await connection.end()

    const totalMedicines = rows.length
    const lowStockCount = rows.filter((med) => med.stock_quantity < 20).length

    return {
      totalMedicines,
      lowStockCount,
    }
  } catch (error) {
    console.error("Error getting medicine stats:", error)
    return {
      totalMedicines: 0,
      lowStockCount: 0,
    }
  }
}

// Get doctor statistics
export async function getDoctorStats() {
  try {
    const connection = await getConnection()

    const [doctorRows] = (await connection.execute("SELECT COUNT(*) as count FROM doctors")) as [any[], any]
    const [prescriptionRows] = (await connection.execute("SELECT COUNT(*) as count FROM prescriptions")) as [any[], any]

    await connection.end()

    return {
      totalDoctors: doctorRows[0]?.count || 0,
      totalPrescriptions: prescriptionRows[0]?.count || 0,
    }
  } catch (error) {
    console.error("Error getting doctor stats:", error)
    return {
      totalDoctors: 0,
      totalPrescriptions: 0,
    }
  }
}

// Get vending machine statistics
export async function getVendingMachineStats() {
  try {
    const connection = await getConnection()

    const [machineRows] = (await connection.execute("SELECT COUNT(*) as count FROM vending_machines")) as [any[], any]

    // Count machines with low stock (any medicine below threshold)
    const [lowStockRows] = (await connection.execute(`
      SELECT COUNT(DISTINCT vm.machine_code) as count
      FROM vending_machines vm
      JOIN vending_machine_medicines vmm ON vm.machine_code = vmm.machine_code
      JOIN medicines m ON vmm.medicine_id = m.medicine_id
      WHERE vmm.quantity < (m.stock_quantity * 0.2)
    `)) as [any[], any]

    await connection.end()

    return {
      totalMachines: machineRows[0]?.count || 0,
      lowStockMachines: lowStockRows[0]?.count || 0,
    }
  } catch (error) {
    console.error("Error getting vending machine stats:", error)
    return {
      totalMachines: 0,
      lowStockMachines: 0,
    }
  }
}

// Get all medicines
export async function getMedicines() {
  try {
    const connection = await getConnection()
    const [rows] = (await connection.execute("SELECT * FROM medicines")) as [any[], any]
    await connection.end()
    return rows
  } catch (error) {
    console.error("Error fetching medicines:", error)
    return []
  }
}

// Get medicine by ID
export async function getMedicineById(id: number) {
  try {
    const connection = await getConnection()
    const [rows] = (await connection.execute("SELECT * FROM medicines WHERE medicine_id = ?", [id])) as [any[], any]
    await connection.end()
    return rows[0] || null
  } catch (error) {
    console.error(`Error fetching medicine with ID ${id}:`, error)
    return null
  }
}

// Get all vending machines with their medicines
export async function getVendingMachines() {
  try {
    const connection = await getConnection()

    // Get all vending machines
    const [machines] = (await connection.execute(`
      SELECT vm.*, 
             COUNT(vmm.medicine_id) as medicineCount,
             EXISTS (
               SELECT 1 FROM vending_machine_medicines vmm2
               JOIN medicines m ON vmm2.medicine_id = m.medicine_id
               WHERE vmm2.machine_code = vm.machine_code
               AND vmm2.quantity < (m.stock_quantity * 0.2)
             ) as hasLowStock
      FROM vending_machines vm
      LEFT JOIN vending_machine_medicines vmm ON vm.machine_code = vmm.machine_code
      GROUP BY vm.machine_code
    `)) as [any[], any]

    await connection.end()
    return machines
  } catch (error) {
    console.error("Error fetching vending machines:", error)
    return []
  }
}

// Get vending machine by code with its medicines
export async function getVendingMachineByCode(code: string) {
  try {
    const connection = await getConnection()

    // Get the vending machine
    const [machineRows] = (await connection.execute("SELECT * FROM vending_machines WHERE machine_code = ?", [
      code,
    ])) as [any[], any]

    if (machineRows.length === 0) {
      await connection.end()
      return null
    }

    const machine = machineRows[0]

    // Get its medicines
    const [medicineRows] = (await connection.execute(
      `SELECT m.*, vmm.quantity 
       FROM medicines m
       JOIN vending_machine_medicines vmm ON m.medicine_id = vmm.medicine_id
       WHERE vmm.machine_code = ?`,
      [code],
    )) as [any[], any]

    machine.medicines = medicineRows

    await connection.end()
    return machine
  } catch (error) {
    console.error(`Error fetching vending machine with code ${code}:`, error)
    return null
  }
}

// Get all doctors with patient and prescription counts
export async function getDoctors() {
  try {
    const connection = await getConnection()

    const [rows] = (await connection.execute(
      `SELECT d.*, u.name, u.email,
       (SELECT COUNT(*) FROM doctor_patient dp WHERE dp.doctor_id = d.doctor_id) AS patientCount,
       (SELECT COUNT(*) FROM prescriptions p WHERE p.doctor_id = d.doctor_id) AS prescriptionCount
       FROM doctors d
       JOIN users u ON d.doctor_id = u.id`,
    )) as [any[], any]

    await connection.end()
    return rows
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return []
  }
}

// Get doctor by ID with patient and prescription counts
export async function getDoctorById(id: number) {
  try {
    const connection = await getConnection()

    const [rows] = (await connection.execute(
      `SELECT d.*, u.name, u.email,
       (SELECT COUNT(*) FROM doctor_patient dp WHERE dp.doctor_id = d.doctor_id) AS patientCount,
       (SELECT COUNT(*) FROM prescriptions p WHERE p.doctor_id = d.doctor_id) AS prescriptionCount
       FROM doctors d
       JOIN users u ON d.doctor_id = u.id
       WHERE d.doctor_id = ?`,
      [id],
    )) as [any[], any]

    await connection.end()
    return rows[0] || null
  } catch (error) {
    console.error(`Error fetching doctor with ID ${id}:`, error)
    return null
  }
}

// Get prescriptions for a doctor
export async function getDoctorPrescriptions(doctorId: number) {
  try {
    const connection = await getConnection()

    const [rows] = (await connection.execute(
      `SELECT p.*, m.name AS medicine_name, u.name AS patient_name
       FROM prescriptions p
       JOIN medicines m ON p.medicine_id = m.medicine_id
       JOIN users u ON p.patient_id = u.id
       WHERE p.doctor_id = ?
       ORDER BY p.prescribed_at DESC`,
      [doctorId],
    )) as [any[], any]

    await connection.end()
    return rows
  } catch (error) {
    console.error(`Error fetching prescriptions for doctor ${doctorId}:`, error)
    return []
  }
}

// Fix the getRecentPrescriptions function to correctly query prescription items
export async function getRecentPrescriptions(limit = 5) {
  try {
    const connection = await getConnection()

    const [rows] = (await connection.execute(
      `SELECT p.prescription_id, 
             u.name as patient_name, 
             m.name as medicine_name, 
             pi.quantity,
             m.price
      FROM prescriptions p
      JOIN prescription_items pi ON p.prescription_id = pi.prescription_id
      JOIN medicines m ON pi.medicine_id = m.medicine_id
      JOIN patients pt ON p.patient_id = pt.patient_id
      JOIN users u ON pt.patient_id = u.id
      ORDER BY p.prescribed_at DESC
      LIMIT ?`,
      [limit],
    )) as [any[], any]

    await connection.end()
    return rows || [] // Ensure we always return an array
  } catch (error) {
    console.error("Error fetching recent prescriptions:", error)
    return [] // Return empty array on error
  }
}

// Get notifications
export async function getNotifications() {
  try {
    const connection = await getConnection()

    // Check if notifications table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'notifications'")
    const tablesArray = tables as any[]

    if (tablesArray.length === 0) {
      // Create notifications table if it doesn't exist
      await connection.execute(`
        CREATE TABLE notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          message VARCHAR(255) NOT NULL,
          machine_code VARCHAR(50),
          medicine_id INT,
          medicine_name VARCHAR(100),
          \`read\` BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (machine_code) REFERENCES vending_machines(machine_code) ON DELETE CASCADE,
          FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
        )
      `)
      await connection.end()
      return []
    }

    const [rows] = (await connection.execute(`SELECT * FROM notifications ORDER BY created_at DESC`)) as [any[], any]

    await connection.end()
    return rows
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

// Get medicine chart data
export async function getMedicineChartData() {
  try {
    const connection = await getConnection()

    // Get all medicines from the database
    const [rows] = (await connection.execute(`SELECT name, stock_quantity FROM medicines`)) as [any[], any]

    await connection.end()

    // Format data for the chart and ensure it's an array
    return Array.isArray(rows)
      ? rows.map((medicine: any) => ({
          name: medicine.name,
          value: medicine.stock_quantity,
        }))
      : []
  } catch (error) {
    console.error("Error fetching medicine chart data:", error)
    return [] // Return empty array on error
  }
}

// Add a function to create a new doctor
export async function createDoctor(userData: any, doctorData: any) {
  try {
    const connection = await getConnection()

    // Start transaction
    await connection.beginTransaction()

    try {
      // Insert into users table first
      const [userResult] = await connection.execute(
        "INSERT INTO users (name, email, password, role, personal_id) VALUES (?, ?, ?, 'doctor', ?)",
        [userData.name, userData.email, userData.password || "", userData.personal_id],
      )

      // Get the inserted user ID
      const userId = (userResult as any).insertId

      // Insert into doctors table
      await connection.execute("INSERT INTO doctors (doctor_id, specialization, contact_no) VALUES (?, ?, ?)", [
        userId,
        doctorData.specialization,
        doctorData.contact_no,
      ])

      // Commit the transaction
      await connection.commit()

      await connection.end()
      return { success: true, doctorId: userId }
    } catch (error) {
      // Rollback in case of error
      await connection.rollback()
      throw error
    }
  } catch (error) {
    console.error("Error creating doctor:", error)
    return { success: false, error: "Failed to create doctor" }
  }
}
