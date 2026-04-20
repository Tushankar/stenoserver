const TextPassage = require("../models/TextPassage");
const { generatePracticePassage } = require("../services/aiService");

exports.getAllTexts = async (req, res) => {
  try {
    const { difficulty, examType, language, category, limit = 10, page = 1 } = req.query;

    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (examType) filter.examType = examType;
    if (language) filter.language = language;
    if (category) filter.category = category;

    const texts = await TextPassage.find(filter)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await TextPassage.countDocuments(filter);

    res.json({
      success: true,
      texts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRandomText = async (req, res) => {
  try {
    const { difficulty, examType } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (examType) filter.examType = examType;

    const count = await TextPassage.countDocuments(filter);
    const random = Math.floor(Math.random() * count);
    const text = await TextPassage.findOne(filter).skip(random);
    res.json({ success: true, text });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTextById = async (req, res) => {
  try {
    const text = await TextPassage.findById(req.params.id);
    if (!text)
      return res
        .status(404)
        .json({ success: false, message: "Passage not found" });
    res.json({ success: true, text });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateAIPassage = async (req, res) => {
  try {
    const {
      difficulty = "intermediate",
      examType = "SSC",
      weakKeys = [],
      weakPatterns = [],
      topics = "",
      wordCount = 100,
    } = req.body;

    // Map frontend difficulty names to internal names
    const difficultyMap = {
      easy: "beginner",
      medium: "intermediate",
      hard: "advanced",
    };

    const internalDifficulty = difficultyMap[difficulty] || difficulty;

    // Generate passage using AI
    const content = await generatePracticePassage({
      weakKeys,
      weakPatterns,
      level: internalDifficulty,
      examType,
      wordCount,
      topics,
    });

    // Create and save passage to database
    const passage = await TextPassage.create({
      title: `AI Generated - ${examType} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
      content,
      language: "english",
      difficulty: internalDifficulty,
      examType,
      category: "ai-generated",
      avgWPMRequired:
        difficulty === "easy" ? 60 : difficulty === "medium" ? 90 : 120,
    });

    res.status(201).json({
      success: true,
      text: passage,
      message: "AI passage generated successfully!",
    });
  } catch (err) {
    console.error("AI Passage Generation Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to generate AI passage",
    });
  }
};

exports.createText = async (req, res) => {
  try {
    // Basic admin check (could use proper authorization middleware later)
    if (req.user && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized as admin" });
    }
    const passage = await TextPassage.create(req.body);
    res.status(201).json({ success: true, passage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
