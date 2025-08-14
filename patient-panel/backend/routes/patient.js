const express = require("express")
const router = express.Router()
const db = require("../db")
const crypto = require("crypto")

// Modify the signup route to store password directly in users table
router.post("/signup", (req, res) => {
  const { name, email, password, age, gender, address, contact_no } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing required fields" })
  }

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err)
      return res.status(500).json({ success: false, message: "Database error" })
    }

    // Insert into users table with password directly
    db.query(
      "INSERT INTO users (name, email, role, personal_id, password) VALUES (?, ?, 'patient', ?, ?)",
      [name, email, `PID${Math.floor(Math.random() * 10000)}`, password],
      (err, userResult) => {
        if (err) {
          db.rollback(() => {
            console.error("User insert error:", err)
            return res.status(500).json({ success: false, message: "Signup failed" })
          })
          return
        }

        const userId = userResult.insertId

        // Then insert into patients table
        db.query(
          "INSERT INTO patients (patient_id, age, gender, address, contact_no) VALUES (?, ?, ?, ?, ?)",
          [userId, age, gender, address, contact_no],
          (err) => {
            if (err) {
              db.rollback(() => {
                console.error("Patient insert error:", err)
                return res.status(500).json({ success: false, message: "Signup failed" })
              })
              return
            }

            // Commit the transaction
            db.commit((err) => {
              if (err) {
                db.rollback(() => {
                  console.error("Commit error:", err)
                  return res.status(500).json({ success: false, message: "Signup failed" })
                })
                return
              }

              res.json({ success: true })
            })
          },
        )
      },
    )
  })
})

// Modify the login route to check password in users table and return personal_id
router.post("/login", (req, res) => {
  const { email, password } = req.body

  // Query users table directly for authentication
  db.query(
    `SELECT u.id, u.name, u.email, u.role, u.personal_id 
     FROM users u 
     WHERE u.email = ? AND u.password = ? AND u.role = 'patient'`,
    [email, password],
    (err, results) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
      }

      if (results.length === 0) {
        return res.status(401).json({ success: false, message: "Invalid credentials" })
      }

      res.json({
        success: true,
        patientId: results[0].id,
        name: results[0].name,
        personalId: results[0].personal_id,
      })
    },
  )
})

// Get profile with personal_id
router.get("/profile/:id", (req, res) => {
  db.query(
    `SELECT u.id, u.name, u.email, u.personal_id, p.age, p.gender, p.address, p.contact_no
     FROM users u
     JOIN patients p ON u.id = p.patient_id
     WHERE u.id = ? AND u.role = 'patient'`,
    [req.params.id],
    (err, results) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "Patient not found" })
      }

      res.json(results[0])
    },
  )
})

// Update profile
router.put("/profile/:id", (req, res) => {
  const { name, age, gender, address, contact_no } = req.body

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err)
      return res.status(500).json({ success: false, message: "Database error" })
    }

    // Update users table
    db.query("UPDATE users SET name = ? WHERE id = ? AND role = 'patient'", [name, req.params.id], (err) => {
      if (err) {
        db.rollback(() => {
          console.error("User update error:", err)
          return res.status(500).json({ success: false, message: "Update failed" })
        })
        return
      }

      // Update patients table
      db.query(
        "UPDATE patients SET age = ?, gender = ?, address = ?, contact_no = ? WHERE patient_id = ?",
        [age, gender, address, contact_no, req.params.id],
        (err) => {
          if (err) {
            db.rollback(() => {
              console.error("Patient update error:", err)
              return res.status(500).json({ success: false, message: "Update failed" })
            })
            return
          }

          // Commit the transaction
          db.commit((err) => {
            if (err) {
              db.rollback(() => {
                console.error("Commit error:", err)
                return res.status(500).json({ success: false, message: "Update failed" })
              })
              return
            }

            res.json({ success: true })
          })
        },
      )
    })
  })
})

