require("dotenv").config();
const express = require("express");
const cors = require("cors");

const locationRoutes = require("./routes/locationRoutes");
const phraseRoutes = require("./routes/phraseRoutes");
const apiRoutes = require("./routes/apiRoutes");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "VESNS API running" });
});

// ===== ROUTES =====
app.use("/auth", authRoutes);          // 🔥 IMPORTANT
app.use("/locations", locationRoutes); // 🔥 Protected later
app.use("/phrases", phraseRoutes);     // 🔥 Protected
app.use("/api", apiRoutes);
app.use("/ai", aiRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    status: "error",
    data: null,
    message: "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    data: null,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 VESNS Backend running at http://localhost:${PORT}`);
});
