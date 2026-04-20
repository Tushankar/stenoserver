const mongoose = require("mongoose");

const errorSchema = new mongoose.Schema(
  {
    position: Number,
    expected: String,
    typed: String,
    type: {
      type: String,
      enum: ["substitution", "transposition", "omission", "insertion"],
    },
  },
  { _id: false },
);

const keystrokeSchema = new mongoose.Schema(
  {
    key: String,
    timestamp: Number,
    correct: Boolean,
    delayMs: Number,
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    passageId: { type: mongoose.Schema.Types.ObjectId, ref: "TextPassage" },
    mode: {
      type: String,
      enum: ["typing", "dictation", "practice"],
      default: "typing",
    },
    duration: Number,
    wpm: Number,
    grossWPM: Number,
    accuracy: Number,
    errorCount: Number,
    correctChars: Number,
    totalChars: Number,
    errors: [errorSchema],
    keystrokeData: [keystrokeSchema],
    weakKeysDetected: [String],
    aiAnalysis: String,
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Phase 7: Optimization Indexes
sessionSchema.index({ userId: 1, completedAt: -1 });
sessionSchema.index({ wpm: -1 });

module.exports = mongoose.model("Session", sessionSchema);
