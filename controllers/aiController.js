const aiService = require("../services/aiService");
const Session = require("../models/Session");

exports.generatePractice = async (req, res) => {
  try {
    const { weakKeys, weakPatterns, level, wordCount } = req.body;
    const user = req.user;
    const passage = await aiService.generatePracticePassage({
      weakKeys: weakKeys || [],
      weakPatterns: weakPatterns || [],
      level: level || "intermediate",
      examType: user.profile?.examTarget || "SSC",
      wordCount: wordCount || 150,
    });
    res.json({ success: true, passage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.analyzeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session)
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });

    const analysis = await aiService.generateSessionAnalysis({
      wpm: session.wpm,
      accuracy: session.accuracy,
      errors: session.errors || [],
      weakKeys: session.weakKeysDetected || [],
      examType: req.user.profile?.examTarget || "SSC",
      targetWPM: req.user.profile?.targetWPM || 80,
    });

    session.aiAnalysis = analysis;
    await session.save();

    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExamReadiness = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(20);
    if (sessions.length < 3)
      return res.json({
        success: true,
        message: "Need more sessions",
        readiness: null,
      });

    const avgWPM = Math.round(
      sessions.reduce((s, se) => s + se.wpm, 0) / sessions.length,
    );
    const avgAccuracy = Math.round(
      sessions.reduce((s, se) => s + se.accuracy, 0) / sessions.length,
    );
    const wpmVariance = sessions.map((s) => s.wpm);
    const mean = avgWPM;
    const variance =
      wpmVariance.reduce((s, w) => s + Math.pow(w - mean, 2), 0) /
      wpmVariance.length;
    const consistencyScore = Math.max(
      0,
      10 - Math.round(Math.sqrt(variance) / 5),
    );

    const readiness = await aiService.getExamReadinessScore({
      avgWPM,
      avgAccuracy,
      consistencyScore,
      targetWPM: req.user.profile?.targetWPM || 80,
    });

    res.json({ success: true, readiness });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
