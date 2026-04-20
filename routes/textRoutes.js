const express = require("express");
const router = express.Router();
const {
  getAllTexts,
  getRandomText,
  getTextById,
  createText,
} = require("../controllers/textController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getAllTexts);
router.get("/random", getRandomText);
router.get("/:id", getTextById);
router.post("/", protect, createText);

module.exports = router;
