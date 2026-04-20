const express = require("express");
const router = express.Router();
const {
  getProgressData,
  getWeakKeyAnalysis,
  getDashboardStats,
} = require("../controllers/analysisController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.get("/progress", getProgressData);
router.get("/weak-keys", getWeakKeyAnalysis);
router.get("/dashboard", getDashboardStats);

module.exports = router;
