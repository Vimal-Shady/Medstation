"use server"

import { revalidatePath } from "next/cache"
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

// Create new medicine
export async function createMedicine(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const stock = Number(formData.get("stock"))
  const price = Number(formData.get("price"))

  try {
    const connection = await getConnection()
    await connection.execute("INSERT INTO medicines (name, description, stock_quantity, price) VALUES (?, ?, ?, ?)", [
      name,
      description,
      stock,
      price,
    ])
    await connection.end()

    revalidatePath("/medicines")
    revalidatePath("/api/medicines/chart")
    return { success: true }
  } catch (error) {
    console.error("Error creating medicine:", error)
    return { success: false, error: "Failed to create medicine" }
  }
}

// Update medicine
export async function updateMedicine(formData: FormData) {
  const medicineId = formData.get("medicineId") as string
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const stock = Number(formData.get("stock"))
  const price = Number(formData.get("price"))

  try {
    const connection = await getConnection()
    await connection.execute(
      "UPDATE medicines SET name = ?, description = ?, stock_quantity = ?, price = ? WHERE medicine_id = ?",
      [name, description, stock, price, medicineId],
    )
    await connection.end()

    revalidatePath("/medicines")
    revalidatePath(`/medicines/${medicineId}`)
    revalidatePath("/api/medicines/chart")
    return { success: true }
  } catch (error) {
    console.error("Error updating medicine:", error)
    return { success: false, error: "Failed to update medicine" }
  }
}

// Delete a medicine
// export async function deleteMedicine(formData: FormData) {
//   const id = formData.get("id") as string

//   try {
//     const connection = await getConnection()
//     await connection.execute("DELETE FROM medicines WHERE medicine_id = ?", [id])
//     await connection.end()

//     revalidatePath("/medicines")
//     return { success: true }
//   } catch (error) {
//     console.error("Error deleting medicine:", error)
//     return { success: false, error: "Failed to delete medicine" }
//   }
// }

// Create new vending machine
export async function createVendingMachine(formData: FormData) {
  const machineCode = formData.get("machineCode") as string
  const location = formData.get("location") as string

  try {
    const connection = await getConnection()
    await connection.execute("INSERT INTO vending_machines (machine_code, location) VALUES (?, ?)", [
      machineCode,
      location,
    ])
    await connection.end()

    revalidatePath("/vending-machines")
    return { success: true }
  } catch (error) {
    console.error("Error creating vending machine:", error)
    return { success: false, error: "Failed to create vending machine" }
  }
}

// Add medicine to vending machine
export async function addMedicineToVendingMachine(formData: FormData) {
  const machineCode = formData.get("machineCode") as string
  const medicineId = formData.get("medicineId") as string
  const quantity = Number(formData.get("quantity"))

  try {
    const connection = await getConnection()

    // Check if medicine exists in the vending machine
    const [existingRows] = (await connection.execute(
      "SELECT * FROM vending_machine_medicines WHERE machine_code = ? AND medicine_id = ?",
      [machineCode, medicineId],
    )) as [any[], any]

    // Check if we have enough stock
    const [medicineRows] = (await connection.execute(
      "SELECT stock_quantity, name FROM medicines WHERE medicine_id = ?",
      [medicineId],
    )) as [any[], any]

    if (medicineRows.length === 0) {
      await connection.end()
      return { success: false, error: "Medicine not found" }
    }

    const stockQuantity = medicineRows[0].stock_quantity
    const medicineName = medicineRows[0].name

    if (quantity > stockQuantity) {
      await connection.end()
      return { success: false, error: "Not enough stock available" }
    }

    if (existingRows.length > 0) {
      // Update existing record
      await connection.execute(
        "UPDATE vending_machine_medicines SET quantity = ? WHERE machine_code = ? AND medicine_id = ?",
        [quantity, machineCode, medicineId],
      )
    } else {
      // Insert new record
      await connection.execute(
        "INSERT INTO vending_machine_medicines (machine_code, medicine_id, quantity) VALUES (?, ?, ?)",
        [machineCode, medicineId, quantity],
      )
    }

    // Check if stock is low (20% threshold)
    if (quantity <= stockQuantity * 0.2) {
      // Create notification
      await createNotification(
        `Low stock alert: ${medicineName} in machine ${machineCode} (${quantity}/${stockQuantity})`,
        machineCode,
        medicineId,
        medicineName,
      )
    }

    await connection.end()

    revalidatePath(`/vending-machines/${machineCode}`)
    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    console.error("Error adding medicine to vending machine:", error)
    return { success: false, error: "Failed to add medicine to vending machine" }
  }
}

