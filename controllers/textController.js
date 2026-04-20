const TextPassage = require("../models/TextPassage");

exports.getAllTexts = async (req, res) => {
  try {
    const { difficulty, examType, language, limit = 10, page = 1 } = req.query;

    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (examType) filter.examType = examType;
    if (language) filter.language = language;

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
