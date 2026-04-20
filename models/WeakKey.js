const mongoose = require("mongoose");

const weakKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    keyStats: [
      {
        key: String,
        totalAttempts: Number,
        errorCount: Number,
        errorRate: Number,
        avgDelayMs: Number,
        score: Number,
      },
    ],
    slowBigrams: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("WeakKey", weakKeySchema);
