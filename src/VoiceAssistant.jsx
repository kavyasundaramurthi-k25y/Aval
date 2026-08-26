import { useEffect, useRef, useState } from "react";
import { Volume2, Mic, X, Square, MessageCircle, Send } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

const LANGUAGE_META = {
  en: { speech: "en-IN", name: "English", placeholder: "Type a message...", listening: "Listening..." },
  ta: { speech: "ta-IN", name: "தமிழ்", placeholder: "செய்தியை தட்டச்சு செய்யவும்...", listening: "கேட்கிறேன்..." },
  te: { speech: "te-IN", name: "తెలుగు", placeholder: "సందేశం టైప్ చేయండి...", listening: "వింటున్నాను..." },
  ml: { speech: "ml-IN", name: "മലയാളം", placeholder: "സന്ദേശം ടൈപ്പ് ചെയ്യുക...", listening: "കേൾക്കുന്നു..." },
  hi: { speech: "hi-IN", name: "हिन्दी", placeholder: "संदेश टाइप करें...", listening: "सुन रही हूँ..." },
  kn: { speech: "kn-IN", name: "ಕನ್ನಡ", placeholder: "ಸಂದೇಶ ಟೈಪ್ ಮಾಡಿ...", listening: "ಕೇಳುತ್ತಿದ್ದೇನೆ..." },
};

const WELCOME_MESSAGE = {
  en: "Hi, I'm Aval. Ask me anything — about finances, your career, or how to use this page.",
  ta: "வணக்கம், நான் அவள். நிதி, தொழில், அல்லது இந்தப் பக்கத்தைப் பற்றி என்னிடம் எதுவும் கேளுங்கள்.",
  te: "నమస్కారం, నేను అవళ్. ఆర్థికం, కెరీర్ లేదా ఈ పేజీ గురించి నన్ను ఏదైనా అడగండి.",
  ml: "നമസ്കാരം, ഞാൻ അവൾ. സാമ്പത്തികം, കരിയർ, അല്ലെങ്കിൽ ഈ പേജിനെക്കുറിച്ച് എന്നോട് എന്തും ചോദിക്കൂ.",
  hi: "नमस्ते, मैं अवल हूँ। पैसे, करियर या इस पेज के बारे में मुझसे कुछ भी पूछें।",
  kn: "ನಮಸ್ಕಾರ, ನಾನು ಅವಳ್. ಹಣಕಾಸು, ವೃತ್ತಿ, ಅಥವಾ ಈ ಪುಟದ ಬಗ್ಗೆ ನನ್ನನ್ನು ಏನಾದರೂ ಕೇಳಿ.",
};

export default function VoiceAssistant({ lang = "en", currentPage = "dashboard", pageContext = {}, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState("");

  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const scrollRef = useRef(null);

  const meta = LANGUAGE_META[lang] || LANGUAGE_META.en;
  const token = localStorage.getItem("aval_token");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const speakReply = async (text) => {
    try {
      audioRef.current?.pause();
      const res = await fetch(`${BACKEND_URL}/api/voice/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, languageCode: meta.speech }),
      });
      const data = await res.json();
      if (!data.success || !data.audios?.[0]) return;

      const audio = new Audio(`data:audio/wav;base64,${data.audios[0]}`);
      audioRef.current = audio;
      audio.onplay = () => setSpeaking(true);
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);
      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
    }
  };

  const stopSpeaking = () => {
    audioRef.current?.pause();
    setSpeaking(false);
  };

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const newMessages = [...messages, { role: "user", message: trimmed }];
    setMessages(newMessages);
    setInputText("");
    setSending(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/assistant/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmed,
          currentPage,
          language: lang,
          pageContext,
          conversationHistory: newMessages,
        }),
      });
      const data = await res.json();

      const replyText = data.success
        ? data.reply
        : "Sorry, I'm having trouble connecting right now. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", message: replyText }]);
      speakReply(replyText);

      if (data.success && data.suggestedActions?.[0] && onNavigate) {
        // Suggested action is offered, not auto-triggered — see action button below
        setMessages((prev) =>
          prev.map((m, i) => (i === prev.length - 1 ? { ...m, suggestedAction: data.suggestedActions[0] } : m))
        );
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { role: "assistant", message: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  const startListening = () => {
  if (listening) {
    setListening(false);
    return;
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setMicError("Voice input is not supported in this browser.");
    return;
  }

  setMicError("");

  const recognition = new SpeechRecognition();

  recognition.lang = meta.speech;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    setListening(true);
  };

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;

    if (text && text.trim()) {
      sendMessage(text);
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);

    if (event.error === "not-allowed") {
      setMicError("Please allow microphone access in your browser.");
    } else if (event.error === "no-speech") {
      setMicError("I couldn't hear you. Please try again.");
    } else {
      setMicError("Could not understand your voice. Please try again.");
    }

    setListening(false);
  };

  recognition.onend = () => {
    setListening(false);
  };

  recognition.start();
};
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const actionLabels = {
    finance: "Open Finance", budget: "Open Budget", jobs: "Go to Jobs",
    resume: "Improve Resume", mentors: "View Mentors", readiness: "View Readiness", dashboard: "Go to Dashboard",
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[100] w-16 h-16 rounded-full bg-[#6b1730] text-[#f7df9b] border-2 border-[#c89b3c] shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center justify-center hover:scale-105 transition"
        aria-label="Open Aval Assistant"
      >
        {open ? <X size={25} /> : <MessageCircle size={27} />}
      </button>

      {open && (
        <div className="fixed bottom-28 right-6 z-[100] w-[360px] max-w-[calc(100vw-32px)] h-[520px] max-h-[calc(100vh-160px)] bg-[#f8ecd7] border-2 border-[#c89b3c] shadow-[0_15px_50px_rgba(50,20,20,0.28)] rounded-2xl overflow-hidden flex flex-col">
          <div className="bg-[#6b1730] text-white p-4 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-serif text-lg text-white">Aval</p>
                <p className="text-xs text-white opacity-80">{meta.name} · AI Assistant</p>
              </div>
              {speaking ? (
                <button onClick={stopSpeaking} aria-label="Stop speaking"><Square size={18} /></button>
              ) : (
                <Volume2 size={20} />
              )}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-white bg-white/60 rounded-xl p-3">
                {WELCOME_MESSAGE[lang] || WELCOME_MESSAGE.en}
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-[#a74735] text-white" : "bg-white/70 text-white"
                  }`}
                >
                  {m.message}
                  {m.suggestedAction && actionLabels[m.suggestedAction] && (
                    <button
                      onClick={() => onNavigate?.(m.suggestedAction)}
                      className="block mt-2 text-xs font-medium underline text-[#6b1730]"
                    >
                      {actionLabels[m.suggestedAction]} →
                    </button>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white/70 rounded-xl px-3.5 py-2.5 text-sm text-[#7a6a6a]">...</div>
              </div>
            )}
            {micError && <p className="text-xs text-rose-600">{micError}</p>}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-[#c89b3c]/40 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={startListening}
              className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2 transition ${
                listening ? "bg-[#c89b3c] border-[#c89b3c] text-[#35151c]" : "bg-transparent border-[#6b1730] text-[#6b1730]"
              }`}
              aria-label="Speak"
            >
              <Mic size={16} />
            </button>
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={listening ? meta.listening : meta.placeholder}
              className="flex-1 rounded-full border border-[#6b1730]/30 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="shrink-0 w-9 h-9 rounded-full bg-[#a74735] text-white flex items-center justify-center disabled:opacity-40"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}