const express = require("express");
const router = express.Router();
const {
  createSession,
  getMySessions,
  getSessionById,
} = require("../controllers/sessionController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.post("/", createSession);
router.get("/", getMySessions);
router.get("/:id", getSessionById);

module.exports = router;
