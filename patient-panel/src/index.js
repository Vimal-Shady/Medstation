import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import App from "./App"

// Clear any potentially invalid auth data on application start
const validateAuth = () => {
  const patientId = localStorage.getItem("patientId")

  // If patientId is invalid, clear all auth data
  if (!patientId || patientId === "undefined" || patientId === "null") {
    console.log("Clearing invalid auth data on application start")
    localStorage.removeItem("patientId")
    localStorage.removeItem("patientName")
    localStorage.removeItem("personalId")
  }
}

// Run auth validation before app starts
validateAuth()

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