// Updated to get patient prescriptions with prescription items from the new schema
router.get("/prescriptions/:id", (req, res) => {
  db.query(
    `SELECT p.prescription_id, p.doctor_id, p.patient_id, p.status, p.prescribed_at,
     p.instructions, d.specialization, u.name AS doctor_name
     FROM prescriptions p
     JOIN doctors d ON p.doctor_id = d.doctor_id
     JOIN users u ON d.doctor_id = u.id
     WHERE p.patient_id = ?
     ORDER BY p.prescribed_at DESC`,
    [req.params.id],
    (err, prescriptions) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
      }

      if (prescriptions.length === 0) {
        return res.json([])
      }

      // For each prescription, get all medicine items
      const promises = prescriptions.map((prescription) => {
        return new Promise((resolve, reject) => {
          db.query(
            `SELECT pi.item_id, pi.medicine_id, pi.quantity, 
             m.name AS medicine_name, m.price
             FROM prescription_items pi
             JOIN medicines m ON pi.medicine_id = m.medicine_id
             WHERE pi.prescription_id = ?`,
            [prescription.prescription_id],
            (err, items) => {
              if (err) {
                reject(err)
                return
              }

              prescription.items = items || []
              resolve(prescription)
            },
          )
        })
      })

      Promise.all(promises)
        .then((prescriptionsWithItems) => {
          res.json(prescriptionsWithItems)
        })
        .catch((err) => {
          console.error(err)
          res.status(500).json({ success: false, message: "Error fetching prescription items" })
        })
    },
  )
})

// Get single prescription with items
router.get("/prescription/:id", (req, res) => {
  db.query(
    `SELECT p.prescription_id, p.doctor_id, p.patient_id, p.status, p.prescribed_at,
     p.instructions, u.name AS doctor_name
     FROM prescriptions p
     JOIN users u ON p.doctor_id = u.id
     WHERE p.prescription_id = ?`,
    [req.params.id],
    (err, results) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "Prescription not found" })
      }

      const prescription = results[0]

      // Get prescription items
      db.query(
        `SELECT pi.item_id, pi.medicine_id, pi.quantity, 
         m.name AS medicine_name, m.price
         FROM prescription_items pi
         JOIN medicines m ON pi.medicine_id = m.medicine_id
         WHERE pi.prescription_id = ?`,
        [prescription.prescription_id],
        (err, items) => {
          if (err) {
            console.error(err)
            return res.status(500).json({ success: false, message: "Error fetching prescription items" })
          }

          prescription.items = items
          res.json(prescription)
        },
      )
    },
  )
})

// Updated: Get purchase history with multiple medicines per purchase
router.get("/purchase-history/:id", (req, res) => {
  console.log(`Fetching purchase history for patient ID: ${req.params.id}`)

  // First get all purchases for this patient that are not migrated
  db.query(
    `SELECT p.purchase_id, p.patient_id, p.prescription_id, p.purchase_date,
     p.payment_method, p.payment_status, p.total_amount, p.State, p.qr_code, p.qr_expiration
     FROM purchases p
     WHERE p.patient_id = ? AND p.is_migrated = 0
     ORDER BY p.purchase_date DESC`,
    [req.params.id],
    (err, purchases) => {
      if (err) {
        console.error("Error fetching purchases:", err)
        return res.status(500).json({ success: false, message: "Database error" })
      }

      console.log(`Found ${purchases.length} purchases`)

      if (purchases.length === 0) {
        return res.json([])
      }

      // For each purchase, get all medicine items
      const promises = purchases.map((purchase) => {
        return new Promise((resolve, reject) => {
          // Get purchase items from purchase_items table
          db.query(
            `SELECT pi.item_id, pi.medicine_id, pi.quantity, pi.amount, pi.vending_machine,
             m.name AS medicine_name
             FROM purchase_items pi
             JOIN medicines m ON pi.medicine_id = m.medicine_id
             WHERE pi.purchase_id = ?`,
            [purchase.purchase_id],
            (err, items) => {
              if (err) {
                console.error(`Error fetching items for purchase ${purchase.purchase_id}:`, err)
                reject(err)
                return
              }

              console.log(`Found ${items.length} items for purchase ${purchase.purchase_id}`)

              // If no items found in purchase_items, try to get from purchase_history
              if (items.length === 0) {
                db.query(
                  `SELECT ph.id as item_id, ph.medicine_id, ph.quantity, ph.amount, ph.vending_machine,
                   m.name AS medicine_name
                   FROM purchase_history ph
                   JOIN medicines m ON ph.medicine_id = m.medicine_id
                   WHERE ph.patient_id = ? AND ph.prescription_id = ?`,
                  [purchase.patient_id, purchase.prescription_id],
                  (err, historyItems) => {
                    if (err) {
                      console.error(`Error fetching history items for purchase ${purchase.purchase_id}:`, err)
                      reject(err)
                      return
                    }

                    console.log(`Found ${historyItems.length} history items for purchase ${purchase.purchase_id}`)
                    purchase.items = historyItems || []
                    resolve(purchase)
                  },
                )
              } else {
                purchase.items = items
                resolve(purchase)
              }
            },
          )
        })
      })

      Promise.all(promises)
        .then((purchasesWithItems) => {
          console.log(`Successfully processed ${purchasesWithItems.length} purchases with items`)
          res.json(purchasesWithItems)
        })
        .catch((err) => {
          console.error("Error processing purchases with items:", err)
          res.status(500).json({ success: false, message: "Error fetching purchase items" })
        })
    },
  )
})

