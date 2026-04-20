const Session = require("../models/Session");
const { getNextDifficulty } = require("../services/adaptiveDifficultyService");

exports.getProgressData = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .select("wpm accuracy completedAt mode errorCount duration")
      .sort({ completedAt: 1 })
      .limit(50);

    const wpmTrend = sessions.map((s) => ({
      date: s.completedAt,
      wpm: s.wpm || 0,
      accuracy: s.accuracy || 0,
      mode: s.mode || "practice",
    }));

    // Moving average WPM
    const movingAvg = wpmTrend.map((_, i, arr) => {
      const slice = arr.slice(Math.max(0, i - 4), i + 1);
      return (
        Math.round(slice.reduce((s, v) => s + v.wpm, 0) / slice.length) || 0
      );
    });

    // Predicted WPM (simple linear regression)
    const n = wpmTrend.length;
    let predictedWPM = null;
    if (n >= 5) {
      const xMean = (n - 1) / 2;
      const yMean = wpmTrend.reduce((s, v) => s + v.wpm, 0) / n;
      const slopeDenom = wpmTrend.reduce(
        (s, _, i) => s + Math.pow(i - xMean, 2),
        0,
      );
      const slope =
        slopeDenom === 0
          ? 0
          : wpmTrend.reduce((s, v, i) => s + (i - xMean) * (v.wpm - yMean), 0) /
            slopeDenom;
      predictedWPM = Math.round(yMean + slope * (n + 6)) || 0; // ~7 sessions ahead
    }

    res.json({ success: true, wpmTrend, movingAvg, predictedWPM });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWeakKeyAnalysis = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .select("keystrokeData weakKeysDetected")
      .sort({ completedAt: -1 })
      .limit(10);

    const keyStats = {};
    sessions.forEach((session) => {
      (session.keystrokeData || []).forEach((k) => {
        if (!k || !k.key) return;
        if (!keyStats[k.key])
          keyStats[k.key] = { total: 0, errors: 0, totalDelay: 0 };
        keyStats[k.key].total++;
        if (!k.correct) keyStats[k.key].errors++;
        keyStats[k.key].totalDelay += k.delayMs || 0;
      });
    });

    const heatmapData = Object.entries(keyStats)
      .map(([key, v]) => ({
        key,
        errorRate: v.total > 0 ? v.errors / v.total : 0,
        avgDelay: v.total > 0 ? v.totalDelay / v.total : 0,
        totalAttempts: v.total,
        score:
          v.total > 0
            ? (v.errors / v.total) * 0.7 +
              Math.min(v.totalDelay / v.total / 500, 1) * 0.3
            : 0,
      }))
      .sort((a, b) => b.score - a.score);

    // Mock slowBigrams generator for Phase 6 AI consumption
    const slowBigrams = ["th", "re", "ing", "ed", "st"].slice(0, 3);

    res.json({ success: true, heatmapData, slowBigrams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(100);

    const totalSessions = sessions.length;
    const avgWPM =
      totalSessions > 0
        ? Math.round(
            sessions.reduce((s, se) => s + (se.wpm || 0), 0) / totalSessions,
          )
        : 0;
    const avgAccuracy =
      totalSessions > 0
        ? Math.round(
            sessions.reduce((s, se) => s + (se.accuracy || 0), 0) /
              totalSessions,
          )
        : 0;
    const bestWPM =
      totalSessions > 0 ? Math.max(...sessions.map((s) => s.wpm || 0)) : 0;

    const recent = sessions.slice(0, 5);
    const adaptiveLevel = getNextDifficulty
      ? getNextDifficulty(recent)
      : "intermediate";

    // Calculate Streak
    let streak = 0;
    if (sessions.length > 0) {
      const dates = [
        ...new Set(
          sessions
            .map((s) => {
              if (!s.completedAt) return 0;
              const d = new Date(s.completedAt);
              if (isNaN(d.getTime())) return 0;
              return new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate(),
              ).getTime();
            })
            .filter((t) => t > 0),
        ),
      ];

      const today = new Date();
      const todayTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ).getTime();

      let checkDate = dates.includes(todayTime)
        ? todayTime
        : todayTime - 86400000;

      for (const d of dates) {
        if (d === checkDate) {
          streak++;
          checkDate -= 86400000;
        } else if (d < checkDate) {
          break;
        }
      }
    }

    res.json({
      success: true,
      stats: {
        totalSessions,
        avgWPM,
        avgAccuracy,
        bestWPM,
        streak,
        adaptiveLevel,
      },
      recent,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
