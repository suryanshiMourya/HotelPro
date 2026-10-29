
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import routes only once
const authRoutes = require("./routes/authRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const roomRoutes = require("./routes/roomRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Home route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to HotelPro API",
    status: "Running",
    version: "1.0.0"
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomRoutes);
// Handle unknown routes (keep this last)
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found"
  });
});

// Start server after database connection
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`HotelPro server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start HotelPro:", error.message);
    process.exit(1);
  }
};

startServer();
