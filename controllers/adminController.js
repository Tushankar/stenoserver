const User = require("../models/User");
const Session = require("../models/Session");
const TextPassage = require("../models/TextPassage");

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSessions = await Session.countDocuments();
    const totalPassages = await TextPassage.countDocuments();

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-password");

    res.json({
      success: true,
      stats: { totalUsers, totalSessions, totalPassages },
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.createPassage = async (req, res) => {
  try {
    const { title, content, difficulty, examType, language } = req.body;
    const passage = await TextPassage.create({
      title,
      content,
      difficulty,
      examType,
      language,
    });
    res.status(201).json({ success: true, passage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
