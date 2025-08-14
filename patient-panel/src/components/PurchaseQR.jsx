"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import "../styles/PurchaseQR.css"
import ThemeToggle from "./ThemeToggle"
import { QRCodeSVG } from "qrcode.react"

const PurchaseQR = () => {
  const [purchase, setPurchase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [qrCode, setQrCode] = useState(null)
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const patientId = localStorage.getItem("patientId")

  // Check if this is being viewed as bill details (from URL query parameter)
  const isBillDetails = location.search.includes("billDetails=true")

  // Generate QR code in the format "medicinename:quantity:medicinename:quantity:..."
  const generateQRCodeData = (items) => {
    return items.map((item) => `${item.medicine_name}:${item.quantity}`).join(":")
  }

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`http://localhost:5000/api/patient/purchase/${id}`)
        console.log("Purchase details:", response.data)
        setPurchase(response.data)

        // Generate QR code in the required format
        if (response.data.items && response.data.items.length > 0) {
          const qrCodeData = generateQRCodeData(response.data.items)
          setQrCode(qrCodeData)
        }

        // Calculate remaining time if QR code exists and not in bill details mode
        if (!isBillDetails && response.data.qr_expiration) {
          const expirationTime = new Date(response.data.qr_expiration).getTime()
          const currentTime = new Date().getTime()
          const remainingTime = Math.max(0, Math.floor((expirationTime - currentTime) / 1000))
          setCountdown(remainingTime)
        } else if (!isBillDetails && response.data.State === 0) {
          // If QR code doesn't exist yet and not in bill details mode, generate it
          generateQRCode()
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching purchase details:", err)
        setError("Failed to load purchase details. Please try again later.")
        setLoading(false)
      }
    }

    fetchPurchaseDetails()
  }, [id, isBillDetails])

  // Countdown timer for QR code expiration
  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [countdown])

  const generateQRCode = async () => {
    try {
      setLoading(true)
      const response = await axios.post(`http://localhost:5000/api/patient/purchase/generate-qr/${id}`)
      console.log("QR code generation response:", response.data)

      if (response.data.success) {
        // Refresh purchase details to get the new QR code
        const purchaseResponse = await axios.get(`http://localhost:5000/api/patient/purchase/${id}`)
        setPurchase(purchaseResponse.data)

        // Generate QR code in the required format
        if (purchaseResponse.data.items && purchaseResponse.data.items.length > 0) {
          const qrCodeData = generateQRCodeData(purchaseResponse.data.items)
          setQrCode(qrCodeData)
        }

        // Set countdown based on expiration time
        if (purchaseResponse.data.qr_expiration) {
          const expirationTime = new Date(purchaseResponse.data.qr_expiration).getTime()
          const currentTime = new Date().getTime()
          const remainingTime = Math.max(0, Math.floor((expirationTime - currentTime) / 1000))
          setCountdown(remainingTime)
        }
      }

      setLoading(false)
    } catch (err) {
      console.error("Error generating QR code:", err)
      setError("Failed to generate QR code. Please try again.")
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleBackToPurchaseHistory = () => {
    navigate(`/purchase-history/${patientId}`)
  }

  if (loading) {
    return <div className="loading">Loading purchase details...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!purchase) {
    return <div className="error">Purchase not found</div>
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px", color: "white", backgroundColor: "#121212" }}>
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
        <h1 style={{ fontSize: "2rem", margin: 0 }}>
          {isBillDetails ? `Purchase Invoice #${purchase.purchase_id}` : `Purchase #${purchase.purchase_id}`}
        </h1>
        <ThemeToggle />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ backgroundColor: "#1a1a1a", borderRadius: "8px", padding: "20px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "15px" }}>Purchase Summary</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "bold", color: "#aaa" }}>Date:</span>
              <span>{new Date(purchase.purchase_date).toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "bold", color: "#aaa" }}>Total Amount:</span>
              <span>${Number.parseFloat(purchase.total_amount).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "bold", color: "#aaa" }}>Payment Method:</span>
              <span>{purchase.payment_method ? purchase.payment_method.replace("_", " ").toUpperCase() : "N/A"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "bold", color: "#aaa" }}>Status:</span>
              <span
                style={{ color: purchase.payment_status === "completed" ? "#4ade80" : "#ef4444", fontWeight: "bold" }}
              >
                {purchase.payment_status.toUpperCase()}
              </span>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <h4 style={{ marginBottom: "10px" }}>Items</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {purchase.items &&
                purchase.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #333",
                      paddingBottom: "10px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold" }}>{item.medicine_name}</div>
                      <div style={{ color: "#aaa", fontSize: "0.9rem" }}>
                        <span>Quantity: {item.quantity}</span>
                        {item.vending_machine && (
                          <span style={{ marginLeft: "10px" }}>Machine: {item.vending_machine}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontWeight: "bold" }}>${Number.parseFloat(item.amount).toFixed(2)}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "right", marginTop: "20px" }}>
        <button
          onClick={handleBackToPurchaseHistory}
          style={{
            backgroundColor: "#4285f4",
            color: "white",
            border: "none",
            borderRadius: "5px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Back to Purchase History
        </button>
      </div>
    </div>
  )
}

export default PurchaseQR
