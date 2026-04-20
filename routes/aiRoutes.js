const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const {
  generatePractice,
  analyzeSession,
  getExamReadiness,
} = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// Phase 5 Requirement: Rate limiter applied to /api/ai/* tracks (max 20 req/min)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per `window`
  message: {
    success: false,
    message: "Too many AI requests, please try again later.",
  },
});

router.use(protect);
router.use(aiLimiter);

router.post("/generate-passage", generatePractice);
router.post("/analyze/:sessionId", analyzeSession);
router.get("/readiness", getExamReadiness);

module.exports = router;
