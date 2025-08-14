// backend/db.js
const mysql = require("mysql2")

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // no password
  database: "medico",
})

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err)
  } else {
    console.log("Connected to MySQL Database")
  }
})

module.exports = db