// Get available vending machines for prescription items
router.get("/vending-machines/:prescriptionId", (req, res) => {
  // First get the prescription details
  db.query(
    `SELECT p.prescription_id, p.patient_id, p.status
     FROM prescriptions p
     WHERE p.prescription_id = ? AND p.status = 'pending'`,
    [req.params.prescriptionId],
    (err, prescriptions) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
      }

      if (prescriptions.length === 0) {
        return res.status(404).json({ success: false, message: "Prescription not found or already used" })
      }

      const prescription = prescriptions[0]

      // Get all prescription items
      db.query(
        `SELECT pi.item_id, pi.medicine_id, pi.quantity, m.name AS medicine_name, m.price
         FROM prescription_items pi
         JOIN medicines m ON pi.medicine_id = m.medicine_id
         WHERE pi.prescription_id = ?`,
        [prescription.prescription_id],
        (err, items) => {
          if (err) {
            console.error(err)
            return res.status(500).json({ success: false, message: "Error fetching prescription items" })
          }

          // For each item, find vending machines with sufficient stock
          const itemPromises = items.map((item) => {
            return new Promise((resolve, reject) => {
              db.query(
                `SELECT vm.machine_code, vm.location, vmm.quantity AS available_quantity
                 FROM vending_machines vm
                 JOIN vending_machine_medicines vmm ON vm.machine_code = vmm.machine_code
                 WHERE vmm.medicine_id = ? AND vmm.quantity >= ?`,
                [item.medicine_id, item.quantity],
                (err, machines) => {
                  if (err) {
                    reject(err)
                    return
                  }

                  resolve({
                    item: item,
                    machines: machines,
                  })
                },
              )
            })
          })

          Promise.all(itemPromises)
            .then((itemsWithMachines) => {
              // Group items by availability
              const availableItems = []
              const unavailableItems = []

              itemsWithMachines.forEach((result) => {
                if (result.machines && result.machines.length > 0) {
                  availableItems.push({
                    ...result.item,
                    machines: result.machines,
                  })
                } else {
                  unavailableItems.push(result.item)
                }
              })

              res.json({
                prescription: {
                  prescription_id: prescription.prescription_id,
                  patient_id: prescription.patient_id,
                  status: prescription.status,
                },
                availableItems,
                unavailableItems,
              })
            })
            .catch((err) => {
              console.error(err)
              res.status(500).json({ success: false, message: "Error checking medicine availability" })
            })
        },
      )
    },
  )
})

