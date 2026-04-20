const Session = require("../models/Session");
const User = require("../models/User");
const TextPassage = require("../models/TextPassage");
const {
  classifyErrors,
  detectWeakKeys,
  calculateAccuracy,
} = require("../services/errorAnalysisService");

exports.createSession = async (req, res) => {
  try {
    const {
      passageId,
      expectedText,
      typedText,
      keystrokeData,
      duration,
      mode,
    } = req.body;

    const safeExpectedText = expectedText || "";
    const safeTypedText = typedText || "";

    const errors = classifyErrors(safeExpectedText, safeTypedText);
    const weakKeys = detectWeakKeys(keystrokeData || []);
    const accuracy = calculateAccuracy(safeExpectedText, safeTypedText);

    // Default to at least 1 second to prevent Infinity/NaN on division by zero
    const safeDuration = Math.max(Number(duration) || 1, 1);
    const minutes = safeDuration / 60;

    // Standard WPM formulas (1 word = 5 characters)
    const grossWPM = Math.round(safeTypedText.length / 5 / minutes) || 0;
    const netWPM =
      Math.round(Math.max(0, grossWPM - errors.length / minutes)) || 0;

    const session = await Session.create({
      userId: req.user._id,
      passageId,
      mode: mode || "typing",
      duration: safeDuration,
      wpm: netWPM,
      grossWPM,
      accuracy: accuracy || 0,
      errorCount: errors.length,
      correctChars: Math.max(0, safeTypedText.length - errors.length),
      totalChars: safeExpectedText.length,
      errors,
      keystrokeData,
      weakKeysDetected: weakKeys,
    });

    // Update user stats
    const user = await User.findById(req.user._id);
    user.stats.totalSessions += 1;
    user.stats.totalMinutesPracticed += Math.round(duration / 60);
    if (netWPM > user.stats.bestWPM) user.stats.bestWPM = netWPM;
    const allSessions = await Session.find({ userId: req.user._id });
    user.stats.avgAccuracy = Math.round(
      allSessions.reduce((s, se) => s + se.accuracy, 0) / allSessions.length,
    );
    await user.save();

    if (passageId)
      await TextPassage.findByIdAndUpdate(passageId, {
        $inc: { usageCount: 1 },
      });

    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .populate("passageId", "title difficulty examType")
      .sort({ completedAt: -1 })
      .limit(20);
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate("passageId");
    if (!session || session.userId.toString() !== req.user._id.toString())
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
