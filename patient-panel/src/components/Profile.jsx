"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import "../styles/Profile.css"
import ThemeToggle from "./ThemeToggle"

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    address: "",
    contact_no: "",
  })
  const [editable, setEditable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/patient/profile/${id}`)
        setProfile(res.data)
      } catch (err) {
        console.error("Failed to fetch profile:", err)
        setError("Failed to load profile data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [id])

  const handleUpdate = async () => {
    setLoading(true)
    try {
      const res = await axios.put(`http://localhost:5000/api/patient/profile/${id}`, profile)
      if (res.data.success) {
        alert("Profile updated successfully!")
        setEditable(false)
      } else {
        setError("Failed to update profile.")
      }
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Server error while updating profile.")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToDashboard = () => {
    navigate(`/dashboard/${id}`)
  }

  if (loading && !profile.name) {
    return <div className="loading">Loading profile data...</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Patient Profile</h1>
        <div className="profile-actions">
          <ThemeToggle />
          <button onClick={handleBackToDashboard} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="profile-card">
        <div className="profile-info">
          <div className="info-group">
            <label>Full Name</label>
            <input
              type="text"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              disabled={!editable}
              className={editable ? "editable" : ""}
            />
          </div>

          <div className="info-group">
            <label>Email</label>
            <input type="email" value={profile.email || ""} disabled className="disabled" />
          </div>

          <div className="info-group">
            <label>Age</label>
            <input
              type="number"
              value={profile.age || ""}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              disabled={!editable}
              className={editable ? "editable" : ""}
            />
          </div>

          <div className="info-group">
            <label>Gender</label>
            <select
              value={profile.gender || ""}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              disabled={!editable}
              className={editable ? "editable" : ""}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="info-group">
            <label>Contact Number</label>
            <input
              type="text"
              value={profile.contact_no || ""}
              onChange={(e) => setProfile({ ...profile, contact_no: e.target.value })}
              disabled={!editable}
              className={editable ? "editable" : ""}
            />
          </div>

          <div className="info-group">
            <label>Address</label>
            <textarea
              value={profile.address || ""}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              disabled={!editable}
              className={editable ? "editable" : ""}
            ></textarea>
          </div>
        </div>

        <div className="profile-actions">
          {!editable ? (
            <button onClick={() => setEditable(true)} className="btn btn-primary">
              Edit Profile
            </button>
          ) : (
            <>
              <button onClick={handleUpdate} className="btn btn-success" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={() => setEditable(false)} className="btn btn-secondary">
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