// Updated checkout route for multiple medicines from different vending machines
router.post("/checkout", (req, res) => {
  const { prescriptionId, patientId, items } = req.body

  if (!prescriptionId || !patientId || !items || !items.length) {
    return res.status(400).json({ success: false, message: "Missing required fields" })
  }

  console.log(`Processing checkout for patient ${patientId}, prescription ${prescriptionId}`)
  console.log("Items:", JSON.stringify(items))

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction error:", err)
      return res.status(500).json({ success: false, message: "Database error" })
    }

    // Check if prescription exists and belongs to this patient
    db.query(
      `SELECT prescription_id, patient_id FROM prescriptions 
       WHERE prescription_id = ? AND patient_id = ? AND status = 'pending'`,
      [prescriptionId, patientId],
      (err, prescriptions) => {
        if (err) {
          return db.rollback(() => {
            console.error("Prescription check error:", err)
            res.status(500).json({ success: false, message: "Database error" })
          })
        }

        if (prescriptions.length === 0) {
          return db.rollback(() => {
            res.status(404).json({ success: false, message: "Prescription not found or already used" })
          })
        }

        // Calculate total amount
        let totalAmount = 0
        const paymentMethod = items[0].payment_method // Use the payment method from the first item
        const currentTimestamp = new Date() // Get current timestamp for all records

        // Create a new purchase record with explicit timestamp
        db.query(
          `INSERT INTO purchases 
           (patient_id, prescription_id, payment_method, payment_status, State, total_amount, is_migrated, purchase_date)
           VALUES (?, ?, ?, 'completed', 0, 0, 0, ?)`,
          [patientId, prescriptionId, paymentMethod, currentTimestamp],
          (err, purchaseResult) => {
            if (err) {
              return db.rollback(() => {
                console.error("Purchase creation error:", err)
                res.status(500).json({ success: false, message: "Failed to create purchase" })
              })
            }

            const purchaseId = purchaseResult.insertId
            console.log(`Created purchase with ID: ${purchaseId}`)

            // Process each item
            const purchaseItemPromises = items.map((item) => {
              return new Promise((resolve, reject) => {
                const { medicine_id, quantity, vending_machine } = item

                // Check vending machine stock
                db.query(
                  `SELECT vmm.quantity, m.name, m.price FROM vending_machine_medicines vmm
                   JOIN medicines m ON vmm.medicine_id = m.medicine_id
                   WHERE vmm.machine_code = ? AND vmm.medicine_id = ? AND vmm.quantity >= ?`,
                  [vending_machine, medicine_id, quantity],
                  (err, stockResults) => {
                    if (err) {
                      console.error(`Stock check error for medicine ${medicine_id}:`, err)
                      reject(err)
                      return
                    }

                    if (stockResults.length === 0) {
                      console.error(`Insufficient stock for medicine ${medicine_id} in machine ${vending_machine}`)
                      reject(
                        new Error(
                          `Insufficient stock of medicine ID ${medicine_id} in vending machine ${vending_machine}`,
                        ),
                      )
                      return
                    }

                    const price = stockResults[0].price
                    const medicineName = stockResults[0].name
                    const amount = price * quantity
                    totalAmount += amount

                    console.log(
                      `Processing item: Medicine ${medicineName} (ID ${medicine_id}), Quantity ${quantity}, Amount ${amount}`,
                    )

                    // Create purchase item record
                    db.query(
                      `INSERT INTO purchase_items 
                       (purchase_id, medicine_id, quantity, amount, vending_machine)
                       VALUES (?, ?, ?, ?, ?)`,
                      [purchaseId, medicine_id, quantity, amount, vending_machine],
                      (err, insertResult) => {
                        if (err) {
                          console.error("Purchase item insert error:", err)
                          reject(err)
                          return
                        }

                        console.log(`Inserted purchase item for medicine ${medicine_id}`)

                        // Also insert into purchase_history for backward compatibility with explicit timestamp
                        db.query(
                          `INSERT INTO purchase_history 
                           (patient_id, medicine_id, quantity, amount, vending_machine, payment_method, prescription_id, payment_status, State, purchase_date)
                           VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', 0, ?)`,
                          [
                            patientId,
                            medicine_id,
                            quantity,
                            amount,
                            vending_machine,
                            paymentMethod,
                            prescriptionId,
                            currentTimestamp,
                          ],
                          (err, historyResult) => {
                            if (err) {
                              console.error("Purchase history insert error:", err)
                              reject(err)
                              return
                            }

                            console.log(`Inserted purchase history for medicine ${medicine_id}`)

                            // Update vending machine stock
                            db.query(
                              "UPDATE vending_machine_medicines SET quantity = quantity - ? WHERE machine_code = ? AND medicine_id = ?",
                              [quantity, vending_machine, medicine_id],
                              (err) => {
                                if (err) {
                                  console.error("Vending machine update error:", err)
                                  reject(err)
                                  return
                                }

                                console.log(`Updated stock for medicine ${medicine_id} in machine ${vending_machine}`)
                                resolve({
                                  medicine_id,
                                  medicine_name: medicineName,
                                  quantity,
                                  amount,
                                  vending_machine,
                                })
                              },
                            )
                          },
                        )
                      },
                    )
                  },
                )
              })
            })

            Promise.all(purchaseItemPromises)
              .then((purchaseItems) => {
                // Update the total amount in the purchase record
                db.query(
                  "UPDATE purchases SET total_amount = ? WHERE purchase_id = ?",
                  [totalAmount, purchaseId],
                  (err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error("Purchase total update error:", err)
                        res.status(500).json({ success: false, message: "Failed to update purchase total" })
                      })
                    }

                    console.log(`Updated purchase total amount to ${totalAmount}`)

                    // Mark prescription as purchased
                    db.query(
                      "UPDATE prescriptions SET status = 'purchased' WHERE prescription_id = ?",
                      [prescriptionId],
                      (err) => {
                        if (err) {
                          return db.rollback(() => {
                            console.error("Prescription status update error:", err)
                            res.status(500).json({ success: false, message: "Failed to update prescription status" })
                          })
                        }

                        console.log(`Updated prescription ${prescriptionId} status to purchased`)

                        // Generate QR code immediately after successful purchase
                        const qrData = {
                          purchaseId: purchaseId,
                          patientId: patientId,
                          items: purchaseItems.map((item) => ({
                            medicineId: item.medicine_id,
                            medicineName: item.medicine_name,
                            quantity: item.quantity,
                            vendingMachine: item.vending_machine,
                          })),
                          timestamp: currentTimestamp.toISOString(),
                        }

                        const qrCode = JSON.stringify(qrData)

                        // Set expiration time (5 minutes from now)
                        const expirationTime = new Date(currentTimestamp)
                        expirationTime.setMinutes(expirationTime.getMinutes() + 5)

                        // Update the purchase with QR code
                        db.query(
                          `UPDATE purchases SET State = 1, qr_code = ?, qr_expiration = ? WHERE purchase_id = ?`,
                          [qrCode, expirationTime, purchaseId],
                          (err) => {
                            if (err) {
                              return db.rollback(() => {
                                console.error("QR code update error:", err)
                                res.status(500).json({ success: false, message: "Failed to generate QR code" })
                              })
                            }

                            console.log(`Updated purchase with QR code`)

                            // Also update purchase_history for backward compatibility
                            db.query(
                              `SELECT id FROM purchase_history 
                               WHERE prescription_id = ? AND patient_id = ? AND State = 0`,
                              [prescriptionId, patientId],
                              (err, historyResults) => {
                                if (err) {
                                  console.error("Error finding purchase history entries:", err)
                                } else if (historyResults.length > 0) {
                                  // Update all related purchase_history entries
                                  const historyIds = historyResults.map((item) => item.id)

                                  if (historyIds.length > 0) {
                                    const idList = historyIds.join(",")
                                    db.query(
                                      `UPDATE purchase_history SET State = 1, qr_code = ?, qr_expiration = ? 
                                       WHERE id IN (${idList})`,
                                      [qrCode, expirationTime],
                                      (err) => {
                                        if (err) {
                                          console.error("Error updating purchase history QR codes:", err)
                                        } else {
                                          console.log(
                                            `Updated QR codes for ${historyIds.length} purchase history entries`,
                                          )
                                        }
                                      },
                                    )
                                  }
                                }
                              },
                            )

                            // Commit the transaction
                            db.commit((err) => {
                              if (err) {
                                return db.rollback(() => {
                                  console.error("Transaction commit error:", err)
                                  res.status(500).json({ success: false, message: "Transaction failed" })
                                })
                              }

                              console.log(`Transaction committed successfully`)
                              res.json({
                                success: true,
                                purchaseId: purchaseId,
                                items: purchaseItems,
                                totalAmount: totalAmount,
                                qrCode: qrCode,
                                expirationTime: expirationTime,
                              })
                            })
                          },
                        )
                      },
                    )
                  },
                )
              })
              .catch((err) => {
                db.rollback(() => {
                  console.error("Purchase item processing error:", err)
                  res.status(400).json({
                    success: false,
                    message: err.message || "Failed to process purchases",
                  })
                })
              })
          },
        )
      },
    )
  })
})

