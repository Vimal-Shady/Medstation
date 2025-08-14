"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import { QRCodeCanvas } from "qrcode.react"
import "../styles/QRGenerator.css"
import ThemeToggle from "./ThemeToggle"

export default function QRGenerator() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [qrData, setQrData] = useState("")
  const [prescription, setPrescription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(300) // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    const fetchQRData = async () => {
      try {
        setLoading(true)
        // First get prescription details
        const prescriptionRes = await axios.get(`http://localhost:5000/api/patient/prescription/${id}`)
        setPrescription(prescriptionRes.data)

        // Create a simple QR data string
        let qrContent = ""

        if (prescriptionRes.data.items && prescriptionRes.data.items.length > 0) {
          // Add each medicine with its quantity without separators
          qrContent = prescriptionRes.data.items.map((item) => `${item.medicine_name}${item.quantity}`).join(":")
        } else if (prescriptionRes.data.medicine_name) {
          // Fallback for single medicine
          qrContent = `${prescriptionRes.data.medicine_name}${prescriptionRes.data.quantity}`
        } else {
          // If no medicine data, use prescription ID as fallback
          qrContent = `prescription${id}`
        }

        console.log("Generated QR content:", qrContent)
        setQrData(qrContent)
        setTimerActive(true)
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch QR data:", err)
        setError("Failed to generate QR code. Please try again later.")
        setLoading(false)
      }
    }

    fetchQRData()
  }, [id])

  // Countdown timer effect
  useEffect(() => {
    let timer
    if (timerActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    } else if (countdown === 0) {
      // QR code expired, mark as used
      handleExpire()
    }

    return () => {
      clearInterval(timer)
    }
  }, [timerActive, countdown])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleExpire = async () => {
    try {
      await axios.put(`http://localhost:5000/api/patient/prescription/expire/${id}`)
      setQrData("")
      setError("QR code has expired. Please generate a new one if needed.")
      setTimerActive(false)
    } catch (err) {
      console.error("Failed to expire QR code:", err)
    }
  }

  const handleBackToPrescriptions = () => {
    const patientId = localStorage.getItem("patientId")
    navigate(`/prescriptions/${patientId}`)
  }

  const regenerateQR = () => {
    setLoading(true)
    setError("")

    // Create a simple text string in the required format
    let qrContent = ""

    if (prescription.items && prescription.items.length > 0) {
      qrContent = prescription.items.map((item) => `${item.medicine_name}${item.quantity}`).join(":")
    } else if (prescription.medicine_name) {
      qrContent = `${prescription.medicine_name}${prescription.quantity}`
    } else {
      qrContent = `prescription${id}`
    }

    setQrData(qrContent)
    setCountdown(300)
    setTimerActive(true)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Generating QR code...</p>
      </div>
    )
  }

  return (
    <div className="qr-page">
      <div className="qr-container">
        <div className="qr-header">
          <h1>QR Code for Vending Machine</h1>
          <div className="header-actions">
            <ThemeToggle />
            <button onClick={handleBackToPrescriptions} className="back-button">
              Back to Prescriptions
            </button>
          </div>
        </div>

        {error ? (
          <div className="error-container">
            <div className="error-message">{error}</div>
            <button onClick={regenerateQR} className="regenerate-button">
              Try Again
            </button>
          </div>
        ) : (
          <div className="qr-content">
            {qrData && (
              <div className="qr-display">
                <div className="qr-code-wrapper">
                  <QRCodeCanvas
                    value={qrData}
                    size={300}
                    level="H" // High error correction level
                    includeMargin={true}
                    bgColor={"#FFFFFF"}
                    fgColor={"#000000"}
                    renderAs="canvas"
                  />
                </div>

                <div className="qr-timer">
                  <p>This QR code will expire in:</p>
                  <div className="countdown">{formatTime(countdown)}</div>
                </div>

                <p className="qr-instruction">
                  Please scan this QR code at the vending machine to collect your medicines
                </p>

                <button onClick={regenerateQR} className="regenerate-button">
                  Regenerate QR Code
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
