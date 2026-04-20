require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");
const TextPassage = require("../../models/TextPassage");
const passages = require("./passages.json");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();
    await TextPassage.deleteMany();
    await TextPassage.insertMany(passages);
    console.log("Passages seeded successfully!");
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
