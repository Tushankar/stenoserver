// Levenshtein distance + error classification
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0,
    ),
  );
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[a.length][b.length];
}

function classifyErrors(expected, typed) {
  const errors = [];
  const expWords = expected.split(" ");
  const typWords = typed.split(" ");
  expWords.forEach((word, i) => {
    const typedWord = typWords[i] || "";
    if (word !== typedWord) {
      let type = "substitution";
      if (!typedWord) type = "omission";
      else if (typedWord.length > word.length) type = "insertion";
      else if (
        word.split("").sort().join("") === typedWord.split("").sort().join("")
      )
        type = "transposition";
      errors.push({ position: i, expected: word, typed: typedWord, type });
    }
  });
  return errors;
}

function detectWeakKeys(keystrokeData) {
  const keyStats = {};
  keystrokeData.forEach((k) => {
    if (!keyStats[k.key])
      keyStats[k.key] = { total: 0, errors: 0, totalDelay: 0 };
    keyStats[k.key].total++;
    if (!k.correct) keyStats[k.key].errors++;
    keyStats[k.key].totalDelay += k.delayMs || 0;
  });

  return Object.entries(keyStats)
    .filter(([, v]) => v.total >= 3)
    .map(([key, v]) => ({
      key,
      errorRate: v.errors / v.total,
      avgDelayMs: v.totalDelay / v.total,
      score:
        (v.errors / v.total) * 0.7 +
        (Math.min(v.totalDelay / v.total, 500) / 500) * 0.3,
    }))
    .filter((k) => k.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((k) => k.key);
}

function calculateAccuracy(expected, typed) {
  const expChars = expected.length;
  let correct = 0;
  for (let i = 0; i < Math.min(expected.length, typed.length); i++) {
    if (expected[i] === typed[i]) correct++;
  }
  return expChars > 0 ? Math.round((correct / expChars) * 100) : 0;
}

module.exports = {
  levenshtein,
  classifyErrors,
  detectWeakKeys,
  calculateAccuracy,
};
