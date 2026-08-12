const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const itemRoutes = require("./routes/itemRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SERVER_NAME = process.env.SERVER_NAME || "Backend-Unknown";
const DELAY = Number(process.env.DELAY || 0.1);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Load test endpoint for Exp 2
app.get("/load-test", async (req, res) => {
  if (DELAY > 0) {
    await new Promise((resolve) => setTimeout(resolve, DELAY * 1000));
  }

  res.json({
    server: SERVER_NAME,
    delay: DELAY
  });
});

// CRUD routes
app.use("/api/items", itemRoutes);

app.get("/", (req, res) => {
  res.send(`Backend server (${SERVER_NAME}) is running`);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`${SERVER_NAME} running on port ${PORT}`);
});
