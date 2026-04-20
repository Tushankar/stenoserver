require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");
const User = require("../../models/User");
const TextPassage = require("../../models/TextPassage");

const passages = [
  {
    title: "Basic Typing Practice",
    content: "The quick brown fox jumps over the lazy dog. This sentence contains every letter in the English alphabet. Typing it repeatedly helps improve your familiarity with the keyboard layout. Keep your fingers on the home row for best results.",
    difficulty: "beginner",
    examType: "General",
    language: "english"
  },
  {
    title: "SSC Stenographer Mock",
    content: "Madam Speaker, I rise to support the motion of thanks on the President's address. The government has taken several steps to ensure the welfare of the farmers and the youth of this country. We are committed to a transparent and accountable administration at all levels. The digital revolution is transforming our economy and creating new opportunities for every citizen. We must work together to build a strong and prosperous nation.",
    difficulty: "intermediate",
    examType: "SSC",
    language: "english"
  },
  {
    title: "Legal Dictation Sample",
    content: "In the High Court of Judicature at Allahabad, the petitioner has filed this writ petition under Article 226 of the Constitution of India. The grievance of the petitioner is that the respondent authorities have failed to perform their statutory duties. The records indicate that the notice was duly served on all parties concerned. However, no counter affidavit has been filed till date despite several opportunities.",
    difficulty: "advanced",
    examType: "Court",
    language: "english"
  },
  {
    title: "Railway Exam Text",
    content: "The Ministry of Railways is pleased to announce the schedule for the upcoming recruitment examinations. All candidates are advised to download their admit cards from the official website. The examination will be conducted in computer-based mode across multiple centers. Please follow the instructions carefully to avoid any inconvenience on the day of the exam.",
    difficulty: "beginner",
    examType: "Railway",
    language: "english"
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding...");

    // Seed Passages
    await TextPassage.deleteMany();
    await TextPassage.insertMany(passages);
    console.log("Passages seeded successfully!");

    process.exit();
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
