"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import Profile from "./components/Profile"
import PrescriptionHistory from "./components/PrescriptionHistory"
import QRGenerator from "./components/QRGenerator"
import DoctorConsultations from "./components/DoctorConsultations"
import Checkout from "./components/Checkout"
import PurchaseQR from "./components/PurchaseQR"
import VendingMachineSelection from "./components/VendingMachineSelection"
import "./styles/ThemeToggle.css"

function App() {
  // Add auth state to force re-render when auth changes
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check authentication on app load
    const checkAuth = () => {
      const patientId = localStorage.getItem("patientId")
      setIsAuthenticated(!!patientId && patientId !== "undefined" && patientId !== "null")
    }

    checkAuth()

    // Listen for storage changes (for multi-tab support)
    window.addEventListener("storage", checkAuth)

    return () => {
      window.removeEventListener("storage", checkAuth)
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/dashboard/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
              <Dashboard setIsAuthenticated={setIsAuthenticated} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
              <PrescriptionHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
              <QRGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
              <DoctorConsultations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vending-machine/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
              <VendingMachineSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-qr/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
              <PurchaseQR />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

// Improved Protected route component
function ProtectedRoute({ children, isAuthenticated, setIsAuthenticated }) {
  useEffect(() => {
    // Double-check authentication on protected route access
    const patientId = localStorage.getItem("patientId")
    if (!patientId || patientId === "undefined" || patientId === "null") {
      // Clear any invalid auth data
      localStorage.removeItem("patientId")
      localStorage.removeItem("patientName")
      localStorage.removeItem("personalId")
      setIsAuthenticated(false)
    }
  }, [setIsAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export default App
