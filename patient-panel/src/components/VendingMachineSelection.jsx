"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import "../styles/VendingMachineSelection.css"
import ThemeToggle from "./ThemeToggle"
import { generatePrescriptionPDF } from "../utils/pdfGenerator" // Import the PDF generator

const VendingMachineSelection = () => {
  const { id: prescriptionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { selectedQuantities } = location.state || {}

  const [availableItems, setAvailableItems] = useState([])
  const [unavailableItems, setUnavailableItems] = useState([])
  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMachines, setSelectedMachines] = useState({})
  const [patientInfo, setPatientInfo] = useState(null) // Added for PDF generation
  const patientId = localStorage.getItem("patientId")

  useEffect(() => {
    if (!prescriptionId) {
      setError("No prescription selected")
      setLoading(false)
      return
    }

    const fetchVendingMachines = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:5000/api/patient/vending-machines/${prescriptionId}`)

        setPrescription(response.data.prescription)
        const allAvailableItems = response.data.availableItems || []
        const allUnavailableItems = response.data.unavailableItems || []

        // Fetch patient information for PDF generation
        if (patientId) {
          try {
            const patientResponse = await axios.get(`http://localhost:5000/api/patient/${patientId}`)
            setPatientInfo(patientResponse.data)
          } catch (patientErr) {
            console.error("Error fetching patient info:", patientErr)
            // Continue with normal flow even if patient info fetch fails
          }
        }

        // Filter available items based on quantity mod 10
        const validAvailableItems = []
        const invalidQuantityItems = []

        allAvailableItems.forEach((item) => {
          const quantity =
            selectedQuantities && selectedQuantities[item.item_id]
              ? Number.parseInt(selectedQuantities[item.item_id])
              : item.quantity
          if (quantity % 10 === 0) {
            validAvailableItems.push(item)
          } else {
            invalidQuantityItems.push({
              ...item,
              quantity,
              reason: "Quantity not in multiples of 10",
            })
          }
        })

        setAvailableItems(validAvailableItems)
        setUnavailableItems([...allUnavailableItems, ...invalidQuantityItems])

        // Initialize selected machines with the first available machine for each item
        const initialSelectedMachines = {}
        if (validAvailableItems.length > 0) {
          validAvailableItems.forEach((item) => {
            if (item.machines && item.machines.length > 0) {
              initialSelectedMachines[item.item_id] = item.machines[0].machine_code
            }
          })
        }
        setSelectedMachines(initialSelectedMachines)

        setError(null)
      } catch (err) {
        console.error("Error fetching vending machines:", err)
        setError(err.response?.data?.message || "Failed to load vending machines. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchVendingMachines()
  }, [prescriptionId, selectedQuantities, patientId])

  const handleMachineSelect = (itemId, machineCode) => {
    setSelectedMachines({
      ...selectedMachines,
      [itemId]: machineCode,
    })
  }

  const handleProceedToCheckout = () => {
    const checkoutItems = availableItems.map((item) => {
      const quantity =
        selectedQuantities && selectedQuantities[item.item_id]
          ? Number.parseInt(selectedQuantities[item.item_id])
          : item.quantity

      return {
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        quantity: quantity,
        vending_machine: selectedMachines[item.item_id],
        payment_method: "credit_card",
      }
    })

    navigate(`/checkout/${prescriptionId}`, {
      state: {
        prescriptionId,
        items: checkoutItems,
        availableItems,
        unavailableItems,
        selectedMachines,
      },
    })
  }

  const handleBackToPrescriptions = () => {
    navigate(`/prescriptions/${patientId}`)
  }

  const downloadPrescriptionPDF = () => {
    // Use the PDF generator with data we already have, without making additional API calls
    const patientData = {
      name: localStorage.getItem("patientName") || "Twinsriram V",
      patient_id: patientId,
      age: "18",
      gender: "Male",
      contact_no: "9042170801",
      address: "Dharmapuri",
    }

    generatePrescriptionPDF(prescription, unavailableItems, patientData)
  }

  if (loading) return <div className="loading">Loading vending machines...</div>

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", color: "white", backgroundColor: "#121212" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid #333",
          paddingBottom: "10px",
        }}
      >
        <h1 style={{ fontSize: "2rem", margin: 0 }}>Select Vending Machines</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <ThemeToggle />
          <button
            onClick={handleBackToPrescriptions}
            style={{
              backgroundColor: "#333",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Back to Prescriptions
          </button>
        </div>
      </div>

      {error && <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>}

      {prescription && (
        <div style={{ backgroundColor: "#1a1a1a", borderRadius: "8px", padding: "15px", marginBottom: "20px" }}>
          <h3 style={{ margin: 0 }}>Prescription #{prescription.prescription_id}</h3>
        </div>
      )}

      {availableItems.length === 0 && unavailableItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px", backgroundColor: "#1a1a1a", borderRadius: "8px" }}>
          <p>No medicine items found in this prescription.</p>
          <button
            onClick={handleBackToPrescriptions}
            style={{
              backgroundColor: "#ffd700",
              color: "black",
              border: "none",
              borderRadius: "5px",
              padding: "10px 20px",
              marginTop: "15px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Back to Prescriptions
          </button>
        </div>
      ) : (
        <>
          {availableItems.length > 0 && (
            <div style={{ marginBottom: "30px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>Available Medicines</h2>

              {availableItems.map((item) => (
                <div
                  key={item.item_id}
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h3 style={{ fontSize: "1.3rem", margin: 0 }}>{item.medicine_name}</h3>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "15px" }}>
                    <div style={{ flex: "1", minWidth: "200px" }}>
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span>Prescribed Quantity:</span>
                          <span>{item.quantity}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span>Selected Quantity:</span>
                          <span>{selectedQuantities?.[item.item_id] ?? item.quantity}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span>Price per unit:</span>
                          <span>${item.price}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                          <span>Total:</span>
                          <span>
                            ${(item.price * (selectedQuantities?.[item.item_id] ?? item.quantity)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: "2", minWidth: "300px" }}>
                      <h4 style={{ margin: "0 0 10px 0" }}>Available at:</h4>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {item.machines.map((machine) => (
                          <div
                            key={machine.machine_code}
                            onClick={() => handleMachineSelect(item.item_id, machine.machine_code)}
                            style={{
                              cursor: "pointer",
                              border:
                                selectedMachines[item.item_id] === machine.machine_code
                                  ? "2px solid #ffd700"
                                  : "1px solid #333",
                              borderRadius: "6px",
                              padding: "10px",
                              backgroundColor:
                                selectedMachines[item.item_id] === machine.machine_code ? "#222" : "#1a1a1a",
                              flex: "1 1 200px",
                              position: "relative",
                            }}
                          >
                            <div>
                              <strong>{machine.location}</strong>
                              <div>Stock: {machine.available_quantity}</div>
                            </div>
                            {selectedMachines[item.item_id] === machine.machine_code && (
                              <div style={{ position: "absolute", top: "10px", right: "10px", color: "#ffd700" }}>
                                ✓
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {unavailableItems.length > 0 && (
            <div style={{ borderLeft: "3px solid #d45d5d", padding: "15px", marginBottom: "30px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "5px", color: "#d45d5d" }}>Unavailable Medicines</h2>
              <p style={{ fontStyle: "italic", marginBottom: "15px", color: "#aaa" }}>
                These medicines are unavailable in vending machines.
              </p>

              {unavailableItems.map((item) => (
                <div
                  key={item.item_id}
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderRadius: "8px",
                    padding: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <h3 style={{ fontSize: "1.3rem", margin: "0 0 10px 0", color: "#d45d5d" }}>{item.medicine_name}</h3>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                    <div style={{ flex: "1", minWidth: "200px" }}>
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span>Prescribed Quantity:</span>
                          <span>{item.quantity}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                          <span>Price per unit:</span>
                          <span>${item.price}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                          <span>Total:</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: "1", minWidth: "200px" }}>
                      <div style={{ color: "#d45d5d", marginBottom: "5px" }}>Not available in vending machine</div>
                      <div style={{ fontStyle: "italic", color: "#aaa" }}>Please purchase from a nearby pharmacy</div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={downloadPrescriptionPDF}
                style={{
                  backgroundColor: "#d45d5d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  padding: "10px 15px",
                  cursor: "pointer",
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Prescription as PDF
              </button>
            </div>
          )}

          {availableItems.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={handleProceedToCheckout}
                disabled={Object.keys(selectedMachines).length !== availableItems.length}
                style={{
                  backgroundColor: "#ffd700",
                  color: "black",
                  border: "none",
                  borderRadius: "5px",
                  padding: "12px 24px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: Object.keys(selectedMachines).length !== availableItems.length ? "not-allowed" : "pointer",
                  opacity: Object.keys(selectedMachines).length !== availableItems.length ? 0.7 : 1,
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default VendingMachineSelection
