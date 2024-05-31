const mongoose = require("mongoose")

const initializeDatabase = () => {
  const dbUrl = process.env.DB_URL

  mongoose.connect(dbUrl, {})

  const db = mongoose.connection

  db.on("error", () => {
    console.error.bind(console, "MongoDB connection error:")
    process.exit(1)
  })
  db.once("open", () => {
    console.log("Connected to the database")
  })
}

module.exports = { initializeDatabase }
