const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./src/database/db");
const { loadAppRoutes } = require("./src/routes");
const { corsOptions } = require("./src/config/cors");
const { port } = require("./src/lib/exports");

const app = express();
initializeDatabase();
app.use(cors(corsOptions));
app.use(express.json());
loadAppRoutes(app);

app.get("/", (req, res) => {
  res.status(200).send("Server is running in development mode");
});

app.listen(port, () =>
  console.log(`Server is running on port http://localhost:${port}`)
);
