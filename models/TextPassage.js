const mongoose = require("mongoose");

const passageSchema = new mongoose.Schema(
  {
    title: String,
    content: { type: String, required: true },
    wordCount: Number,
    language: { type: String, enum: ["english", "hindi"], default: "english" },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    examType: { type: String, enum: ["SSC", "Railway", "Court", "General"] },
    category: String,
    avgWPMRequired: Number,
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

passageSchema.pre("save", function (next) {
  this.wordCount = this.content.trim().split(/\s+/).length;
  next();
});

// Phase 7: Optimization Indexes
passageSchema.index({ difficulty: 1, examType: 1 });

module.exports = mongoose.model("TextPassage", passageSchema);
