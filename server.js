require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});
// Validate environment variables
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL;

if (!PORT || !MONGO_URI || !CLIENT_URL) {
  console.error("❌ Missing required environment variables: PORT, MONGO_URI, or CLIENT_URL");
  process.exit(1);
}

// Initialize Express App
const app = express();
app.use(express.json());

// CORS with strict env check
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

// Dynamically load all route files from the routes folder
const routesDir = path.join(__dirname, "routes");

fs.readdirSync(routesDir).forEach(file => {
  const route = require(path.join(routesDir, file));

  if (file === 'rejectedRequests.js' || file === 'acceptedRequests.js') {
    app.use("/api", route);
  } else if (file === 'payment.js') {
    app.use("/api/payment", route); // <-- this is where payment routes are mounted
  } else {
    app.use(route);
  }
});


// MongoDB connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