// Updated: Get purchase details with items
router.get("/purchase/:id", (req, res) => {
  db.query(
    `SELECT p.purchase_id, p.patient_id, p.prescription_id, p.purchase_date,
     p.payment_method, p.payment_status, p.total_amount, p.State, p.qr_code, p.qr_expiration,
     pr.instructions, pr.prescribed_at, u.name as doctor_name
     FROM purchases p
     LEFT JOIN prescriptions pr ON p.prescription_id = pr.prescription_id
     LEFT JOIN users u ON pr.doctor_id = u.id
     WHERE p.purchase_id = ?`,
    [req.params.id],
    (err, results) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "Purchase not found" })
      }

      const purchase = results[0]

      // Get purchase items with medicine details
      db.query(
        `SELECT pi.item_id, pi.medicine_id, pi.quantity, pi.amount, pi.vending_machine,
         m.name AS medicine_name, m.price
         FROM purchase_items pi
         JOIN medicines m ON pi.medicine_id = m.medicine_id
         WHERE pi.purchase_id = ?`,
        [purchase.purchase_id],
        (err, items) => {
          if (err) {
            console.error(err)
            return res.status(500).json({ success: false, message: "Error fetching purchase items" })
          }

          purchase.items = items
          res.json(purchase)
        },
      )
    },
  )
})

