const Groq = require("groq-sdk");

// Groq client — ultra-fast inference, OpenAI-compatible API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper: call Groq chat completion
async function chat(model, messages, maxTokens = 1024) {
  try {
    const response = await groq.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Groq API Error:", error.message);
    throw new Error("AI Service temporarily unavailable.");
  }
}

exports.generatePracticePassage = async ({
  weakKeys,
  weakPatterns,
  level,
  examType,
  wordCount,
  topics,
}) => {
  const topicPrompt = topics ? `- Focus primarily on these topics: ${topics}` : "";
  const prompt = `You are a steno typing trainer for Indian competitive exams (${examType}).

Generate a ${wordCount}-word practice passage that:
${topicPrompt}
- Has HIGH frequency of these characters/patterns: ${(weakKeys || []).join(", ")}
- Includes words with these bigrams: ${(weakPatterns || []).join(", ")}
- Matches ${level} difficulty
- Is government/legal/news style (realistic for steno exams)
- Uses proper English, no special characters

Output ONLY the passage text. No titles, no labels, no quotes.`;

  return await chat("llama-3.3-70b-versatile", [
    {
      role: "system",
      content:
        "You are a professional steno exam trainer. Output only the requested passage text, nothing else.",
    },
    { role: "user", content: prompt },
  ]);
};

exports.generateSessionAnalysis = async ({
  wpm,
  accuracy,
  errors,
  weakKeys,
  examType,
  targetWPM,
}) => {
  const errorSummary = errors
    .slice(0, 10)
    .map((e) => `"${e.expected}" → "${e.typed}"`)
    .join(", ");

  const prompt = `You are a professional steno coach analyzing a typing session for a ${examType} aspirant.

Session Data:
- WPM: ${wpm} (Target: ${targetWPM})
- Accuracy: ${accuracy}%
- Errors: ${errors.length} total
- Common mistakes: ${errorSummary}
- Weak keys: ${weakKeys.join(", ")}

Write a personalized coaching report (150-200 words) that:
1. Acknowledges what went well
2. Identifies the main issue clearly
3. Gives 2-3 specific, actionable practice tips
4. Estimates how many sessions to reach target WPM
5. Has an encouraging but honest tone

Be specific, not generic. Mention their actual weak keys and errors.`;

  return await chat("llama-3.3-70b-versatile", [
    {
      role: "system",
      content:
        "You are an expert steno coach. Give direct, personal, actionable feedback.",
    },
    { role: "user", content: prompt },
  ]);
};

exports.getExamReadinessScore = async ({
  avgWPM,
  avgAccuracy,
  consistencyScore,
  targetWPM,
}) => {
  const prompt = `Evaluate steno exam readiness based on these stats:
- Average WPM: ${avgWPM} (required: ${targetWPM})
- Accuracy: ${avgAccuracy}%
- Consistency score: ${consistencyScore}/10

Respond ONLY with a raw JSON object (no markdown, no backticks):
{
  "score": <0-100 number>,
  "level": "<Not Ready | Building | Almost Ready | Exam Ready>",
  "summary": "<1 sentence>",
  "nextMilestone": "<specific goal>"
}`;

  // Use smaller/faster model for structured JSON output
  const raw = await chat(
    "llama3-8b-8192",
    [
      {
        role: "system",
        content:
          "You are a JSON-only responder. Output ONLY valid JSON, no explanation, no markdown.",
      },
      { role: "user", content: prompt },
    ],
    256,
  );

  // Strip any accidental markdown fences
  const clean = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    return {
      score: 0,
      level: "Error",
      summary: "Could not parse AI response",
      nextMilestone: "Practice more to generate reliable data.",
    };
  }
};
