"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useParams, Link, useLocation } from "react-router-dom"
import "../styles/purchaseHistory.css"
import ThemeToggle from "./ThemeToggle"

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const { id } = useParams()
  const [successMessage, setSuccessMessage] = useState("")
  const location = useLocation()

  useEffect(() => {
    // Check for success message from location state (e.g., after payment)
    if (location.state?.paymentSuccess) {
      setSuccessMessage(location.state.message || "Payment processed successfully!")
      // Clear the state after showing the message
      window.history.replaceState({}, document.title)
    }

    const fetchPurchaseHistory = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:5000/api/patient/purchase-history/${id}`)
        console.log("Purchase history data:", response.data)
        setPurchases(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching purchase history:", err)
        setError("Failed to load purchase history. Please try again later.")
        setLoading(false)
      }
    }

    fetchPurchaseHistory()
  }, [id, location.state])

  const handleViewDetails = (purchase) => {
    setSelectedPurchase(purchase)
  }

  const handleCloseDetails = () => {
    setSelectedPurchase(null)
  }

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return <div className="loading">Loading purchase history...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="purchase-history-container">
      <div className="purchase-history-header">
        <h1>Purchase History</h1>
        <ThemeToggle />
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}

      {purchases.length === 0 ? (
        <div className="no-purchases">
          <p>You haven't made any purchases yet.</p>
          <Link to={`/dashboard/${id}`} className="back-button">
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <div className="purchase-list">
          {purchases.map((purchase) => (
            <div key={purchase.purchase_id} className="purchase-card">
              <div className="purchase-header">
                <div className="purchase-id">Purchase #{purchase.purchase_id}</div>
                <div className="purchase-date">{formatDate(purchase.purchase_date)}</div>
              </div>

              <div className="purchase-details">
                <div className="purchase-info">
                  <div className="info-row">
                    <span className="label">Total Amount:</span>
                    <span className="value">${Number.parseFloat(purchase.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Payment Method:</span>
                    <span className="value">
                      {purchase.payment_method ? purchase.payment_method.replace("_", " ").toUpperCase() : "N/A"}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`value status ${purchase.payment_status}`}>
                      {purchase.payment_status.toUpperCase()}
                    </span>
                  </div>
                  {purchase.doctor_name && (
                    <div className="info-row">
                      <span className="label">Doctor:</span>
                      <span className="value">{purchase.doctor_name}</span>
                    </div>
                  )}
                  {purchase.prescribed_at && (
                    <div className="info-row">
                      <span className="label">Prescribed:</span>
                      <span className="value">{formatDate(purchase.prescribed_at)}</span>
                    </div>
                  )}
                </div>

                <div className="purchase-actions">
                  <button className="view-details-button" onClick={() => handleViewDetails(purchase)}>
                    View Details
                  </button>

                  {purchase.State === 1 && purchase.qr_code && (
                    <Link to={`/purchase-qr/${purchase.purchase_id}`} className="view-qr-button">
                      View QR Code
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to={`/dashboard/${id}`} className="back-button">
        Back to Dashboard
      </Link>

      {selectedPurchase && (
        <div className="purchase-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Purchase Details</h2>
              <button className="close-button" onClick={handleCloseDetails}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="purchase-summary">
                <div className="summary-row">
                  <span className="label">Purchase ID:</span>
                  <span className="value">#{selectedPurchase.purchase_id}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Date:</span>
                  <span className="value">{formatDate(selectedPurchase.purchase_date)}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Payment Method:</span>
                  <span className="value">
                    {selectedPurchase.payment_method
                      ? selectedPurchase.payment_method.replace("_", " ").toUpperCase()
                      : "N/A"}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="label">Status:</span>
                  <span className={`value status ${selectedPurchase.payment_status}`}>
                    {selectedPurchase.payment_status.toUpperCase()}
                  </span>
                </div>
                {selectedPurchase.doctor_name && (
                  <div className="summary-row">
                    <span className="label">Doctor:</span>
                    <span className="value">{selectedPurchase.doctor_name}</span>
                  </div>
                )}
                {selectedPurchase.prescribed_at && (
                  <div className="summary-row">
                    <span className="label">Prescribed:</span>
                    <span className="value">{formatDate(selectedPurchase.prescribed_at)}</span>
                  </div>
                )}
                {selectedPurchase.instructions && (
                  <div className="summary-row">
                    <span className="label">Instructions:</span>
                    <span className="value">{selectedPurchase.instructions}</span>
                  </div>
                )}
              </div>

              <h3>Items</h3>
              <div className="items-list">
                {selectedPurchase.items &&
                  selectedPurchase.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <div className="item-details">
                        <div className="item-name">{item.medicine_name}</div>
                        <div className="item-meta">
                          <span>Quantity: {item.quantity}</span>
                          {item.vending_machine && <span>Machine: {item.vending_machine}</span>}
                        </div>
                      </div>
                      <div className="item-price">${Number.parseFloat(item.amount).toFixed(2)}</div>
                    </div>
                  ))}
              </div>

              <div className="total-row">
                <span className="label">Total Amount:</span>
                <span className="value">${Number.parseFloat(selectedPurchase.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="close-button" onClick={handleCloseDetails}>
                Close
              </button>

              {selectedPurchase.State === 1 && selectedPurchase.qr_code && (
                <Link to={`/purchase-qr/${selectedPurchase.purchase_id}`} className="view-qr-button">
                  View QR Code
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchaseHistory
