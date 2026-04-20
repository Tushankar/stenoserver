function getNextDifficulty(recentSessions) {
  if (!recentSessions || recentSessions.length < 3) return "beginner";
  const last3 = recentSessions.slice(0, 3);
  const avgAccuracy = last3.reduce((s, se) => s + (se.accuracy || 0), 0) / 3;
  const avgWPM = last3.reduce((s, se) => s + (se.wpm || 0), 0) / 3;
  const trend = (last3[0].wpm || 0) - (last3[2].wpm || 0);

  if (avgAccuracy > 95 && trend > 0) return "advanced";
  if (avgAccuracy < 80) return "beginner";
  return "intermediate";
}

module.exports = { getNextDifficulty };
