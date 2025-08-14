// Utility functions for authentication

// Clear all authentication data from localStorage
export const clearAuthData = () => {
  localStorage.removeItem("patientId")
  localStorage.removeItem("patientName")
  localStorage.removeItem("personalId")
  // Add any other auth-related items here
}

// Check if user is authenticated
export const isAuthenticated = () => {
  const patientId = localStorage.getItem("patientId")
  return !!patientId && patientId !== "undefined" && patientId !== "null"
}

// Force logout and redirect to login page
export const forceLogout = (navigate, setIsAuthenticated) => {
  clearAuthData()
  if (setIsAuthenticated) {
    setIsAuthenticated(false)
  }
  if (navigate) {
    navigate("/", { replace: true })
  }
}
