const fs = require("fs");
const file = "data/seed/passages.json";
let data = JSON.parse(fs.readFileSync(file, "utf8"));

for (let i = 1; i <= 45; i++) {
  const contentLen = 30 + Math.floor(Math.random() * 20);
  const dict = [
    "the",
    "quick",
    "brown",
    "fox",
    "jumps",
    "over",
    "lazy",
    "dog",
    "stenography",
    "practice",
    "session",
    "court",
    "trial",
    "government",
    "policy",
    "market",
    "economy",
    "growth",
    "education",
    "health",
    "system",
    "technology",
    "innovation",
    "development",
    "infrastructure",
    "public",
    "private",
    "sector",
    "investment",
    "capital",
    "skills",
    "wpm",
    "shorthand",
    "transcription",
    "accuracy",
    "keyboard",
    "layout",
  ];

  let passage = [];
  for (let j = 0; j < Math.floor(contentLen * 5); j++) {
    let word = dict[Math.floor(Math.random() * dict.length)];
    if (j % 12 === 0 && j > 0) word += ".";
    passage.push(word);
  }
  let content = passage.join(" ") + ".";
  content = content.charAt(0).toUpperCase() + content.slice(1);

  data.push({
    title: `Custom Drill Passage ${i}`,
    content: content,
    language: "english",
    difficulty: ["beginner", "intermediate", "advanced"][
      Math.floor(Math.random() * 3)
    ],
    examType: ["SSC", "Court", "Railway", "General"][
      Math.floor(Math.random() * 4)
    ],
    category: ["general", "legal", "finance", "education"][
      Math.floor(Math.random() * 4)
    ],
    avgWPMRequired: 60 + Math.floor(Math.random() * 60),
  });
}
fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log("Added 45 custom passages! Total is now: " + data.length);
