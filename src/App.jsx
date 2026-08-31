import React, { useState, useEffect, useMemo, useCallback } from "react";import VoiceAssistant from "./VoiceAssistant";
import {
  Home, Wallet, Briefcase, FileText, Users, Compass, LayoutDashboard,
  Menu, X, ChevronRight, ChevronLeft, Check, Lock, Globe, TrendingUp,
  Sparkles, ArrowRight, IndianRupee, Star, Plus, Trash2, GraduationCap,
  MapPin, Clock, Shield, Heart, RotateCcw, Loader2, BookOpen, Circle
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Document, Page, View, Text as PdfText, Image as PdfImage, StyleSheet, PDFViewer, pdf } from "@react-pdf/renderer";
const BACKEND_URL = import.meta.env.VITE_API_URL;

/* =========================================================================
   AVAL — financial independence + career restart platform for homemakers.
   Self-contained preview build: in-memory React state only, no
   window.storage and no backend calls, so it always runs standalone.
   ========================================================================= */

/* ---------------------------- i18n ---------------------------- */

const LANGS = [
  { code: "en", label: "English" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "ml", label: "മലയാളം" },
  { code: "hi", label: "हिन्दी" },
  { code: "kn", label: "ಕನ್ನಡ" },
];

const T = {
  brand_tagline: { en: "Your money. Your skills. Your next step.", ta: "உங்கள் பணம். உங்கள் திறமைகள். உங்கள் அடுத்த அடி.", te: "మీ డబ్బు. మీ నైపుణ్యాలు. మీ తదుపరి అడుగు.", ml: "നിങ്ങളുടെ പണം. നിങ്ങളുടെ കഴിവുകൾ. നിങ്ങളുടെ അടുത്ത ചുവട്.", hi: "आपका पैसा। आपके हुनर। आपका अगला कदम।", kn: "ನಿಮ್ಮ ಹಣ. ನಿಮ್ಮ ಕೌಶಲ್ಯಗಳು. ನಿಮ್ಮ ಮುಂದಿನ ಹೆಜ್ಜೆ." },
  brand_sub: { en: "Build financial confidence and restart your career — one step at a time.", ta: "நிதி நம்பிக்கையை உருவாக்கி, உங்கள் தொழிலை மீண்டும் தொடங்குங்கள் — ஒவ்வொரு அடியாக.", te: "ఆర్థిక విశ్వాసాన్ని పెంచుకోండి, మీ కెరీర్‌ను తిరిగి ప్రారంభించండి — ఒక్కో అడుగు.", ml: "സാമ്പത്തിക ആത്മവിശ്വാസം വളർത്തി, നിങ്ങളുടെ കരിയർ വീണ്ടും തുടങ്ങൂ — ഒരു ചുവടു വീതം.", hi: "वित्तीय आत्मविश्वास बनाएं और अपना करियर फिर से शुरू करें — एक कदम एक बार में।", kn: "ಆರ್ಥಿಕ ವಿಶ್ವಾಸ ಬೆಳೆಸಿ, ನಿಮ್ಮ ವೃತ್ತಿಜೀವನವನ್ನು ಮತ್ತೆ ಆರಂಭಿಸಿ — ಒಂದೊಂದೇ ಹೆಜ್ಜೆ." },
  cta_start: { en: "Start my journey", ta: "என் பயணத்தைத் தொடங்கு", te: "నా ప్రయాణం ప్రారంభించండి", ml: "എന്റെ യാത്ര തുടങ്ങാം", hi: "मेरी यात्रा शुरू करें", kn: "ನನ್ನ ಪಯಣ ಆರಂಭಿಸಿ" },
  cta_how: { en: "Explore how it works", ta: "இது எப்படி செயல்படுகிறது எனப் பாருங்கள்", te: "ఇది ఎలా పనిచేస్తుందో చూడండి", ml: "ഇത് എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്ന് കാണുക", hi: "जानें यह कैसे काम करता है", kn: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ನೋಡಿ" },
  why_title: { en: "Why Aval exists", ta: "அவள் ஏன் இருக்கிறாள்", te: "అవళ్ ఎందుకు ఉంది", ml: "അവൾ എന്തിനു നിലനിൽക്കുന്നു", hi: "अवள் क्यों है", kn: "ಅವಳ್ ಏಕೆ ಇದೆ" },
  why_body: { en: "Most career platforms assume you already have a resume. Most finance apps assume you already earn. Aval starts where you actually are — with the skills you built running a home, and the money habits you're ready to grow.", ta: "பெரும்பாலான தொழில் தளங்கள் உங்களிடம் ஏற்கனவே resume இருக்கும் என நினைக்கின்றன. பெரும்பாலான நிதிக் கருவிகள் நீங்கள் ஏற்கனவே சம்பாதிக்கிறீர்கள் என நினைக்கின்றன. அவள் நீங்கள் இருக்கும் இடத்திலிருந்தே தொடங்குகிறாள் — வீட்டை நடத்திய திறமைகளுடன், வளர தயாராக இருக்கும் பண பழக்கங்களுடன்.", te: "చాలా కెరీర్ ప్లాట్‌ఫారమ్‌లు మీకు ఇప్పటికే రెజ్యూమ్ ఉందని అనుకుంటాయి. చాలా ఫైనాన్స్ యాప్‌లు మీరు ఇప్పటికే సంపాదిస్తున్నారని అనుకుంటాయి. అవళ్ మీరు నిజంగా ఉన్న చోటనే మొదలవుతుంది.", ml: "മിക്ക കരിയർ പ്ലാറ്റ്‌ഫോമുകളും നിങ്ങൾക്ക് ഇതിനകം റെസ്യൂമെ ഉണ്ടെന്ന് കരുതുന്നു. അവൾ നിങ്ങൾ യഥാർത്ഥത്തിൽ ഉള്ളിടത്തു നിന്ന് ആരംഭിക്കുന്നു — വീട് നടത്തി നേടിയ കഴിവുകളോടെ.", hi: "ज़्यादातर करियर प्लेटफ़ॉर्म मानते हैं कि आपके पास पहले से रिज़्यूमे है। ज़्यादातर फाइनेंस ऐप मानते हैं कि आप पहले से कमा रहे हैं। अवள் वहीं से शुरू होता है जहाँ आप असल में हैं — घर चलाकर बनाए गए हुनर के साथ।", kn: "ಹೆಚ್ಚಿನ ಕೆರಿಯರ್ ವೇದಿಕೆಗಳು ನಿಮ್ಮಲ್ಲಿ ಈಗಾಗಲೇ ರೆಸ್ಯೂಮ್ ಇದೆ ಎಂದು ಭಾವಿಸುತ್ತವೆ. ಅವಳ್ ನೀವು ನಿಜವಾಗಿಯೂ ಇರುವಲ್ಲಿಂದ ಆರಂಭವಾಗುತ್ತದೆ." },
  pillar_finance_title: { en: "Financial Independence", ta: "நிதி சுதந்திரம்", te: "ఆర్థిక స్వాతంత్ర్యం", ml: "സാമ്പത്തിക സ്വാതന്ത്ര്യം", hi: "वित्तीय स्वतंत्रता", kn: "ಆರ್ಥಿಕ ಸ್ವಾತಂತ್ರ್ಯ" },
  pillar_finance_body: { en: "Banking, budgeting, digital payment safety, and simple investing — explained in plain language, no jargon.", ta: "வங்கி, பட்ஜெட், டிஜிட்டல் பணப் பாதுகாப்பு, எளிய முதலீடு — எளிய மொழியில்.", te: "బ్యాంకింగ్, బడ్జెట్, డిజిటల్ చెల్లింపు భద్రత, సాధారణ పెట్టుబడి — సరళమైన భాషలో.", ml: "ബാങ്കിംഗ്, ബജറ്റിംഗ്, ഡിജിറ്റൽ പേയ്‌മെന്റ് സുരക്ഷ, ലളിതമായ നിക്ഷേപം — ലളിതമായ ഭാഷയിൽ.", hi: "बैंकिंग, बजट, डिजिटल भुगतान सुरक्षा और सरल निवेश — आसान भाषा में।", kn: "ಬ್ಯಾಂಕಿಂಗ್, ಬಜೆಟ್, ಡಿಜಿಟಲ್ ಪಾವತಿ ಸುರಕ್ಷತೆ, ಸರಳ ಹೂಡಿಕೆ — ಸರಳ ಭಾಷೆಯಲ್ಲಿ." },
  pillar_career_title: { en: "Career Restart", ta: "தொழில் மறுதொடக்கம்", te: "కెరీర్ పునఃప్రారంభం", ml: "കരിയർ പുനരാരംഭം", hi: "करियर पुनः शुरुआत", kn: "ವೃತ್ತಿ ಮರುಆರಂಭ" },
  pillar_career_body: { en: "Discover the skills running a household already gave you, build a gap-friendly resume, and find roles that welcome you back.", ta: "வீட்டை நடத்துவதால் உங்களுக்கு ஏற்கனவே கிடைத்த திறமைகளைக் கண்டறியுங்கள்.", te: "ఇల్లు నడపడం వల్ల మీకు ఇప్పటికే వచ్చిన నైపుణ్యాలను తెలుసుకోండి.", ml: "വീട് നടത്തിയതിലൂടെ നിങ്ങൾക്ക് ലഭിച്ച കഴിവുകൾ കണ്ടെത്തുക.", hi: "घर चलाने से आपको पहले से मिले हुनर को पहचानें।", kn: "ಮನೆ ನಡೆಸುವುದರಿಂದ ನಿಮಗೆ ಈಗಾಗಲೇ ಸಿಕ್ಕ ಕೌಶಲ್ಯಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ." },
  pillar_readiness_title: { en: "Your Readiness Path", ta: "உங்கள் தயார் பாதை", te: "మీ సంసిద్ధత మార్గం", ml: "നിങ്ങളുടെ സന്നദ്ധത പാത", hi: "आपकी तैयारी की राह", kn: "ನಿಮ್ಮ ಸಿದ್ಧತೆಯ ಹಾದಿ" },
  pillar_readiness_body: { en: "One connected path from your first budget to your first job offer — paced to how confident you feel, not a fixed clock.", ta: "உங்கள் முதல் பட்ஜெட்டிலிருந்து முதல் வேலை வாய்ப்பு வரை ஒரே இணைந்த பாதை.", te: "మీ మొదటి బడ్జెట్ నుండి మొదటి ఉద్యోగ ఆఫర్ వరకు ఒక అనుసంధాన మార్గం.", ml: "നിങ്ങളുടെ ആദ്യ ബജറ്റ് മുതൽ ആദ്യ ജോലി ഓഫർ വരെ ഒറ്റ ബന്ധിത പാത.", hi: "आपके पहले बजट से पहली नौकरी की पेशकश तक एक जुड़ा हुआ रास्ता।", kn: "ನಿಮ್ಮ ಮೊದಲ ಬಜೆಟ್‌ನಿಂದ ಮೊದಲ ಉದ್ಯೋಗ ಕೊಡುಗೆಯವರೆಗೆ ಒಂದು ಸಂಪರ್ಕಿತ ಹಾದಿ." },
  msg_doing_great: { en: "You're doing great 🌱", ta: "நீங்கள் அருமையாகச் செய்கிறீர்கள் 🌱", te: "మీరు చాలా బాగా చేస్తున్నారు 🌱", ml: "നിങ്ങൾ വളരെ നന്നായി ചെയ്യുന്നു 🌱", hi: "आप बहुत अच्छा कर रही हैं 🌱", kn: "ನೀವು ಚೆನ್ನಾಗಿ ಮಾಡುತ್ತಿದ್ದೀರಿ 🌱" },
  msg_skills_note: { en: "You already have more skills than you think.", ta: "நீங்கள் நினைப்பதை விட அதிக திறமைகள் உங்களிடம் ஏற்கனவே உள்ளன.", te: "మీరు అనుకున్నదానికంటే ఎక్కువ నైపుణ్యాలు మీ దగ్గర ఇప్పటికే ఉన్నాయి.", ml: "നിങ്ങൾ കരുതുന്നതിലും കൂടുതൽ കഴിവുകൾ നിങ്ങൾക്ക് ഇതിനകം ഉണ്ട്.", hi: "आपके पास सोच से कहीं ज़्यादा हुनर पहले से हैं।", kn: "ನೀವು ಅಂದುಕೊಂಡಿದ್ದಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಕೌಶಲ್ಯಗಳು ನಿಮ್ಮಲ್ಲಿ ಈಗಾಗಲೇ ಇವೆ." },
  nav_dashboard: { en: "Dashboard", ta: "டாஷ்போர்டு", te: "డాష్‌బోర్డ్", ml: "ഡാഷ്ബോർഡ്", hi: "डैशबोर्ड", kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" },
  nav_finance: { en: "Finance", ta: "நிதி", te: "ఫైనాన్స్", ml: "ധനകാര്യം", hi: "वित्त", kn: "ಹಣಕಾಸು" },
  nav_budget: { en: "Budget", ta: "பட்ஜெட்", te: "బడ్జెట్", ml: "ബജറ്റ്", hi: "बजट", kn: "ಬಜೆಟ್" },
  nav_career: { en: "Career", ta: "தொழில்", te: "కెరీర్", ml: "കരിയർ", hi: "करियर", kn: "ವೃತ್ತಿ" },
  nav_jobs: { en: "Jobs", ta: "வேலைகள்", te: "ఉద్యోగాలు", ml: "ജോലികൾ", hi: "नौकरियां", kn: "ಉದ್ಯೋಗಗಳು" },
  nav_resume: { en: "Resume", ta: "ரெசுமே", te: "రెజ్యూమ్", ml: "റെസ്യൂമെ", hi: "रिज़्यूमे", kn: "ರೆಸ್ಯೂಮ್" },
  nav_mentors: { en: "Mentors", ta: "வழிகாட்டிகள்", te: "మెంటార్లు", ml: "മെന്റർമാർ", hi: "मेंटर", kn: "ಮಾರ್ಗದರ್ಶಕರು" },
  nav_readiness: { en: "Readiness", ta: "தயார்நிலை", te: "సంసిద్ధత", ml: "സന്നദ്ധത", hi: "तैयारी", kn: "ಸಿದ್ಧತೆ" },
  nav_login: { en: "Log in", ta: "உள்நுழை", te: "లాగిన్", ml: "ലോഗിൻ", hi: "लॉग इन", kn: "ಲಾಗಿನ್" },
  nav_logout: { en: "Log out", ta: "வெளியேறு", te: "లాగ్ అవుట్", ml: "ലോഗ്ഔട്ട്", hi: "लॉग आउट", kn: "ಲಾಗ್ ಔಟ್" },
  field_name: { en: "Name", ta: "பெயர்", te: "పేరు", ml: "പേര്", hi: "नाम", kn: "ಹೆಸರು" },
  field_email: { en: "Email", ta: "மின்னஞ்சல்", te: "ఇమెయిల్", ml: "ഇമെയിൽ", hi: "ईमेल", kn: "ಇಮೇಲ್" },
  field_password: { en: "Password", ta: "கடவுச்சொல்", te: "పాస్‌వర్డ్", ml: "പാസ്‌വേഡ്", hi: "पासवर्ड", kn: "ಪಾಸ್‌ವರ್ಡ್" },
  field_language: { en: "Preferred language", ta: "விருப்பமான மொழி", te: "ఇష్టమైన భాష", ml: "ഇഷ്ട ഭാഷ", hi: "पसंदीदा भाषा", kn: "ಆದ್ಯತೆಯ ಭಾಷೆ" },
  btn_login: { en: "Log in", ta: "உள்நுழை", te: "లాగిన్ చేయండి", ml: "ലോഗിൻ ചെയ്യുക", hi: "लॉग इन करें", kn: "ಲಾಗಿನ್ ಮಾಡಿ" },
  btn_signup: { en: "Create account", ta: "கணக்கை உருவாக்கு", te: "ఖాతా సృష్టించండి", ml: "അക്കൗണ്ട് ഉണ്ടാക്കുക", hi: "खाता बनाएं", kn: "ಖಾತೆ ರಚಿಸಿ" },
  auth_switch_to_signup: { en: "New here? Create an account", ta: "புதியவரா? கணக்கை உருவாக்குங்கள்", te: "కొత్తవారా? ఖాతా సృష్టించండి", ml: "പുതിയ ആളാണോ? അക്കൗണ്ട് ഉണ്ടാക്കൂ", hi: "नए हैं? खाता बनाएं", kn: "ಹೊಸಬರೇ? ಖಾತೆ ರಚಿಸಿ" },
  auth_switch_to_login: { en: "Already have an account? Log in", ta: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையுங்கள்", te: "ఇప్పటికే ఖాతా ఉందా? లాగిన్ చేయండి", ml: "അക്കൗണ്ട് ഉണ്ടോ? ലോഗിൻ ചെയ്യൂ", hi: "पहले से खाता है? लॉग इन करें", kn: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ" },
  onboarding_title: { en: "Tell us a little about you", ta: "உங்களைப் பற்றி கொஞ்சம் சொல்லுங்கள்", te: "మీ గురించి కొంచెం చెప్పండి", ml: "നിങ്ങളെക്കുറിച്ച് അൽപ്പം പറയൂ", hi: "अपने बारे में थोड़ा बताएं", kn: "ನಿಮ್ಮ ಬಗ್ಗೆ ಸ್ವಲ್ಪ ಹೇಳಿ" },
  onboarding_sub: { en: "This helps Aval build a path that fits your life, not a generic one.", ta: "இது உங்கள் வாழ்க்கைக்கு ஏற்ற பாதையை உருவாக்க அவளுக்கு உதவும்.", te: "ఇది మీ జీవితానికి సరిపోయే మార్గాన్ని రూపొందించడంలో సహాయపడుతుంది.", ml: "ഇത് നിങ്ങളുടെ ജീവിതത്തിന് അനുയോജ്യമായ പാത നിർമ്മിക്കാൻ സഹായിക്കും.", hi: "इससे अवள் को आपके जीवन के लिए सही राह बनाने में मदद मिलती है।", kn: "ಇದು ನಿಮ್ಮ ಜೀವನಕ್ಕೆ ಸರಿಹೊಂದುವ ಹಾದಿಯನ್ನು ರೂಪಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ." },
  q_age: { en: "Age range", ta: "வயது வரம்பு", te: "వయస్సు పరిధి", ml: "പ്രായപരിധി", hi: "आयु सीमा", kn: "ವಯಸ್ಸಿನ ವ್ಯಾಪ್ತಿ" },
  q_education: { en: "Education level", ta: "கல்வித் தகுதி", te: "విద్యా స్థాయి", ml: "വിദ്യാഭ്യാസ നിലവാരം", hi: "शिक्षा स्तर", kn: "ಶಿಕ್ಷಣ ಮಟ್ಟ" },
  q_years_gap: { en: "Years since last paid work", ta: "கடைசி வேலைக்குப் பிறகு எத்தனை ஆண்டுகள்", te: "చివరి ఉద్యోగం తర్వాత ఎన్ని సంవత్సరాలు", ml: "അവസാന ജോലിക്ക് ശേഷം എത്ര വർഷം", hi: "आख़िरी नौकरी के बाद कितने साल", kn: "ಕೊನೆಯ ಉದ್ಯೋಗದ ನಂತರ ಎಷ್ಟು ವರ್ಷಗಳು" },
  q_prev_area: { en: "Previous work area", ta: "முந்தைய பணித் துறை", te: "మునుపటి పని రంగం", ml: "മുൻ ജോലി മേഖല", hi: "पिछला कार्य क्षेत्र", kn: "ಹಿಂದಿನ ಕೆಲಸದ ಕ್ಷೇತ್ರ" },
  q_confidence: { en: "How confident do you feel managing money?", ta: "பணத்தை நிர்வகிப்பதில் உங்கள் நம்பிக்கை எப்படி?", te: "డబ్బు నిర్వహణలో మీకు ఎంత నమ్మకం ఉంది?", ml: "പണം കൈകാര്യം ചെയ്യുന്നതിൽ എത്ര ആത്മവിശ്വാസം?", hi: "पैसे संभालने में आपका आत्मविश्वास कैसा है?", kn: "ಹಣ ನಿರ್ವಹಣೆಯಲ್ಲಿ ನಿಮ್ಮ ವಿಶ್ವಾಸ ಹೇಗಿದೆ?" },
  q_goal: { en: "What's your main goal right now?", ta: "இப்போது உங்கள் முக்கிய இலக்கு என்ன?", te: "ఇప్పుడు మీ ప్రధాన లక్ష్యం ఏమిటి?", ml: "ഇപ്പോൾ നിങ്ങളുടെ പ്രധാന ലക്ഷ്യം എന്താണ്?", hi: "अभी आपका मुख्य लक्ष्य क्या है?", kn: "ಈಗ ನಿಮ್ಮ ಮುಖ್ಯ ಗುರಿ ಏನು?" },
  q_work_type: { en: "Preferred work type", ta: "விருப்பமான வேலை வகை", te: "ఇష్టమైన పని రకం", ml: "ഇഷ്ട ജോലി തരം", hi: "पसंदीदा काम का प्रकार", kn: "ಆದ್ಯತೆಯ ಕೆಲಸದ ಪ್ರಕಾರ" },
  work_type_fulltime: { en: "Full-time", ta: "முழு நேரம்", te: "పూర్తి సమయం", ml: "മുഴുവൻ സമയം", hi: "पूर्णकालिक", kn: "ಪೂರ್ಣ ಸಮಯ" },
  work_type_parttime: { en: "Part-time", ta: "பகுதி நேரம்", te: "పార్ట్ టైమ్", ml: "പാർട്ട് ടൈം", hi: "अंशकालिक", kn: "ಅರೆಕಾಲಿಕ" },
  work_type_remote: { en: "Remote", ta: "தொலைதூரம்", te: "రిమోట్", ml: "റിമോട്ട്", hi: "रिमोट", kn: "ರಿಮೋಟ್" },
  work_type_freelance: { en: "Freelance", ta: "ஃப்ரீலான்ஸ்", te: "ఫ్రీలాన్స్", ml: "ഫ്രീലാൻസ്", hi: "फ्रीलांस", kn: "ಫ್ರೀಲ್ಯಾನ್ಸ್" },
  work_type_returnship: { en: "Returnship", ta: "மறுவேலை பயிற்சி", te: "రిటర్న్‌షిప్", ml: "റിട്ടേൺഷിപ്പ്", hi: "रिटर्नशिप", kn: "ರಿಟರ್ನ್‌ಶಿಪ್" },
  confidence_low: { en: "Just starting out", ta: "இப்போதுதான் தொடங்குகிறேன்", te: "ఇప్పుడే మొదలుపెడుతున్నాను", ml: "ഇപ്പോൾ തുടങ്ങുന്നു", hi: "अभी शुरुआत कर रही हूं", kn: "ಈಗಷ್ಟೇ ಆರಂಭಿಸುತ್ತಿದ್ದೇನೆ" },
  confidence_medium: { en: "Somewhat confident", ta: "ஓரளவு நம்பிக்கை", te: "కొంత నమ్మకం ఉంది", ml: "കുറച്ച് ആത്മവിശ്വാസം", hi: "कुछ हद तक आत्मविश्वासी", kn: "ಸ್ವಲ್ಪ ವಿಶ್ವಾಸ ಇದೆ" },
  confidence_high: { en: "Quite confident", ta: "நல்ல நம்பிக்கை", te: "బాగా నమ్మకం ఉంది", ml: "നല്ല ആത്മവിശ്വാസം", hi: "काफी आत्मविश्वासी", kn: "ಸಾಕಷ್ಟು ವಿಶ್ವಾಸ ಇದೆ" },
  btn_next: { en: "Next", ta: "அடுத்து", te: "తదుపరి", ml: "അടുത്തത്", hi: "आगे", kn: "ಮುಂದೆ" },
  btn_back: { en: "Back", ta: "பின்", te: "వెనుకకు", ml: "പിന്നോട്ട്", hi: "पीछे", kn: "ಹಿಂದೆ" },
  btn_finish: { en: "Build my dashboard", ta: "என் டாஷ்போர்டை உருவாக்கு", te: "నా డాష్‌బోర్డ్ నిర్మించండి", ml: "എന്റെ ഡാഷ്‌ബോർഡ് നിർമ്മിക്കൂ", hi: "मेरा डैशबोर्ड बनाएं", kn: "ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ನಿರ್ಮಿಸಿ" },
  dash_welcome: { en: "Good morning", ta: "காலை வணக்கம்", te: "శుభోదయం", ml: "സുപ്രഭാതം", hi: "सुप्रभात", kn: "ಶುಭೋದಯ" },
  dash_sub: { en: "You're making progress toward financial and career independence.", ta: "நிதி மற்றும் தொழில் சுதந்திரத்தை நோக்கி முன்னேறி வருகிறீர்கள்.", te: "మీరు ఆర్థిక మరియు కెరీర్ స్వాతంత్ర్యం వైపు పురోగతి సాధిస్తున్నారు.", ml: "സാമ്പത്തികവും തൊഴിൽപരവുമായ സ്വാതന്ത്ര്യത്തിലേക്ക് നിങ്ങൾ മുന്നേറുന്നു.", hi: "आप वित्तीय और करियर स्वतंत्रता की ओर प्रगति कर रही हैं।", kn: "ನೀವು ಆರ್ಥಿಕ ಮತ್ತು ವೃತ್ತಿ ಸ್ವಾತಂತ್ರ್ಯದತ್ತ ಪ್ರಗತಿ ಸಾಧಿಸುತ್ತಿದ್ದೀರಿ." },
  financial_confidence: { en: "Financial Confidence", ta: "நிதி நம்பிக்கை", te: "ఆర్థిక విశ్వాసం", ml: "സാമ്പത്തിക ആത്മവിശ്വാസം", hi: "वित्तीय आत्मविश्वास", kn: "ಆರ್ಥಿಕ ವಿಶ್ವಾಸ" },
  career_readiness: { en: "Career Readiness", ta: "தொழில் தயார்நிலை", te: "కెరీర్ సంసిద్ధత", ml: "കരിയർ സന്നദ്ധത", hi: "करियर तत्परता", kn: "ವೃತ್ತಿ ಸಿದ್ಧತೆ" },
  overall_readiness: { en: "Overall Readiness", ta: "ஒட்டுமொத்த தயார்நிலை", te: "మొత్తం సంసిద్ధత", ml: "മൊത്തം സന്നദ്ധത", hi: "कुल तैयारी", kn: "ಒಟ್ಟಾರೆ ಸಿದ್ಧತೆ" },
  todays_step: { en: "Your next recommended step", ta: "பரிந்துரைக்கப்படும் அடுத்த அடி", te: "మీ తదుపరి సిఫార్సు చేసిన అడుగు", ml: "ശുപാർശ ചെയ്യുന്ന അടുത്ത ചുവട്", hi: "आपका अगला सुझाया कदम", kn: "ನಿಮ್ಮ ಮುಂದಿನ ಶಿಫಾರಸು ಮಾಡಿದ ಹೆಜ್ಜೆ" },
  btn_continue: { en: "Continue", ta: "தொடரவும்", te: "కొనసాగించండి", ml: "തുടരുക", hi: "जारी रखें", kn: "ಮುಂದುವರಿಸಿ" },
  finance_title: { en: "Financial Literacy", ta: "நிதி அறிவு", te: "ఆర్థిక అక్షరాస్యత", ml: "സാമ്പത്തിക സാക്ഷരത", hi: "वित्तीय साक्षरता", kn: "ಹಣಕಾಸು ಸಾಕ್ಷರತೆ" },
  finance_sub: { en: "Short lessons, in plain language. Learn at your own pace.", ta: "எளிய மொழியில் குறுகிய பாடங்கள். உங்கள் வேகத்தில் கற்றுக்கொள்ளுங்கள்.", te: "సాధారణ భాషలో చిన్న పాఠాలు. మీ వేగంతో నేర్చుకోండి.", ml: "ലളിതമായ ഭാഷയിൽ ചെറിയ പാഠങ്ങൾ. നിങ്ങളുടെ വേഗതയിൽ പഠിക്കൂ.", hi: "आसान भाषा में छोटे पाठ। अपनी गति से सीखें।", kn: "ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಚಿಕ್ಕ ಪಾಠಗಳು. ನಿಮ್ಮ ವೇಗದಲ್ಲಿ ಕಲಿಯಿರಿ." },
  cat_money_basics: { en: "Money Basics", ta: "பணத்தின் அடிப்படைகள்", te: "డబ్బు ప్రాథమికాలు", ml: "പണത്തിന്റെ അടിസ്ഥാനങ്ങൾ", hi: "पैसे की बुनियादी बातें", kn: "ಹಣದ ಮೂಲಭೂತಗಳು" },
  cat_budgeting: { en: "Budgeting", ta: "பட்ஜெட் திட்டமிடல்", te: "బడ్జెటింగ్", ml: "ബജറ്റിംഗ്", hi: "बजट बनाना", kn: "ಬಜೆಟಿಂಗ್" },
  cat_digital_payments: { en: "Digital Payments", ta: "டிஜிட்டல் பணம் செலுத்துதல்", te: "డిజిటల్ చెల్లింపులు", ml: "ഡിജിറ്റൽ പേയ്‌മെന്റുകൾ", hi: "डिजिटल भुगतान", kn: "ಡಿಜಿಟಲ್ ಪಾವತಿಗಳು" },
  cat_savings: { en: "Savings", ta: "சேமிப்பு", te: "పొదుపు", ml: "സമ്പാദ്യം", hi: "बचत", kn: "ಉಳಿತಾಯ" },
  cat_investment_basics: { en: "Investment Basics", ta: "முதலீட்டு அடிப்படைகள்", te: "పెట్టుబడి ప్రాథమికాలు", ml: "നിക്ഷേപ അടിസ്ഥാനങ്ങൾ", hi: "निवेश की बुनियादी बातें", kn: "ಹೂಡಿಕೆ ಮೂಲಭೂತಗಳು" },
  btn_start_lesson: { en: "Start", ta: "தொடங்கு", te: "ప్రారంభించండి", ml: "തുടങ്ങൂ", hi: "शुरू करें", kn: "ಆರಂಭಿಸಿ" },
  lesson_complete: { en: "Completed", ta: "முடிந்தது", te: "పూర్తయింది", ml: "പൂർത്തിയായി", hi: "पूर्ण", kn: "ಪೂರ್ಣಗೊಂಡಿದೆ" },
  lesson_quiz: { en: "Quick check", ta: "விரைவு சோதனை", te: "త్వరిత పరీక్ష", ml: "വേഗ പരിശോധന", hi: "त्वरित जांच", kn: "ತ್ವರಿತ ಪರೀಕ್ಷೆ" },
  btn_check_answer: { en: "Check", ta: "சரிபார்", te: "తనిఖీ చేయండి", ml: "പരിശോധിക്കൂ", hi: "जांचें", kn: "ಪರಿಶೀಲಿಸಿ" },
  disclaimer_investment: { en: "Educational content only — not personalized financial advice.", ta: "இது கல்விச் செய்தி மட்டுமே — தனிப்பட்ட நிதி ஆலோசனை அல்ல.", te: "ఇది విద్యా సమాచారం మాత్రమే — వ్యక్తిగత ఆర్థిక సలహా కాదు.", ml: "ഇത് വിദ്യാഭ്യാസ ഉള്ളടക്കം മാത്രം — വ്യക്തിഗത സാമ്പത്തിക ഉപദേശമല്ല.", hi: "यह केवल शैक्षिक जानकारी है — व्यक्तिगत वित्तीय सलाह नहीं।", kn: "ಇದು ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿ ಮಾತ್ರ — ವೈಯಕ್ತಿಕ ಹಣಕಾಸು ಸಲಹೆ ಅಲ್ಲ." },
  fi_score_title: { en: "Financial Independence Score", ta: "நிதி சுதந்திர மதிப்பெண்", te: "ఆర్థిక స్వాతంత్ర్య స్కోరు", ml: "സാമ്പത്തിക സ്വാതന്ത്ര്യ സ്കോർ", hi: "वित्तीय स्वतंत्रता स्कोर", kn: "ಆರ್ಥಿಕ ಸ್ವಾತಂತ್ರ್ಯ ಸ್ಕೋರ್" },
  budget_title: { en: "Household Budget", ta: "வீட்டு பட்ஜெட்", te: "గృహ బడ్జెట్", ml: "ഗാർഹിക ബജറ്റ്", hi: "घरेलू बजट", kn: "ಗೃಹ ಬಜೆಟ್" },
  budget_income: { en: "Monthly Income", ta: "மாத வருமானம்", te: "నెలవారీ ఆదాయం", ml: "പ്രതിമാസ വരുമാനം", hi: "मासिक आय", kn: "ಮಾಸಿಕ ಆದಾಯ" },
  budget_expenses: { en: "Monthly Expenses", ta: "மாத செலவுகள்", te: "నెలవారీ ఖర్చులు", ml: "പ്രതിമാസ ചെലവുകൾ", hi: "मासिक खर्च", kn: "ಮಾಸಿಕ ಖರ್ಚು" },
  budget_remaining: { en: "Remaining", ta: "மீதம்", te: "మిగిలింది", ml: "ബാക്കി", hi: "शेष", kn: "ಉಳಿದದ್ದು" },
  budget_add_income: { en: "Add income", ta: "வருமானம் சேர்", te: "ఆదాయం జోడించండి", ml: "വരുമാനം ചേർക്കുക", hi: "आय जोड़ें", kn: "ಆದಾಯ ಸೇರಿಸಿ" },
  budget_add_expense: { en: "Add expense", ta: "செலவு சேர்", te: "ఖర్చు జోడించండి", ml: "ചെലവ് ചേർക്കുക", hi: "खर्च जोड़ें", kn: "ಖರ್ಚು ಸೇರಿಸಿ" },
  budget_category: { en: "Category", ta: "வகை", te: "వర్గం", ml: "വിഭാഗം", hi: "श्रेणी", kn: "ವರ್ಗ" },
  budget_amount: { en: "Amount", ta: "தொகை", te: "మొత్తం", ml: "തുക", hi: "राशि", kn: "ಮೊತ್ತ" },
  budget_note: { en: "Note (optional)", ta: "குறிப்பு (விருப்பம்)", te: "గమనిక (ఐచ్ఛికం)", ml: "കുറിപ്പ് (ഓപ്ഷണൽ)", hi: "टिप्पणी (वैकल्पिक)", kn: "ಟಿಪ್ಪಣಿ (ಐಚ್ಛಿಕ)" },
  budget_savings_goal: { en: "Savings goal", ta: "சேமிப்பு இலக்கு", te: "పొదుపు లక్ష్యం", ml: "സമ്പാദ്യ ലക്ഷ്യം", hi: "बचत लक्ष्य", kn: "ಉಳಿತಾಯ ಗುರಿ" },
  cat_groceries: { en: "Groceries", ta: "மளிகை", te: "కిరాణా", ml: "പലചരക്ക്", hi: "किराना", kn: "ದಿನಸಿ" },
  cat_electricity: { en: "Electricity", ta: "மின்சாரம்", te: "విద్యుత్", ml: "വൈദ്യുതി", hi: "बिजली", kn: "ವಿದ್ಯುತ್" },
  cat_water: { en: "Water", ta: "தண்ணீர்", te: "నీరు", ml: "വെള്ളം", hi: "पानी", kn: "ನೀರು" },
  cat_school: { en: "School", ta: "பள்ளி", te: "పాఠశాల", ml: "സ്കൂൾ", hi: "स्कूल", kn: "ಶಾಲೆ" },
  cat_transport: { en: "Transport", ta: "போக்குவரத்து", te: "రవాణా", ml: "ഗതാഗതം", hi: "परिवहन", kn: "ಸಾರಿಗೆ" },
  cat_healthcare: { en: "Healthcare", ta: "சுகாதாரம்", te: "ఆరోగ్యం", ml: "ആരോഗ്യം", hi: "स्वास्थ्य", kn: "ಆರೋಗ್ಯ" },
  cat_household: { en: "Household", ta: "வீட்டுத் தேவைகள்", te: "గృహావసరాలు", ml: "വീട്ടാവശ്യങ്ങൾ", hi: "घरेलू ज़रूरतें", kn: "ಮನೆಯ ಅಗತ್ಯಗಳು" },
  cat_savings_cat: { en: "Savings", ta: "சேமிப்பு", te: "పొదుపు", ml: "സമ്പാദ്യം", hi: "बचत", kn: "ಉಳಿತಾಯ" },
  cat_other: { en: "Other", ta: "மற்றவை", te: "ఇతరాలు", ml: "മറ്റുള്ളവ", hi: "अन्य", kn: "ಇತರೆ" },
  career_title: { en: "Career Restart", ta: "தொழில் மறுதொடக்கம்", te: "కెరీర్ పునఃప్రారంభం", ml: "കരിയർ പുനരാരംഭം", hi: "करियर पुनः शुरुआत", kn: "ವೃತ್ತಿ ಮರುಆರಂಭ" },
  discover_skills: { en: "Discover the skills you already have", ta: "நீங்கள் ஏற்கனவே கொண்டுள்ள திறமைகளைக் கண்டறியுங்கள்", te: "మీకు ఇప్పటికే ఉన్న నైపుణ్యాలను కనుగొనండి", ml: "നിങ്ങൾക്ക് ഇതിനകം ഉള്ള കഴിവുകൾ കണ്ടെത്തുക", hi: "अपने पहले से मौजूद हुनर को पहचानें", kn: "ನಿಮ್ಮಲ್ಲಿ ಈಗಾಗಲೇ ಇರುವ ಕೌಶಲ್ಯಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ" },
  btn_take_assessment: { en: "Take the 2-minute assessment", ta: "2 நிமிட மதிப்பீட்டை எடுங்கள்", te: "2 నిమిషాల మూల్యాంకనం తీసుకోండి", ml: "2 മിനിറ്റ് വിലയിരുത്തൽ എടുക്കുക", hi: "2 मिनट का आकलन करें", kn: "2 ನಿಮಿಷದ ಮೌಲ್ಯಮಾಪನ ತೆಗೆದುಕೊಳ್ಳಿ" },
  your_transferable_skills: { en: "Your transferable skills", ta: "உங்கள் மாற்றக்கூடிய திறமைகள்", te: "మీ బదిలీ చేయదగిన నైపుణ్యాలు", ml: "നിങ്ങളുടെ കൈമാറ്റം ചെയ്യാവുന്ന കഴിവുകൾ", hi: "आपके स्थानांतरणीय हुनर", kn: "ನಿಮ್ಮ ವರ್ಗಾಯಿಸಬಹುದಾದ ಕೌಶಲ್ಯಗಳು" },
  recommended_because: { en: "Recommended because your assessment shows strength here.", ta: "உங்கள் மதிப்பீடு இதில் வலிமையைக் காட்டுவதால் பரிந்துரைக்கப்படுகிறது.", te: "మీ మూల్యాంకనం ఇక్కడ బలాన్ని చూపిస్తుంది కాబట్టి సిఫార్సు చేయబడింది.", ml: "നിങ്ങളുടെ വിലയിരുത്തൽ ഇവിടെ കരുത്ത് കാണിക്കുന്നതിനാൽ ശുപാർശ ചെയ്യുന്നു.", hi: "क्योंकि आपका आकलन यहाँ मज़बूती दिखाता है, इसलिए सुझाया गया।", kn: "ನಿಮ್ಮ ಮೌಲ್ಯಮಾಪನ ಇಲ್ಲಿ ಬಲವನ್ನು ತೋರಿಸುವುದರಿಂದ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ." },
  jobs_title: { en: "Jobs & Returnships", ta: "வேலைகள் & மறுவேலை பயிற்சிகள்", te: "ఉద్యోగాలు & రిటర్న్‌షిప్‌లు", ml: "ജോലികളും റിട്ടേൺഷിപ്പുകളും", hi: "नौकरियां और रिटर्नशिप", kn: "ಉದ್ಯೋಗಗಳು ಮತ್ತು ರಿಟರ್ನ್‌ಶಿಪ್‌ಗಳು" },
  job_gap_friendly: { en: "Career-gap friendly", ta: "தொழில் இடைவெளிக்கு ஏற்றது", te: "కెరీర్-గ్యాప్ స్నేహపూర్వకం", ml: "കരിയർ-ഗ്യാപ്പ് അനുകൂലം", hi: "करियर-गैप के अनुकूल", kn: "ವೃತ್ತಿ-ಅಂತರ ಸ್ನೇಹಿ" },
  btn_view: { en: "View", ta: "காண்க", te: "చూడండి", ml: "കാണുക", hi: "देखें", kn: "ವೀಕ್ಷಿಸಿ" },
  btn_save: { en: "Save", ta: "சேமி", te: "సేవ్ చేయండి", ml: "സേവ് ചെയ്യൂ", hi: "सहेजें", kn: "ಉಳಿಸಿ" },
  btn_saved: { en: "Saved", ta: "சேமிக்கப்பட்டது", te: "సేవ్ చేయబడింది", ml: "സേവ് ചെയ്തു", hi: "सहेजा गया", kn: "ಉಳಿಸಲಾಗಿದೆ" },
  filter_all: { en: "All", ta: "அனைத்தும்", te: "అన్నీ", ml: "എല്ലാം", hi: "सभी", kn: "ಎಲ್ಲಾ" },
  resume_title: { en: "Career-Gap Resume Builder", ta: "தொழில் இடைவெளி ரெசுமே", te: "కెరీర్-గ్యాప్ రెజ్యూమ్ బిల్డర్", ml: "കരിയർ-ഗ്യാപ്പ് റെസ്യൂമെ ബിൽഡർ", hi: "करियर-गैप रिज़्यूमे बिल्डर", kn: "ವೃತ್ತಿ-ಅಂತರ ರೆಸ್ಯೂಮ್ ಬಿಲ್ಡರ್" },
  field_experience: { en: "Previous experience", ta: "முந்தைய அனுபவம்", te: "మునుపటి అనుభవం", ml: "മുൻ പരിചയം", hi: "पिछला अनुभव", kn: "ಹಿಂದಿನ ಅನುಭವ" },
  field_break_duration: { en: "Career break duration", ta: "தொழில் இடைவெளி காலம்", te: "కెరీర్ బ్రేక్ వ్యవధి", ml: "കരിയർ ബ്രേക്ക് ദൈർഘ്യം", hi: "करियर ब्रेक अवधि", kn: "ವೃತ್ತಿ ವಿರಾಮ ಅವಧಿ" },
  field_household: { en: "Household responsibilities", ta: "வீட்டுப் பொறுப்புகள்", te: "గృహ బాధ్యతలు", ml: "ഗാർഹിക ഉത്തരവാദിത്തങ്ങൾ", hi: "घरेलू ज़िम्मेदारियां", kn: "ಮನೆಯ ಜವಾಬ್ದಾರಿಗಳು" },
  btn_generate_resume: { en: "Generate my resume", ta: "என் ரெசுமேவை உருவாக்கு", te: "నా రెజ్యూమ్ రూపొందించండి", ml: "എന്റെ റെസ്യൂമെ ഉണ്ടാക്കൂ", hi: "मेरा रिज़्यूमे बनाएं", kn: "ನನ್ನ ರೆಸ್ಯೂಮ್ ರಚಿಸಿ" },
  resume_career_break_label: { en: "Career Break — Family & Household Management", ta: "தொழில் இடைவெளி — குடும்பம் & வீட்டு நிர்வாகம்", te: "కెరీర్ బ్రేక్ — కుటుంబం & గృహ నిర్వహణ", ml: "കരിയർ ബ്രേക്ക് — കുടുംബവും ഗാർഹിക മാനേജ്മെന്റും", hi: "करियर ब्रेक — परिवार और घरेलू प्रबंधन", kn: "ವೃತ್ತಿ ವಿರಾಮ — ಕುಟುಂಬ ಮತ್ತು ಗೃಹ ನಿರ್ವಹಣೆ" },
  mentors_title: { en: "Mentors", ta: "வழிகாட்டிகள்", te: "మెంటార్లు", ml: "മെന്റർമാർ", hi: "मेंटर", kn: "ಮಾರ್ಗದರ್ಶಕರು" },
  btn_request_mentorship: { en: "Request mentorship", ta: "வழிகாட்டுதலைக் கோருங்கள்", te: "మెంటార్‌షిప్ అభ్యర్థించండి", ml: "മെന്റർഷിപ്പ് അഭ്യർത്ഥിക്കുക", hi: "मेंटरशिप का अनुरोध करें", kn: "ಮಾರ್ಗದರ್ಶನ ವಿನಂತಿಸಿ" },
  btn_requested: { en: "Requested", ta: "கோரப்பட்டது", te: "అభ్యర్థించారు", ml: "അഭ്യർത്ഥിച്ചു", hi: "अनुरोध किया गया", kn: "ವಿನಂತಿಸಲಾಗಿದೆ" },
  readiness_title: { en: "Your Readiness Path", ta: "உங்கள் தயார் பாதை", te: "మీ సంసిద్ధత మార్గం", ml: "നിങ്ങളുടെ സന്നദ്ധത പാത", hi: "आपकी तैयारी की राह", kn: "ನಿಮ್ಮ ಸಿದ್ಧತೆಯ ಹಾದಿ" },
  readiness_sub: { en: "One connected path — from your first budget to your first job offer.", ta: "ஒரே இணைந்த பாதை — முதல் பட்ஜெட்டிலிருந்து முதல் வேலை வாய்ப்பு வரை.", te: "ఒక అనుసంధాన మార్గం — మీ మొదటి బడ్జెట్ నుండి మొదటి ఉద్యోగం వరకు.", ml: "ഒരു ബന്ധിത പാത — ആദ്യ ബജറ്റ് മുതൽ ആദ്യ ജോലി വരെ.", hi: "एक जुड़ा हुआ रास्ता — पहले बजट से पहली नौकरी तक।", kn: "ಒಂದು ಸಂಪರ್ಕಿತ ಹಾದಿ — ಮೊದಲ ಬಜೆಟ್‌ನಿಂದ ಮೊದಲ ಉದ್ಯೋಗದವರೆಗೆ." },
  status_completed: { en: "Completed", ta: "முடிந்தது", te: "పూర్తయింది", ml: "പൂർത്തിയായി", hi: "पूर्ण", kn: "ಪೂರ್ಣಗೊಂಡಿದೆ" },
  status_current: { en: "Current", ta: "தற்போதைய", te: "ప్రస్తుత", ml: "നിലവിലെ", hi: "वर्तमान", kn: "ಪ್ರಸ್ತುತ" },
  status_locked: { en: "Locked", ta: "பூட்டப்பட்டது", te: "లాక్ చేయబడింది", ml: "ലോക്ക് ചെയ്തു", hi: "लॉक", kn: "ಲಾಕ್ ಆಗಿದೆ" },
  whats_next: { en: "What should I do next?", ta: "அடுத்து நான் என்ன செய்ய வேண்டும்?", te: "నేను తర్వాత ఏమి చేయాలి?", ml: "ഞാൻ അടുത്തതായി എന്ത് ചെയ്യണം?", hi: "मुझे आगे क्या करना चाहिए?", kn: "ನಾನು ಮುಂದೆ ಏನು ಮಾಡಬೇಕು?" },
  level_strong: { en: "Strong", ta: "வலிமையானது", te: "బలంగా ఉంది", ml: "ശക്തം", hi: "मज़बूत", kn: "ಬಲವಾದ" },
  level_good: { en: "Good", ta: "நல்லது", te: "మంచిది", ml: "നല്ലത്", hi: "अच्छा", kn: "ಚೆನ್ನಾಗಿದೆ" },
  level_developing: { en: "Developing", ta: "வளர்ந்து வருகிறது", te: "అభివృద్ధి చెందుతోంది", ml: "വളരുന്നു", hi: "विकसित हो रहा है", kn: "ಬೆಳೆಯುತ್ತಿದೆ" },
  career_recommend_title: { en: "Roles that fit your strengths", ta: "உங்கள் திறமைகளுக்கு ஏற்ற பணிகள்", te: "మీ బలాలకు సరిపోయే పాత్రలు", ml: "നിങ്ങളുടെ ശക്തികൾക്ക് അനുയോജ്യമായ റോളുകൾ", hi: "आपकी ताकत के अनुरूप भूमिकाएं", kn: "ನಿಮ್ಮ ಬಲಗಳಿಗೆ ಸರಿಹೊಂದುವ ಪಾತ್ರಗಳು" },
  reset_data: { en: "Reset my data", ta: "என் தரவை மீட்டமை", te: "నా డేటాను రీసెట్ చేయండి", ml: "എന്റെ ഡാറ്റ പുനഃസജ്ജമാക്കുക", hi: "मेरा डेटा रीसेट करें", kn: "ನನ್ನ ಡೇಟಾ ಮರುಹೊಂದಿಸಿ" },
};

function makeT(lang) {
  return (key) => (T[key] ? (T[key][lang] || T[key].en) : key);
}

/* ---------------------------- mock data ---------------------------- */

const LESSONS = [
  { id: "l1", cat: "cat_money_basics", title: { en: "What is a bank account?", ta: "வங்கிக் கணக்கு என்றால் என்ன?" },
    body: { en: "A bank account is a safe place to keep your money instead of cash at home. A savings account lets your money earn a little interest over time, while a current account is mainly for frequent transactions and doesn't earn interest. Opening one needs only an ID proof, address proof, and a photo.",
      ta: "வங்கிக் கணக்கு என்பது வீட்டில் பணமாக வைப்பதற்குப் பதிலாக உங்கள் பணத்தை பாதுகாப்பாக வைக்கும் இடம். சேமிப்புக் கணக்கு காலப்போக்கில் சிறிது வட்டியைப் பெற உதவும், நடப்புக் கணக்கு அடிக்கடி பரிவர்த்தனைகளுக்கானது, வட்டி கிடைக்காது." },
    quiz: [
      { q: { en: "Which account type usually earns interest?", ta: "எந்த வகைக் கணக்கு பொதுவாக வட்டி பெறும்?" }, options: [{ en: "Savings account", ta: "சேமிப்புக் கணக்கு" }, { en: "Current account", ta: "நடப்புக் கணக்கு" }], answer: 0 },
    ] },
  { id: "l2", cat: "cat_budgeting", title: { en: "Needs vs wants", ta: "தேவைகள் Vs விருப்பங்கள்" },
    body: { en: "Needs are expenses you can't avoid — food, rent, school fees, medicine. Wants are things that are nice to have but not essential — eating out, new gadgets. A simple rule: cover needs first, then decide how much goes to wants and how much to savings.",
      ta: "தேவைகள் என்பவை தவிர்க்க முடியாத செலவுகள் — உணவு, வாடகை, பள்ளிக் கட்டணம், மருந்து. விருப்பங்கள் அவசியமில்லாதவை — வெளியில் சாப்பிடுவது, புதிய கருவிகள். முதலில் தேவைகளை பூர்த்தி செய்யுங்கள், பிறகு விருப்பங்கள் மற்றும் சேமிப்புக்கு எவ்வளவு ஒதுக்குவது என முடிவு செய்யுங்கள்." },
    quiz: [
      { q: { en: "Which of these is a 'need'?", ta: "இவற்றில் எது 'தேவை'?" }, options: [{ en: "School fees", ta: "பள்ளிக் கட்டணம்" }, { en: "New handbag", ta: "புதிய கைப்பை" }], answer: 0 },
    ] },
  { id: "l3", cat: "cat_digital_payments", title: { en: "UPI PIN safety", ta: "UPI PIN பாதுகாப்பு" },
    body: { en: "Your UPI PIN is like a key to your account — never share it with anyone, including someone claiming to be from your bank. You only enter your PIN to SEND money, never to RECEIVE money. If someone asks you to enter a PIN to 'receive' a payment, it's a scam.",
      ta: "உங்கள் UPI PIN உங்கள் கணக்கின் திறவுகோல் போன்றது — வங்கியிலிருந்து வந்தவர் என்று கூறினாலும் யாருடனும் பகிர வேண்டாம். பணம் அனுப்ப மட்டுமே PIN தேவை, பெற அல்ல. 'பணம் பெற' PIN கேட்டால் அது மோசடி." },
    quiz: [
      { q: { en: "Do you need your UPI PIN to receive money?", ta: "பணம் பெற UPI PIN தேவையா?" }, options: [{ en: "No, never", ta: "இல்லை, ஒருபோதும் இல்லை" }, { en: "Yes, always", ta: "ஆம், எப்போதும்" }], answer: 0 },
    ] },
  { id: "l4", cat: "cat_savings", title: { en: "Understanding emergency funds", ta: "அவசரகால நிதியைப் புரிந்துகொள்ளுதல்" },
    body: { en: "An emergency fund is money set aside only for unexpected situations — a medical bill, urgent repair, or a gap in income. A good starting goal is 3 months of essential household expenses, saved a little at a time in a separate savings account.",
      ta: "அவசரகால நிதி என்பது எதிர்பாராத சூழ்நிலைகளுக்காக மட்டும் ஒதுக்கி வைக்கப்படும் பணம் — மருத்துவச் செலவு, அவசர பழுது, அல்லது வருமான இடைவெளி. 3 மாத அத்தியாவசிய வீட்டுச் செலவுகள் ஒரு நல்ல தொடக்க இலக்கு." },
    quiz: [
      { q: { en: "An emergency fund is best kept for:", ta: "அவசரகால நிதி எதற்காக வைக்கப்பட வேண்டும்:" }, options: [{ en: "Unexpected situations only", ta: "எதிர்பாராத சூழ்நிலைகளுக்கு மட்டும்" }, { en: "Monthly shopping", ta: "மாதாந்திர ஷாப்பிங்" }], answer: 0 },
    ] },
  { id: "l5", cat: "cat_investment_basics", title: { en: "What is a SIP?", ta: "SIP என்றால் என்ன?" },
    body: { en: "A SIP (Systematic Investment Plan) lets you invest a small fixed amount into a mutual fund every month, instead of a large amount at once. It builds the habit of investing regularly and can smooth out market ups and downs over time. This is educational — not a recommendation to buy any specific fund.",
      ta: "SIP (முறையான முதலீட்டுத் திட்டம்) ஒரு பெரிய தொகையை ஒரே நேரத்தில் முதலீடு செய்வதற்குப் பதிலாக, ஒவ்வொரு மாதமும் ஒரு சிறிய நிலையான தொகையை மியூச்சுவல் ஃபண்டில் முதலீடு செய்ய அனுமதிக்கிறது." },
    quiz: [
      { q: { en: "SIP mainly helps you:", ta: "SIP முக்கியமாக உதவுவது:" }, options: [{ en: "Invest a fixed amount regularly", ta: "தொடர்ந்து ஒரு நிலையான தொகையை முதலீடு செய்ய" }, { en: "Get a guaranteed high return", ta: "உத்தரவாதமான அதிக வருமானம் பெற" }], answer: 0 },
    ] },
];

const SKILL_QUESTIONS = [
  { id: "s1", text: { en: "How comfortable are you organizing multiple tasks at once?", ta: "ஒரே நேரத்தில் பல பணிகளை ஒழுங்கமைப்பதில் உங்கள் வசதி எப்படி?" }, skill: "Organization" },
  { id: "s2", text: { en: "How comfortable are you communicating with people (school, vendors, family)?", ta: "மக்களுடன் (பள்ளி, விற்பனையாளர்கள், குடும்பம்) தொடர்பு கொள்வதில் உங்கள் வசதி எப்படி?" }, skill: "Communication" },
  { id: "s3", text: { en: "Have you managed a household budget?", ta: "வீட்டு பட்ஜெட்டை நிர்வகித்திருக்கிறீர்களா?" }, skill: "Financial management" },
  { id: "s4", text: { en: "Have you coordinated a school or community event?", ta: "பள்ளி அல்லது சமூக நிகழ்வை ஒருங்கிணைத்திருக்கிறீர்களா?" }, skill: "Planning" },
  { id: "s5", text: { en: "Do you enjoy teaching or explaining things to others?", ta: "மற்றவர்களுக்கு கற்பிப்பதை அல்லது விளக்குவதை நீங்கள் ரசிக்கிறீர்களா?" }, skill: "Teaching" },
  { id: "s6", text: { en: "How comfortable are you using a smartphone or computer?", ta: "ஸ்மார்ட்போன் அல்லது கணினியைப் பயன்படுத்துவதில் உங்கள் வசதி எப்படி?" }, skill: "Digital skills" },
];

const JOB_CATEGORIES = {
  Organization: ["Administrative Assistant", "Operations Coordinator"],
  Communication: ["Customer Support", "Virtual Assistant"],
  "Financial management": ["Bookkeeping Assistant", "Billing Coordinator"],
  Planning: ["Event Coordinator", "School Coordinator"],
  Teaching: ["Tutor", "Training Assistant"],
  "Digital skills": ["Data Entry Specialist", "Social Media Assistant"],
};

const MOCK_JOBS = [
  { id: "j1", title: "Operations Assistant", company: "ClearDesk Co.", location: "Remote", type: "Part-time", exp: "0-2 years", salary: "₹20,000–₹30,000/mo", gapFriendly: true, cat: "Organization" },
  { id: "j2", title: "Virtual Assistant", company: "Northwind Services", location: "Remote", type: "Freelance", exp: "0-1 years", salary: "₹15,000–₹25,000/mo", gapFriendly: true, cat: "Communication" },
  { id: "j3", title: "Bookkeeping Assistant", company: "Ledger Lane", location: "Chennai", type: "Part-time", exp: "1-3 years", salary: "₹18,000–₹28,000/mo", gapFriendly: true, cat: "Financial management" },
  { id: "j4", title: "School Coordinator", company: "Little Sprouts School", location: "Coimbatore", type: "Full-time", exp: "0-2 years", salary: "₹22,000–₹32,000/mo", gapFriendly: true, cat: "Planning" },
  { id: "j5", title: "Returnship — Customer Support", company: "HelpFirst", location: "Remote", type: "Returnship", exp: "Entry-level", salary: "₹17,000–₹24,000/mo", gapFriendly: true, cat: "Communication" },
  { id: "j6", title: "Data Entry Specialist", company: "FormFlow", location: "Remote", type: "Part-time", exp: "Entry-level", salary: "₹14,000–₹20,000/mo", gapFriendly: true, cat: "Digital skills" },
];

const MENTORS = [
  { id: "m1", name: "Priya Rajendran", field: "Human Resources", years: 9, breakYears: 6, role: "HR Specialist, Zenith Corp", languages: "Tamil, English", story: { en: "Returned to work after a 6-year career break and now works as an HR specialist.", ta: "6 ஆண்டு தொழில் இடைவெளிக்குப் பிறகு மீண்டும் பணியில் சேர்ந்து இப்போது HR நிபுணராக பணியாற்றுகிறார்." } },
  { id: "m2", name: "Divya Suresh", field: "Finance", years: 12, breakYears: 4, role: "Finance Analyst, Bluepeak", languages: "Tamil, Telugu, English", story: { en: "Restarted her finance career part-time before moving back to full-time work.", ta: "பகுதி நேர வேலையிலிருந்து மீண்டும் முழுநேர வேலைக்குச் சென்றார்." } },
  { id: "m3", name: "Meera Krishnan", field: "Education", years: 15, breakYears: 8, role: "Curriculum Lead, BrightPath", languages: "Malayalam, English", story: { en: "Took an 8-year break to raise her children and returned as a curriculum lead.", ta: "குழந்தைகளை வளர்க்க 8 ஆண்டுகள் இடைவெளி எடுத்துவிட்டு பாடத்திட்ட தலைவராகத் திரும்பினார்." } },
];

const READINESS_STEPS = [
  { id: "r1", title: { en: "Understand basic banking", ta: "அடிப்படை வங்கியியலைப் புரிந்துகொள்ளுங்கள்" }, area: "finance" },
  { id: "r2", title: { en: "Create your first household budget", ta: "உங்கள் முதல் வீட்டு பட்ஜெட்டை உருவாக்குங்கள்" }, area: "budget" },
  { id: "r3", title: { en: "Learn digital payment safety", ta: "டிஜிட்டல் பணம் செலுத்தும் பாதுகாப்பைக் கற்றுக்கொள்ளுங்கள்" }, area: "finance" },
  { id: "r4", title: { en: "Discover your transferable skills", ta: "உங்கள் மாற்றக்கூடிய திறமைகளைக் கண்டறியுங்கள்" }, area: "skills" },
  { id: "r5", title: { en: "Build your career profile", ta: "உங்கள் தொழில் சுயவிவரத்தை உருவாக்குங்கள்" }, area: "career" },
  { id: "r6", title: { en: "Create your career-gap resume", ta: "உங்கள் தொழில் இடைவெளி ரெசுமேவை உருவாக்குங்கள்" }, area: "resume" },
  { id: "r7", title: { en: "Explore suitable jobs", ta: "பொருத்தமான வேலைகளை ஆராயுங்கள்" }, area: "jobs" },
  { id: "r8", title: { en: "Connect with a mentor", ta: "ஒரு வழிகாட்டியுடன் இணையுங்கள்" }, area: "mentors" },
];

/* ---------------------------- storage ---------------------------- */

const initialAppState = {
  user: null,
  onboarded: false,
  profile: { ageRange: "", education: "", yearsGap: "", prevArea: "", confidence: "", goal: "", workType: "" },
  financeCompleted: [],
  budget: { income: 0, expenses: [], savingsGoal: { target: 30000, current: 0 } },
  skills: null,
  savedJobs: [],
  resume: null,
  mentorRequests: [],
  readinessIndex: 0,
};

/* ---------------------------- small UI pieces ---------------------------- */

function KolamDivider() {
  const dots = Array.from({ length: 13 });
  return (
    <div className="flex items-center justify-center gap-3 py-2" aria-hidden="true">
      {dots.map((_, i) => (
        <span
          key={i}
          className="rounded-full bg-amber-500"
          style={{
            width: i % 4 === 0 ? 7 : 3,
            height: i % 4 === 0 ? 7 : 3,
            opacity: i % 4 === 0 ? 1 : 0.45,
          }}
        />
      ))}
    </div>
  );
}

// Ornamental gold linework mandala — a decorative background motif (concentric
// rings + radiating petals), inspired by the reference art's tone, never a
// reproduction of it. Purely decorative; aria-hidden.
function MandalaMotif({ size = 460, stroke = "#c9932b", opacity = 0.35, className = "" }) {
  const rings = [1, 0.82, 0.64, 0.46, 0.3];
  const petals = 20;
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" className={className} aria-hidden="true">
      <g stroke={stroke} fill="none" opacity={opacity}>
        {rings.map((r, i) => (
          <circle key={i} cx="200" cy="200" r={r * 188} strokeWidth={i === 0 ? 1.25 : 0.75}
            strokeDasharray={i % 2 === 0 ? "1 7" : "3 3"} />
        ))}
        {Array.from({ length: petals }).map((_, i) => {
          const angle = (i / petals) * 2 * Math.PI;
          const x1 = 200 + Math.cos(angle) * 78, y1 = 200 + Math.sin(angle) * 78;
          const x2 = 200 + Math.cos(angle) * 172, y2 = 200 + Math.sin(angle) * 172;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.6" />;
        })}
        <circle cx="200" cy="200" r="6" fill={stroke} stroke="none" />
        <circle cx="200" cy="200" r="56" strokeWidth="1" />
      </g>
    </svg>
  );
}

function ProgressRing({ value, size = 96, stroke = 8, colorClass = "text-red-700" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(100, value)) / 100 * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-stone-200" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
        className={colorClass} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" className="fill-stone-800 font-semibold" style={{ fontSize: size * 0.22, fontFamily: "'Fraunces', serif" }}>
        {Math.round(value)}%
      </text>
    </svg>
  );
}

