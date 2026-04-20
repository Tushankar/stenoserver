const express = require("express");
const router = express.Router();
const {
  getAllTexts,
  getRandomText,
  getTextById,
  createText,
  generateAIPassage,
} = require("../controllers/textController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getAllTexts);
router.get("/random", getRandomText);
router.post("/generate-ai", generateAIPassage);
router.get("/:id", getTextById);
router.post("/", protect, createText);

module.exports = router;
