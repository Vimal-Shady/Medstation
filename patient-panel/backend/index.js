// backend/index.js
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const patientRoutes = require("./routes/patient")

const app = express()
const PORT = 5000

app.use(cors())
app.use(bodyParser.json())

app.use("/api/patient", patientRoutes)

app.get("/", (req, res) => {
  res.send("Pharmacy backend is running.")
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
