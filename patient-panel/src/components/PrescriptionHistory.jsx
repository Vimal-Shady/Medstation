"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import "../styles/PrescriptionHistory.css"
import ThemeToggle from "./ThemeToggle"

const PrescriptionHistory = () => {
  const [activeTab, setActiveTab] = useState("pending")
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedQuantities, setSelectedQuantities] = useState({})
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch prescriptions
      const prescriptionsResponse = await axios.get(`http://localhost:5000/api/patient/prescriptions/${id}`)
      setPrescriptions(prescriptionsResponse.data)

      // Initialize selected quantities with the prescribed quantities
      const initialQuantities = {}
      prescriptionsResponse.data.forEach((prescription) => {
        if (prescription.items && prescription.items.length > 0) {
          prescription.items.forEach((item) => {
            initialQuantities[item.item_id] = item.quantity
          })
        }
      })
      setSelectedQuantities(initialQuantities)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(`/dashboard/${id}`)
  }

  const handleQuantityChange = (itemId, value, maxQuantity) => {
    // Ensure value is a number and not less than 1 or more than prescribed quantity
    const quantity = Math.min(maxQuantity, Math.max(1, Number.parseInt(value) || 1))
    setSelectedQuantities((prev) => ({
      ...prev,
      [itemId]: quantity,
    }))
  }

  const handleProceedToVendingMachine = (prescriptionId) => {
    // Passing the selected quantities to the vending machine page via state
    navigate(`/vending-machine/${prescriptionId}`, {
      state: { selectedQuantities },
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatPaymentMethod = (method) => {
    if (!method) return "N/A"
    return method
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (loading) {
    return (
      <div className="prescription-history-container">
        <div className="loading">Loading data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="prescription-history-container">
        <div className="error-message">{error}</div>
        <button className="btn btn-primary" onClick={handleBack}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  const pendingPrescriptions = prescriptions.filter((prescription) => prescription.status === "pending")
  const purchasedPrescriptions = prescriptions.filter((prescription) => prescription.status === "purchased")
  const allPrescriptions = [...prescriptions]

  // Show empty message if there are no prescriptions in the active tab
  const getEmptyMessage = () => {
    switch (activeTab) {
      case "pending":
        return "You don't have any pending prescriptions."
      case "purchases":
        return "You don't have any purchased prescriptions."
      case "all":
        return "You don't have any prescriptions."
      default:
        return "No prescriptions found."
    }
  }

  // Get prescriptions based on active tab
  const getActivePrescriptions = () => {
    switch (activeTab) {
      case "pending":
        return pendingPrescriptions
      case "purchases":
        return purchasedPrescriptions
      case "all":
        return allPrescriptions
      default:
        return []
    }
  }

  const activePrescriptions = getActivePrescriptions()

  return (
    <div
      style={{
        border: "3px solid #FFD700", // golden border
        borderRadius: "12px",
        padding: "24px",
        margin: "20px",
        backgroundColor: "#000", // optional for contrast
        color: "#fff", // optional for readability
      }}
    >
      <div className="prescription-history-container">
        <div className="prescription-history-header">
          <h1>Prescription & Purchase History</h1>
          <div className="header-actions">
            <ThemeToggle />
            <button onClick={handleBack} className="btn btn-secondary" style={{ backgroundColor: "orange" }}>
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>
            Pending Prescriptions
          </button>
          <button
            className={`tab ${activeTab === "purchases" ? "active" : ""}`}
            onClick={() => setActiveTab("purchases")}
          >
            Purchase History
          </button>
        </div>

        <div
          className="prescriptions-list"
          style={{ border: "1px solid white", padding: "1rem", borderRadius: "0.5rem" }}
        >
          {activePrescriptions.length === 0 ? (
            <div
              className="no-prescriptions"
              style={{ border: "1px solid white", padding: "1rem", borderRadius: "0.5rem" }}
            >
              <p>{getEmptyMessage()}</p>
            </div>
          ) : (
            activePrescriptions.map((prescription) => (
              <div
                key={prescription.prescription_id}
                className="prescription-card"
                style={{
                  border: "1px solid white",
                  padding: "1rem",
                  borderRadius: "0.75rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  className="prescription-header"
                  style={{
                    borderBottom: "1px solid white",
                    marginBottom: "0.75rem",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <h3>Prescription #{prescription.prescription_id}</h3>
                  <p className="prescription-date">Prescribed on: {formatDate(prescription.prescribed_at)}</p>
                  <p className="prescription-status">
                    Status:{" "}
                    <span
                      style={{
                        color: prescription.status === "pending" ? "#FFD700" : "#4ade80",
                        fontWeight: "bold",
                      }}
                    >
                      {prescription.status.toUpperCase()}
                    </span>
                  </p>
                </div>

                <div className="prescription-details" style={{ borderTop: "1px solid white", paddingTop: "0.5rem" }}>
                  <p>
                    <strong>Doctor:</strong> {prescription.doctor_name} ({prescription.specialization})
                  </p>

                  {prescription.instructions && (
                    <p>
                      <strong>Instructions:</strong> {prescription.instructions}
                    </p>
                  )}

                  <div
                    className="prescription-medicines"
                    style={{
                      border: "1px solid white",
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <h4>Medicines</h4>
                    <ul>
                      {prescription.items && (
  <>
    <ul>
      {prescription.items.map((item) => (
        <li
          key={item.item_id}
          className="medicine-item"
          style={{
            borderBottom: "1px solid white",
            marginBottom: "0.5rem",
            paddingBottom: "0.5rem",
          }}
        >
          <div className="medicine-info">
            <span className="medicine-name">{item.medicine_name}</span>
            <span className="medicine-price">${item.price} each</span>
          </div>
          {prescription.status === "pending" && (
            <div className="medicine-quantity-control">
              <label htmlFor={`quantity-${item.item_id}`}>Quantity:</label>
              <div
                className="quantity-input-group"
                style={{ backgroundColor: "slategray", borderRadius: "15%" }}
              >
                <button
                  className="quantity-btn"
                  onClick={() =>
                    handleQuantityChange(
                      item.item_id,
                      (selectedQuantities[item.item_id] || item.quantity) - 1,
                      item.quantity
                    )
                  }
                  disabled={(selectedQuantities[item.item_id] || item.quantity) <= 1}
                >
                  -
                </button>
                <input
                  id={`quantity-${item.item_id}`}
                  type="number"
                  min="1"
                  max={item.quantity}
                  value={selectedQuantities[item.item_id] || item.quantity}
                  onChange={(e) => handleQuantityChange(item.item_id, e.target.value, item.quantity)}
                  className="quantity-input"
                />
                <button
                  className="quantity-btn"
                  onClick={() =>
                    handleQuantityChange(
                      item.item_id,
                      (selectedQuantities[item.item_id] || item.quantity) + 1,
                      item.quantity
                    )
                  }
                  disabled={(selectedQuantities[item.item_id] || item.quantity) >= item.quantity}
                >
                  +
                </button>
              </div>
            </div>
          )}
          {prescription.status === "purchased" && (
            <div className="medicine-quantity">
              <span>Quantity: {item.quantity}</span>
            </div>
          )}
        </li>
      ))}
    </ul>
    
    {/* Calculate total amount dynamically while mapping */}
    <div className="total-amount">
      <span>
        Total Amount: $
        {prescription.items.reduce((total, item) => {
          const quantity = selectedQuantities[item.item_id] || item.quantity;
          return total + quantity * item.price; // Sum up total
        }, 0).toFixed(2)}
      </span>
    </div>
  </>
)}

                    </ul>
                  </div>

                  {prescription.status === "pending" && (
                    <div className="prescription-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleProceedToVendingMachine(prescription.prescription_id)}
                      >
                        Proceed to Vending Machine
                      </button>
                    </div>
                  )}

                  {prescription.status === "purchased" && prescription.purchase_id && (
                    <div className="prescription-actions">
                      <button
                        className="btn btn-info"
                        onClick={() => navigate(`/purchase-history/${id}`)}
                        style={{ backgroundColor: "#4285f4" }}
                      >
                        View Purchase Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default PrescriptionHistory
