import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/item.route.js";

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

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`${SERVER_NAME} running on port ${PORT}`);
});
