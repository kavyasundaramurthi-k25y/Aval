import axios from "axios";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

const LANGUAGE_NAMES = {
  en: "English", ta: "Tamil", te: "Telugu",
  ml: "Malayalam", hi: "Hindi", kn: "Kannada",
};

function buildSystemPrompt(currentPage, pageContext, languageName) {
  const pageGuides = {
    dashboard: "Help the user understand how to use AVAL and summarize their progress across finance, budget, career, and readiness.",
    finance: "Answer general financial-literacy questions clearly and simply. When relevant, refer to the user's own financial info provided below.",
    budget: "Help the user understand their spending, budgeting, and savings goals using the data provided below.",
    jobs: "Help with career choices, job recommendations, career breaks, skills, upskilling, and job searching. Use the user's career profile below if relevant.",
    resume: "Help create, improve, and rewrite resume content using the user's actual resume data below.",
    mentors: "Explain mentorship, help the user understand available mentors, and guide them through requesting mentorship.",
    readiness: "Explain the user's readiness assessment results, identify gaps, and suggest next steps.",
  };

  const guide = pageGuides[currentPage] || pageGuides.dashboard;
  const contextJson = pageContext ? JSON.stringify(pageContext) : "{}";

  return `You are Aval, a warm, patient, encouraging female career and financial guidance assistant inside the AVAL app, built for women — especially homemakers and women returning to work after a career break.

LANGUAGE RULE — VERY IMPORTANT:
Reply in the same language that the user's CURRENT MESSAGE is written in.

Detect the language of the user's message yourself. Do NOT blindly follow the app's selected language if it conflicts with the language used in the user's message.

Examples:
- If the user writes in Tamil, reply completely in Tamil.
- If the user writes in Telugu, reply completely in Telugu.
- If the user writes in Malayalam, reply completely in Malayalam.
- If the user writes in Hindi, reply completely in Hindi.
- If the user writes in Kannada, reply completely in Kannada.
- If the user writes in English, reply completely in English.

If the user mixes English with an Indian language, reply primarily in the Indian language they are using.
If the user's current message clearly switches language, immediately switch to that language.

The app's currently selected language is ${languageName}, but the user's CURRENT MESSAGE LANGUAGE has higher priority.

Never reply in English merely because the app language is English.
Never translate the user's message unless they ask you to translate it.

Tone: friendly, respectful, non-judgmental, simple, practical. Avoid technical jargon unless asked. Never sound robotic or repeat phrases like "According to your query." Speak naturally, like a supportive person, not a formal report.

The user is currently on the "${currentPage}" page of the app. ${guide}

Relevant data from this page (only use what's relevant to the question, don't recite it back verbatim):
${contextJson}

For financial questions: give general education, not personalized financial advice; never promise guaranteed returns; encourage professional advice for high-stakes decisions.

If the user's message suggests they want to take an action in the app (view mentors, open finance, go to jobs, improve resume, etc.), you may mention it naturally, but do NOT claim to have performed any action yourself — only the user can click buttons.

Keep responses conversational and concise (2-5 sentences) unless the user asks for more detail or a list.

Respond with ONLY the raw JSON object below, nothing else — no markdown, no explanation:
{"reply": "your natural spoken response here", "suggestedAction": "finance" | "budget" | "jobs" | "resume" | "mentors" | "readiness" | "dashboard" | null}`;
}

export async function getGeminiResponse({ message, currentPage, pageContext, language, conversationHistory }) {
  const languageName = LANGUAGE_NAMES[language] || "English";
  const systemPrompt = buildSystemPrompt(currentPage, pageContext, languageName);

  // Keep only the last 10 turns to control request size
  const trimmedHistory = (conversationHistory || []).slice(-10);

  const contents = [
  {
    role: "user",
    parts: [{ text: message }],
  },
];

  const response = await axios.post(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.6, maxOutputTokens: 800 },
    },
    { headers: { "Content-Type": "application/json" } }
  );

     const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let reply = cleaned;
  let suggestedAction = null;

  try {
    const parsed = JSON.parse(cleaned);
    reply = parsed.reply;
    suggestedAction = parsed.suggestedAction || null;
  } catch {
    // Try a full-match first (works even without the closing part)
    let match = cleaned.match(/"reply"\s*:\s*"([\s\S]*?)"\s*,\s*"suggestedAction"/);
    if (!match) {
      // Response likely got cut off before "suggestedAction" — grab everything after "reply": " instead
      match = cleaned.match(/"reply"\s*:\s*"([\s\S]*)/);
    }
    if (match) {
      reply = match[1]
        .replace(/\\"/g, '"')
        .replace(/\\n/g, "\n")
        .replace(/"\s*,?\s*"suggestedAction"[\s\S]*$/, "") // strip any trailing partial JSON
        .replace(/"$/, ""); // strip trailing quote if present
    } else {
      reply = cleaned;
    }
  }

  return { reply, suggestedAction };
}