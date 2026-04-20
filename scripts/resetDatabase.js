require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");
const Session = require("../models/Session");
const ErrorPattern = require("../models/ErrorPattern");
const WeakKey = require("../models/WeakKey");

const resetDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Reset...");

    console.log("Clearing Users...");
    await User.deleteMany({});

    console.log("Clearing Sessions...");
    await Session.deleteMany({});

    console.log("Clearing ErrorPatterns...");
    await ErrorPattern.deleteMany({});

    console.log("Clearing WeakKeys...");
    await WeakKey.deleteMany({});

    console.log("✅ Database cleared successfully (Passages preserved)!");
    process.exit(0);
  } catch (err) {
    console.error("Error resetting database:", err.message);
    process.exit(1);
  }
};

resetDb();