// Updated: Generate QR code for a purchase
router.post("/purchase/generate-qr/:id", (req, res) => {
  const purchaseId = req.params.id

  // Check if purchase exists
  db.query(
    `SELECT p.purchase_id, p.patient_id, p.State, p.prescription_id
     FROM purchases p
     WHERE p.purchase_id = ?`,
    [purchaseId],
    (err, results) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Purchase not found",
        })
      }

      const purchase = results[0]

      // Check if QR code has already been generated
      if (purchase.State === 1) {
        return res.status(400).json({
          success: false,
          message: "QR code has already been generated for this purchase",
        })
      }

      // Get all items in this purchase
      db.query(
        `SELECT pi.medicine_id, pi.quantity, pi.vending_machine, m.name AS medicine_name
         FROM purchase_items pi
         JOIN medicines m ON pi.medicine_id = m.medicine_id
         WHERE pi.purchase_id = ?`,
        [purchaseId],
        (err, items) => {
          if (err) {
            console.error(err)
            return res.status(500).json({ success: false, message: "Error fetching purchase items" })
          }

          // Create QR code data
          const qrData = {
            purchaseId: purchase.purchase_id,
            patientId: purchase.patient_id,
            items: items.map((item) => ({
              medicineId: item.medicine_id,
              medicineName: item.medicine_name,
              quantity: item.quantity,
              vendingMachine: item.vending_machine,
            })),
            timestamp: new Date().toISOString(),
          }

          const qrCode = JSON.stringify(qrData)

          // Set expiration time (5 minutes from now)
          const expirationTime = new Date()
          expirationTime.setMinutes(expirationTime.getMinutes() + 5)

          // Update the State to 1 (QR generated) and set expiration time
          db.query(
            `UPDATE purchases SET State = 1, qr_code = ?, qr_expiration = ? WHERE purchase_id = ?`,
            [qrCode, expirationTime, purchaseId],
            (err) => {
              if (err) {
                console.error(err)
                return res.status(500).json({ success: false, message: "Failed to update QR state" })
              }

              // Also update purchase_history for backward compatibility
              // First get all purchase_history entries related to this purchase
              db.query(
                `SELECT id FROM purchase_history 
                 WHERE prescription_id = ? AND patient_id = ?`,
                [purchase.prescription_id, purchase.patient_id],
                (err, historyResults) => {
                  if (err) {
                    console.error("Error finding purchase history entries:", err)
                  } else if (historyResults.length > 0) {
                    // Update all related purchase_history entries
                    const historyIds = historyResults.map((item) => item.id).join(",")
                    db.query(
                      `UPDATE purchase_history SET State = 1, qr_code = ?, qr_expiration = ? 
                       WHERE id IN (${historyIds})`,
                      [qrCode, expirationTime],
                      (err) => {
                        if (err) {
                          console.error("Error updating purchase history QR codes:", err)
                        }
                      },
                    )
                  }
                },
              )

              // Return the QR code data with expiration
              res.json({
                success: true,
                qrCode,
                purchaseId,
                expirationTime,
              })
            },
          )
        },
      )
    },
  )
})