// Update vending machine medicine quantity
export async function updateVendingMachineMedicine(formData: FormData) {
  const machineCode = formData.get("machineCode") as string
  const medicineId = formData.get("medicineId") as string
  const quantity = Number(formData.get("quantity"))

  try {
    const connection = await getConnection()

    // Get medicine details
    const [medicineRows] = (await connection.execute(
      "SELECT name, stock_quantity FROM medicines WHERE medicine_id = ?",
      [medicineId],
    )) as [any[], any]

    if (medicineRows.length === 0) {
      await connection.end()
      return { success: false, error: "Medicine not found" }
    }

    const medicineName = medicineRows[0].name
    const stockQuantity = medicineRows[0].stock_quantity

    if (quantity > stockQuantity) {
      await connection.end()
      return { success: false, error: "Not enough stock available" }
    }

    // Update quantity
    await connection.execute(
      "UPDATE vending_machine_medicines SET quantity = ? WHERE machine_code = ? AND medicine_id = ?",
      [quantity, machineCode, medicineId],
    )

    // Check if stock is low (20% threshold)
    if (quantity <= stockQuantity * 0.2) {
      // Create notification
      await createNotification(
        `Low stock alert: ${medicineName} in machine ${machineCode} (${quantity}/${stockQuantity})`,
        machineCode,
        medicineId,
        medicineName,
      )
    }

    await connection.end()

    revalidatePath(`/vending-machines/${machineCode}`)
    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    console.error("Error updating vending machine medicine:", error)
    return { success: false, error: "Failed to update medicine quantity" }
  }
}

// Create notification
async function createNotification(message: string, machineCode: string, medicineId: string, medicineName: string) {
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
    }

    await connection.execute(
      "INSERT INTO notifications (message, machine_code, medicine_id, medicine_name) VALUES (?, ?, ?, ?)",
      [message, machineCode, medicineId, medicineName],
    )

    await connection.end()
  } catch (error) {
    console.error("Error creating notification:", error)
  }
}

// Mark notification as read
export async function markNotificationAsRead(formData: FormData) {
  const notificationId = formData.get("notificationId") as string

  try {
    const connection = await getConnection()
    await connection.execute("UPDATE notifications SET `read` = TRUE WHERE id = ?", [notificationId])
    await connection.end()

    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error: "Failed to update notification" }
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  try {
    const connection = await getConnection()
    await connection.execute("UPDATE notifications SET `read` = TRUE WHERE `read` = FALSE")
    await connection.end()

    revalidatePath("/notifications")
    return { success: true }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, error: "Failed to update notifications" }
  }
}

// Add the createDoctor server action
export async function createDoctor(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const specialization = formData.get("specialization") as string
  const contactNo = formData.get("contactNo") as string

  // Generate a unique personal ID with timestamp to avoid duplicates
  const timestamp = Date.now().toString().slice(-6)
  const personalId = `DOC${timestamp}`

  try {
    const connection = await getConnection()

    // Start transaction
    await connection.beginTransaction()

    try {
      // Insert into users table first
      const [userResult] = await connection.execute(
        "INSERT INTO users (name, email, password, role, personal_id) VALUES (?, ?, '', 'doctor', ?)",
        [name, email, personalId],
      )

      // Get the inserted user ID
      const userId = (userResult as any).insertId

      // Insert into doctors table
      await connection.execute("INSERT INTO doctors (doctor_id, specialization, contact_no) VALUES (?, ?, ?)", [
        userId,
        specialization,
        contactNo,
      ])

      // Commit the transaction
      await connection.commit()

      await connection.end()

      revalidatePath("/doctors")
      return { success: true }
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

// Add the updateDoctor server action
export async function updateDoctor(formData: FormData) {
  const doctorId = formData.get("doctorId") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const specialization = formData.get("specialization") as string
  const contactNo = formData.get("contactNo") as string

  try {
    const connection = await getConnection()

    // Start transaction
    await connection.beginTransaction()

    try {
      // Update users table
      await connection.execute("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, doctorId])

      // Update doctors table
      await connection.execute("UPDATE doctors SET specialization = ?, contact_no = ? WHERE doctor_id = ?", [
        specialization,
        contactNo,
        doctorId,
      ])

      // Commit the transaction
      await connection.commit()

      await connection.end()

      revalidatePath("/doctors")
      revalidatePath(`/doctors/${doctorId}`)
      return { success: true }
    } catch (error) {
      // Rollback in case of error
      await connection.rollback()
      throw error
    }
  } catch (error) {
    console.error("Error updating doctor:", error)
    return { success: false, error: "Failed to update doctor" }
  }
}
