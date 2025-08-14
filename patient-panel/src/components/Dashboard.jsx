"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, Link, useNavigate } from "react-router-dom"
import "../styles/Dashboard.css"
import ThemeToggle from "./ThemeToggle"

export default function Dashboard({ setIsAuthenticated }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [prescriptions, setPrescriptions] = useState([])
  const [purchaseHistory, setPurchaseHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [patientName, setPatientName] = useState("")
  const [personalId, setPersonalId] = useState("")

  useEffect(() => {
    // Validate authentication on dashboard load
    const storedId = localStorage.getItem("patientId")

    // Redirect to login if no valid ID or if ID doesn't match URL parameter
    if (!storedId || storedId !== id) {
      console.log("Invalid authentication detected in Dashboard")
      localStorage.removeItem("patientId")
      localStorage.removeItem("patientName")
      localStorage.removeItem("personalId")
      setIsAuthenticated(false)
      navigate("/")
      return
    }

    const storedName = localStorage.getItem("patientName")
    const storedPersonalId = localStorage.getItem("personalId")

    if (storedName) {
      setPatientName(storedName)
    }

    if (storedPersonalId) {
      setPersonalId(storedPersonalId)
    }

    const fetchData = async () => {
      try {
        // Fetch profile information to get personal ID if not in localStorage
        if (!storedPersonalId) {
          const profileRes = await axios.get(`http://localhost:5000/api/patient/profile/${id}`)
          if (profileRes.data.personal_id) {
            setPersonalId(profileRes.data.personal_id)
            localStorage.setItem("personalId", profileRes.data.personal_id)
          }
        }

        // Fetch prescriptions
        const prescriptionsRes = await axios.get(`http://localhost:5000/api/patient/prescriptions/${id}`)
        setPrescriptions(prescriptionsRes.data)

        // Fetch purchase history
        const purchaseRes = await axios.get(`http://localhost:5000/api/patient/purchase-history/${id}`)
        setPurchaseHistory(purchaseRes.data)
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError("Failed to load data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, navigate, setIsAuthenticated])

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("patientId")
    localStorage.removeItem("patientName")
    localStorage.removeItem("personalId")
    // Update auth state
    setIsAuthenticated(false)
    // Force navigation to login
    navigate("/", { replace: true })
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  // Count pending prescriptions
  const pendingCount = prescriptions.filter((p) => p.status === "pending").length

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Patient Dashboard</h1>
        <div className="user-info">
          <h2><span style={{ width: "auto", fontsize:'150%'}}>Welcome, {patientName}</span></h2>
          <span className="personal-id-badge">ID: {personalId}</span>
          <ThemeToggle />
          <button onClick={handleLogout} className="btn btn-danger" style={{ width: "100px" }}>
            Logout
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-content">
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-icon prescription-icon">📋</div>
            <div className="card-content">
              <h3>Pending Prescriptions</h3>
              <p className="card-count">{pendingCount}</p>
              <Link to={`/prescriptions/${id}`} className="card-link">
                View All Prescriptions
              </Link>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon profile-icon">👤</div>
            <div className="card-content">
              <h3>My Profile</h3>
              <p>View and edit your personal information</p>
              <Link to={`/profile/${id}`} className="card-link">
                Manage Profile
              </Link>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon doctor-icon">👨‍⚕️</div>
            <div className="card-content">
              <h3>My Doctors</h3>
              <p>View your consulting doctors and their prescriptions</p>
              <Link to={`/doctors/${id}`} className="card-link">
                View Doctors
              </Link>
            </div>
          </div>
        </div>

        <div className="recent-prescriptions">
          <div className="section-header">
            <h2>Recent Prescriptions</h2>
            <Link to={`/prescriptions/${id}`} className="view-all">
              View All
            </Link>
          </div>

          {prescriptions.filter((p) => p.status === "pending").length === 0 ? (
            <div className="no-prescriptions">
              <p>You don't have any pending prescriptions.</p>
            </div>
          ) : (
            <div className="prescription-list">
              {prescriptions
                .filter((p) => p.status === "pending")
                .slice(0, 3)
                .map((prescription) => (
                  <div key={prescription.prescription_id} className="prescription-item">
                    <div className="prescription-details">
                      <h4>Prescription #{prescription.prescription_id}</h4>
                      <p>Prescribed by: Dr. {prescription.doctor_name || "Unknown"}</p>
                      <p>Date: {new Date(prescription.prescribed_at).toLocaleDateString()}</p>
                      <p>Medicines: {prescription.items?.length || 0}</p>
                    </div>
<div
  className="prescription-status"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
    backgroundColor: "#f8f9fa",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    marginBottom: "15px",
  }}
>
  <span
    className="status pending"
    style={{
      fontWeight: "bold",
      padding: "5px 10px",
      borderRadius: "3px",
      color: "#fff",
      backgroundColor: "#f0ad4e", // Orange color for pending status
    }}
  >
    Pending
  </span>
  <button
    onClick={() => navigate(`/prescriptions/${id}`)}
    className="btn btn-success btn-sm"
    style={{
      padding: "8px 16px",
      fontSize: "14px",
      border: "none",
      borderRadius: "3px",
      cursor: "pointer",
      backgroundColor: "#28a745", // Green color for success button
      color: "#fff",
      fontSize: "12px",
      transition: "background-color 0.3s ease",
    }}
    onMouseEnter={(e) => (e.target.style.backgroundColor = "#218838")} // Darker green on hover
    onMouseLeave={(e) => (e.target.style.backgroundColor = "#28a745")} // Revert back to original color
  >
    Checkout
  </button>
</div>


                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="recent-purchases">
          <div className="section-header">
            <h2>Recent Purchases</h2>
            <Link to={`/prescriptions/${id}`} className="view-all">
              View All
            </Link>
          </div>

          {purchaseHistory.length === 0 ? (
            <div className="no-prescriptions">
              <p>You don't have any purchase history yet.</p>
            </div>
          ) : (
            <div className="prescription-list">
              {purchaseHistory.slice(0, 3).map((purchase) => (
                <div key={purchase.purchase_id} className="prescription-item">
                  <div className="prescription-details">
                    <h4>
                      {purchase.items && purchase.items.length > 0
                        ? `${purchase.items[0].medicine_name}${purchase.items.length > 1 ? ` + ${purchase.items.length - 1} more` : ""}`
                        : "Medicine Purchase"}
                    </h4>
                    <p>Amount: ${Number.parseFloat(purchase.total_amount).toFixed(2)}</p>
                    <p>Date: {new Date(purchase.purchase_date).toLocaleDateString()}</p>
                    <p>
                      {purchase.items && purchase.items.length > 0 && purchase.items[0].vending_machine
                        ? `Vending Machine: ${purchase.items[0].vending_machine}`
                        : ""}
                    </p>
                  </div>
                  <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem",
                      marginBottom: "1rem",
                      borderBottom: "2px solid #FFD700",
                      backgroundColor: "hsl(var(--background))"
                    }}>
                      <span style={{
                        fontSize: "1rem",
                        color: "#28a745", 
                        fontWeight: 600,
                        paddingRight:'20px'
                      }}>
                        {purchase.payment_status || "Purchased"}
                      </span>
                      <Link to={`/purchase-qr/${purchase.purchase_id}`} style={{
                        padding: "0.5rem 1rem",
                        border: "none",
                        borderRadius: "0.25rem",
                        backgroundColor: "#007BFF",
                        color: "white",
                        textDecoration: "none",
                        fontSize: "0.875rem"
                      }} className="btn btn-primary btn-sm">
                        Bill Details
                      </Link>
                    </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