// Modify the QR data generation in the /prescription/qr/:id route
router.get("/prescription/qr/:id", (req, res) => {
  db.query(
    `SELECT p.prescription_id, p.patient_id, p.doctor_id, p.status, m.name as medicine_name,
     pi.medicine_id, pi.quantity
     FROM prescriptions p
     JOIN prescription_items pi ON p.prescription_id = pi.prescription_id
     JOIN medicines m ON pi.medicine_id = m.medicine_id
     WHERE p.prescription_id = ? AND p.status = 'pending'`,
    [req.params.id],
    (err, results) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "Prescription not found or already used" })
      }

      // Create QR codes for each medicine
      const medicines = results.map((item) => {
        return {
          medicine_id: item.medicine_id,
          medicine_name: item.medicine_name,
          quantity: item.quantity,
          qr: `${item.medicine_name}:${item.quantity}`,
        }
      })

      // Set expiration time (5 minutes from now)
      const expirationTime = new Date()
      expirationTime.setMinutes(expirationTime.getMinutes() + 5)

      res.json({
        prescription_id: results[0].prescription_id,
        medicines: medicines,
        expirationTime: expirationTime,
      })
    },
  )
})

// Mark prescription as expired/used and delete it
router.put("/prescription/expire/:id", (req, res) => {
  // First update the status to purchased
  db.query("UPDATE prescriptions SET status = 'purchased' WHERE prescription_id = ?", [req.params.id], (err) => {
    if (err) {
      console.error(err)
      return res.status(500).json({ success: false, message: "Database error" })
    }

    res.json({ success: true })
  })
})

// Get doctors and their pending prescriptions for a patient
router.get("/doctors/:id", (req, res) => {
  // First get all doctors consulting with this patient
  db.query(
    `SELECT d.doctor_id, u.name, d.specialization, d.contact_no, dp.assigned_at
     FROM doctor_patient dp
     JOIN doctors d ON dp.doctor_id = d.doctor_id
     JOIN users u ON d.doctor_id = u.id
     WHERE dp.patient_id = ?`,
    [req.params.id],
    (err, doctors) => {
      if (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
      }

      if (doctors.length === 0) {
        return res.json([])
      }

      // For each doctor, get their pending prescriptions for this patient
      const doctorPromises = doctors.map((doctor) => {
        return new Promise((resolve, reject) => {
          db.query(
            `SELECT p.prescription_id, p.status, p.prescribed_at
             FROM prescriptions p
             WHERE p.doctor_id = ? AND p.patient_id = ? AND p.status = 'pending'
             ORDER BY p.prescribed_at DESC`,
            [doctor.doctor_id, req.params.id],
            (err, prescriptions) => {
              if (err) {
                reject(err)
                return
              }

              // For each prescription, get all medicine items
              const prescriptionPromises = prescriptions.map((prescription) => {
                return new Promise((resolve, reject) => {
                  db.query(
                    `SELECT pi.item_id, pi.medicine_id, pi.quantity, 
                     m.name AS medicine_name, m.price
                     FROM prescription_items pi
                     JOIN medicines m ON pi.medicine_id = m.medicine_id
                     WHERE pi.prescription_id = ?`,
                    [prescription.prescription_id],
                    (err, items) => {
                      if (err) {
                        reject(err)
                        return
                      }

                      prescription.items = items || []
                      resolve(prescription)
                    },
                  )
                })
              })

              Promise.all(prescriptionPromises)
                .then((prescriptionsWithItems) => {
                  doctor.prescriptions = prescriptionsWithItems || []
                  resolve(doctor)
                })
                .catch((err) => {
                  reject(err)
                })
            },
          )
        })
      })

      // Wait for all doctor prescription queries to complete
      Promise.all(doctorPromises)
        .then((doctorsWithPrescriptions) => {
          res.json(doctorsWithPrescriptions)
        })
        .catch((err) => {
          console.error(err)
          res.status(500).json({ success: false, message: "Error fetching doctor prescriptions" })
        })
    },
  )
})

