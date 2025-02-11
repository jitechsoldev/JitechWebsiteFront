require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const jobOrderRoutes = require("./routes/jobOrderRoute");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Debugging: Check if MONGO_URI is being loaded
console.log("🔍 MONGO_URI from .env:", process.env.MONGO_URL);

// Check if MONGO_URI is defined before connecting
if (!process.env.MONGO_URL) {
  console.error("❌ MONGO_URI is undefined! Check your .env file.");
  process.exit(1); // Stop execution if MONGO_URI is missing
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api", jobOrderRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
