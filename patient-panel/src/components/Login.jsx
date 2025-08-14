"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "../styles/Login.css"

export default function Login({ setIsAuthenticated }) {
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
    address: "",
    contact_no: "",
  })

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeForm, setActiveForm] = useState("login")
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const navigate = useNavigate()

  // Clear any stale auth data and check for valid authentication
  useEffect(() => {
    const checkAuthentication = () => {
      setCheckingAuth(true)

      // Get authentication data
      const patientId = localStorage.getItem("patientId")

      // Validate authentication data
      if (patientId && patientId !== "undefined" && patientId !== "null") {
        console.log("Valid authentication found, redirecting to dashboard")
        setIsAuthenticated(true)
        setTimeout(() => {
          navigate(`/dashboard/${patientId}`)
        }, 100)
      } else {
        // Clear any invalid auth data
        console.log("No valid authentication found, staying on login page")
        localStorage.removeItem("patientId")
        localStorage.removeItem("patientName")
        localStorage.removeItem("personalId")
        setIsAuthenticated(false)
      }

      setCheckingAuth(false)
    }

    // Small delay to ensure we stay on login page initially
    setTimeout(checkAuthentication, 300)
  }, [navigate, setIsAuthenticated])

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await axios.post("http://localhost:5000/api/patient/signup", signupData)
      if (res.data.success) {
        setSignupSuccess(true)
        setActiveForm("login")
        setLoginData((prev) => ({ ...prev, email: signupData.email }))
        setSignupData({
          name: "",
          email: "",
          password: "",
          age: "",
          gender: "",
          address: "",
          contact_no: "",
        })
        setTimeout(() => {
          setSignupSuccess(false)
        }, 5000)
      } else {
        setError(res.data.message || "Signup failed.")
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Server error during signup.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await axios.post("http://localhost:5000/api/patient/login", loginData)
      if (res.data.success) {
        // Set authentication data
        localStorage.setItem("patientId", res.data.patientId)
        localStorage.setItem("patientName", res.data.name)
        setIsAuthenticated(true)
        navigate(`/dashboard/${res.data.patientId}`)
      } else {
        setError(res.data.message || "Login failed.")
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Server error during login.")
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (checkingAuth) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="login-container">
      <div className="app-title">
        <h1>MediVend</h1>
        <p>Your Pharmacy Vending Solution</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {signupSuccess && (
        <div
          className="success-message"
          style={{
            backgroundColor: "rgba(40, 167, 69, 0.2)",
            color: "#28a745",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "1rem",
            textAlign: "center",
            border: "1px solid rgba(40, 167, 69, 0.3)",
          }}
        >
          Signup successful! Please login with your credentials.
        </div>
      )}

      <div className="forms-container">
        <div className="form-section active">
          <h2>{activeForm === "login" ? "Welcome Back" : "Create Account"}</h2>
          <form onSubmit={activeForm === "login" ? handleLogin : handleSignup}>
            {activeForm === "signup" && (
              <>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={signupData.age}
                    onChange={(e) => setSignupData({ ...signupData, age: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={signupData.gender}
                    onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    value={signupData.contact_no}
                    onChange={(e) => setSignupData({ ...signupData, contact_no: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={signupData.address}
                    onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                    required
                  ></textarea>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={activeForm === "login" ? loginData.email : signupData.email}
                onChange={(e) =>
                  activeForm === "login"
                    ? setLoginData({ ...loginData, email: e.target.value })
                    : setSignupData({ ...signupData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={activeForm === "login" ? loginData.password : signupData.password}
                onChange={(e) =>
                  activeForm === "login"
                    ? setLoginData({ ...loginData, password: e.target.value })
                    : setSignupData({ ...signupData, password: e.target.value })
                }
                required
              />
            </div>
            <center>
              <button style={{ width: "100px" }} type="submit" disabled={loading}>
                {loading
                  ? activeForm === "login"
                    ? "Logging in..."
                    : "Creating Account..."
                  : activeForm === "login"
                    ? "Login"
                    : "Sign Up"}
              </button>
            </center>
            <p style={{ textAlign: "center", marginTop: "1rem", color: "#aaaaaa" }}>
              {activeForm === "login" ? "Don't have an account?" : "Already have an account?"}
              <span
                onClick={() => setActiveForm(activeForm === "login" ? "signup" : "login")}
                style={{
                  color: "#3a86ff",
                  cursor: "pointer",
                  marginLeft: "0.5rem",
                  fontWeight: "500",
                }}
              >
                {activeForm === "login" ? "Sign up" : "Login"}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
