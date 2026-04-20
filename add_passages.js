const fs = require("fs");
const file = "data/seed/passages.json";
let data = JSON.parse(fs.readFileSync(file, "utf8"));

// Clear generated, keep original 55
data = data.slice(0, 55);

const hardWords = [
  "ubiquitous",
  "serendipity",
  "conundrum",
  "magnanimous",
  "meticulous",
  "ephemeral",
  "quintessential",
  "fastidious",
  "idiosyncratic",
  "clandestine",
  "cacophony",
  "esoteric",
  "sycophant",
  "mellifluous",
  "obfuscate",
  "perfunctory",
  "quixotic",
  "surreptitious",
  "trepidation",
  "vociferous",
  "anomaly",
  "capricious",
  "dichotomy",
  "enigma",
  "equivocal",
  "grandiose",
  "ineffable",
  "juxtaposition",
  "labyrinthine",
  "nefarious",
  "paradigm",
  "rhetoric",
  "symbiosis",
  "unprecedented",
  "venerable",
  "acrimonious",
  "belligerent",
  "circuitous",
  "demagogue",
  "efficacious",
  "facetious",
  "garrulous",
  "histrionic",
  "iconoclast",
  "loquacious",
  "munificent",
  "obstinate",
  "pedantic",
  "querulous",
  "recalcitrant",
  "sagacious",
  "taciturn",
  "vacillate",
  "zealous",
  "ambivalent",
  "benevolent",
  "cogent",
  "didactic",
  "empirical",
  "frivolous",
  "gregarious",
  "imperative",
  "jurisprudence",
  "litigation",
  "plaintiff",
  "defendant",
  "affidavit",
  "testimony",
  "bureaucracy",
  "constitution",
  "parliament",
  "senate",
  "legislation",
  "sovereign",
  "economic",
  "fluctuation",
  "inflation",
  "recession",
  "monetary",
  "fiscal",
  "deficit",
  "surplus",
  "dividend",
  "liquidity",
  "amortization",
  "arbitrage",
  "depreciation",
];

for (let i = 1; i <= 45; i++) {
  // Much longer passages containing hard words and varied vocabulary
  const contentLen = 80 + Math.floor(Math.random() * 40);
  let passageList = [];
  let recentWords = [];

  for (let j = 0; j < contentLen; j++) {
    let word;
    let attempts = 0;

    do {
      // Pick a random word from the hard dictionary
      word = hardWords[Math.floor(Math.random() * hardWords.length)];
      attempts++;
    } while (recentWords.includes(word) && attempts < 20); // Keep trying if it's recently used

    // Add to our recent memory array so it doesn't get drawn again right away
    recentWords.push(word);

    // Remember the last 30 words to prevent any close repetition
    if (recentWords.length > 30) recentWords.shift();

    // Adding basic punctuation for realistic sentences
    if (j > 0 && j % 10 === 0 && j < contentLen - 1) {
      word += ".";
    } else if (j > 0 && j % 6 === 0 && j < contentLen - 1) {
      word += ",";
    }

    passageList.push(word);
  }

  let content = passageList.join(" ") + ".";

  // Capitalize sentence beginnings
  content = content.replace(/(^\w|\.\s+\w)/gi, (match) => match.toUpperCase());

  data.push({
    title: `Advanced Vocabulary Drill ${i}`,
    content: content,
    language: "english",
    difficulty: ["intermediate", "advanced"][Math.floor(Math.random() * 2)],
    examType: ["SSC", "Court", "Railway", "General"][
      Math.floor(Math.random() * 4)
    ],
    category: ["legal", "finance", "education", "environment"][
      Math.floor(Math.random() * 4)
    ],
    avgWPMRequired: 80 + Math.floor(Math.random() * 40),
  });
}

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log(
  "Regenerated 45 custom passages with extensive hard vocabulary! Total is now: " +
    data.length,
);
