"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import "../styles/Checkout.css"
import ThemeToggle from "./ThemeToggle"
import { QRCodeSVG } from "qrcode.react"

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [qrCodeData, setQrCodeData] = useState("")
  const [countdown, setCountdown] = useState(300) // 5 minutes in seconds
  const [purchaseId, setPurchaseId] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { id: prescriptionId } = useParams()
  const patientId = localStorage.getItem("patientId")

  const { items, availableItems, unavailableItems, selectedMachines } = location.state || {}

  // Countdown timer for QR code expiration
  useEffect(() => {
    let timer
    if (paymentSuccess && qrCode && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      setQrCode(null)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [paymentSuccess, qrCode, countdown])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value)
  }


  const generateQRCodeData = (medicines) => {
    if (!medicines || medicines.length === 0) return ""

    const qrData = medicines.map((item) => `${item.medicine_name}${item.quantity}`).join(":")
    return qrData
  }

  // Update the handleProcessPayment function in the Checkout component
  const handleProcessPayment = async () => {
    if (!prescriptionId || !items || !patientId) {
      setError("Missing required information for checkout")
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Processing payment with data:", {
        prescriptionId,
        patientId,
        items: items.map((item) => ({
          ...item,
          payment_method: paymentMethod,
        })),
      })

      // Update all items to use the selected payment method
      const itemsWithPayment = items.map((item) => ({
        ...item,
        payment_method: paymentMethod,
      }))

      // Generate QR code data in the required format
      const qrCodeString = generateQRCodeData(itemsWithPayment)
      setQrCodeData(qrCodeString)

      // Process the payment
      const response = await axios.post("http://localhost:5000/api/patient/checkout", {
        prescriptionId,
        patientId,
        items: itemsWithPayment,
        qrCodeData: qrCodeString, // Send the formatted QR code data to backend
      })

      console.log("Payment response:", response.data)

      if (response.data.success) {
        // Set the QR code to our formatted string instead of using the backend response
        setPurchaseId(response.data.purchaseId)
        setQrCode(qrCodeString)
        setPaymentSuccess(true)
        setCountdown(300) // 5 minutes
      }
    } catch (err) {
      console.error("Payment processing error:", err)
      setError(err.response?.data?.message || "Payment processing failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(`/vending-machine/${prescriptionId}`)
  }

  const handleBackToDashboard = () => {
    navigate(`/dashboard/${patientId}`)
  }

  if (!items || items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="error-message">Missing items information</div>
        <button className="btn-secondary" onClick={() => navigate(`/prescriptions/${patientId}`)}>
          Back to Prescriptions
        </button>
      </div>
    )
  }

  // Calculate total amount
  const totalAmount = availableItems
    ? availableItems.reduce((total, item) => {
        const selectedQuantity = items.find((i) => i.medicine_id === item.medicine_id)?.quantity || item.quantity
        return total + item.price * selectedQuantity
      }, 0)
    : 0

  // If payment is successful, show the QR code
  if (paymentSuccess) {
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Payment Successful</h1>
          <div className="header-actions">
            <ThemeToggle />
            <button onClick={handleBackToDashboard} className="btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="payment-success-content">
          <div className="success-message">
            <h2>Your payment has been processed successfully!</h2>
            <p>Total Amount: ${totalAmount.toFixed(2)}</p>
            <p>Payment Method: {paymentMethod.replace("_", " ").toUpperCase()}</p>
          </div>

          <div className="qr-code-section">
            <h3>QR Code for Vending Machine</h3>
            <div className="qr-code-container">
              {qrCode && (
                <div className="qr-display">
                  <div className="qr-code-wrapper">
                    <QRCodeSVG
                      value={qrCode}
                      size={250}
                      level="H"
                      includeMargin={true}
                      bgColor={"#FFFFFF"}
                      fgColor={"#000000"}
                    />
                  </div>

                </div>
              )}
              <div className="qr-expiration">
                <p>
                  This QR code will expire in: <span className="countdown">{formatTime(countdown)}</span>
                </p>
                <p className="qr-note">Please scan this QR code at the vending machine to collect your medicines</p>
              </div>
            </div>
            <div className="qr-instructions">
              <h4>How to use:</h4>
              <ol>
                <li>Go to the nearest MediVend machine</li>
                <li>Press "Scan QR Code" on the machine</li>
                <li>Hold this QR code in front of the scanner</li>
                <li>Follow the instructions on the machine to collect your medicines</li>
              </ol>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={handleBackToDashboard}>
              Return to Dashboard
            </button>
            <button className="btn-secondary" onClick={() => navigate(`/purchase-history/${patientId}`)}>
              View Purchase History
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <div className="header-actions">
          <ThemeToggle />
          <button onClick={handleBack} className="btn-secondary">
            Back
          </button>
        </div>
      </div>

      <div className="order-summary">
        <h3>Order Summary</h3>

        {availableItems?.length > 0 && (
          <div className="available-items">
            <h4>Medicines Available in Vending Machines</h4>
            <div className="items-table">
              {availableItems.map((item) => {
                const selectedItem = items.find((i) => i.medicine_id === item.medicine_id)
                const selectedQuantity = selectedItem ? selectedItem.quantity : item.quantity
                const selectedMachine = selectedItem ? selectedItem.vending_machine : null
                const machineName =
                  availableItems
                    .find((ai) => ai.medicine_id === item.medicine_id)
                    ?.machines.find((m) => m.machine_code === selectedMachine)?.location || selectedMachine

                return (
                  <div key={item.item_id} className="item">
                    <div className="item-info">
                      <div className="item-name">{item.medicine_name}</div>
                      <div className="item-details">
                        <span>Quantity: {selectedQuantity}</span>
                        <span>Vending Machine: {machineName}</span>
                      </div>
                    </div>
                    <div className="item-price">${(item.price * selectedQuantity).toFixed(2)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {unavailableItems?.length > 0 && (
          <div className="unavailable-items">
            <h4>Medicines to Purchase Elsewhere</h4>
            <p className="unavailable-note">
              These medicines are not available in vending machines and should be purchased at a pharmacy.
            </p>
            <div className="items-table">
              {unavailableItems.map((item) => (
                <div key={item.item_id} className="item">
                  <div className="item-info">
                    <div className="item-name">{item.medicine_name}</div>
                    <div className="item-details">
                      <span>Quantity: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="total">
          <span>Total Amount (Vending Machine):</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="payment-method">
        <h3>Payment Method</h3>
        <div className="payment-options">
          {["credit_card", "debit_card", "upi"].map((method) => (
            <label key={method} className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={paymentMethod === method}
                onChange={handlePaymentMethodChange}
              />
              <span>{method.replace("_", " ").toUpperCase()}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="payment-action">
        <button
          onClick={handleProcessPayment}
          disabled={loading}
          className={`complete-payment-btn ${loading ? "loading" : ""}`}
        >
          {loading ? "Processing..." : "Complete Payment"}
        </button>
        <p className="payment-note">
          This will process your payment and generate a QR code for collecting medicines from the vending machine.
        </p>
      </div>
    </div>
  )
}

export default Checkout
