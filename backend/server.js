import express from "express";
import bcrypt from "bcryptjs";
import axios from "axios";
import jwt from "jsonwebtoken";
import cors from "cors";
import "dotenv/config";
import prisma from "./lib/prisma.js";
import FormData from "form-data";
import { getGeminiResponse } from "./services/geminiService.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Aval backend is running!",
  });
});

app.get("/api/test", async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json({
      success: true,
      message: "Database connection is working!",
      users,
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === "MENTOR" ? "MENTOR" : "USER",
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Apply to become a mentor
app.post("/api/mentor/apply", verifyToken, async (req, res) => {
  try {
    const { bio, profession, experience } = req.body;

    const existing = await prisma.mentorProfile.findUnique({ where: { userId: req.userId } });
    if (existing) {
      return res.status(400).json({ success: false, message: "You already applied to be a mentor" });
    }

    const mentorProfile = await prisma.mentorProfile.create({
      data: {
        userId: req.userId,
        bio,
        profession,
        experience: experience ? parseInt(experience) : null,
      },
    });

    res.json({ success: true, mentorProfile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Browse approved mentors (any logged-in user)
app.get("/api/mentors", verifyToken, async (req, res) => {
  try {
    const mentors = await prisma.mentorProfile.findMany({
      where: { verificationStatus: "APPROVED" },
      include: { user: { select: { name: true, email: true } } },
    });

    res.json({ success: true, mentors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Request mentorship from an approved mentor
app.post("/api/mentor/request", verifyToken, async (req, res) => {
  try {
    const { mentorProfileId } = req.body;

    const mentor = await prisma.mentorProfile.findUnique({ where: { id: mentorProfileId } });
    if (!mentor || mentor.verificationStatus !== "APPROVED") {
      return res.status(400).json({ success: false, message: "Mentor not available" });
    }

    const existing = await prisma.mentorRequest.findFirst({
      where: { userId: req.userId, mentorProfileId },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Already requested" });
    }

    const request = await prisma.mentorRequest.create({
      data: { userId: req.userId, mentorProfileId },
    });

    res.json({ success: true, request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: view all pending mentor applications
app.get("/api/admin/mentor-applications", verifyToken, async (req, res) => {
  try {
    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admins only" });
    }

    const applications = await prisma.mentorProfile.findMany({
      where: { verificationStatus: "PENDING" },
      include: { user: { select: { name: true, email: true } } },
    });

    res.json({ success: true, applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: approve or reject a mentor application
app.post("/api/admin/mentor-applications/:id", verifyToken, async (req, res) => {
  try {
    if (req.userRole !== "ADMIN") {
      return res.status(403).json({ success: false, message: "Admins only" });
    }

    const { status } = req.body; // "APPROVED" or "REJECTED"
    const id = parseInt(req.params.id);

    const updated = await prisma.mentorProfile.update({
      where: { id },
      data: { verificationStatus: status },
    });

    res.json({ success: true, mentorProfile: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Load the logged-in user's saved app data
app.get("/api/user-data", verifyToken, async (req, res) => {
  try {
    const userData = await prisma.userData.findUnique({
      where: { userId: req.userId },
    });

    res.json({ success: true, userData: userData || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Save (create or update) the logged-in user's app data
app.put("/api/user-data", verifyToken, async (req, res) => {
  try {
    const { profile, financeCompleted, budget, skills, savedJobs, resume, careerProfile } = req.body;

    const userData = await prisma.userData.upsert({
      where: { userId: req.userId },
      update: { profile, financeCompleted, budget, skills, savedJobs, resume, careerProfile },
      create: { userId: req.userId, profile, financeCompleted, budget, skills, savedJobs, resume, careerProfile },
    });

    res.json({ success: true, userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
app.post("/api/voice/stt", async (req, res) => {
  try {
    const { audioBase64, languageCode, mimeType } = req.body;

    const audioBuffer = Buffer.from(audioBase64, "base64");

    const cleanMimeType = (mimeType || "audio/wav").split(";")[0]; // strip ";codecs=opus"
    const ext = cleanMimeType.includes("webm") ? "webm" : "wav";

    const formData = new FormData();
    formData.append("file", audioBuffer, {
      filename: `audio.${ext}`,
      contentType: cleanMimeType,
    });
    formData.append("language_code", languageCode);
    formData.append("model", "saarika:v2.5");

    const response = await axios.post(
      "https://api.sarvam.ai/speech-to-text",
      formData,
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          ...formData.getHeaders(),
        },
      }
    );

    res.json({ success: true, text: response.data.transcript });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: "STT failed" });
  }
});

app.post("/api/voice/tts", async (req, res) => {
  try {
    const { text, languageCode } = req.body;

    const response = await axios.post(
      "https://api.sarvam.ai/text-to-speech",
      {
        inputs: [text],
        target_language_code: languageCode,
        speaker: "anushka",
        model: "bulbul:v2",
      },
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, audios: response.data.audios });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: "TTS failed" });
  }
});
app.post("/api/voice/chat", async (req, res) => {
  try {
    const { message, lang } = req.body;

    const langNames = {
      en: "English", ta: "Tamil", te: "Telugu",
      ml: "Malayalam", hi: "Hindi", kn: "Kannada",
    };
    const languageName = langNames[lang] || "English";

    const systemPrompt = `You are Aval, a warm, encouraging voice assistant inside a women's financial-readiness and career-restart app.
Always reply in ${languageName}, in 1-3 short, natural, conversational sentences — caring and supportive.
The app has these sections: finance, career, budget, mentors, dashboard.
If the user's message clearly wants to go to one of these sections, include its key in "navigateTo". Otherwise use null — most messages (questions, chit-chat, advice) should have navigateTo as null.
Respond ONLY with valid JSON, nothing else, in exactly this shape:
{"reply": "your spoken reply here", "navigateTo": "finance" | "career" | "budget" | "mentors" | "dashboard" | null}`;

    const response = await axios.post(
      "https://api.sarvam.ai/v1/chat/completions",
      {
        model: "sarvam-105b-conversations",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.4,
        max_tokens: 300,
      },
      {
        headers: {
          "api-subscription-key": process.env.SARVAM_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

        const rawText = response.data.choices[0].message.content.trim();
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let reply = cleaned;
    let navigateTo = null;

    try {
      const parsed = JSON.parse(cleaned);
      reply = parsed.reply;
      navigateTo = parsed.navigateTo;
    } catch {
      // Model replied in plain text instead of JSON — just use it as-is
      reply = cleaned;
    }

    res.json({ success: true, reply, navigateTo });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Chat failed" });
  }
});

app.post("/api/assistant/chat", verifyToken, async (req, res) => {
  try {
    const { message, currentPage, language, pageContext, conversationHistory } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const { reply, suggestedAction } = await getGeminiResponse({
      message,
      currentPage: currentPage || "dashboard",
      pageContext: pageContext || {},
      language: language || "en",
      conversationHistory: conversationHistory || [],
    });

    res.json({ success: true, reply, language: language || "en", suggestedActions: suggestedAction ? [suggestedAction] : [] });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Sorry, I'm having trouble connecting right now. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Aval backend running on http://localhost:${PORT}`);
});
