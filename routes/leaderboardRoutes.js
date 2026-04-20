const express = require("express");
const router = express.Router();
const {
  getGlobalLeaderboard,
} = require("../controllers/leaderboardController");
const { protect } = require("../middleware/authMiddleware");

// Get leaderboard
router.get("/", protect, getGlobalLeaderboard);

module.exports = router;