function Card({ children, className = "" }) {
  return <div className={`aval-card bg-white rounded-3xl border border-stone-200 shadow-sm ${className}`}>{children}</div>;
}

function PrimaryButton({ children, onClick, disabled, className = "", type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`aval-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`aval-ghost inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium active:scale-[0.98] transition ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------------------- main app ---------------------------- */

export default function App() {
  const [lang, setLang] = useState("en");
  const [page, setPage] = useState("landing");
  const [app, setApp] = useState(initialAppState);
  const [careerProfile, setCareerProfile] = useState(null);
  const [authMode, setAuthMode] = useState("signup");
  const t = makeT(lang);

  const update = useCallback((patch) => setApp((prev) => ({ ...prev, ...patch })), []);
 useEffect(() => {
  const token = localStorage.getItem("aval_token");
  if (!token) return;

  fetch(`${BACKEND_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then(async (data) => {
      if (!data.success) {
        localStorage.removeItem("aval_token");
        return;
      }

      update({ user: data.user });
      setPage((prev) => (prev === "landing" || prev === "auth" ? "dashboard" : prev));

      const savedRes = await fetch(`${BACKEND_URL}/api/user-data`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const savedData = await savedRes.json();

      if (savedData.success && savedData.userData) {
        const d = savedData.userData;
        update({
          profile: d.profile || initialAppState.profile,
          financeCompleted: d.financeCompleted || [],
          budget: d.budget || initialAppState.budget,
          skills: d.skills || null,
          savedJobs: d.savedJobs || [],
          resume: d.resume || null,
          onboarded: !!d.profile,
        });
        setCareerProfile(d.careerProfile || null);
      }
    })
    .catch(() => localStorage.removeItem("aval_token"));
}, []);
useEffect(() => {
  const token = localStorage.getItem("aval_token");
  if (!token || !app.user) return;

  const timeout = setTimeout(() => {
    fetch(`${BACKEND_URL}/api/user-data`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        profile: app.profile,
        financeCompleted: app.financeCompleted,
        budget: app.budget,
        skills: app.skills,
        savedJobs: app.savedJobs,
        resume: app.resume,
        careerProfile: careerProfile,
      }),
    }).catch((err) => console.error("Auto-save failed:", err));
  }, 800);

  return () => clearTimeout(timeout);
}, [app.profile, app.financeCompleted, app.budget, app.skills, app.savedJobs, app.resume, app.user, careerProfile]);

  const financialScore = useMemo(() => {
    let score = 0;
    score += Math.min(40, app.financeCompleted.length * 8);
    score += app.budget.expenses.length > 0 ? 20 : 0;
    score += app.budget.income > 0 ? 15 : 0;
    score += app.budget.savingsGoal.current > 0 ? 15 : 0;
    score += app.financeCompleted.includes("l3") ? 10 : 0;
    return Math.min(100, score);
  }, [app]);

  const careerScore = useMemo(() => {
    let score = 0;
    score += app.skills ? 35 : 0;
    score += app.resume ? 30 : 0;
    score += app.savedJobs.length > 0 ? 15 : 0;
    score += app.mentorRequests.length > 0 ? 20 : 0;
    return Math.min(100, score);
  }, [app]);

  const overallScore = Math.round((financialScore + careerScore) / 2);

  const readinessCompletion = useMemo(() => {
    return READINESS_STEPS.map((step, i) => {
      let done = false;
      if (step.area === "finance" && step.id === "r1") done = app.financeCompleted.includes("l1");
      if (step.area === "budget") done = app.budget.expenses.length > 0;
      if (step.area === "finance" && step.id === "r3") done = app.financeCompleted.includes("l3");
      if (step.area === "skills") done = !!app.skills;
      if (step.area === "career") done = !!app.skills;
      if (step.area === "resume") done = !!app.resume;
      if (step.area === "jobs") done = app.savedJobs.length > 0;
      if (step.area === "mentors") done = app.mentorRequests.length > 0;
      return { ...step, done };
    });
  }, [app]);

  const currentReadinessIdx = readinessCompletion.findIndex((s) => !s.done);
  const nextStepIdx = currentReadinessIdx === -1 ? READINESS_STEPS.length - 1 : currentReadinessIdx;

  const goTo = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const getPageBackground = () => {
  switch (page) {
    case "dashboard":
      return "aval-dashboard-bg";
    case "finance":
      return "aval-finance-bg";
    case "budget":
      return "aval-budget-bg";
    case "jobs":
      return "aval-jobs-bg";
    case "resume":
      return "aval-resume-bg";
    case "readiness":
      return "aval-readiness-bg";
    case "mentors":
      return "aval-mentors-bg";
    default:
      return "";
  }
};
  const resetData = () => {
    setApp(initialAppState);
    setPage("landing");
  };

  return (
  <div
    className="aval-app min-h-screen text-stone-900"
    style={{
      fontFamily: "'Source Serif 4','Noto Sans Devanagari','Noto Sans Tamil','Noto Sans Telugu','Noto Sans Malayalam','Noto Sans Kannada',sans-serif",
      backgroundImage: `url("/backgrounds/${page}.png")`,
      backgroundSize: "100% 100%",
backgroundPosition: "top center",
backgroundAttachment: "scroll",
backgroundRepeat: "no-repeat",
    }}
  
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;600;700&family=Noto+Sans+Malayalam:wght@400;600;700&family=Noto+Sans+Kannada:wght@400;600;700&display=swap');
        .aval-app {
  color: white !important;
}
        :root {
          --aval-wine: #5a1025;
          --aval-wine-2: #741b34;
          --aval-red: #9a3f32;
          --aval-terracotta: #b85b42;
          --aval-gold: #c99a45;
          --aval-gold-soft: #e4c47f;
          --aval-cream: #f5e7cc;
          --aval-paper: #ead7b7;
          --aval-ink: #2b1718;
        }
        .aval-app {
          min-height: 100vh;
          background:
            radial-gradient(circle at 10% 5%, rgba(201,154,69,.12), transparent 25%),
            radial-gradient(circle at 90% 20%, rgba(154,63,50,.08), transparent 25%),
            #f5e7cc;
          color: var(--aval-ink);
          font-family: 'Source Serif 4','Noto Sans Tamil','Noto Sans Devanagari','Noto Sans Telugu','Noto Sans Malayalam','Noto Sans Kannada',sans-serif;
        }
        .font-display { font-family: 'Source Serif 4','Noto Sans Tamil','Noto Sans Devanagari','Noto Sans Telugu','Noto Sans Malayalam','Noto Sans Kannada',serif !important; font-weight: 700; letter-spacing: -.02em; }
        .grad-brand { background: none !important; color: var(--aval-wine) !important; }
        .aval-app button { font-family: inherit; }
        .aval-app .bg-white { background: rgba(255,250,239,.50) !important; }
        .aval-app .border-stone-200, .aval-app .border-stone-300 { border-color: rgba(90,16,37,.18) !important; }
        .aval-app .rounded-3xl { border-radius: 1.15rem !important; }
        .aval-app .shadow-sm { box-shadow: 0 10px 30px rgba(70,26,24,.07) !important; }
        .aval-app .text-red-950, .aval-app .text-red-900, .aval-app .text-red-800 { color: var(--aval-wine) !important; }
        .aval-app .text-stone-400 { color: #6b5a52 !important; }
.aval-app .text-stone-500 { color: #5a4a43 !important; }
.aval-app .text-stone-600 { color: #3f322c !important; }
.aval-app .text-stone-700 { color: #2b201c !important; }
.aval-app .text-stone-800 { color: var(--aval-ink) !important; }
.aval-app .text-stone-900 { color: var(--aval-ink) !important; }.aval-section-outline *:not(.text-amber-50):not(.text-amber-100):not(.text-white) {
  text-shadow:
    -1px -1px 0 #fff,
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff,
    0 0 4px rgba(255,255,255,0.6);
}

.aval-section-outline .text-amber-50,
.aval-section-outline .text-amber-100,
.aval-section-outline .text-white {
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000,
    0 0 4px rgba(0,0,0,0.6);
}
        .aval-app .text-amber-600 { color: var(--aval-gold) !important; }
        .aval-app .bg-red-950 { background: var(--aval-wine) !important; }
        .aval-app .bg-red-800, .aval-app .bg-red-700 { background: var(--aval-wine) !important; }
        .aval-app .bg-amber-50 { background: var(--aval-cream) !important; }
        .aval-app .bg-amber-500 { background: var(--aval-gold) !important; }
        .aval-app .text-amber-50 { color: #fff5df !important; }
        .aval-app input, .aval-app textarea, .aval-app select {
          background: rgba(255,249,235,.82) !important;
          border-color: rgba(90,16,37,.22) !important;
          color: var(--aval-ink) !important;
          border-radius: .7rem !important;
        }
        .aval-app input:focus, .aval-app textarea:focus, .aval-app select:focus {
          border-color: var(--aval-gold) !important;
          box-shadow: 0 0 0 3px rgba(201,154,69,.15) !important;
        }
        .aval-card {
          background: rgba(255,250,239,.50) !important;
          border: 1px solid rgba(90,16,37,.16) !important;
          box-shadow: 0 12px 35px rgba(70,26,24,.07) !important;
          position: relative;
          overflow: hidden;
        }
        .aval-card::after {
          content: ''; position: absolute; inset: 8px; border: 1px solid rgba(201,154,69,.13); border-radius: .85rem; pointer-events: none;
        }
        .aval-primary {
          background: var(--aval-wine) !important; color: #fff4dd !important;
          border: 1px solid var(--aval-wine) !important;
          box-shadow: 0 8px 18px rgba(90,16,37,.16);
        }
        .aval-primary:hover { background: var(--aval-wine-2) !important; }
        .aval-ghost {
          background: transparent !important; color: var(--aval-wine) !important;
          border: 1px solid rgba(90,16,37,.55) !important;
        }
        .aval-ghost:hover { background: rgba(201,154,69,.1) !important; }
        .aval-ornament { color: var(--aval-gold); letter-spacing: .55em; }
        .aval-hero {
          background: var(--aval-wine);
          color: #fff4df;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(228,196,127,.25);
          border-bottom: 1px solid rgba(228,196,127,.25);
        }
        .aval-hero::before {
          content:''; position:absolute; inset:0; opacity:.2;
          background-image: radial-gradient(circle, rgba(228,196,127,.7) 1px, transparent 1.5px);
          background-size: 18px 18px; mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        .aval-image-frame {
          position: relative; border: 1px solid rgba(228,196,127,.7); padding: 10px;
          background: rgba(228,196,127,.08); box-shadow: 0 22px 60px rgba(0,0,0,.25);
        }
        .aval-image-frame img { width:100%; height:100%; object-fit:cover; display:block; filter: saturate(.82) contrast(1.02); }
        .aval-section-title { color: var(--aval-wine); }
        .aval-divider { height:1px; background: linear-gradient(90deg, transparent, var(--aval-gold), transparent); }
        .aval-nav { background: rgba(245,231,204,.94) !important; border-color: rgba(90,16,37,.16) !important; }
        .aval-nav button[data-active='true'] { background: var(--aval-wine) !important; color:#fff4df !important; }
        .aval-app .ring-2 { --tw-ring-color: rgba(201,154,69,.65) !important; }
        @media (max-width: 640px) {
          .aval-hero h1 { font-size: 3.2rem !important; line-height: .94 !important; }
        }
      `}</style>

      {app.user && page !== "landing" && page !== "onboarding" && (
  <Navbar
  t={t}
  page={page}
  goTo={goTo}
  lang={lang}
  setLang={setLang}
  userName={app.user.name}
    onLogout={() => {
    localStorage.removeItem("aval_token");
    setApp(initialAppState);
    setCareerProfile(null);
    goTo("landing");
  }}
/>
      )}

      {page === "landing" && <Landing t={t} lang={lang} setLang={setLang} onStart={() => { setAuthMode("signup"); goTo("auth"); }} onHow={() => goTo("auth")} />}
      {page === "auth" && (<AuthPage
    t={t}
    lang={lang}
    authMode={authMode}
    setAuthMode={setAuthMode}
    onAuthSuccess={async (user, mode, token) => {
      setApp({ ...initialAppState, user });
      setCareerProfile(null);

      if (mode === "login") {
        const savedRes = await fetch(`${BACKEND_URL}/api/user-data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const savedData = await savedRes.json();
        if (savedData.success && savedData.userData) {
          const d = savedData.userData;
          update({
            profile: d.profile || initialAppState.profile,
            financeCompleted: d.financeCompleted || [],
            budget: d.budget || initialAppState.budget,
            skills: d.skills || null,
            savedJobs: d.savedJobs || [],
            resume: d.resume || null,
            onboarded: !!d.profile,
          });
          setCareerProfile(d.careerProfile || null);
        }
      }
      goTo(mode === "signup" ? "onboarding" : "dashboard");
    }}
  />
)}
      {page === "onboarding" && <Onboarding t={t} lang={lang} setLang={setLang} profile={app.profile} onFinish={(profile) => { update({ profile, onboarded: true }); goTo("dashboard"); }} />}

      {app.user && (
  <div className="aval-section-outline">
    {page === "dashboard" && (
      <Dashboard t={t} userName={app.user.name} financialScore={financialScore} careerScore={careerScore} overallScore={overallScore}
        nextStep={READINESS_STEPS[nextStepIdx]} lang={lang} goTo={goTo} app={app} />
    )}
    {page === "finance" && <FinancePage t={t} lang={lang} setLang={setLang} completed={app.financeCompleted} onComplete={(id) => update({ financeCompleted: Array.from(new Set([...app.financeCompleted, id])) })} />}
    {page === "budget" && <BudgetPage t={t} lang={lang} setLang={setLang} budget={app.budget} onChange={(budget) => update({ budget })} />}

    {page === "jobs" && (
      <CareerAssessmentPage
        careerProfile={careerProfile}
        onProfileBuilt={setCareerProfile}
        savedJobs={app.savedJobs}
        onToggleSave={(id) => update({ savedJobs: app.savedJobs.includes(id) ? app.savedJobs.filter((j) => j !== id) : [...app.savedJobs, id] })}
      />
    )}
    {page === "resume" && <ResumePage t={t} lang={lang} resume={app.resume} onSave={(resume) => update({ resume })} user={app.user} />}
    {page === "mentors" && <MentorsPage t={t} lang={lang} />}
    {page === "readiness" && <ReadinessPage t={t} lang={lang} steps={readinessCompletion} goTo={goTo} />}
  </div>
)}
      <VoiceAssistant
   lang={lang}
   currentPage={page}
   pageContext={{
     dashboard: { financialScore, careerScore, overallScore },
     finance: { completedLessons: app.financeCompleted.length, totalLessons: LESSONS.length },
     budget: { income: app.budget.income, expenses: app.budget.expenses, savingsGoal: app.budget.savingsGoal },
     jobs: { careerProfile },
     resume: { resume: app.resume },
     mentors: {},
     readiness: { readinessCompletion },
   }[page] || {}}
   onNavigate={goTo}
/>

      {app.user && (
        <footer className="max-w-5xl mx-auto px-6 py-10 text-center">
          <button onClick={resetData} className="text-xs text-stone-400 hover:text-stone-600 inline-flex items-center gap-1">
            <RotateCcw size={12} /> {t("reset_data")}
          </button>
        </footer>
      )}
    </div>
  );
}

/* ---------------------------- Navbar ---------------------------- */

function Navbar({ t, page, goTo, lang, setLang, userName, onLogout }) {
  const items = [
    { id: "dashboard", label: t("nav_dashboard"), icon: LayoutDashboard },
    { id: "finance", label: t("nav_finance"), icon: Wallet },
    { id: "budget", label: t("nav_budget"), icon: IndianRupee },
    { id: "jobs", label: t("nav_jobs"), icon: MapPin },
    { id: "resume", label: t("nav_resume"), icon: FileText },
    { id: "mentors", label: t("nav_mentors"), icon: Users },
    { id: "readiness", label: t("nav_readiness"), icon: Compass },
  ];
  return (
    <header className="aval-nav sticky top-0 z-40 backdrop-blur border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => goTo("dashboard")} className="font-display text-2xl grad-brand tracking-tight">அவள் Aval</button>

        <nav className="flex flex-wrap items-center gap-1">
          {items.map((it) => (
            <button key={it.id} onClick={() => goTo(it.id)}
              data-active={page === it.id} className={`px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1.5 transition ${page === it.id ? "bg-red-800 text-amber-50" : "text-red-900 hover:bg-red-50"}`}>
              <it.icon size={15} /> {it.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          
          <button
            onClick={onLogout}
            className="flex px-3 py-2 rounded-full text-sm font-medium text-red-900 hover:bg-red-50 items-center gap-1.5"
          >
            {t("nav_logout")}
          </button>
        </div>
      </div>
    </header>
  );
}

function LanguagePicker({ lang, setLang, compact }) {
  return (
    <div className="relative">
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label="Language"
        className={`appearance-none bg-white border border-stone-300 rounded-full text-sm font-medium text-red-900 pl-8 pr-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${compact ? "" : "text-base"}`}
      >
        {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-700 pointer-events-none" />
    </div>
  );
}

/* ---------------------------- Landing ---------------------------- */

function Landing({ t, lang, setLang, onStart, onHow }) {
  return (
    <div className="min-h-screen">
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div>
          <div className="font-display text-3xl tracking-tight text-red-950">அவள் <span className="text-[#9a3f32]">Aval</span></div>
          <div className="text-[10px] uppercase tracking-[.32em] text-red-900/60 mt-0.5">Her money. Her next chapter.</div>
        </div>
        <div className="flex items-center gap-3">
          
          <GhostButton onClick={onHow} className="py-2 px-4 text-sm">{t("nav_login")}</GhostButton>
        </div>
      </header>

      <section className="aval-hero">
        <div className="max-w-7xl mx-auto px-6 py-12 sm:py-20 grid lg:grid-cols-[1.02fr_.98fr] gap-12 items-center">
          <div className="relative z-10 py-4">
            <div className="aval-ornament text-xs mb-6">✦ ✦ ✦</div>
            <p className="uppercase tracking-[.3em] text-xs text-amber-200/80 mb-5">FINANCIAL INDEPENDENCE · CAREER RESTART</p>
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[.9] font-semibold">{t("brand_tagline")}</h1>
            <p className="text-lg sm:text-xl text-amber-50/75 mt-7 max-w-xl leading-relaxed">{t("brand_sub")}</p>
            <div className="flex flex-wrap gap-3 mt-9">
              <PrimaryButton onClick={onStart} className="bg-amber-500 text-red-950 hover:bg-amber-400">{t("cta_start")} <ArrowRight size={18} /></PrimaryButton>
              <GhostButton onClick={onHow} className="border-amber-200/70 text-amber-50 hover:bg-amber-50/10">{t("cta_how")}</GhostButton>
            </div>
            <div className="mt-12 flex items-center gap-5 text-sm text-amber-100/65">
              <span>✦ Learn money</span><span>✦ See your skills</span><span>✦ Take your next step</span>
            </div>
          </div>
          <div className="relative z-10 max-w-xl w-full mx-auto lg:ml-auto">
            <div className="absolute -inset-8 rounded-full border border-amber-300/20" />
            <div className="absolute -inset-16 rounded-full border border-amber-300/10" />
            <div className="aval-image-frame aspect-[4/5]">
              <img src="/aval-hero.png" alt="Illustrated woman in a traditional Indian-inspired editorial style" />
              <div className="absolute left-5 right-5 bottom-5 bg-[#5a1025]/90 border border-amber-200/35 p-4 backdrop-blur-sm">
                <p className="font-display text-2xl text-amber-50">You already have more skills than you think.</p>
                <p className="text-xs text-amber-100/65 mt-1 uppercase tracking-[.18em]">Aval · one step at a time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-7"><div className="aval-divider" /></div>

      <section className="max-w-6xl mx-auto px-6 py-12 sm:py-20">
        <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-12 items-start">
          <div>
            <p className="uppercase tracking-[.28em] text-xs text-red-900/55 mb-3">THE IDEA BEHIND AVAL</p>
            <h2 className="font-display text-5xl sm:text-6xl aval-section-title leading-[.92]">{t("why_title")}</h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-stone-700">{t("why_body")}</p>
            <div className="grid sm:grid-cols-3 gap-4 mt-10">
              {[
                [Wallet, t("pillar_finance_title"), t("pillar_finance_body")],
                [Briefcase, t("pillar_career_title"), t("pillar_career_body")],
                [Compass, t("pillar_readiness_title"), t("pillar_readiness_body")],
              ].map(([Icon, title, body]) => (
                <Card key={title} className="p-6">
                  <Icon className="text-amber-600 mb-5" size={27} />
                  <h3 className="font-display text-2xl text-red-950 mb-2">{title}</h3>
                  <p className="text-sm leading-6 text-stone-600">{body}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#ead7b7] border-y border-[#5a1025]/10 py-16">
        <MandalaMotif className="absolute -right-24 -top-28" size={520} opacity={0.25} />
        <div className="max-w-5xl mx-auto px-6 text-center relative">
          <div className="aval-ornament text-sm mb-5">✦ · ✦ · ✦</div>
          <h2 className="font-display text-4xl sm:text-5xl text-red-950">A path built around your life.</h2>
          <p className="max-w-2xl mx-auto mt-4 text-stone-700 leading-7">Not a race. Not a generic checklist. Aval connects the money confidence, skills and career steps that make a return to work feel possible.</p>
          <div className="mt-8"><PrimaryButton onClick={onStart}>{t("cta_start")} <ArrowRight size={18} /></PrimaryButton></div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-red-950/55">
        <span>அவள் Aval</span><span>Your money. Your skills. Your next step.</span>
      </footer>
    </div>
  );
}

/* ---------------------------- Auth ---------------------------- */

function AuthPage({ t, lang, authMode, setAuthMode, onAuthSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const submit = async (e) => {
    e.preventDefault();

    if (authMode === "signup" && !name.trim()) {
      setError(t("field_name") + " is required.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const endpoint = authMode === "signup" ? "/api/signup" : "/api/login";
      const body =
        authMode === "signup"
          ? { name: name.trim(), email: email.trim(), password }
          : { email: email.trim(), password };

      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Something went wrong.");
        setLoading(false);
        return;
      }

      localStorage.setItem("aval_token", data.token);
      onAuthSuccess(data.user, authMode,data.token);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md p-8">
        <div className="font-display text-2xl grad-brand text-center mb-1">அவள் Aval</div>
        <h1 className="font-display text-2xl text-red-950 text-center mb-6">
          {authMode === "signup" ? t("btn_signup") : t("btn_login")}
        </h1>
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-2.5">{error}</div>
        )}
        <form onSubmit={submit} className="space-y-4" noValidate>
          {authMode === "signup" && (
            <div>
              <label className="text-sm font-medium text-stone-700">{t("field_name")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-stone-700">{t("field_email")}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700">{t("field_password")}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <PrimaryButton type="submit" disabled={loading} className="w-full">
            {loading ? "Please wait..." : authMode === "signup" ? t("btn_signup") : t("btn_login")}
          </PrimaryButton>
        </form>
        <button onClick={() => { setError(""); setAuthMode(authMode === "signup" ? "login" : "signup"); }} className="text-sm text-red-800 underline mt-5 w-full text-center">
          {authMode === "signup" ? t("auth_switch_to_login") : t("auth_switch_to_signup")}
        </button>
      </Card>
    </div>
  );
}
/* ---------------------------- Onboarding ---------------------------- */

function Onboarding({ t, lang, setLang, profile, onFinish }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(profile);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"];
  const EDU = { en: ["School", "Diploma", "Bachelor's", "Master's", "Other"], ta: ["பள்ளி", "டிப்ளோமா", "பட்டப்படிப்பு", "முதுகலை", "மற்றவை"] };
  const YEARS = ["0-1", "2-4", "5-9", "10+"];
  const WORKTYPES = [
    { v: "fulltime", l: t("work_type_fulltime") }, { v: "parttime", l: t("work_type_parttime") },
    { v: "remote", l: t("work_type_remote") }, { v: "freelance", l: t("work_type_freelance") },
    { v: "returnship", l: t("work_type_returnship") },
  ];
  const CONF = [
    { v: "low", l: t("confidence_low") }, { v: "medium", l: t("confidence_medium") }, { v: "high", l: t("confidence_high") },
  ];

  const steps = [
    { key: "ageRange", label: t("q_age"), options: AGE_RANGES },
    { key: "education", label: t("q_education"), options: EDU[lang] || EDU.en },
    { key: "yearsGap", label: t("q_years_gap"), options: YEARS },
    { key: "confidence", label: t("q_confidence"), options: CONF.map((c) => c.l), values: CONF.map((c) => c.v) },
    { key: "workType", label: t("q_work_type"), options: WORKTYPES.map((w) => w.l), values: WORKTYPES.map((w) => w.v) },
  ];

  const cur = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const choose = (label, idx) => {
    const value = cur.values ? cur.values[idx] : label;
    set(cur.key, value);
  };

  const next = () => (step < steps.length - 1 ? setStep(step + 1) : onFinish(form));
  const back = () => step > 0 && setStep(step - 1);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <Card className="w-full max-w-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="font-display text-xl grad-brand">அவள் Aval</div>
          
        </div>
        <h1 className="font-display text-2xl text-red-950 mb-1">{t("onboarding_title")}</h1>
        <p className="text-sm text-stone-600 mb-6">{t("onboarding_sub")}</p>
        <div className="w-full h-1.5 bg-stone-200 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <h2 className="font-medium text-red-900 mb-3">{cur.label}</h2>
        <div className="grid grid-cols-2 gap-2 mb-8">
          {cur.options.map((opt, idx) => {
            const value = cur.values ? cur.values[idx] : opt;
            const selected = form[cur.key] === value;
            return (
              <button key={opt} onClick={() => choose(opt, idx)}
                className={`text-sm rounded-xl px-4 py-3 border text-left transition ${selected ? "bg-red-800 text-amber-50 border-red-800" : "border-stone-300 hover:border-red-600"}`}>
                {opt}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between">
          <GhostButton onClick={back} className={`py-2 px-4 ${step === 0 ? "invisible" : ""}`}><ChevronLeft size={16} /> {t("btn_back")}</GhostButton>
          <PrimaryButton onClick={next} disabled={!form[cur.key]} className="py-2 px-5">
            {step === steps.length - 1 ? t("btn_finish") : t("btn_next")} <ChevronRight size={16} />
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------- Dashboard ---------------------------- */

function Dashboard({ t, userName, financialScore, careerScore, overallScore, nextStep, lang, goTo, app }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Card className="relative overflow-hidden p-8 mb-8 bg-gradient-to-br from-red-950 via-red-800 to-amber-700 text-amber-50 border-none">
        <MandalaMotif stroke="#fde68a" opacity={0.25} size={340} className="absolute -right-16 -top-16 pointer-events-none" />
        <p className="text-white text-sm font-medium relative">{t("dash_welcome")}, {userName} 🌱</p>
        <h1 className="font-display text-3xl mt-1 relative">{t("msg_doing_great")}</h1>
        <p className="text-white mt-2 max-w-xl relative">{t("dash_sub")}</p>
      </Card>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <Card className="p-6 flex flex-col items-center text-center">
          <ProgressRing value={financialScore} colorClass="text-red-700" />
          <p className="mt-3 font-medium text-stone-700 text-sm">{t("financial_confidence")}</p>
        </Card>
        <Card className="p-6 flex flex-col items-center text-center">
          <ProgressRing value={careerScore} colorClass="text-amber-600" />
          <p className="mt-3 font-medium text-stone-700 text-sm">{t("career_readiness")}</p>
        </Card>
        <Card className="p-6 flex flex-col items-center text-center">
          <ProgressRing value={overallScore} colorClass="text-rose-500" />
          <p className="mt-3 font-medium text-stone-700 text-sm">{t("overall_readiness")}</p>
        </Card>
      </div>

      <Card className="p-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-600 font-semibold">{t("todays_step")}</p>
          <p className="font-display text-xl text-red-950 mt-1">{nextStep.title[lang] || nextStep.title.en}</p>
        </div>
        <PrimaryButton onClick={() => goTo(nextStep.area === "budget" ? "budget" : nextStep.area === "skills" || nextStep.area === "career" ? "jobs" : nextStep.area)}>
          {t("btn_continue")} <ChevronRight size={16} />
        </PrimaryButton>
      </Card>

      <div className="grid sm:grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="font-display text-lg text-red-950 mb-3 flex items-center gap-2"><Wallet size={18} className="text-amber-600" /> {t("pillar_finance_title")}</h3>
          <ul className="text-sm text-stone-600 space-y-1.5">
            <li>{t("cat_savings")}: ₹{app.budget.savingsGoal.current} / ₹{app.budget.savingsGoal.target}</li>
            <li>{app.financeCompleted.length} / {LESSONS.length} {t("lesson_complete").toLowerCase()}</li>
          </ul>
          <GhostButton onClick={() => goTo("finance")} className="mt-4 py-2 px-4 text-sm">{t("nav_finance")} <ChevronRight size={14} /></GhostButton>
        </Card>
        <Card className="p-6">
          <h3 className="font-display text-lg text-red-950 mb-3 flex items-center gap-2"><Briefcase size={18} className="text-amber-600" /> {t("pillar_career_title")}</h3>
          <ul className="text-sm text-stone-600 space-y-1.5">
            <li>{app.skills ? "✓ " + t("your_transferable_skills") : t("discover_skills")}</li>
            <li>{app.savedJobs.length} {t("nav_jobs")} {t("btn_saved").toLowerCase()}</li>
          </ul>
          <GhostButton onClick={() => goTo("jobs")} className="mt-4 py-2 px-4 text-sm">{t("nav_career")} <ChevronRight size={14} /></GhostButton>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------- Finance ---------------------------- */

function FinancePage({ t, lang, setLang, completed, onComplete })  {
  const [openLesson, setOpenLesson] = useState(null);
  const cats = ["cat_money_basics", "cat_budgeting", "cat_digital_payments", "cat_savings", "cat_investment_basics"];

  if (openLesson) {
    return <LessonView t={t} lang={lang} lesson={openLesson} done={completed.includes(openLesson.id)} onComplete={() => { onComplete(openLesson.id); setOpenLesson(null); }} onBack={() => setOpenLesson(null)} />;
  }

    return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-red-950">{t("finance_title")}</h1>
        <LanguagePicker lang={lang} setLang={setLang} compact />
      </div>
      <p className="text-stone-600 mt-2 mb-8">{t("finance_sub")}</p>
      {cats.map((cat) => (
        <div key={cat} className="mb-8">
          <h2 className="font-display text-xl text-red-900 mb-3">{t(cat)}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {LESSONS.filter((l) => l.cat === cat).map((l) => {
              const isDone = completed.includes(l.id);
              return (
                <Card key={l.id} className="p-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-stone-800">{l.title[lang] || l.title.en}</p>
                    {isDone && <span className="text-xs text-red-700 flex items-center gap-1 mt-1"><Check size={12} /> {t("lesson_complete")}</span>}
                  </div>
                  <GhostButton onClick={() => setOpenLesson(l)} className="py-2 px-4 text-sm shrink-0">{t("btn_start_lesson")}</GhostButton>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-xs text-stone-400 mt-4">{t("disclaimer_investment")}</p>
    </div>
  );
}

function LessonView({ t, lang, lesson, done, onComplete, onBack }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const allCorrect = lesson.quiz.every((q, i) => answers[i] === q.answer);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button onClick={onBack} className="text-sm text-red-800 flex items-center gap-1 mb-6"><ChevronLeft size={16} /> {t("nav_finance")}</button>
      <Card className="p-8">
        <BookOpen className="text-amber-600 mb-3" size={26} />
        <h1 className="font-display text-2xl text-red-950 mb-4">{lesson.title[lang] || lesson.title.en}</h1>
        <p className="text-stone-700 leading-relaxed">{lesson.body[lang] || lesson.body.en}</p>

        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="font-medium text-red-900 mb-4">{t("lesson_quiz")}</h3>
          {lesson.quiz.map((q, qi) => (
            <div key={qi} className="mb-5">
              <p className="text-sm font-medium text-stone-800 mb-2">{q.q[lang] || q.q.en}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[qi] === oi;
                  const showResult = checked;
                  const isRight = oi === q.answer;
                  return (
                    <button key={oi} onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                      className={`w-full text-left text-sm rounded-xl px-4 py-2.5 border transition
                        ${selected ? "border-red-700" : "border-stone-300"}
                        ${showResult && isRight ? "bg-red-50 border-red-600" : ""}
                        ${showResult && selected && !isRight ? "bg-rose-50 border-rose-400" : ""}`}>
                      {opt[lang] || opt.en}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!checked ? (
            <PrimaryButton onClick={() => setChecked(true)} disabled={Object.keys(answers).length < lesson.quiz.length}>{t("btn_check_answer")}</PrimaryButton>
          ) : (
            <PrimaryButton onClick={onComplete} disabled={!allCorrect}>{done ? t("lesson_complete") : t("lesson_complete")} <Check size={16} /></PrimaryButton>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------- Budget ---------------------------- */

const BUDGET_CATS = ["cat_groceries", "cat_electricity", "cat_water", "cat_school", "cat_transport", "cat_healthcare", "cat_household", "cat_savings_cat", "cat_other"];
const PIE_COLORS = ["#0f766e", "#d97706", "#e11d48", "#0891b2", "#65a30d", "#7c3aed", "#c2410c", "#0369a1", "#78716c"];

function BudgetPage({ t, lang,setLang, budget, onChange }) {
  const [incomeInput, setIncomeInput] = useState("");
  const [expCat, setExpCat] = useState(BUDGET_CATS[0]);
  const [expAmount, setExpAmount] = useState("");
  const [expNote, setExpNote] = useState("");

  const totalExpenses = budget.expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = budget.income - totalExpenses;

  const addIncome = () => {
  const v = parseFloat(incomeInput);

  if (!v) return;

  onChange({ ...budget, income: budget.income + v });

  setIncomeInput("");
};

  const addExpense = () => {
    const v = parseFloat(expAmount);
    if (!v) return;
    const newExpenses = [...budget.expenses, { id: Date.now(), cat: expCat, amount: v, note: expNote, date: new Date().toISOString().slice(0, 10) }];
    onChange({ ...budget, expenses: newExpenses, savingsGoal: expCat === "cat_savings_cat" ? { ...budget.savingsGoal, current: budget.savingsGoal.current + v } : budget.savingsGoal });
    setExpAmount(""); setExpNote("");
  };

  const removeExpense = (id) => {
    onChange({ ...budget, expenses: budget.expenses.filter((e) => e.id !== id) });
  };

  const chartData = BUDGET_CATS.map((c) => ({
    name: t(c), value: budget.expenses.filter((e) => e.cat === c).reduce((s, e) => s + e.amount, 0),
  })).filter((d) => d.value > 0);

  const savingsPct = Math.min(100, Math.round((budget.savingsGoal.current / budget.savingsGoal.target) * 100));

    return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-red-950">{t("budget_title")}</h1>
        <LanguagePicker lang={lang} setLang={setLang} compact />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5"><p className="text-xs text-stone-500">{t("budget_income")}</p><p className="font-display text-2xl text-red-800 mt-1">₹{budget.income.toLocaleString()}</p></Card>
        <Card className="p-5"><p className="text-xs text-stone-500">{t("budget_expenses")}</p><p className="font-display text-2xl text-amber-600 mt-1">₹{totalExpenses.toLocaleString()}</p></Card>
        <Card className="p-5"><p className="text-xs text-stone-500">{t("budget_remaining")}</p><p
  className="font-display text-2xl mt-1"
  style={{
    color: "#57534e",
    WebkitTextStroke: "0",
    textShadow: "none"
  }}
>
  ₹{remaining.toLocaleString()}
</p></Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="font-medium text-red-900 mb-3">{t("budget_add_income")}</h3>
          <div className="flex gap-2">
            <input type="number" value={incomeInput} onChange={(e) => setIncomeInput(e.target.value)} placeholder="₹" className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <PrimaryButton onClick={addIncome} className="px-4"><Plus size={16} /></PrimaryButton>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-medium text-red-900 mb-3">{t("budget_add_expense")}</h3>
          <div className="space-y-2">
            <select value={expCat} onChange={(e) => setExpCat(e.target.value)} className="w-full rounded-xl border border-stone-300 px-4 py-2.5">
              {BUDGET_CATS.map((c) => <option key={c} value={c}>{t(c)}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder={t("budget_amount")} className="flex-1 rounded-xl border border-stone-300 px-4 py-2.5" />
              <PrimaryButton onClick={addExpense} className="px-4"><Plus size={16} /></PrimaryButton>
            </div>
            <input value={expNote} onChange={(e) => setExpNote(e.target.value)} placeholder={t("budget_note")} className="w-full rounded-xl border border-stone-300 px-4 py-2.5" />
          </div>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="font-medium text-red-900 mb-3">{t("budget_expenses")}</h3>
          {chartData.length === 0 ? <p className="text-sm text-stone-400">—</p> : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card className="p-6">
          <h3 className="font-medium text-red-900 mb-3">{t("budget_savings_goal")}</h3>
          <p className="text-sm text-stone-600 mb-2">₹{budget.savingsGoal.current.toLocaleString()} / ₹{budget.savingsGoal.target.toLocaleString()}</p>
          <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: `${savingsPct}%` }} />
          </div>
          <p className="text-xs text-stone-500 mt-2">{savingsPct}%</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-medium text-red-900 mb-3">{t("budget_expenses")}</h3>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {budget.expenses.slice().reverse().map((e) => (
            <div key={e.id} className="flex items-center justify-between text-sm border-b border-stone-100 pb-2">
              <div>
                <p className="font-medium text-stone-800">{t(e.cat)} — ₹{e.amount}</p>
                {e.note && <p className="text-stone-400 text-xs">{e.note}</p>}
              </div>
              <button onClick={() => removeExpense(e.id)} className="text-stone-400 hover:text-rose-500"><Trash2 size={15} /></button>
            </div>
          ))}
          {budget.expenses.length === 0 && <p className="text-sm text-stone-400">—</p>}
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------- Career ---------------------------- */

function CareerPage({ t, lang, skills, onAssess }) {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(!!skills);

  const submit = () => {
    const scores = {};
    SKILL_QUESTIONS.forEach((q) => {
      const v = answers[q.id] || 1;
      scores[q.skill] = (scores[q.skill] || 0) + v;
    });
    onAssess(scores);
    setShowResults(true);
  };

  const levelLabel = (v) => (v >= 3 ? t("level_strong") || "Strong" : v === 2 ? t("level_good") || "Good" : "Developing");

  if (showResults && skills) {
    const sorted = Object.entries(skills).sort((a, b) => b[1] - a[1]);
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl text-red-950 mb-2">{t("your_transferable_skills")}</h1>
        <p className="text-stone-600 mb-8">{t("msg_skills_note")}</p>
        <Card className="p-6 mb-8">
          <div className="space-y-3">
            {sorted.map(([skill, v]) => (
              <div key={skill}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-stone-800">{skill}</span><span className="text-stone-500">{levelLabel(v)}</span></div>
                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden"><div className="h-full bg-red-700" style={{ width: `${Math.min(100, v * 25)}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
        <h2 className="font-display text-xl text-red-900 mb-3">{t("career_recommend_title") || t("nav_jobs")}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {sorted.slice(0, 2).flatMap(([skill]) => JOB_CATEGORIES[skill] || []).slice(0, 4).map((role) => (
            <Card key={role} className="p-5">
              <p className="font-medium text-stone-800">{role}</p>
              <p className="text-xs text-stone-500 mt-1">{t("recommended_because")}</p>
            </Card>
          ))}
        </div>
        <GhostButton onClick={() => setShowResults(false)} className="mt-8">{t("btn_take_assessment")}</GhostButton>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-red-950 mb-2">{t("discover_skills")}</h1>
      <p className="text-stone-600 mb-8">{t("career_title")}</p>
      <Card className="p-6">
        {SKILL_QUESTIONS.map((q) => (
          <div key={q.id} className="mb-6">
            <p className="text-sm font-medium text-stone-800 mb-2">{q.text[lang] || q.text.en}</p>
            <div className="flex gap-2">
              {[1, 2, 3].map((v) => (
                <button key={v} onClick={() => setAnswers((a) => ({ ...a, [q.id]: v }))}
                  className={`flex-1 rounded-xl py-2 text-sm border ${answers[q.id] === v ? "bg-red-800 text-amber-50 border-red-800" : "border-stone-300"}`}>
                  {"★".repeat(v)}
                </button>
              ))}
            </div>
          </div>
        ))}
        <PrimaryButton onClick={submit} disabled={Object.keys(answers).length < SKILL_QUESTIONS.length} className="w-full">{t("btn_take_assessment")}</PrimaryButton>
      </Card>
    </div>
  );
}
/* ---------------------------- Career Assessment v2 ---------------------------- */

const CAREER_WEIGHTS = {
  experience: 0.20,
  skills: 0.20,
  interests: 0.15,
  workPreferences: 0.10,
  salary: 0.10,
  education: 0.10,
  careerGoals: 0.05,
  location: 0.05,
  learningReadiness: 0.05,
};

const TECH_SKILLS_OPTIONS = ["Excel/Spreadsheets", "Basic accounting", "Bookkeeping", "Data entry", "Social media", "Content writing", "Graphic design", "Teaching/tutoring", "Customer service software", "Basic coding", "Inventory management", "Scheduling tools"];
const SOFT_SKILLS_OPTIONS = ["Communication", "Team coordination", "Problem-solving", "Time management", "Negotiation", "Patience", "Multitasking", "Leadership", "Attention to detail", "Adaptability"];
const TOOLS_OPTIONS = ["MS Word/Excel", "Google Workspace", "WhatsApp Business", "Tally/accounting software", "Canva", "Zoom/Video calls", "Basic CRM tools", "None of these yet"];
const INDUSTRY_OPTIONS = ["Administration/Office", "Finance/Accounting", "Education/Teaching", "Healthcare support", "Retail/Sales", "Customer support", "IT/Tech support", "Marketing/Social media", "HR/People operations", "Hospitality"];
const ROLE_TYPE_OPTIONS = ["People-oriented", "Analytical", "Creative", "Administrative", "Technical", "Teaching", "Business/Sales", "Independent work"];

const CAREER_QUESTION_GROUPS = [
  {
    id: "experience",
    title: "Your work experience",
    questions: [
      { id: "hasWorkedBefore", type: "yesno", label: "Have you worked in a paid job before?", required: true },
      { id: "prevJobTitle", type: "text", label: "What was your most recent job title?", showIf: (a) => a.hasWorkedBefore === "yes" },
      { id: "prevIndustry", type: "select", label: "Which industry was that in?", options: INDUSTRY_OPTIONS, showIf: (a) => a.hasWorkedBefore === "yes" },
      { id: "yearsExperience", type: "select", label: "How many years of work experience do you have in total?", options: ["Less than 1 year", "1-3 years", "4-7 years", "8-15 years", "15+ years"], showIf: (a) => a.hasWorkedBefore === "yes" },
      { id: "seniorityLevel", type: "select", label: "What level was your role?", options: ["Entry-level", "Mid-level", "Senior/Managed a team", "Owned my own business"], showIf: (a) => a.hasWorkedBefore === "yes" },
      { id: "responsibilities", type: "multiselect", label: "Which of these did your work involve?", options: ["Managing people", "Handling money/accounts", "Talking to customers", "Planning events or schedules", "Data entry or records", "Teaching or training others", "Sales or promotion"], showIf: (a) => a.hasWorkedBefore === "yes" },
      { id: "achievements", type: "text", label: "Anything you're proud of from that work? (optional)", showIf: (a) => a.hasWorkedBefore === "yes" },
    ],
  },
  {
    id: "education",
    title: "Your education",
    questions: [
      { id: "highestQualification", type: "select", label: "What is your highest level of education?", options: ["School (up to 10th/12th)", "Diploma", "Bachelor's degree", "Master's degree", "Other professional qualification"], required: true },
      { id: "specialization", type: "text", label: "What did you study or specialize in? (optional)" },
      { id: "certifications", type: "text", label: "Any certifications or short courses you've completed? (optional)" },
    ],
  },
  {
    id: "skills",
    title: "Your skills",
    questions: [
      { id: "technicalSkills", type: "multiselect", label: "Which of these can you already do?", options: TECH_SKILLS_OPTIONS },
      { id: "softSkills", type: "multiselect", label: "Which of these describe you?", options: SOFT_SKILLS_OPTIONS },
      { id: "toolsKnown", type: "multiselect", label: "Which tools or apps have you used?", options: TOOLS_OPTIONS },
      { id: "skillsWantAgain", type: "multiselect", label: "Which skills would you like to use in your next job?", options: [...new Set([...TECH_SKILLS_OPTIONS, ...SOFT_SKILLS_OPTIONS])] },
    ],
  },
  {
    id: "interests",
    title: "What interests you",
    questions: [
      { id: "interestedIndustries", type: "multiselect", label: "Which fields interest you?", options: INDUSTRY_OPTIONS, required: true },
      { id: "roleTypesEnjoy", type: "multiselect", label: "What kind of work do you enjoy most?", options: ROLE_TYPE_OPTIONS, required: true },
      { id: "tasksDislike", type: "text", label: "Anything you'd rather avoid in a job? (optional)" },
    ],
  },
  {
    id: "careerBreak",
    title: "About your career break",
    questions: [
      { id: "hasBreak", type: "yesno", label: "Have you taken a break from paid work?", required: true },
      { id: "breakLength", type: "select", label: "How long was the break?", options: ["Less than 1 year", "1-3 years", "4-7 years", "8+ years"], showIf: (a) => a.hasBreak === "yes" },
      { id: "breakReason", type: "select", label: "What was the main reason?", options: ["Childcare", "Family/household responsibilities", "Health", "Relocation", "Studies", "Other"], showIf: (a) => a.hasBreak === "yes" },
      { id: "returnOrSwitch", type: "select", label: "Do you want to return to the same field, or try something new?", options: ["Same field as before", "Open to switching", "Not sure yet"], showIf: (a) => a.hasBreak === "yes" },
      { id: "breakConfidence", type: "scale", label: "How confident do you feel about returning to work?", showIf: (a) => a.hasBreak === "yes" },
      { id: "skillsRusty", type: "multiselect", label: "Any skills you feel need refreshing?", options: [...TECH_SKILLS_OPTIONS, "None, I feel ready"], showIf: (a) => a.hasBreak === "yes" },
    ],
  },
  {
    id: "workPreferences",
    title: "How you'd like to work",
    questions: [
      { id: "employmentType", type: "multiselect", label: "What type of work are you open to?", options: ["Full-time", "Part-time", "Freelance", "Contract"], required: true },
      { id: "workMode", type: "select", label: "Where would you like to work?", options: ["Remote (from home)", "Hybrid", "In-office"], required: true },
      { id: "preferredHours", type: "select", label: "What working hours suit you best?", options: ["Regular daytime hours", "Flexible/any time", "Part of the day only"] },
      { id: "weekendWork", type: "yesno", label: "Are you open to working weekends if needed?" },
      { id: "maxCommute", type: "select", label: "What's the maximum commute you'd accept?", options: ["Work from home only", "Under 30 minutes", "30-60 minutes", "Over 1 hour is fine"] },
      { id: "relocationWillingness", type: "yesno", label: "Would you consider relocating for the right opportunity?" },
    ],
  },
  {
    id: "constraints",
    title: "Your time and responsibilities",
    questions: [
      { id: "hoursAvailable", type: "select", label: "How many hours a week can you realistically work?", options: ["Under 10 hours", "10-20 hours", "20-35 hours", "35+ hours (full-time)"], required: true },
      { id: "caregiving", type: "multiselect", label: "Do you currently care for anyone at home?", options: ["Young children", "Elderly family member", "Someone with health needs", "None currently"] },
      { id: "flexibilityNeeded", type: "select", label: "How important is flexible timing to you?", options: ["Very important", "Somewhat important", "Not a major concern"] },
    ],
  },
  {
    id: "salary",
    title: "Salary and goals",
    questions: [
      { id: "prevSalaryRange", type: "select", label: "What was your previous salary range? (if any)", options: ["Not applicable", "Under ₹15,000/mo", "₹15,000-30,000/mo", "₹30,000-50,000/mo", "₹50,000+/mo"] },
      { id: "expectedSalary", type: "select", label: "What salary are you hoping for now?", options: ["Under ₹15,000/mo", "₹15,000-30,000/mo", "₹30,000-50,000/mo", "₹50,000+/mo", "Open/flexible"], required: true },
      { id: "shortTermGoal", type: "text", label: "What's your main goal for the next few months?" },
      { id: "longTermGoal", type: "text", label: "Where would you like to be in a few years? (optional)" },
      { id: "leadershipInterest", type: "yesno", label: "Are you interested in leading a team eventually?" },
    ],
  },
  {
    id: "learning",
    title: "Learning readiness",
    questions: [
      { id: "willingToLearn", type: "yesno", label: "Are you open to learning new skills for the right job?", required: true },
      { id: "hoursForUpskilling", type: "select", label: "How much time could you give to learning each week?", options: ["None right now", "1-3 hours", "4-7 hours", "8+ hours"] },
      { id: "learningStyle", type: "select", label: "How do you learn best?", options: ["Watching videos", "Reading", "Hands-on practice", "Learning from a mentor"] },
      { id: "immediateVsPrepare", type: "select", label: "Do you want a job right away, or are you okay preparing for a few months first?", options: ["I need work as soon as possible", "I can prepare for a couple of months", "No rush, I want to do this properly"] },
    ],
  },
  {
    id: "personality",
    title: "Your work style",
    questions: [
      { id: "teamVsIndependent", type: "select", label: "Do you prefer working in a team or independently?", options: ["Mostly in a team", "Mostly independently", "A mix of both"] },
      { id: "routineVsVaried", type: "select", label: "Do you prefer routine work or varied tasks?", options: ["Predictable routine", "Variety and change", "A mix"] },
      { id: "publicSpeakingComfort", type: "scale", label: "How comfortable are you talking to customers or speaking in groups?" },
      { id: "riskTolerance", type: "scale", label: "How comfortable are you trying something new and uncertain?" },
    ],
  },
];
const CAREER_JOBS_DB = [
  {
    id: "accounts-exec", title: "Accounts Executive", industry: "Finance/Accounting",
    requiredSkills: ["Basic accounting", "Bookkeeping", "Excel/Spreadsheets"], niceSkills: ["Tally/accounting software"],
    roleTypes: ["Analytical", "Administrative"], workModes: ["Remote (from home)", "Hybrid", "In-office"],
    minSalary: "₹15,000-30,000/mo", education: ["Diploma", "Bachelor's degree", "Master's degree"],
    prepWeeks: 6, growth: "Can grow into Senior Accountant or Finance Manager with experience.",
    challenges: "May need to refresh GST/tax rules if it's been a few years.",
  },
  {
    id: "bookkeeper-freelance", title: "Freelance Bookkeeper", industry: "Finance/Accounting",
    requiredSkills: ["Basic accounting", "Bookkeeping"], niceSkills: ["Tally/accounting software", "Excel/Spreadsheets"],
    roleTypes: ["Analytical", "Independent work"], workModes: ["Remote (from home)"],
    minSalary: "₹15,000-30,000/mo", education: ["School (up to 10th/12th)", "Diploma", "Bachelor's degree"],
    prepWeeks: 4, growth: "Build a client base over time and set your own hours.",
    challenges: "Income can be irregular at first while building clients.",
  },
  {
    id: "hr-ops", title: "HR Operations Specialist", industry: "HR/People operations",
    requiredSkills: ["Data entry", "Customer service software"], niceSkills: ["MS Word/Excel"],
    roleTypes: ["People-oriented", "Administrative"], workModes: ["Hybrid", "In-office"],
    minSalary: "₹15,000-30,000/mo", education: ["Diploma", "Bachelor's degree", "Master's degree"],
    prepWeeks: 8, growth: "Path toward HR Generalist or HR Manager roles.",
    challenges: "May need to learn basic HRMS software and employment law basics.",
  },
  {
    id: "customer-support", title: "Customer Support Associate", industry: "Customer support",
    requiredSkills: ["Customer service software"], niceSkills: ["Communication"],
    roleTypes: ["People-oriented"], workModes: ["Remote (from home)", "Hybrid", "In-office"],
    minSalary: "Under ₹15,000/mo", education: ["School (up to 10th/12th)", "Diploma", "Bachelor's degree"],
    prepWeeks: 2, growth: "Can move into Team Lead or Quality Analyst roles.",
    challenges: "Often involves fixed shift hours, sometimes including evenings.",
  },
  {
    id: "virtual-assistant", title: "Virtual Assistant", industry: "Administration/Office",
    requiredSkills: ["Scheduling tools", "Google Workspace"], niceSkills: ["Data entry", "Social media"],
    roleTypes: ["Administrative", "Independent work"], workModes: ["Remote (from home)"],
    minSalary: "Under ₹15,000/mo", education: ["School (up to 10th/12th)", "Diploma", "Bachelor's degree", "Master's degree"],
    prepWeeks: 3, growth: "Can specialize into executive assistant or operations coordinator work.",
    challenges: "Requires self-discipline working independently from home.",
  },
  {
    id: "school-coordinator", title: "School/Center Coordinator", industry: "Education/Teaching",
    requiredSkills: ["Scheduling tools"], niceSkills: ["Communication", "Team coordination"],
    roleTypes: ["Administrative", "People-oriented", "Teaching"], workModes: ["In-office", "Hybrid"],
    minSalary: "₹15,000-30,000/mo", education: ["Diploma", "Bachelor's degree", "Master's degree"],
    prepWeeks: 3, growth: "Can grow into Academic Coordinator or Center Manager.",
    challenges: "Usually requires being on-site during school hours.",
  },
  {
    id: "tutor", title: "Subject Tutor", industry: "Education/Teaching",
    requiredSkills: [], niceSkills: ["Communication"],
    roleTypes: ["Teaching", "People-oriented", "Independent work"], workModes: ["Remote (from home)", "Hybrid", "In-office"],
    minSalary: "Under ₹15,000/mo", education: ["Diploma", "Bachelor's degree", "Master's degree"],
    prepWeeks: 2, growth: "Can build a full tutoring practice or join an ed-tech platform.",
    challenges: "Income depends on number of students; takes time to build a base.",
  },
  {
    id: "social-media-assistant", title: "Social Media Assistant", industry: "Marketing/Social media",
    requiredSkills: ["Social media"], niceSkills: ["Content writing", "Graphic design"],
    roleTypes: ["Creative", "Independent work"], workModes: ["Remote (from home)", "Hybrid"],
    minSalary: "Under ₹15,000/mo", education: ["School (up to 10th/12th)", "Diploma", "Bachelor's degree"],
    prepWeeks: 4, growth: "Can grow into Social Media Manager or freelance consultant.",
    challenges: "Fast-changing field; benefits from ongoing learning.",
  },
  {
    id: "data-entry", title: "Data Entry Specialist", industry: "Administration/Office",
    requiredSkills: ["Data entry", "Excel/Spreadsheets"], niceSkills: [],
    roleTypes: ["Administrative", "Independent work"], workModes: ["Remote (from home)", "In-office"],
    minSalary: "Under ₹15,000/mo", education: ["School (up to 10th/12th)", "Diploma"],
    prepWeeks: 1, growth: "Good starting point; can move into admin or ops roles.",
    challenges: "Can be repetitive; best as a stepping stone role.",
  },
  {
    id: "retail-sales", title: "Retail Sales Associate", industry: "Retail/Sales",
    requiredSkills: [], niceSkills: ["Negotiation", "Communication"],
    roleTypes: ["People-oriented", "Business/Sales"], workModes: ["In-office"],
    minSalary: "Under ₹15,000/mo", education: ["School (up to 10th/12th)", "Diploma", "Bachelor's degree"],
    prepWeeks: 1, growth: "Can move into Store Supervisor or Sales Manager roles.",
    challenges: "Usually requires standing hours and fixed shifts.",
  },
  {
    id: "it-support", title: "IT Helpdesk Support", industry: "IT/Tech support",
    requiredSkills: ["Basic coding"], niceSkills: ["Customer service software"],
    roleTypes: ["Technical", "Analytical"], workModes: ["Remote (from home)", "Hybrid", "In-office"],
    minSalary: "₹15,000-30,000/mo", education: ["Diploma", "Bachelor's degree"],
    prepWeeks: 10, growth: "Path toward IT Support Specialist or systems roles.",
    challenges: "Requires learning technical troubleshooting basics.",
  },
  {
    id: "healthcare-support", title: "Healthcare Admin Support", industry: "Healthcare support",
    requiredSkills: ["Data entry", "Scheduling tools"], niceSkills: ["Communication"],
    roleTypes: ["Administrative", "People-oriented"], workModes: ["In-office", "Hybrid"],
    minSalary: "₹15,000-30,000/mo", education: ["Diploma", "Bachelor's degree"],
    prepWeeks: 4, growth: "Can move into Clinic Manager or Patient Coordinator roles.",
    challenges: "May involve sensitive information handling and training.",
  },
];

const SALARY_ORDER = ["Under ₹15,000/mo", "₹15,000-30,000/mo", "₹30,000-50,000/mo", "₹50,000+/mo", "Open/flexible", "Not applicable"];
const EDU_ORDER = ["School (up to 10th/12th)", "Diploma", "Bachelor's degree", "Master's degree", "Other professional qualification"];

function buildCareerProfile(answers) {
  return {
    previousExperience: {
      hasWorkedBefore: answers.hasWorkedBefore === "yes",
      jobTitle: answers.prevJobTitle || "",
      industry: answers.prevIndustry || "",
      years: answers.yearsExperience || "",
      seniority: answers.seniorityLevel || "",
      responsibilities: answers.responsibilities || [],
    },
    education: {
      level: answers.highestQualification || "",
      specialization: answers.specialization || "",
      certifications: answers.certifications || "",
    },
    technicalSkills: answers.technicalSkills || [],
    softSkills: answers.softSkills || [],
    toolsKnown: answers.toolsKnown || [],
    skillsWantAgain: answers.skillsWantAgain || [],
    interests: {
      industries: answers.interestedIndustries || [],
      roleTypes: answers.roleTypesEnjoy || [],
      dislikes: answers.tasksDislike || "",
    },
    careerBreak: {
      hasBreak: answers.hasBreak === "yes",
      length: answers.breakLength || "",
      reason: answers.breakReason || "",
      returnOrSwitch: answers.returnOrSwitch || "",
      confidence: answers.breakConfidence || 3,
      rustySkills: answers.skillsRusty || [],
    },
    workPreferences: {
      employmentType: answers.employmentType || [],
      workMode: answers.workMode || "",
      preferredHours: answers.preferredHours || "",
      weekendWork: answers.weekendWork === "yes",
      maxCommute: answers.maxCommute || "",
      relocation: answers.relocationWillingness === "yes",
    },
    constraints: {
      hoursAvailable: answers.hoursAvailable || "",
      caregiving: answers.caregiving || [],
      flexibilityNeeded: answers.flexibilityNeeded || "",
    },
    salaryExpectations: {
      previous: answers.prevSalaryRange || "",
      expected: answers.expectedSalary || "",
    },
    careerGoals: {
      shortTerm: answers.shortTermGoal || "",
      longTerm: answers.longTermGoal || "",
      leadershipInterest: answers.leadershipInterest === "yes",
    },
    learningReadiness: {
      willing: answers.willingToLearn === "yes",
      hoursPerWeek: answers.hoursForUpskilling || "",
      style: answers.learningStyle || "",
      urgency: answers.immediateVsPrepare || "",
    },
    personality: {
      teamVsIndependent: answers.teamVsIndependent || "",
      routineVsVaried: answers.routineVsVaried || "",
      publicSpeaking: answers.publicSpeakingComfort || 3,
      riskTolerance: answers.riskTolerance || 3,
    },
  };
}

function scoreJob(profile, job) {
  const allUserSkills = [...profile.technicalSkills, ...profile.softSkills, ...profile.toolsKnown];

  // Skills match
  const matchingSkills = job.requiredSkills.filter((s) => allUserSkills.includes(s));
  const matchingNice = job.niceSkills.filter((s) => allUserSkills.includes(s));
  const skillsToLearn = job.requiredSkills.filter((s) => !allUserSkills.includes(s));
  const totalReq = job.requiredSkills.length || 1;
  const skillsScore = Math.min(100, ((matchingSkills.length / totalReq) * 80) + (matchingNice.length * 10));

  // Experience match
  let experienceScore = 40;
  if (profile.previousExperience.hasWorkedBefore) {
    if (profile.previousExperience.industry === job.industry) experienceScore = 90;
    else if (job.roleTypes.some((rt) => profile.previousExperience.responsibilities.some((r) => r.toLowerCase().includes(rt.toLowerCase().split("-")[0])))) experienceScore = 65;
    else experienceScore = 50;
  }

  // Interests match
  const industryMatch = profile.interests.industries.includes(job.industry) ? 60 : 0;
  const roleTypeMatch = job.roleTypes.filter((rt) => profile.interests.roleTypes.includes(rt)).length;
  const interestsScore = Math.min(100, industryMatch + roleTypeMatch * 20);

  // Work preferences match
  const workModeMatch = job.workModes.includes(profile.workPreferences.workMode) ? 100 : 40;
  const workPreferencesScore = workModeMatch;

  // Salary match
  const expectedIdx = SALARY_ORDER.indexOf(profile.salaryExpectations.expected);
  const jobMinIdx = SALARY_ORDER.indexOf(job.minSalary);
  const salaryScore = expectedIdx === -1 || jobMinIdx === -1 ? 60 : (expectedIdx <= jobMinIdx + 1 ? 90 : 50);

  // Education match
  const eduIdx = EDU_ORDER.indexOf(profile.education.level);
  const educationScore = job.education.includes(profile.education.level) ? 90 : (eduIdx >= 0 ? 55 : 40);

  // Career goals
  const careerGoalsScore = profile.careerGoals.leadershipInterest && job.growth.toLowerCase().includes("manager") ? 90 : 60;

  // Location (approximated via work mode/commute)
  const locationScore = profile.workPreferences.maxCommute === "Work from home only"
    ? (job.workModes.includes("Remote (from home)") ? 100 : 20)
    : 75;

  // Learning readiness
  const learningReadinessScore = profile.learningReadiness.willing
    ? (job.prepWeeks <= 6 ? 90 : 70)
    : (job.prepWeeks <= 2 ? 80 : 30);

  const weighted =
    skillsScore * CAREER_WEIGHTS.skills +
    experienceScore * CAREER_WEIGHTS.experience +
    interestsScore * CAREER_WEIGHTS.interests +
    workPreferencesScore * CAREER_WEIGHTS.workPreferences +
    salaryScore * CAREER_WEIGHTS.salary +
    educationScore * CAREER_WEIGHTS.education +
    careerGoalsScore * CAREER_WEIGHTS.careerGoals +
    locationScore * CAREER_WEIGHTS.location +
    learningReadinessScore * CAREER_WEIGHTS.learningReadiness;

  const transferableSkills = profile.previousExperience.responsibilities.filter((r) =>
    job.roleTypes.some((rt) => r.toLowerCase().includes(rt.toLowerCase().split("/")[0].split(" ")[0].toLowerCase()))
  );

  const reasons = [];
  if (profile.previousExperience.industry === job.industry) reasons.push(`your ${profile.previousExperience.years} background in ${job.industry}`);
  if (matchingSkills.length > 0) reasons.push(`your existing skills in ${matchingSkills.slice(0, 2).join(" and ")}`);
  if (profile.interests.industries.includes(job.industry)) reasons.push(`your interest in ${job.industry}`);
  if (workModeMatch === 100) reasons.push(`it matches your preferred ${profile.workPreferences.workMode.toLowerCase()} setup`);

  return {
    job,
    matchPercent: Math.round(weighted),
    matchingSkills: [...matchingSkills, ...matchingNice],
    skillsToLearn,
    transferableSkills: transferableSkills.length > 0 ? transferableSkills : matchingSkills,
    reasons,
  };
}

function rankRecommendations(profile) {
  const scored = CAREER_JOBS_DB.map((job) => scoreJob(profile, job)).sort((a, b) => b.matchPercent - a.matchPercent);
  const top = scored.slice(0, 8);
  return {
    best: top.filter((s) => s.matchPercent >= 75),
    good: top.filter((s) => s.matchPercent >= 55 && s.matchPercent < 75),
    explore: top.filter((s) => s.matchPercent < 55),
  };
}
function QuestionInput({ q, value, onChange }) {
  if (q.type === "yesno") {
    return (
      <div className="flex gap-3">
        {["yes", "no"].map((opt) => (
          <button key={opt} onClick={() => onChange(opt)}
            className={`flex-1 rounded-xl py-3 text-sm font-medium border ${value === opt ? "bg-red-800 text-amber-50 border-red-800" : "border-stone-300"}`}>
            {opt === "yes" ? "Yes" : "No"}
          </button>
        ))}
      </div>
    );
  }
  if (q.type === "select") {
    return (
      <div className="grid gap-2">
        {q.options.map((opt) => (
          <button key={opt} onClick={() => onChange(opt)}
            className={`text-left rounded-xl px-4 py-2.5 text-sm border ${value === opt ? "bg-red-800 text-amber-50 border-red-800" : "border-stone-300"}`}>
            {opt}
          </button>
        ))}
      </div>
    );
  }
  if (q.type === "multiselect") {
    const selected = value || [];
    const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
    return (
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt) => (
          <button key={opt} onClick={() => toggle(opt)}
            className={`text-left rounded-xl px-3 py-2 text-sm border ${selected.includes(opt) ? "bg-red-800 text-amber-50 border-red-800" : "border-stone-300"}`}>
            {opt}
          </button>
        ))}
      </div>
    );
  }
  if (q.type === "scale") {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button key={v} onClick={() => onChange(v)}
            className={`flex-1 rounded-xl py-3 text-sm border ${value === v ? "bg-red-800 text-amber-50 border-red-800" : "border-stone-300"}`}>
            {v}
          </button>
        ))}
      </div>
    );
  }
  return (
    <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={2}
      className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" />
  );
}

function CareerAssessment({ onFinish }) {
  const [groupIdx, setGroupIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  const group = CAREER_QUESTION_GROUPS[groupIdx];
  const visibleQuestions = group.questions.filter((q) => !q.showIf || q.showIf(answers));

  const setAnswer = (id, val) => setAnswers((a) => ({ ...a, [id]: val }));

  const canProceed = visibleQuestions.every((q) => !q.required || answers[q.id]);

  const next = () => {
    if (groupIdx < CAREER_QUESTION_GROUPS.length - 1) {
      setGroupIdx(groupIdx + 1);
    } else {
      const profile = buildCareerProfile(answers);
      onFinish(profile);
    }
  };
  const back = () => groupIdx > 0 && setGroupIdx(groupIdx - 1);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <p className="text-xs uppercase tracking-wide text-amber-600 font-semibold mb-2">
        Section {groupIdx + 1} of {CAREER_QUESTION_GROUPS.length}
      </p>
      <div className="w-full h-1.5 bg-stone-200 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-amber-500 transition-all" style={{ width: `${((groupIdx + 1) / CAREER_QUESTION_GROUPS.length) * 100}%` }} />
      </div>
      <h1 className="font-display text-2xl text-red-950 mb-6">{group.title}</h1>
      <Card className="p-6 space-y-6">
        {visibleQuestions.map((q) => (
          <div key={q.id}>
            <p className="text-sm font-medium text-stone-800 mb-2">{q.label}</p>
            <QuestionInput q={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} />
          </div>
        ))}
        <div className="flex justify-between pt-2">
          <GhostButton onClick={back} className={`py-2 px-4 ${groupIdx === 0 ? "invisible" : ""}`}><ChevronLeft size={16} /> Back</GhostButton>
          <PrimaryButton onClick={next} disabled={!canProceed} className="py-2 px-5">
            <span style={{ color: "#333333" }}>
  {groupIdx === CAREER_QUESTION_GROUPS.length - 1 ? "See my recommendations" : "Next"}
</span>
<ChevronRight size={16} />
          </PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

function CareerRecommendationCard({ rec, onSave, saved }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-xl text-red-950">{rec.job.title}</p>
        <span className="text-sm font-semibold text-red-800 shrink-0">{rec.matchPercent}% Match</span>
      </div>
      {rec.reasons.length > 0 && (
        <p className="text-sm text-stone-600 mt-2">
          Why this fits you: {rec.reasons.join(", ")}.
        </p>
      )}
      {rec.transferableSkills.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Your transferable skills</p>
          <p className="text-sm text-stone-700 mt-1">{rec.transferableSkills.join(", ")}</p>
        </div>
      )}
      {rec.skillsToLearn.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Skills to refresh or learn</p>
          <p className="text-sm text-stone-700 mt-1">{rec.skillsToLearn.join(", ")}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div><p className="text-xs text-stone-500">Preparation time</p><p className="text-stone-800">{rec.job.prepWeeks} weeks</p></div>
        <div><p className="text-xs text-stone-500">Work arrangement</p><p className="text-stone-800">{rec.job.workModes.join(", ")}</p></div>
      </div>
      <div className="mt-3">
        <p className="text-xs text-stone-500">Growth path</p>
        <p className="text-sm text-stone-700">{rec.job.growth}</p>
      </div>
      <div className="mt-3">
        <p className="text-xs text-stone-500">Worth considering</p>
        <p className="text-sm text-stone-700">{rec.job.challenges}</p>
      </div>
      <PrimaryButton
  onClick={() => onSave(rec.job.id)}
  disabled={saved}
  className="w-full mt-4 py-2 text-sm"
>
  <span style={{ color: "#333333" }}>
    {saved ? "Saved" : "Save this recommendation"}
  </span>
</PrimaryButton>
    </Card>
  );
}

function CareerResultsView({ profile, savedJobs, onToggleSave, onRetake }) {
  const { best, good, explore } = useMemo(() => rankRecommendations(profile), [profile]);

  const section = (title, list) =>
    list.length > 0 && (
      <div className="mb-10">
        <h2 className="font-display text-xl text-red-900 mb-4">{title}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {list.map((rec) => (
            <CareerRecommendationCard key={rec.job.id} rec={rec} onSave={onToggleSave} saved={savedJobs.includes(rec.job.id)} />
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-red-950">Your personalized recommendations</h1>
        <GhostButton onClick={onRetake} className="py-2 px-4 text-sm">Retake assessment</GhostButton>
      </div>
      {section("Best match", best)}
      {section("Good match", good)}
      {section("Explore / career switch", explore)}
    </div>
  );
}

function CareerAssessmentPage({ careerProfile, onProfileBuilt, savedJobs, onToggleSave }) {
  if (!careerProfile) {
    return <CareerAssessment onFinish={onProfileBuilt} />;
  }
  return (
    <CareerResultsView
      profile={careerProfile}
      savedJobs={savedJobs}
      onToggleSave={onToggleSave}
      onRetake={() => onProfileBuilt(null)}
    />
  );
}


/* ---------------------------- Jobs ---------------------------- */

function JobsPage({ t, lang, savedJobs, onToggleSave, skills }) {
  const [filter, setFilter] = useState("All");
  const types = ["All", "Remote", "Part-time", "Full-time", "Returnship", "Freelance"];
  const topSkill = skills ? Object.entries(skills).sort((a, b) => b[1] - a[1])[0][0] : null;

  const jobs = MOCK_JOBS.filter((j) => filter === "All" || j.type === filter || j.location === filter);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-red-950 mb-6">{t("jobs_title")}</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {types.map((ty) => (
          <button key={ty} onClick={() => setFilter(ty)} className={`px-4 py-1.5 rounded-full text-sm border ${filter === ty ? "bg-red-800 text-amber-50 border-red-800" : "border-stone-300 text-stone-600"}`}>{ty}</button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {jobs.map((j) => (
          <Card key={j.id} className={`p-5 ${topSkill === j.cat ? "ring-2 ring-amber-400" : ""}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-stone-900">{j.title}</p>
                <p className="text-sm text-stone-500">{j.company}</p>
              </div>
              {j.gapFriendly && <span className="text-[10px] bg-red-50 text-red-800 rounded-full px-2 py-1 font-medium shrink-0">{t("job_gap_friendly")}</span>}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 mt-3">
              <span className="flex items-center gap-1"><MapPin size={12} /> {j.location}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> {j.type}</span>
              <span>{j.exp}</span>
            </div>
            <p className="text-sm font-medium text-red-800 mt-2">{j.salary}</p>
            <div className="flex gap-2 mt-4">
              <GhostButton className="py-2 px-4 text-sm flex-1">{t("btn_view")}</GhostButton>
              <PrimaryButton onClick={() => onToggleSave(j.id)} className="py-2 px-4 text-sm flex-1">
                {savedJobs.includes(j.id) ? t("btn_saved") : t("btn_save")}
              </PrimaryButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- Resume ---------------------------- */
const pdfStyles = StyleSheet.create({
  page: { flexDirection: "row", backgroundColor: "#ffffff", fontFamily: "Helvetica", fontSize: 9.5, color: "#1a1a1a" },
  leftCol: { width: "34%", backgroundColor: "#f6f4ef", padding: 22 },
  rightCol: { width: "66%", padding: 26 },
  photo: { width: 88, height: 88, borderRadius: 44, marginBottom: 14, alignSelf: "center" },
  sectionTitleLeft: { fontSize: 9.5, fontWeight: 700, letterSpacing: 1, color: "#7a1f2b", marginTop: 16, marginBottom: 6, textTransform: "uppercase" },
  sectionTitleRight: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#7a1f2b", marginTop: 14, marginBottom: 6, textTransform: "uppercase", borderBottomWidth: 1, borderBottomColor: "#7a1f2b", paddingBottom: 3 },
  bodyText: { fontSize: 9.5, lineHeight: 1.5, marginBottom: 3 },
  name: { fontSize: 22, fontWeight: 700, color: "#111111" },
  jobTitleText: { fontSize: 12, color: "#555555", marginTop: 2, marginBottom: 4 },
  entryHeader: { fontSize: 10.5, fontWeight: 700, marginTop: 8 },
  entrySub: { fontSize: 9, color: "#666666", marginBottom: 4 },
  bulletRow: { flexDirection: "row", marginBottom: 2 },
  bulletDot: { width: 9, fontSize: 9.5 },
  bulletText: { flex: 1, fontSize: 9.5, lineHeight: 1.4 },
  skillLine: { fontSize: 9, marginBottom: 3 },
});

function ResumePDFDocument({ data }) {
  const experience = (data.experience || []).filter((e) => e.title || e.company);
  const education = (data.education || []).filter((e) => e.degree || e.institution);
  const skills = (data.skills || []).map((s) => s.trim()).filter(Boolean);
  const languages = (data.languages || []).map((s) => s.trim()).filter(Boolean);
  const certifications = (data.certifications || []).map((s) => s.trim()).filter(Boolean);
  const volunteer = (data.volunteer || []).map((s) => s.trim()).filter(Boolean);
  const household = (data.household || []).map((s) => s.trim()).filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.leftCol}>
          {data.photo ? <PdfImage src={data.photo} style={pdfStyles.photo} /> : null}
          {data.summary ? (
            <View>
              <PdfText style={pdfStyles.sectionTitleLeft}>Profile</PdfText>
              <PdfText style={pdfStyles.bodyText}>{data.summary}</PdfText>
            </View>
          ) : null}
          <View>
            <PdfText style={pdfStyles.sectionTitleLeft}>Contact</PdfText>
            {data.phone ? <PdfText style={pdfStyles.bodyText}>{data.phone}</PdfText> : null}
            {data.email ? <PdfText style={pdfStyles.bodyText}>{data.email}</PdfText> : null}
            {data.location ? <PdfText style={pdfStyles.bodyText}>{data.location}</PdfText> : null}
            {data.linkedin ? <PdfText style={pdfStyles.bodyText}>{data.linkedin}</PdfText> : null}
          </View>
          {skills.length > 0 ? (
            <View>
              <PdfText style={pdfStyles.sectionTitleLeft}>Skills</PdfText>
              {skills.map((s, i) => (
                <PdfText key={i} style={pdfStyles.skillLine}>• {s}</PdfText>
              ))}
            </View>
          ) : null}
          {languages.length > 0 ? (
            <View>
              <PdfText style={pdfStyles.sectionTitleLeft}>Languages</PdfText>
              {languages.map((l, i) => (
                <PdfText key={i} style={pdfStyles.skillLine}>{l}</PdfText>
              ))}
            </View>
          ) : null}
        </View>

        <View style={pdfStyles.rightCol}>
          <PdfText style={pdfStyles.name}>{data.fullName || "Your Name"}</PdfText>
          {data.jobTitle ? <PdfText style={pdfStyles.jobTitleText}>{data.jobTitle}</PdfText> : null}
          {experience.length > 0 ? (
            <View>
              <PdfText style={pdfStyles.sectionTitleRight}>Professional Experience</PdfText>
              {experience.map((e, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <PdfText style={pdfStyles.entryHeader}>{[e.title, e.company].filter(Boolean).join(" | ")}</PdfText>
                  <PdfText style={pdfStyles.entrySub}>{[e.duration, e.location].filter(Boolean).join(" | ")}</PdfText>
                  {(e.bullets || []).map((b) => b.trim()).filter(Boolean).map((b, j) => (
                    <View key={j} style={pdfStyles.bulletRow}>
                      <PdfText style={pdfStyles.bulletDot}>•</PdfText>
                      <PdfText style={pdfStyles.bulletText}>{b}</PdfText>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : null}
          {household.length > 0 ? (
            <View>
              <PdfText style={pdfStyles.sectionTitleRight}>Household &amp; Community Management</PdfText>
              {household.map((b, i) => (
                <View key={i} style={pdfStyles.bulletRow}>
                  <PdfText style={pdfStyles.bulletDot}>•</PdfText>
                  <PdfText style={pdfStyles.bulletText}>{b}</PdfText>
                </View>
              ))}
            </View>
          ) : null}
          {education.length > 0 ? (
            <View>
              <PdfText style={pdfStyles.sectionTitleRight}>Education</PdfText>
              {education.map((ed, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <PdfText style={pdfStyles.entryHeader}>{ed.degree}</PdfText>
                  <PdfText style={pdfStyles.entrySub}>{[ed.institution, ed.year, ed.location].filter(Boolean).join(" | ")}</PdfText>
                </View>
              ))}
            </View>
          ) : null}
          {certifications.length > 0 ? (
            <View>
              <PdfText style={pdfStyles.sectionTitleRight}>Certifications</PdfText>
              {certifications.map((c, i) => (
                <View key={i} style={pdfStyles.bulletRow}>
                  <PdfText style={pdfStyles.bulletDot}>•</PdfText>
                  <PdfText style={pdfStyles.bulletText}>{c}</PdfText>
                </View>
              ))}
            </View>
          ) : null}
          {volunteer.length > 0 ? (
            <View>
              <PdfText style={pdfStyles.sectionTitleRight}>Volunteer / Community Experience</PdfText>
              {volunteer.map((v, i) => (
                <View key={i} style={pdfStyles.bulletRow}>
                  <PdfText style={pdfStyles.bulletDot}>•</PdfText>
                  <PdfText style={pdfStyles.bulletText}>{v}</PdfText>
                </View>
              ))}
            </View>
          ) : null}
          {data.additionalInfo ? (
            <View>
              <PdfText style={pdfStyles.sectionTitleRight}>Additional Information</PdfText>
              <PdfText style={pdfStyles.bodyText}>{data.additionalInfo}</PdfText>
            </View>
          ) : null}
        </View>
      </Page>
    </Document>
  );
}

function LinesInput({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="text-sm font-medium text-stone-700">{label}</label>
      <textarea
        rows={rows}
        value={(value || []).join("\n")}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      <p className="text-xs text-stone-400 mt-1">One per line.</p>
    </div>
  );
}

function ExperienceEditor({ items, onChange }) {
  const update = (idx, patch) => onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const addEntry = () => onChange([...items, { title: "", company: "", duration: "", location: "", bullets: [""] }]);
  const removeEntry = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-stone-700">Professional experience</label>
        <button type="button" onClick={addEntry} className="text-xs flex items-center gap-1 text-red-800">
          <Plus size={14} /> Add role
        </button>
      </div>
      {items.map((it, idx) => (
        <div key={idx} className="border border-stone-200 rounded-xl p-3 space-y-2 relative">
          <button type="button" onClick={() => removeEntry(idx)} className="absolute top-2 right-2 text-stone-400 hover:text-red-700" aria-label="Remove role">
            <Trash2 size={14} />
          </button>
          <div className="grid grid-cols-2 gap-2 pr-6">
            <input placeholder="Job title" value={it.title} onChange={(e) => update(idx, { title: e.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            <input placeholder="Company" value={it.company} onChange={(e) => update(idx, { company: e.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            <input placeholder="Duration (e.g. 2018 – 2021)" value={it.duration} onChange={(e) => update(idx, { duration: e.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            <input placeholder="Location" value={it.location} onChange={(e) => update(idx, { location: e.target.value })}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          </div>
          <textarea rows={3} placeholder="One achievement per line" value={(it.bullets || []).join("\n")}
            onChange={(e) => update(idx, { bullets: e.target.value.split("\n") })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        </div>
      ))}
    </div>
  );
}

function EducationEditor({ items, onChange }) {
  const update = (idx, patch) => onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const addEntry = () => onChange([...items, { degree: "", institution: "", year: "", location: "" }]);
  const removeEntry = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-stone-700">Education</label>
        <button type="button" onClick={addEntry} className="text-xs flex items-center gap-1 text-red-800">
          <Plus size={14} /> Add
        </button>
      </div>
      {items.map((it, idx) => (
        <div key={idx} className="border border-stone-200 rounded-xl p-3 grid grid-cols-2 gap-2 relative">
          <button type="button" onClick={() => removeEntry(idx)} className="absolute top-2 right-2 text-stone-400 hover:text-red-700" aria-label="Remove education entry">
            <Trash2 size={14} />
          </button>
          <input placeholder="Degree / qualification" value={it.degree} onChange={(e) => update(idx, { degree: e.target.value })}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm col-span-2 pr-6" />
          <input placeholder="Institution" value={it.institution} onChange={(e) => update(idx, { institution: e.target.value })}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          <input placeholder="Year" value={it.year} onChange={(e) => update(idx, { year: e.target.value })}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          <input placeholder="Location" value={it.location} onChange={(e) => update(idx, { location: e.target.value })}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm col-span-2" />
        </div>
      ))}
    </div>
  );
}

function makeResumeFilename(fullName) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]}_${parts[parts.length - 1]}_Resume.pdf`;
  if (parts.length === 1) return `${parts[0]}_Resume.pdf`;
  return "AVAL_Resume.pdf";
}
function ResumePage({ t, lang, resume, onSave, user }) {
  const [form, setForm] = useState(
    resume && resume.experience
      ? resume
      : {
          fullName: user?.name || "",
          jobTitle: "",
          phone: "",
          email: user?.email || "",
          location: "",
          linkedin: "",
          photo: null,
          summary: "",
          experience: [{ title: "", company: "", duration: "", location: "", bullets: [""] }],
          education: [{ degree: "", institution: "", year: "", location: "" }],
          skills: [],
          languages: [],
          certifications: [],
          volunteer: [],
          household: [],
          additionalInfo: "",
        }
  );
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [downloading, setDownloading] = useState(false);
  

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("photo", reader.result);
    reader.readAsDataURL(file);
  };

  

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await pdf(<ResumePDFDocument data={form} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = makeResumeFilename(form.fullName);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-display text-3xl text-red-950 mb-2">{t("resume_title")}</h1>
      <p className="text-stone-500 text-sm mb-8">The preview on the right is the exact document you'll download — nothing changes between the two.</p>
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card className="p-6 space-y-5 max-h-[900px] overflow-auto">
          <div>
            <label className="text-sm font-medium text-stone-700">Professional photo (optional)</label>
            <input type="file" accept="image/*" onChange={handlePhoto} className="mt-1 block text-sm" />
            {form.photo && <img src={form.photo} alt="" className="w-16 h-16 rounded-full object-cover mt-2" />}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Full name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm" />
            <input placeholder="Target job title" value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm" />
            <input placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm" />
            <input placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm" />
            <input placeholder="Location" value={form.location} onChange={(e) => set("location", e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm" />
            <input placeholder="LinkedIn URL" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)}
              className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm" />
          </div>

                    <div>
            <label className="text-sm font-medium text-stone-700">Professional summary</label>
            <textarea rows={4} value={form.summary} onChange={(e) => set("summary", e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" />
          </div>

          <ExperienceEditor items={form.experience} onChange={(v) => set("experience", v)} />

          <LinesInput label="Household & community management (optional)" value={form.household} onChange={(v) => set("household", v)}
            placeholder={"Managed household budgeting and expenses\nCoordinated children's education schedules"} />

          <EducationEditor items={form.education} onChange={(v) => set("education", v)} />

          <LinesInput label="Skills" value={form.skills} onChange={(v) => set("skills", v)} placeholder={"Communication\nBudgeting"} />
          <LinesInput label="Languages (optional)" value={form.languages} onChange={(v) => set("languages", v)} placeholder={"English — Native\nTamil — Fluent"} rows={2} />
          <LinesInput label="Certifications (optional)" value={form.certifications} onChange={(v) => set("certifications", v)} rows={2} />
          <LinesInput label="Volunteer / community experience (optional)" value={form.volunteer} onChange={(v) => set("volunteer", v)} rows={2} />

          <div>
            <label className="text-sm font-medium text-stone-700">Additional information (optional)</label>
            <textarea rows={2} value={form.additionalInfo} onChange={(e) => set("additionalInfo", e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm" />
          </div>

          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
            <PrimaryButton onClick={() => onSave(form)} className="flex-1">
              <span style={{ color: "#333333" }}>{t("btn_generate_resume")}</span>
            </PrimaryButton>
            <PrimaryButton onClick={downloadPdf} disabled={downloading} className="flex-1">
              <span style={{ color: "#333333" }}>{downloading ? "Preparing…" : "Download PDF"}</span>
            </PrimaryButton>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <p className="text-xs uppercase tracking-wide text-stone-400 px-6 pt-4 pb-2">Live preview</p>
          <PDFViewer style={{ width: "100%", height: "860px", border: "none" }} showToolbar={false}>
            <ResumePDFDocument data={form} />
          </PDFViewer>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------- Mentors ---------------------------- */
function MentorsPage({ t, lang }) {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestedIds, setRequestedIds] = useState([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyForm, setApplyForm] = useState({ bio: "", profession: "", experience: "" });
  const [applyStatus, setApplyStatus] = useState("");

  const token = localStorage.getItem("aval_token");

  const loadMentors = () => {
    setLoading(true);
    fetch(`${BACKEND_URL}/api/mentors`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMentors(data.mentors);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMentors();
  }, []);

  const requestMentor = async (mentorProfileId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/mentor/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mentorProfileId }),
      });
      const data = await res.json();
      if (data.success) {
        setRequestedIds((prev) => [...prev, mentorProfileId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setApplyStatus("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/mentor/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: applyForm.bio,
          profession: applyForm.profession,
          experience: applyForm.experience ? parseInt(applyForm.experience) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApplyStatus("Application submitted! An admin will review it soon.");
        setApplyForm({ bio: "", profession: "", experience: "" });
      } else {
        setApplyStatus(data.message || "Something went wrong.");
      }
    } catch (err) {
      setApplyStatus("Could not reach the server.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-red-950">{t("mentors_title")}</h1>
        <GhostButton onClick={() => setShowApplyForm((v) => !v)} className="py-2 px-4 text-sm">
          {showApplyForm ? "Cancel" : "Become a mentor"}
        </GhostButton>
      </div>

      {showApplyForm && (
        <Card className="p-6 mb-8">
          <h3 className="font-display text-lg text-red-950 mb-4">Apply to become a mentor</h3>
          {applyStatus && (
            <p className="text-sm mb-4 text-red-800">{applyStatus}</p>
          )}
          <form onSubmit={submitApplication} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700">Profession</label>
              <input
                value={applyForm.profession}
                onChange={(e) => setApplyForm((f) => ({ ...f, profession: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Years of experience</label>
              <input
                type="number"
                value={applyForm.experience}
                onChange={(e) => setApplyForm((f) => ({ ...f, experience: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Short bio</label>
              <textarea
                value={applyForm.bio}
                onChange={(e) => setApplyForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-xl border border-stone-300 px-4 py-2.5"
                required
              />
            </div>
            <PrimaryButton type="submit">
  <span style={{ color: "#333333" }}>
    Submit application
  </span>
</PrimaryButton>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-stone-500">Loading mentors...</p>
      ) : mentors.length === 0 ? (
        <p className="text-stone-500">No approved mentors yet — check back soon.</p>
      ) : (
        <div className="grid sm:grid-cols-3 gap-5">
          {mentors.map((m) => (
            <Card key={m.id} className="p-6">
              <div className="w-14 h-14 rounded-full bg-red-800 text-amber-50 flex items-center justify-center font-display text-xl mb-4">
                {m.user?.name?.[0] || "?"}
              </div>
              <p className="font-medium text-stone-900">{m.user?.name}</p>
              <p className="text-sm text-red-800">{m.profession}</p>
              <p className="text-xs text-stone-500 mt-1">{m.experience} yrs experience</p>
              <p className="text-sm text-stone-600 mt-3">{m.bio}</p>
              <PrimaryButton 
  onClick={() => requestMentor(m.id)} 
  className="w-full mt-4 py-2 text-sm" 
  disabled={requestedIds.includes(m.id)} 
>
  <span style={{ color: "#333333" }}>
    {requestedIds.includes(m.id) ? t("btn_requested") : t("btn_request_mentorship")}
  </span>
</PrimaryButton>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


/* ---------------------------- Readiness ---------------------------- */

function ReadinessPage({ t, lang, steps, goTo }) {
  const firstIncompleteIdx = steps.findIndex((s) => !s.done);
  return (
    <div
  className="max-w-2xl mx-auto px-6 py-10"
  style={{ color: "#000000" }}
>
      <h1 className="font-display text-3xl text-red-950 mb-2">{t("readiness_title")}</h1>
      <p className="text-stone-600 mb-10">{t("readiness_sub")}</p>
      <div className="relative pl-8">
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-stone-200" />
        {steps.map((s, i) => {
          const status = s.done ? "completed" : i === firstIncompleteIdx ? "current" : "locked";
          return (
            <div key={s.id} className="relative mb-8 last:mb-0">
              <div className={`absolute -left-8 top-0.5 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-amber-50
                ${status === "completed" ? "border-red-700 bg-red-700 text-amber-50" : status === "current" ? "border-amber-500 text-amber-600" : "border-stone-300 text-stone-400"}`}>
                {status === "completed" ? <Check size={15} /> : status === "locked" ? <Lock size={13} /> : <Circle size={13} fill="currentColor" />}
              </div>
              <Card
  className={`p-5 ${
    status === "current"
      ? "ring-2 ring-amber-400"
      : status === "locked"
      ? "opacity-60"
      : ""
  }`}
  style={{ color: "#000000" }}
>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p
  className="font-bold"
  style={{ color: "#000000" }}
>
  {s.title[lang] || s.title.en}
</p>

<p
  className="text-xs mt-1 font-semibold"
  style={{ color: "#000000" }}
>
  {status === "completed"
    ? t("status_completed")
    : status === "current"
    ? t("status_current")
    : t("status_locked")}
</p>
                  </div>
                  {status !== "locked" && (
                    <GhostButton onClick={() => goTo(s.area === "skills" || s.area === "career" ? "jobs" : s.area)} className="py-1.5 px-3 text-xs shrink-0">
                      {t("btn_continue")}
                    </GhostButton>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
