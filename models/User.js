const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profile: {
      examTarget: { type: String, default: "SSC" },
      targetWPM: { type: Number, default: 80 },
      language: { type: String, default: "english" },
    },
    stats: {
      totalSessions: { type: Number, default: 0 },
      totalMinutesPracticed: { type: Number, default: 0 },
      bestWPM: { type: Number, default: 0 },
      avgAccuracy: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

// Phase 7: Optimization Indexes
userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
