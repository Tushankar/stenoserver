const Session = require("../models/Session");
const User = require("../models/User");

exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const { period = "all", limit = 50 } = req.query;
    let dateFilter = {};
    if (period === "week")
      dateFilter = {
        completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      };
    if (period === "month")
      dateFilter = {
        completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      };

    const leaderboard = await Session.aggregate([
      { $match: { ...dateFilter } },
      {
        $group: {
          _id: "$userId",
          bestWPM: { $max: "$wpm" },
          avgAccuracy: { $avg: "$accuracy" },
          sessions: { $sum: 1 },
        },
      },
      { $sort: { bestWPM: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          email: "$user.email",
          examTarget: "$user.profile.examTarget",
          bestWPM: 1,
          avgAccuracy: { $round: ["$avgAccuracy", 1] },
          sessions: 1,
        },
      },
    ]);

    res.json({
      success: true,
      leaderboard: leaderboard.map((e, i) => ({ ...e, rank: i + 1 })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
