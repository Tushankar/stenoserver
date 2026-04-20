const mongoose = require("mongoose");

const errorPatternSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patterns: [
      {
        from: String,
        to: String,
        frequency: Number,
        lastSeen: Date,
      },
    ],
    frequentMistakeWords: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("ErrorPattern", errorPatternSchema);
