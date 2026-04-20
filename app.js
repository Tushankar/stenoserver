const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");

const app = express();

// Phase 7: Polish, Performance + Production setup
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(xss()); // Prevent XSS

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes.",
});

// Apply rate limiting (API level overall restriction)
app.use("/api", limiter);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/sessions", require("./routes/sessionRoutes"));
app.use("/api/texts", require("./routes/textRoutes"));
app.use("/api/analysis", require("./routes/analysisRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/leaderboard", require("./routes/leaderboardRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// 404 handler
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;
