const mongoose = require("mongoose");
const { databaseUrl } = require("../lib/exports");

const initializeDatabase = () => {
  if (!databaseUrl) {
    throw new Error("DB_URL is not defined in environment variables");
  }

  mongoose.connect(databaseUrl, {});

  const db = mongoose.connection;

  db.on("error", () => {
    console.error.bind(console, "MongoDB connection error:");
    process.exit(1);
  });
  db.once("open", () => {
    console.log("Connected to the database");
  });
};

module.exports = { initializeDatabase };
