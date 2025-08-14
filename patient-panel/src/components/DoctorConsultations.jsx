"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, Link, useNavigate } from "react-router-dom"
import "../styles/DoctorConsultations.css"
import ThemeToggle from "./ThemeToggle"

export default function DoctorConsultations() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctorData, setDoctorData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/patient/doctors/${id}`)
        setDoctorData(res.data)
      } catch (err) {
        console.error("Failed to fetch doctor data:", err)
        setError("Failed to load doctor consultation data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorData()
  }, [id])

  const handleBackToDashboard = () => {
    navigate(`/dashboard/${id}`)
  }

  if (loading) {
    return <div className="loading">Loading doctor consultations...</div>
  }

  return (
    <div className="doctors-container">
      <div className="doctors-header">
        <h1>My Doctors</h1>
        <div className="header-actions">
          <ThemeToggle />
          <button onClick={handleBackToDashboard} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {doctorData.length === 0 ? (
        <div className="no-doctors">
          <p>You are not currently consulting with any doctors.</p>
        </div>
      ) : (
        <div className="doctors-list">
          {doctorData.map((doctor) => (
            <div key={doctor.doctor_id} className="doctor-card">
              <div className="doctor-info">
                <div className="doctor-avatar">
                  <span>{doctor.name.charAt(0)}</span>
                </div>
                <div className="doctor-details">
                  <h3>Dr. {doctor.name}</h3>
                  <p className="specialization">{doctor.specialization}</p>
                  <p className="contact">Contact: {doctor.contact_no}</p>
                  <p className="since">Consulting since: {new Date(doctor.assigned_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