// Update the purchase history route to include more details
router.get("/purchase-history/:id", (req, res) => {
  console.log(`Fetching purchase history for patient ID: ${req.params.id}`)

  // First get all purchases for this patient that are not migrated
  db.query(
    `SELECT p.purchase_id, p.patient_id, p.prescription_id, p.purchase_date,
     p.payment_method, p.payment_status, p.total_amount, p.State, p.qr_code, p.qr_expiration,
     pr.instructions, pr.prescribed_at, u.name as doctor_name
     FROM purchases p
     LEFT JOIN prescriptions pr ON p.prescription_id = pr.prescription_id
     LEFT JOIN users u ON pr.doctor_id = u.id
     WHERE p.patient_id = ? AND p.is_migrated = 0
     ORDER BY p.purchase_date DESC`,
    [req.params.id],
    (err, purchases) => {
      if (err) {
        console.error("Error fetching purchases:", err)
        return res.status(500).json({ success: false, message: "Database error" })
      }

      console.log(`Found ${purchases.length} purchases`)

      if (purchases.length === 0) {
        return res.json([])
      }

      // For each purchase, get all medicine items
      const promises = purchases.map((purchase) => {
        return new Promise((resolve, reject) => {
          // Get purchase items from purchase_items table
          db.query(
            `SELECT pi.item_id, pi.medicine_id, pi.quantity, pi.amount, pi.vending_machine,
             m.name AS medicine_name, m.price
             FROM purchase_items pi
             JOIN medicines m ON pi.medicine_id = m.medicine_id
             WHERE pi.purchase_id = ?`,
            [purchase.purchase_id],
            (err, items) => {
              if (err) {
                console.error(`Error fetching items for purchase ${purchase.purchase_id}:`, err)
                reject(err)
                return
              }

              console.log(`Found ${items.length} items for purchase ${purchase.purchase_id}`)

              // If no items found in purchase_items, try to get from purchase_history
              if (items.length === 0) {
                db.query(
                  `SELECT ph.id as item_id, ph.medicine_id, ph.quantity, ph.amount, ph.vending_machine,
                   m.name AS medicine_name, m.price
                   FROM purchase_history ph
                   JOIN medicines m ON ph.medicine_id = m.medicine_id
                   WHERE ph.patient_id = ? AND ph.prescription_id = ?`,
                  [purchase.patient_id, purchase.prescription_id],
                  (err, historyItems) => {
                    if (err) {
                      console.error(`Error fetching history items for purchase ${purchase.purchase_id}:`, err)
                      reject(err)
                      return
                    }

                    console.log(`Found ${historyItems.length} history items for purchase ${purchase.purchase_id}`)
                    purchase.items = historyItems || []
                    resolve(purchase)
                  },
                )
              } else {
                purchase.items = items
                resolve(purchase)
              }
            },
          )
        })
      })

      Promise.all(promises)
        .then((purchasesWithItems) => {
          console.log(`Successfully processed ${purchasesWithItems.length} purchases with items`)
          res.json(purchasesWithItems)
        })
        .catch((err) => {
          console.error("Error processing purchases with items:", err)
          res.status(500).json({ success: false, message: "Error fetching purchase items" })
        })
    },
  )
})

module.exports = router
