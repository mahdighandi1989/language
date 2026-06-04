// Purpose: root React component for the Lebanese-dialect learning app. It owns
// the top-level UI (lessons, chat, live voice call, settings) and the client
// state, wiring Firebase auth/Firestore (with a localStorage fallback) to the
// AI features exposed by the backend.
//
// Upstream (what this file depends on): VITE_* env vars via
// src/firebaseConfig.js, mounted by src/main.jsx, and the backend REST/WebSocket
// API (/api/* and /ws/live, proxied by Vite in dev — see vite.config.js).
// Downstream (what depends on this file): src/main.jsx renders <App/>; this is
// the SPA entry component served from frontend/index.html.
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Plus, BookOpen, MessageSquare, BarChart2, Edit3, Download, Upload, Trash2, ChevronDown, ChevronUp, Sparkles, Volume2, Loader, ClipboardList, LifeBuoy, Users, GraduationCap, Clock, CheckCircle, Mic, MicOff, Settings, BrainCircuit, Brain, Search, X, Edit, FileText, Paperclip, Archive, Phone, PhoneOff, MessageCircle, Check, RotateCcw, Activity, Zap, Circle, ArrowRight, Database, Save, RefreshCw, AlertCircle, Square, Menu } from 'lucide-react';

// --- Firebase Imports ---
// Auth + Firestore primitives used directly by the root component. App/auth/db
// bootstrapping lives in ../hooks/useFirebase.
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { isAdminEmail, fullPermissions, emptyPermissions, normalizePermissions, canAccess, PERMISSION_SECTIONS } from '../auth/access';

// --- Extracted modules (contexts, hooks, command guard, utilities) ---
import { ExecutionFlowProvider, useExecutionFlow, FLOW_NODES } from '../contexts/ExecutionFlowContext';
import { LiveChatProvider, useLiveChat } from '../contexts/LiveChatContext';
import InspectorBridge, { handleCommand } from './InspectorBridge';
import { playBeepSound, getWavUrl } from '../utils/audio';
import { initFirebase } from '../hooks/useFirebase';
import { resolveLiveWsUrl } from '../utils/wsUrl';
import { nextReconnectDelay, shouldReconnect } from '../utils/wsReconnect';
import { installGlobalErrorTracking, reportError } from '../inspectorBridge.js';

// --- Analytics ---
// Client-side product analytics tracker. Records chat interactions and flushes
// session summaries to the backend so the product KPIs / outcome_rate can be
// measured (see src/analytics.js and backend/services/analyticsService.js).
import AnalyticsTracker from '../analytics.js';

// Module-level singleton: one tracker for the app's chat activity. Analytics is
// strictly best-effort and must never affect the chat UX.
const chatAnalytics = new AnalyticsTracker();

// NOTE: AI-command guards (handleCommand/isValidSelector/isValidUrl) now live
// in ./InspectorBridge; ExecutionFlow + LiveChat contexts live in ../contexts/.

// --- Google Fonts ---
// This component injects the Google Fonts stylesheet into the document head.
const Fonts = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;700&display=swap');
      body {
        font-family: 'Vazirmatn', sans-serif;
      }
    `}
  </style>
);


// --- Initial Data ---
// Defines the initial state structure for the application for a new user.
// Default prompts for AI system - can be customized via Settings
const defaultPrompts = {
  // Chat prompts
  chatBase: `You are "Jad", a friendly Lebanese Arabic tutor for a Persian beginner. Your entire response MUST be in simple Lebanese Arabic.`,
  chatFinglish: `Write your responses using Arabizi (Lebanese chat alphabet). For example: 'Mni7 ktir! Shu 3melt lyoum?'. Use numbers for specific letters: 7 for ح, 3 for ع, 2 for ء, 6 for ط, 9 for ص.`,
  chatTashkeel: `Write your responses in Arabic script with full Lebanese dialect vowel markings (Tashkeel) to aid pronunciation.`,
  chatLessonContext: `Your conversation MUST be based on the provided lesson notes (ONLY the correct content):`,
  chatFeedbackInstruction: `IMPORTANT: When the student responds in Arabic (not asking questions in Persian), evaluate their response and add ONE of these hidden markers at the VERY END of your message:
[FEEDBACK:correct] - if the student's Arabic usage was correct (grammar, vocabulary, meaning)
[FEEDBACK:incorrect] - if the student made significant errors
[FEEDBACK:partial] - if the student was partially correct with minor errors
Only add feedback for actual Arabic practice attempts, not for questions or Persian messages.`,
  chatScenario: `You are role-playing.`,
  chatTopicFocus: `Focus the conversation on these items:`,

  // Live voice prompts (Arabic)
  liveVoiceIntro: `انت جاد، شب لبناني من بيروت عمرك 28 سنة. انت معلم لهجة لبنانية لطالب أجنبي.`,
  liveVoiceRules: `مهم كتير كتير: لازم تحكي باللهجة اللبنانية البيروتية بس! ممنوع الفصحى نهائياً!`,
  liveVoiceSimplified: `حاول تحكي ببطء وبوضوح حتى الطالب يفهم.`,
  liveVoiceAuthentic: `احكي بطريقة طبيعية متل شب لبناني حقيقي.`,
  liveVoicePronunciation: `=== قواعد النطق اللبناني الأساسية ===

1. تحويل الحروف - مهم جداً للهجة:
   - القاف → همزة: قال=آل، قلب=ألب، قهوة=أهوة، قمر=أمر
   - الثاء → ت أو س: ثلاثة=تلاتة، ثاني=تاني، كثير=كتير
   - الذال → د أو ز: هذا=هيدا، ذهب=دهب، لذيذ=لزيز
   - الضاد أحياناً → ظ أو د: بيضة=بيظة

2. تقصير وإيقاع الكلام:
   - احذف الحركات القصيرة: كِتاب=كتاب (بسكون)
   - مدّ الألفات: آه، هلأ، شو، ليش
   - الكلام سريع وخفيف مش ثقيل`,
  liveVoiceVocabulary: `=== المفردات اللبنانية الأساسية - استخدمها دائماً ===

بدل "ماذا/ما": شو
بدل "كيف حالك": كيفك
بدل "الآن": هلأ، هلق
بدل "جيد/حسن": منيح، تمام
بدل "جداً/كثيراً": كتير
بدل "لماذا": ليش
بدل "أين": وين
بدل "أريد": بدّي
بدل "تريد": بدّك
بدل "هذا": هيدا
بدل "هذه": هيدي
بدل "هؤلاء": هودي، هول
بدل "أستطيع": فيّي
بدل "تستطيع": فيك
بدل "لا أستطيع": ما فيّي
بدل "لا أعرف": ما بعرف
بدل "نعم": إي، أي
بدل "لا": لأ`,
  liveVoiceVerbs: `=== الأفعال بالطريقة اللبنانية ===

المضارع المستمر = عم + فعل:
"شو عم تعمل؟" "عم بحكي" "عم ناكل"

المستقبل = رح + فعل:
"رح روح" "رح نحكي" "رح تتعلم"

النفي = ما + فعل:
"ما بعرف" "ما فهمت" "ما فيي"`,
  liveVoiceExpressions: `=== تعابير لبنانية شائعة - استخدمها بكثرة ===

يلا = هيا، تشجيع
خلص = انتهى، كفى
بس = فقط، لكن
كمان = أيضاً
شي = شيء
هيك = هكذا
طيب = حسناً
ماشي = موافق
عنجد = حقاً
أكيد = بالتأكيد
والله = للتأكيد
يعني = للتوضيح
متل = مثل
أحسن = أفضل`,
  liveVoiceExamples: `=== نماذج جمل لبنانية صحيحة ===

"أهلا فيك! كيفك اليوم؟"
"شو اسمك؟ من وين انت؟"
"كتير منيح! برافو عليك!"
"ما فهمت، فيك تعيد؟"
"يلا نكمل"
"شو بدك تتعلم؟"
"هيدي كلمة جديدة"
"طيب، رح نحكي شوي"
"عنجد كتير شاطر!"
"إي هيك، تمام!"`,
  liveVoiceStyle: `=== أسلوب المحادثة ===

- ردودك قصيرة وطبيعية (جملة أو جملتين)
- استخدم "يا" للنداء: "كيفك يا صديقي؟"
- كن ودود ومشجع
- اضحك وامزح أحياناً
- استخدم التعابير العامية كثيراً`,
  liveVoiceImportantRules: `=== قواعد مهمة جداً ===

- ممنوع تقول "خلصنا" أو "كفاية لليوم" أو "تعبت" - استمر بالمحادثة دائماً!
- ممنوع تنهي المحادثة من عندك - الطالب هو يلي بيقرر متى يخلص
- دائماً اسأل سؤال جديد أو كمّل الحديث
- لا تفترض إنو الطالب تعبان أو بدو يوقف`,
  liveVoiceClosing: `تذكر: انت شب لبناني حقيقي من بيروت. احكي متل ما بتحكي مع رفقاتك. خليك طبيعي ودافئ. كل كلمة لازم تكون لبنانية 100% - ممنوع الفصحى!`,

  // Analysis prompts (Persian)
  analysisLebaneseCorrection: `=== قواعد تصحیح عربی لبنانی ===
هنگام تحلیل محتوا، اشتباهات رایج را بر اساس این قواعد تصحیح کن:

1. تبدیل حروف لبنانی:
   - قاف → همزه: قال=آل، قلب=ألب، قهوة=أهوة
   - ثاء → ت یا س: ثلاثة=تلاتة، كثير=كتير
   - ذال → د یا ز: هذا=هيدا، لذيذ=لزيز

2. واژگان صحیح لبنانی:
   - "ماذا" → "شو"
   - "كيف حالك" → "كيفك"
   - "الآن" → "هلأ/هلق"
   - "جيد" → "منيح"
   - "كثيراً" → "كتير"
   - "لماذا" → "ليش"
   - "أين" → "وين"
   - "أريد" → "بدّي"
   - "هذا/هذه" → "هيدا/هيدي"

3. ساختار فعل لبنانی:
   - مضارع مستمر: عم + فعل (عم بحكي)
   - آینده: رح + فعل (رح روح)
   - نفی: ما + فعل (ما بعرف)`,
  analysisSystem: `تو یک تحلیلگر زبان‌شناسی متخصص برای دانش‌آموز فارسی‌زبانی هستی که عربی لبنانی یاد می‌گیرد.`,
  analysisOutputFormat: `=== فرمت خروجی ===
خروجی باید به فارسی و با ساختار زیر باشد. از فرمت markdown استفاده کن:

---

## 📚 لغات و واژگان

| کلمه لبنانی | تلفظ فینگلیش | معنی فارسی | مثال در جمله |
|------------|--------------|-----------|--------------|
| كيفك | kifak | چطوری؟ | كيفك اليوم؟ |

---

## 💬 عبارات و اصطلاحات کاربردی

### 🗣️ سلام و احوالپرسی
- **مرحبا** (marhaba) → سلام
  - 💡 استفاده: غیررسمی، روزمره

---

## 📝 نکات گرامری

### 🔹 ضمایر متصل
| ضمیر | مثال | معنی |
|------|------|------|
| ـي | كتابي | کتابم |

---

## ✏️ تصحیحات لهجه

| ✅ صحیح (لبنانی) | ❌ غلط (فصیح/اشتباه) | توضیح |
|-----------------|---------------------|-------|

---

## 📌 نکات فرهنگی و مهم

- 💡 [نکته مهم]
- ⚠️ [هشدار]`,
  analysisInstructions: `⚠️ نکات مهم:
- همه لغات و عبارات موجود در محتوا را استخراج کن
- تصحیحات را مشخص کن: اول صحیح، بعد غلط
- برای هر بخش که محتوایی ندارد، آن بخش را ننویس
- زبان خروجی: فارسی (با عبارات عربی در جدول‌ها)`,

  // Merge prompts
  mergeSystem: `تو یک ویراستار متخصص هستی که جزوات آموزشی عربی لبنانی را ادغام می‌کنی.

⚠️ قوانین حیاتی:
1. **هرگز محتوای قبلی را حذف نکن** - همه لغات، عبارات و نکات قبلی باید کامل حفظ شوند
2. فقط موارد **کاملاً یکسان** (کلمه به کلمه) را تکراری در نظر بگیر
3. موارد مشابه ولی متفاوت را نگه دار (مثلاً دو جمله مختلف با یک کلمه)
4. محتوای جدید را به **انتهای** هر بخش مربوطه اضافه کن
5. ساختار و فرمت markdown را حفظ کن

⚡ خروجی نهایی باید شامل 100% موارد قبلی + موارد جدید باشد.`,

  // Quiz prompts
  quizSystem: `تو یک سازنده آزمون عربی لبنانی هستی.`,
  quizQuestionTypes: `انواع سوالات:
- mcq: چهارگزینه‌ای
- fill_in_blank: جای خالی
- translate_to_persian: ترجمه به فارسی
- translate_to_arabic: ترجمه به عربی
- word_order: مرتب کردن کلمات
- matching: تطابق`,
  quizInstructions: `سوالات را بر اساس محتوای درس و سطح دشواری انتخاب‌شده بساز.
از تنوع در انواع سوالات استفاده کن.
پاسخ‌های صحیح باید دقیق و مطابق با محتوای درس باشند.`,

  // Study plan prompts
  studyPlanSystem: `تو یک مربی زبان عربی لبنانی برای فارسی‌زبانان هستی.
بر اساس دروس و آمار کاربر، یک برنامه مطالعه هفتگی شخصی‌سازی شده بساز.`,
  studyPlanFormat: `فرمت خروجی:
- برنامه روزانه با زمان‌بندی پیشنهادی
- اولویت‌بندی دروس بر اساس پیشرفت
- تمرینات پیشنهادی
- اهداف هفتگی`,

  // General assistant prompt
  generalAssistant: `You are a helpful AI assistant for a student learning Lebanese Arabic. You can answer questions, analyze text for learning points, or provide general help.`,

  // TTS prompt template
  ttsPromptTemplate: `Say in a clear, {accentMode} Lebanese accent:`,
};

// Helper function to get a prompt (checks customPrompts first, falls back to defaultPrompts)
export function getPrompt(customPrompts, key) {
  return customPrompts?.[key] || defaultPrompts[key] || '';
}

// Prompt categories for UI organization
const promptCategories = {
  chat: {
    title: '💬 چت متنی با استاد',
    description: 'پرامپت‌های مربوط به چت متنی با استاد جاد',
    prompts: ['chatBase', 'chatFinglish', 'chatTashkeel', 'chatLessonContext', 'chatScenario', 'chatTopicFocus']
  },
  liveVoice: {
    title: '🎤 مکالمه صوتی زنده',
    description: 'پرامپت‌های مربوط به مکالمه صوتی Real-time با استاد',
    prompts: ['liveVoiceIntro', 'liveVoiceRules', 'liveVoiceSimplified', 'liveVoiceAuthentic',
              'liveVoicePronunciation', 'liveVoiceVocabulary', 'liveVoiceVerbs',
              'liveVoiceExpressions', 'liveVoiceExamples', 'liveVoiceStyle',
              'liveVoiceImportantRules', 'liveVoiceClosing']
  },
  analysis: {
    title: '📊 تحلیل محتوا',
    description: 'پرامپت‌های مربوط به تحلیل فایل‌ها و استخراج محتوای آموزشی',
    prompts: ['analysisSystem', 'analysisLebaneseCorrection', 'analysisOutputFormat', 'analysisInstructions']
  },
  merge: {
    title: '🔀 ادغام جزوات',
    description: 'پرامپت مربوط به ادغام محتوای جدید با محتوای قبلی',
    prompts: ['mergeSystem']
  },
  quiz: {
    title: '📝 ساخت آزمون',
    description: 'پرامپت‌های مربوط به تولید سوالات آزمون',
    prompts: ['quizSystem', 'quizQuestionTypes', 'quizInstructions']
  },
  studyPlan: {
    title: '📅 برنامه‌ریزی',
    description: 'پرامپت‌های مربوط به ساخت برنامه مطالعه',
    prompts: ['studyPlanSystem', 'studyPlanFormat']
  },
  other: {
    title: '⚙️ سایر',
    description: 'سایر پرامپت‌ها',
    prompts: ['generalAssistant', 'ttsPromptTemplate']
  }
};

// Prompt labels for display (Persian names)
const promptLabels = {
  chatBase: 'پرامپت پایه چت',
  chatFinglish: 'دستور نوشتن فینگلیش',
  chatTashkeel: 'دستور نوشتن با اعراب',
  chatLessonContext: 'معرفی محتوای درس',
  chatScenario: 'معرفی سناریو نقش‌آفرینی',
  chatTopicFocus: 'تمرکز روی موضوع',
  liveVoiceIntro: 'معرفی شخصیت جاد',
  liveVoiceRules: 'قوانین اصلی لهجه',
  liveVoiceSimplified: 'حالت ساده‌شده',
  liveVoiceAuthentic: 'حالت اصیل',
  liveVoicePronunciation: 'قواعد تلفظ',
  liveVoiceVocabulary: 'لغات لبنانی',
  liveVoiceVerbs: 'ساختار افعال',
  liveVoiceExpressions: 'عبارات رایج',
  liveVoiceExamples: 'نمونه جملات',
  liveVoiceStyle: 'سبک مکالمه',
  liveVoiceImportantRules: 'قوانین مهم',
  liveVoiceClosing: 'پیام پایانی',
  analysisSystem: 'پرامپت سیستم تحلیل',
  analysisLebaneseCorrection: 'قواعد تصحیح لبنانی',
  analysisOutputFormat: 'فرمت خروجی',
  analysisInstructions: 'دستورات نهایی',
  mergeSystem: 'پرامپت ادغام',
  quizSystem: 'پرامپت سیستم آزمون',
  quizQuestionTypes: 'انواع سوالات',
  quizInstructions: 'دستورات آزمون',
  studyPlanSystem: 'پرامپت برنامه‌ریزی',
  studyPlanFormat: 'فرمت برنامه',
  generalAssistant: 'دستیار عمومی',
  ttsPromptTemplate: 'قالب TTS'
};

const initialData = {
  lessons: [],
  knowledgeBase: {
    vocabulary: [],
    grammar: [],
    phrases: [],
    verbs: [],
    pronouns: [],
    adjectives: []
  },
  pronunciationCorrections: [], // Store pronunciation mistakes and corrections
  journal: [
    { id: Date.now(), date: new Date().toISOString(), entry: "برنامه برای اولین بار راه اندازی شد." }
  ],
  stats: {
    lessonsCompleted: 0,
    wordsLearned: 0,
    quizzesTaken: 0,
    averageScore: 0,
    studyTime: 0
  },
  chatHistories: {
    global: []
  },
  customVoices: [],
  // Added default settings for the chat interface
  defaultChatSettings: {
    aiVoice: 'Charon',
    accentMode: 'standard',
    writingStyle: 'simple_arabic',
    translationLanguage: 'none',
    aiResponseType: 'audio',
    sendVoiceAs: 'audio',
    // Voice conversation mode settings
    voiceConversationBeepDelay: 500, // ms - delay before beep after AI response
    voiceConversationSilenceThreshold: 2000, // ms - silence duration to auto-send
  },
  archivedConversations: [],
  // Custom prompts (overrides defaultPrompts when set)
  customPrompts: {},
};

// --- Gemini API Helpers ---
// Calls backend API for Gemini chat (API key is secure on server)
async function callGeminiAPI(payload, retries = 3, delay = 1000, signal = null) {
  // Best-effort analytics: count this as a user turn and start the response
  // timer. Only on the first attempt so retries don't inflate the counts.
  if (retries === 3) {
    try { chatAnalytics.trackUserMessage(); } catch { /* analytics must never break chat */ }
  }

  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal
  });

  if (!response.ok) {
    if (response.status === 429 && retries > 0) {
      await new Promise(res => setTimeout(res, delay));
      return callGeminiAPI(payload, retries - 1, delay * 2, signal);
    }
    const error = new Error(`HTTP error! status: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const result = await response.json();

  // Record the assistant reply + response time, then flush the session summary
  // to the backend. Fire-and-forget so it never delays the chat response.
  try {
    chatAnalytics.trackAssistantMessage();
    chatAnalytics.flush();
  } catch { /* analytics must never break chat */ }

  return result.text;
}

// Calls backend API for Gemini TTS
async function callGeminiTTS(fullPrompt, voiceName = "Kore", signal = null) {
  try {
    const response = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: fullPrompt, voice: voiceName }),
      signal
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    if (result.audioData && result.mimeType) {
      return { audioData: result.audioData, mimeType: result.mimeType };
    }
    throw new Error("Invalid audio data received.");
  } catch (error) {
    // Don't log abort errors as they are intentional
    if (error.name !== 'AbortError') {
      console.error("Error with TTS API:", error);
    }
    return null;
  }
}

// --- Main App Component ---
export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [data, setData] = useState(initialData);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [globalSelectionPopup, setGlobalSelectionPopup] = useState(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [itemToSave, setItemToSave] = useState(null);

  // --- Firebase State ---
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [firebaseServices, setFirebaseServices] = useState({ auth: null, db: null });
  const dataRef = useRef(data);

  // --- Auth / access-control state ---
  // authUser: the signed-in Google user (or null). accessRecord: that user's
  // accessControl document ({ status, role, permissions, ... }). accessStatus is
  // the gate the UI renders against: 'loading' until known, then one of
  // 'nofirebase' (local dev), 'signedOut', 'pending', 'rejected', 'approved'.
  const [authUser, setAuthUser] = useState(null);
  const [accessRecord, setAccessRecord] = useState(null);
  const [accessStatus, setAccessStatus] = useState('loading');

  // localStorage helper functions
  const STORAGE_KEY = 'lebanese_dialect_app_data';
  const BACKUP_KEY = 'lebanese_dialect_app_backup';
  const BACKUP_TIMESTAMP_KEY = 'lebanese_dialect_app_backup_timestamp';

  const saveToLocalStorage = (newData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...initialData, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
    return initialData;
  };

  // Backup system - saves a copy of data to localStorage even when using Firebase
  const saveBackup = (dataToBackup) => {
    try {
      // Only backup if there's meaningful data (at least one lesson or knowledge item)
      const hasContent = dataToBackup.lessons?.length > 0 ||
        Object.values(dataToBackup.knowledgeBase || {}).some(arr => arr?.length > 0);

      if (hasContent) {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(dataToBackup));
        localStorage.setItem(BACKUP_TIMESTAMP_KEY, new Date().toISOString());
        console.log("Backup saved to localStorage");
      }
    } catch (error) {
      console.error("Error saving backup:", error);
    }
  };

  const loadBackup = () => {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      const timestamp = localStorage.getItem(BACKUP_TIMESTAMP_KEY);
      if (backup) {
        return {
          data: { ...initialData, ...JSON.parse(backup) },
          timestamp: timestamp ? new Date(timestamp).toLocaleString('fa-IR') : 'نامشخص'
        };
      }
    } catch (error) {
      console.error("Error loading backup:", error);
    }
    return null;
  };

  const clearBackup = () => {
    try {
      localStorage.removeItem(BACKUP_KEY);
      localStorage.removeItem(BACKUP_TIMESTAMP_KEY);
    } catch (error) {
      console.error("Error clearing backup:", error);
    }
  };

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Install Inspector Bridge global error tracking once on mount: uncaught
  // runtime errors and unhandled promise rejections are captured and reported
  // to the structured logger as error_rate/outcome_rate metrics (see
  // ../inspectorBridge.js). Returns an uninstall fn for clean teardown.
  useEffect(() => installGlobalErrorTracking(), []);

  useEffect(() => {
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    // No Firebase configured (local dev): single-user localStorage mode with no
    // sign-in gate, so the app remains usable offline / in development.
    if (!firebaseConfig) {
      console.log('Firebase not configured - using localStorage (no sign-in gate)');
      setData(loadFromLocalStorage());
      setUserId('local-user');
      setAccessRecord({ status: 'approved', role: 'admin', permissions: fullPermissions(), email: 'local' });
      setAccessStatus('nofirebase');
      setIsAuthReady(true);
      return;
    }

    const { auth, db } = initFirebase(firebaseConfig, { debug: true });
    setFirebaseServices({ auth, db });

    let unsubData = null;     // listener on the user's own data document
    let unsubAccess = null;   // listener on the user's accessControl record

    const stopData = () => { if (unsubData) { unsubData(); unsubData = null; } };
    const stopAccess = () => { if (unsubAccess) { unsubAccess(); unsubAccess = null; } };

    // Stream the approved user's own data document (load or initialize).
    const startDataSync = (uid) => {
      if (unsubData) return;
      setUserId(uid);
      const userDocRef = doc(db, `/artifacts/${appId}/users/${uid}/data/main`);
      unsubData = onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
          const merged = { ...initialData, ...snap.data() };
          setData(merged);
          saveBackup(merged);
        } else {
          setDoc(userDocRef, initialData).catch((e) => console.error('init data doc:', e));
          setData(initialData);
        }
        setIsAuthReady(true);
      }, (error) => {
        console.error('Data listener error:', error);
        reportError(error, { source: 'firebase' });
        setIsAuthReady(true);
      });
    };

    // One-time migration: copy the legacy shared document into the owner's own
    // data doc on first admin login so existing lessons are not lost.
    const migrateSharedDataForAdmin = async (uid) => {
      try {
        const adminRef = doc(db, `/artifacts/${appId}/users/${uid}/data/main`);
        const adminSnap = await getDoc(adminRef);
        if (adminSnap.exists() && (adminSnap.data()?.lessons?.length > 0)) return;
        const sharedSnap = await getDoc(doc(db, `/artifacts/${appId}/users/shared-user-mahdi/data/main`));
        if (sharedSnap.exists()) {
          await setDoc(adminRef, sharedSnap.data(), { merge: true });
          console.log('Migrated legacy shared data to the owner account.');
        }
      } catch (e) {
        console.warn('Shared-data migration skipped:', e?.message || e);
      }
    };

    const handleSignedIn = async (user) => {
      setAuthUser(user);
      const email = user.email || '';
      const accessRef = doc(db, `/artifacts/${appId}/accessControl/${user.uid}`);

      // Ensure an accessControl record exists / is correct for this user.
      try {
        const snap = await getDoc(accessRef);
        if (isAdminEmail(email)) {
          // Bootstrap / maintain the owner as an approved admin.
          await setDoc(accessRef, {
            email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: 'admin',
            status: 'approved',
            permissions: fullPermissions(),
            updatedAt: serverTimestamp(),
            ...(snap.exists() ? {} : { requestedAt: serverTimestamp() }),
          }, { merge: true });
        } else if (!snap.exists()) {
          // First sign-in for a normal user: create a PENDING request.
          await setDoc(accessRef, {
            email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: 'user',
            status: 'pending',
            permissions: emptyPermissions(),
            requestedAt: serverTimestamp(),
          });
        }
      } catch (e) {
        console.error('accessControl bootstrap error:', e);
      }

      // Live-subscribe so approvals / permission changes apply without reload.
      unsubAccess = onSnapshot(accessRef, async (snap) => {
        const rec = snap.exists()
          ? snap.data()
          : { status: 'pending', role: 'user', permissions: emptyPermissions(), email };
        setAccessRecord(rec);
        const approved = rec.role === 'admin' || rec.status === 'approved';
        setAccessStatus(approved ? 'approved' : (rec.status === 'rejected' ? 'rejected' : 'pending'));
        if (approved) {
          if (rec.role === 'admin') await migrateSharedDataForAdmin(user.uid);
          startDataSync(user.uid);
        } else {
          stopData();
          setUserId(null);
          setIsAuthReady(true);
        }
      }, (error) => {
        console.error('Access listener error:', error);
        setAccessStatus('pending');
        setIsAuthReady(true);
      });
    };

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      stopData();
      stopAccess();
      if (!user) {
        setAuthUser(null);
        setAccessRecord(null);
        setUserId(null);
        setData(initialData);
        setAccessStatus('signedOut');
        setIsAuthReady(true);
        return;
      }
      setAccessStatus('loading');
      handleSignedIn(user);
    });

    return () => {
      stopData();
      stopAccess();
      if (unsubAuth) unsubAuth();
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady || !userId) return;

    // Save to localStorage if using local storage mode
    if (userId === 'local-user') {
      const handler = setTimeout(() => {
        saveToLocalStorage(dataRef.current);
        saveBackup(dataRef.current); // Also save backup
        console.log("Data saved to localStorage");
      }, 1000);
      return () => clearTimeout(handler);
    }

    // Save to Firebase if available
    const { db } = firebaseServices;
    if (!db) return;

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const userDocRef = doc(db, `/artifacts/${appId}/users/${userId}/data/main`);

    const handler = setTimeout(() => {
        setDoc(userDocRef, dataRef.current, { merge: true })
            .then(() => {
              // Save backup to localStorage after successful Firestore save
              saveBackup(dataRef.current);
            })
            .catch(err => console.error("Error saving data to Firestore:", err));
    }, 1000);

    return () => clearTimeout(handler);
  }, [data, userId, isAuthReady, firebaseServices]);
  
  const selectedLesson = useMemo(() => {
      if (!selectedLessonId) return null;
      return data.lessons.find(l => l.id === selectedLessonId);
  }, [selectedLessonId, data.lessons]);

  const addLesson = (title) => {
    const newLesson = {
      id: Date.now(),
      title,
      summary: "خلاصه‌ای ایجاد نشده.",
      files: [],
      archivedNotes: "",
      progress: {
        totalItems: 0,       // Total items to learn in this lesson
        learnedItems: 0,     // Items marked as learned
        quizzesTaken: 0,     // Number of quizzes completed
        correctAnswers: 0,   // Total correct answers in quizzes
        chatPracticeCount: 0 // Number of chat practice sessions
      }
    };
    setData(prev => ({ ...prev, lessons: [...prev.lessons, newLesson] }));
    navigateTo('lesson', newLesson);
    addJournalEntry(`درس جدیدی با عنوان "${title}" ایجاد شد.`);
  };

  const confirmDeleteLesson = (lessonId) => {
    const lesson = data.lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    setModalConfig({
        title: "تایید حذف درس",
        message: `آیا از حذف درس "${lesson.title}" مطمئن هستید؟ این عمل غیرقابل بازگشت است.`,
        buttons: [
            { label: "انصراف", onClick: () => setModalConfig(null), className: "bg-slate-200 hover:bg-slate-300" },
            { label: "حذف کن", onClick: () => deleteLesson(lessonId), className: "bg-red-600 text-white hover:bg-red-700" }
        ]
    });
  };

  const deleteLesson = (lessonId) => {
    setData(prev => ({ ...prev, lessons: prev.lessons.filter(l => l.id !== lessonId) }));
    addJournalEntry(`درس با شناسه ${lessonId} حذف شد.`);
    if (selectedLesson && selectedLesson.id === lessonId) navigateTo('lessons');
    setModalConfig(null);
  };

  const editLesson = (lessonId, newTitle, newSummary) => {
    setData(prev => ({ ...prev, lessons: prev.lessons.map(l => l.id === lessonId ? { ...l, title: newTitle, summary: newSummary } : l) }));
    addJournalEntry(`درس "${newTitle}" ویرایش شد.`);
  };

  const updateLesson = (lessonId, updatedLessonData) => {
    setData(prev => ({ ...prev, lessons: prev.lessons.map(l => l.id === lessonId ? { ...l, ...updatedLessonData } : l) }));
  };

  const updateKnowledgeBase = (category, item) => {
    setData(prev => {
      const newKnowledgeBase = { ...prev.knowledgeBase };
      if (!newKnowledgeBase[category]) newKnowledgeBase[category] = [];
      const exists = newKnowledgeBase[category].some(i => i.term.trim().toLowerCase() === item.term.trim().toLowerCase());
      if (!exists) newKnowledgeBase[category].push({ ...item, id: Date.now() + Math.random() });
      return { ...prev, knowledgeBase: newKnowledgeBase };
    });
  };

  const saveChatHistory = useCallback((context, history) => {
    setData(prev => ({ ...prev, chatHistories: { ...prev.chatHistories, [context]: history } }));
  }, []);

  const addJournalEntry = (entry) => {
    const newEntry = { id: Date.now(), date: new Date().toISOString(), entry };
    setData(prev => ({ ...prev, journal: [newEntry, ...prev.journal] }));
  };

  const addPronunciationCorrection = (wrong, correct) => {
    const newCorrection = { id: Date.now(), wrong, correct, date: new Date().toISOString() };
    setData(prev => ({
      ...prev,
      pronunciationCorrections: [...(prev.pronunciationCorrections || []), newCorrection]
    }));
  };

  const removePronunciationCorrection = (id) => {
    setData(prev => ({
      ...prev,
      pronunciationCorrections: (prev.pronunciationCorrections || []).filter(c => c.id !== id)
    }));
  };

  const exportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "lebanese_learning_data.json";
    link.click();
    addJournalEntry("داده‌ها به صورت فایل JSON خروجی گرفته شد.");
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = e => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.lessons && importedData.knowledgeBase && importedData.journal) {
            setData(importedData);
            setModalConfig({ title: "موفقیت", message: "داده‌ها با موفقیت بارگذاری شد!" });
            addJournalEntry("داده‌های جدید از فایل JSON بارگذاری شد.");
        } else {
            throw new Error("Invalid data structure.");
        }
      } catch (error) {
        setModalConfig({ title: "خطا", message: "خطا در بارگذاری فایل. فایل معتبر نیست." });
      }
    };
    event.target.value = null;
  };

  const navigateTo = (view, lesson = null) => {
    setActiveView(view);
    setSelectedLessonId(lesson ? lesson.id : null);
    setIsSearchOpen(false);
  };
  
  const openSaveModal = (text) => {
    setItemToSave(text);
    setIsSaveModalOpen(true);
  };

  const handleGlobalMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText && !isSaveModalOpen && !modalConfig) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setGlobalSelectionPopup({
            text: selectedText,
            top: rect.top + window.scrollY - 45,
            left: rect.left + window.scrollX + (rect.width / 2),
        });
    } else if (!selectedText) {
        setGlobalSelectionPopup(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setGlobalSelectionPopup(null);
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderContent = () => {
    if (!isAuthReady) {
        return <div className="w-full h-full flex items-center justify-center"><Loader size={48} className="animate-spin text-teal-500" /></div>;
    }
    const commonProps = { navigateTo, addJournalEntry, setModalConfig, data, setData, removePronunciationCorrection, addPronunciationCorrection };
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    // Admin-only management panel.
    if (activeView === 'admin') {
      return accessRecord?.role === 'admin'
        ? <AdminPanel db={firebaseServices.db} appId={appId} currentUid={authUser?.uid} />
        : <AccessNotice title="دسترسی محدود" message="این بخش فقط برای مدیر است." />;
    }
    // Per-section access gate (admins bypass via canAccess). Applies only when a
    // real access record exists (Firebase mode); local dev mode is full access.
    if (accessRecord && !canAccess(accessRecord, activeView)) {
      return <AccessNotice title="دسترسی ندارید" message="هنوز به این بخش دسترسی داده نشده است. لطفاً با مدیر تماس بگیرید." />;
    }
    switch (activeView) {
      case 'dashboard': return <Dashboard {...commonProps} stats={data.stats} lessons={data.lessons} addLesson={addLesson} knowledgeBase={data.knowledgeBase} updateKnowledgeBase={updateKnowledgeBase} saveChatHistory={saveChatHistory} chatHistories={data.chatHistories} />;
      case 'lessons': return <LessonList {...commonProps} lessons={data.lessons} deleteLesson={confirmDeleteLesson} editLesson={editLesson} addLesson={addLesson} />;
      case 'lesson': return selectedLesson ? <LessonDetail {...commonProps} key={selectedLesson.id} lesson={selectedLesson} updateLesson={updateLesson} updateKnowledgeBase={updateKnowledgeBase} saveChatHistory={saveChatHistory} chatHistories={data.chatHistories} knowledgeBase={data.knowledgeBase} /> : <div>درسی انتخاب نشده است.</div>;
      case 'quiz': return <QuizCenter {...commonProps} lessons={data.lessons} />;
      case 'planner': return <ProgressCenter {...commonProps} lessons={data.lessons} journal={data.journal} knowledgeBase={data.knowledgeBase} />;
      case 'cultural': return <CulturalInsights {...commonProps} knowledgeBase={data.knowledgeBase} updateKnowledgeBase={updateKnowledgeBase} />;
      case 'stats': return <ProgressCenter {...commonProps} lessons={data.lessons} journal={data.journal} knowledgeBase={data.knowledgeBase} />;
      case 'journal': return <Journal {...commonProps} entries={data.journal} />;
      case 'settings': return <SettingsPage {...commonProps} firebaseServices={firebaseServices} userId={userId} />;
      case 'archivedConversations': return <ArchivedConversations {...commonProps} conversations={data.archivedConversations || []} />;
      default: return <Dashboard {...commonProps} stats={data.stats} lessons={data.lessons} addLesson={addLesson} knowledgeBase={data.knowledgeBase} updateKnowledgeBase={updateKnowledgeBase} saveChatHistory={saveChatHistory} chatHistories={data.chatHistories} />;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { auth } = firebaseServices;
      if (!auth) return;
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      console.error('Google sign-in failed:', e);
      setModalConfig({ title: 'خطای ورود', message: 'ورود با گوگل ناموفق بود. دوباره تلاش کنید.' });
    }
  };

  const handleSignOut = async () => {
    try {
      const { auth } = firebaseServices;
      if (auth) await signOut(auth);
    } catch (e) { console.error('sign-out failed:', e); }
  };

  // --- Auth gate: render the access screen until the user is approved ---
  if (accessStatus === 'loading') {
    return <AuthGateScreen variant="loading" />;
  }
  if (accessStatus === 'signedOut') {
    return <AuthGateScreen variant="login" onSignIn={handleGoogleSignIn} />;
  }
  if (accessStatus === 'pending' || accessStatus === 'rejected') {
    return <AuthGateScreen variant={accessStatus} user={authUser} onSignOut={handleSignOut} />;
  }

  return (
    <ExecutionFlowProvider firebaseServices={firebaseServices} userId={userId}>
      <LiveChatProvider
        data={data}
        setData={setData}
        addJournalEntry={addJournalEntry}
        addPronunciationCorrection={addPronunciationCorrection}
        saveChatHistory={saveChatHistory}
        navigateTo={navigateTo}
      >
        <Fonts />
        <InspectorBridge />
        <div data-testid="app-root" className="bg-slate-50 text-slate-800" dir="rtl" onMouseUp={handleGlobalMouseUp}>
          <div className="flex flex-col md:flex-row min-h-screen">
            <Sidebar navigateTo={navigateTo} activeView={activeView} exportData={exportData} importData={importData} onSearchClick={() => setIsSearchOpen(true)} accessRecord={accessRecord} onSignOut={handleSignOut} userEmail={authUser?.email} />
            <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 bg-slate-100">{renderContent()}</main>
            <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} data={data} navigateTo={navigateTo} />
            {modalConfig && <Modal config={modalConfig} onClose={() => setModalConfig(null)} />}
            {canAccess(accessRecord, 'assistant') && (
              <button onClick={() => setIsAssistantOpen(true)} className="fixed bottom-6 right-6 bg-teal-500 text-white rounded-full p-4 shadow-lg hover:bg-teal-600 transition-transform hover:scale-110 z-40">
                <Sparkles size={28} />
              </button>
            )}
            {isAssistantOpen && canAccess(accessRecord, 'assistant') && <GlobalAssistant onClose={() => setIsAssistantOpen(false)} updateKnowledgeBase={updateKnowledgeBase} setModalConfig={setModalConfig} addJournalEntry={addJournalEntry} />}
            {globalSelectionPopup && (
                <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => {
                        openSaveModal(globalSelectionPopup.text);
                        setGlobalSelectionPopup(null);
                    }}
                    className="fixed bg-teal-500 text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg flex items-center gap-2"
                    style={{ top: `${globalSelectionPopup.top}px`, left: `${globalSelectionPopup.left}px`, transform: 'translateX(-50%)' }}
                >
                    <Plus size={16}/> افزودن به مرکز دانش
                </button>
            )}
            <SaveToKnowledgeBaseModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                item={itemToSave}
                updateKnowledgeBase={updateKnowledgeBase}
                addJournalEntry={addJournalEntry}
            />
          </div>
        </div>
        {/* Global floating voice chats - persist across page navigation */}
        <GlobalLiveVoiceChat />
        <FloatingLiveChatWidget />
        <FloatingVoiceConvWidget />
      </LiveChatProvider>
    </ExecutionFlowProvider>
  );
}

// --- Components ---

function Sidebar({ navigateTo, activeView, exportData, importData, onSearchClick, accessRecord, onSignOut, userEmail }) {
    const fileInputRef = useRef(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleImportClick = () => fileInputRef.current.click();
    const isAdmin = accessRecord?.role === 'admin';
    // Only render a nav entry the user is actually allowed to open.
    const NavLink = ({ view, icon: Icon, label }) => {
        if (!canAccess(accessRecord, view)) return null;
        return (
            <li>
                <button onClick={() => { navigateTo(view); setMobileOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg text-right transition-colors duration-200 text-slate-300 hover:bg-slate-700 hover:text-white ${activeView === view ? 'bg-slate-900 text-white font-bold' : ''}`}>
                    <Icon size={22} /><span>{label}</span>
                </button>
            </li>
        );
    };
    return (
        <nav className="w-full md:w-72 bg-slate-800 text-white md:p-6 flex flex-col shadow-2xl md:sticky md:top-0 md:h-screen">
            <div className="flex items-center justify-between gap-3 p-4 md:p-0 md:mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-teal-500 p-2 rounded-lg"><GraduationCap size={28} /></div>
                    <h1 className="text-2xl font-bold">لهجه لبنانی</h1>
                </div>
                <button onClick={() => setMobileOpen(o => !o)} className="md:hidden p-2 rounded-lg hover:bg-slate-700" aria-label="منو" aria-expanded={mobileOpen}>
                    {mobileOpen ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>
            <div className={`${mobileOpen ? 'flex' : 'hidden'} md:flex flex-col flex-1 px-4 pb-4 md:p-0 md:overflow-y-auto`}>
             <div className="mb-8">
                <button onClick={() => { onSearchClick(); setMobileOpen(false); }} className="w-full flex items-center gap-3 py-3 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                    <Search size={20} /><span>جستجوی کلی...</span>
                </button>
            </div>
            <ul className="space-y-3 flex-1">
                <NavLink view="dashboard" icon={BarChart2} label="داشبورد" />
                <NavLink view="lessons" icon={BookOpen} label="لیست دروس" />
                <NavLink view="quiz" icon={Edit3} label="مرکز آزمون" />
                <NavLink view="planner" icon={ClipboardList} label="مرکز پیشرفت" />
                <NavLink view="cultural" icon={LifeBuoy} label="فرهنگ لبنان" />
                <NavLink view="journal" icon={Edit3} label="ژورنال فعالیت‌ها" />
                <NavLink view="archivedConversations" icon={Archive} label="مکالمات بایگانی شده" />
                {isAdmin && (
                    <li>
                        <button onClick={() => { navigateTo('admin'); setMobileOpen(false); }} className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg text-right transition-colors duration-200 text-amber-300 hover:bg-slate-700 hover:text-white ${activeView === 'admin' ? 'bg-slate-900 text-white font-bold' : ''}`}>
                            <Users size={22} /><span>مدیریت کاربران</span>
                        </button>
                    </li>
                )}
            </ul>
            <div className="space-y-2 pt-4 border-t border-slate-700">
                {canAccess(accessRecord, 'settings') && (
                    <button onClick={() => { navigateTo('settings'); setMobileOpen(false); }} className="w-full flex items-center gap-3 py-2 px-4 rounded-lg text-right transition-colors text-slate-400 hover:bg-slate-700 hover:text-white"><Settings size={20} /><span>تنظیمات و شخصی‌سازی</span></button>
                )}
                <button onClick={exportData} className="w-full flex items-center gap-3 py-2 px-4 rounded-lg text-right transition-colors text-slate-400 hover:bg-slate-700 hover:text-white"><Download size={20} /><span>خروجی (JSON)</span></button>
                <button onClick={handleImportClick} className="w-full flex items-center gap-3 py-2 px-4 rounded-lg text-right transition-colors text-slate-400 hover:bg-slate-700 hover:text-white"><Upload size={20} /><span>بارگذاری (JSON)</span></button>
                <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
                {userEmail && (
                    <div className="pt-3 mt-2 border-t border-slate-700">
                        <p className="text-xs text-slate-400 px-4 mb-1 truncate" title={userEmail}>{userEmail}</p>
                        <button onClick={onSignOut} className="w-full flex items-center gap-3 py-2 px-4 rounded-lg text-right transition-colors text-red-300 hover:bg-red-900/40 hover:text-white"><X size={20} /><span>خروج از حساب</span></button>
                    </div>
                )}
            </div>
            </div>
        </nav>
    );
}

// Full-screen auth gate: login, pending-approval, rejected, and loading states.
function AuthGateScreen({ variant, user, onSignIn, onSignOut }) {
    const Wrapper = ({ children }) => (
        <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-teal-900 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
                <div className="bg-teal-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white"><GraduationCap size={36} /></div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">لهجه لبنانی</h1>
                {children}
            </div>
        </div>
    );
    if (variant === 'loading') {
        return <Wrapper><div className="flex justify-center py-6"><Loader size={40} className="animate-spin text-teal-500" /></div></Wrapper>;
    }
    if (variant === 'login') {
        return (
            <Wrapper>
                <p className="text-slate-600 mb-6">برای استفاده از برنامه، با حساب گوگل خود وارد شوید.</p>
                <button onClick={onSignIn} className="w-full flex items-center justify-center gap-3 bg-teal-500 text-white py-3 rounded-xl hover:bg-teal-600 font-bold transition-colors">
                    ورود با گوگل
                </button>
            </Wrapper>
        );
    }
    if (variant === 'pending') {
        return (
            <Wrapper>
                <div className="text-4xl mb-3">⏳</div>
                <h2 className="text-lg font-bold text-slate-800 mb-2">در انتظار تأیید مدیر</h2>
                <p className="text-slate-600 mb-2">درخواست شما ثبت شد. پس از تأیید مدیر می‌توانید وارد شوید.</p>
                {user?.email && <p className="text-xs text-slate-400 mb-6">{user.email}</p>}
                <button onClick={onSignOut} className="w-full bg-slate-200 text-slate-700 py-2 rounded-xl hover:bg-slate-300 transition-colors">خروج از حساب</button>
            </Wrapper>
        );
    }
    // rejected
    return (
        <Wrapper>
            <div className="text-4xl mb-3">🚫</div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">دسترسی رد شد</h2>
            <p className="text-slate-600 mb-2">متأسفانه دسترسی شما به این برنامه تأیید نشده است.</p>
            {user?.email && <p className="text-xs text-slate-400 mb-6">{user.email}</p>}
            <button onClick={onSignOut} className="w-full bg-slate-200 text-slate-700 py-2 rounded-xl hover:bg-slate-300 transition-colors">خروج از حساب</button>
        </Wrapper>
    );
}

// Inline notice shown when an approved user opens a section they lack access to.
function AccessNotice({ title, message }) {
    return (
        <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow p-8 text-center" dir="rtl">
            <div className="text-4xl mb-3">🔒</div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-600">{message}</p>
        </div>
    );
}

// Admin-only panel: review access requests, approve/reject, and grant per-section
// permissions. All writes are guarded by Firestore rules (admin-only).
function AdminPanel({ db, appId, currentUid }) {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!db) return;
        const col = collection(db, `/artifacts/${appId}/accessControl`);
        const unsub = onSnapshot(col,
            (snap) => setUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))),
            (e) => { console.error('admin list error:', e); setError('خطا در خواندن لیست کاربران (قوانین Firestore را بررسی کنید).'); }
        );
        return () => unsub();
    }, [db, appId]);

    const patchUser = (uid, patch) =>
        updateDoc(doc(db, `/artifacts/${appId}/accessControl/${uid}`), { ...patch, updatedAt: serverTimestamp() })
            .catch((e) => console.error('update user error:', e));
    const setStatus = (uid, status) => patchUser(uid, { status, decidedAt: serverTimestamp() });
    const togglePerm = (u, key) => {
        const perms = normalizePermissions(u.permissions);
        perms[key] = !perms[key];
        patchUser(u.uid, { permissions: perms });
    };
    const setAllPerms = (u, val) => patchUser(u.uid, { permissions: val ? fullPermissions() : emptyPermissions() });

    const StatusBadge = ({ status }) => {
        const map = { approved: 'bg-green-100 text-green-700', pending: 'bg-amber-100 text-amber-700', rejected: 'bg-red-100 text-red-700' };
        const label = { approved: 'تأییدشده', pending: 'در انتظار', rejected: 'ردشده' };
        return <span className={`text-xs px-2 py-1 rounded-full ${map[status] || 'bg-slate-100 text-slate-600'}`}>{label[status] || status}</span>;
    };

    const UserCard = ({ u }) => {
        const perms = normalizePermissions(u.permissions);
        const isSelf = u.uid === currentUid;
        return (
            <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                        <p className="font-bold text-slate-800">{u.displayName || u.email || u.uid}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {u.role === 'admin' && <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">مدیر</span>}
                        <StatusBadge status={u.status} />
                    </div>
                </div>
                {!isSelf && (
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setStatus(u.uid, 'approved')} disabled={u.status === 'approved'} className="px-3 py-1.5 rounded-lg text-sm bg-green-500 text-white hover:bg-green-600 disabled:bg-slate-300">تأیید</button>
                        <button onClick={() => setStatus(u.uid, 'rejected')} disabled={u.status === 'rejected'} className="px-3 py-1.5 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 disabled:bg-slate-300">رد</button>
                        <button onClick={() => setAllPerms(u, true)} className="px-3 py-1.5 rounded-lg text-sm bg-slate-200 hover:bg-slate-300">همه دسترسی‌ها</button>
                        <button onClick={() => setAllPerms(u, false)} className="px-3 py-1.5 rounded-lg text-sm bg-slate-200 hover:bg-slate-300">حذف همه</button>
                    </div>
                )}
                {isSelf && <p className="text-xs text-slate-400">(این حساب شماست)</p>}
                {!isSelf && u.role !== 'admin' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PERMISSION_SECTIONS.map((s) => (
                            <label key={s.key} className="flex items-center gap-2 text-sm bg-slate-50 rounded-lg px-2 py-1.5 cursor-pointer">
                                <input type="checkbox" checked={perms[s.key]} onChange={() => togglePerm(u, s.key)} />
                                <span>{s.label}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const pending = users.filter((u) => u.status === 'pending');
    const others = users.filter((u) => u.status !== 'pending');

    return (
        <div dir="rtl" className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">مدیریت کاربران</h1>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">{error}</div>}
            <section className="space-y-3">
                <h2 className="font-bold text-slate-700">درخواست‌های در انتظار ({pending.length})</h2>
                {pending.length === 0 ? <p className="text-slate-500 text-sm">درخواست جدیدی نیست.</p> : pending.map((u) => <UserCard key={u.uid} u={u} />)}
            </section>
            <section className="space-y-3">
                <h2 className="font-bold text-slate-700">همهٔ کاربران ({others.length})</h2>
                {others.map((u) => <UserCard key={u.uid} u={u} />)}
            </section>
        </div>
    );
}

function SettingsPage({ data, setData, setModalConfig, removePronunciationCorrection, firebaseServices, userId }) {
    const [activeTab, setActiveTab] = useState('general');
    const pronunciationCorrections = data.pronunciationCorrections || [];
    const customPrompts = data.customPrompts || {};

    const handleSettingChange = (key, value) => {
        setData(prev => ({
            ...prev,
            defaultChatSettings: {
                ...prev.defaultChatSettings,
                [key]: value,
            }
        }));
    };

    const handlePromptChange = (promptKey, value) => {
        setData(prev => ({
            ...prev,
            customPrompts: {
                ...prev.customPrompts,
                [promptKey]: value
            }
        }));
    };

    const resetPrompt = (promptKey) => {
        setData(prev => {
            const newCustomPrompts = { ...prev.customPrompts };
            delete newCustomPrompts[promptKey];
            return { ...prev, customPrompts: newCustomPrompts };
        });
    };

    const resetAllPrompts = () => {
        setModalConfig({
            title: '⚠️ بازنشانی همه پرامپت‌ها',
            message: 'آیا مطمئن هستید؟ همه تغییرات پرامپت‌ها به حالت پیش‌فرض برمی‌گردند.',
            buttons: [
                { label: 'انصراف', onClick: () => setModalConfig(null), className: 'bg-slate-200' },
                { label: 'بازنشانی', onClick: () => { setData(prev => ({ ...prev, customPrompts: {} })); setModalConfig(null); }, className: 'bg-red-500 text-white' }
            ]
        });
    };

    const { defaultChatSettings = initialData.defaultChatSettings } = data;
    const availableVoices = { 'Charon': 'مرد - استاندارد', 'Kore': 'زن - محکم', 'Zephyr': 'زن - روشن', 'Puck': 'مرد - شاد', 'Leda': 'زن - جوان', 'Fenrir': 'مرد - هیجان‌زده' };

    const tabs = [
        { id: 'general', label: '⚙️ عمومی', icon: Settings },
        { id: 'prompts', label: '🧠 پرامپت‌ها', icon: MessageSquare },
        { id: 'flow', label: '📊 جریان الگوریتم', icon: Activity },
        { id: 'backup', label: '💾 پشتیبان‌گیری', icon: Database }
    ];

    // Backup functions
    const BACKUP_KEY = 'lebanese_dialect_app_backup';
    const BACKUP_TIMESTAMP_KEY = 'lebanese_dialect_app_backup_timestamp';

    const getBackupInfo = () => {
        try {
            const backup = localStorage.getItem(BACKUP_KEY);
            const timestamp = localStorage.getItem(BACKUP_TIMESTAMP_KEY);
            if (backup) {
                const backupData = JSON.parse(backup);
                return {
                    exists: true,
                    timestamp: timestamp ? new Date(timestamp).toLocaleString('fa-IR') : 'نامشخص',
                    lessonsCount: backupData.lessons?.length || 0,
                    knowledgeCount: Object.values(backupData.knowledgeBase || {}).flat().length
                };
            }
        } catch (e) {
            console.error("Error reading backup info:", e);
        }
        return { exists: false };
    };

    const manualBackup = () => {
        try {
            localStorage.setItem(BACKUP_KEY, JSON.stringify(data));
            localStorage.setItem(BACKUP_TIMESTAMP_KEY, new Date().toISOString());
            setModalConfig({
                title: '✅ پشتیبان ذخیره شد',
                message: `پشتیبان با ${data.lessons?.length || 0} درس و ${Object.values(data.knowledgeBase || {}).flat().length} آیتم دانش ذخیره شد.`,
                buttons: [{ label: 'باشه', onClick: () => setModalConfig(null), className: 'bg-teal-500 text-white' }]
            });
        } catch (e) {
            setModalConfig({
                title: '❌ خطا',
                message: 'خطا در ذخیره پشتیبان: ' + e.message,
                buttons: [{ label: 'باشه', onClick: () => setModalConfig(null), className: 'bg-red-500 text-white' }]
            });
        }
    };

    const restoreFromBackup = () => {
        try {
            const backup = localStorage.getItem(BACKUP_KEY);
            if (backup) {
                const backupData = JSON.parse(backup);
                setModalConfig({
                    title: '⚠️ بازیابی از پشتیبان',
                    message: 'آیا مطمئنید؟ داده‌های فعلی با پشتیبان جایگزین می‌شوند.',
                    buttons: [
                        { label: 'انصراف', onClick: () => setModalConfig(null), className: 'bg-slate-200' },
                        {
                            label: 'بازیابی کن',
                            onClick: () => {
                                setData(prev => ({ ...prev, ...backupData }));
                                setModalConfig({
                                    title: '✅ بازیابی شد',
                                    message: 'داده‌ها با موفقیت بازیابی شدند.',
                                    buttons: [{ label: 'باشه', onClick: () => setModalConfig(null), className: 'bg-teal-500 text-white' }]
                                });
                            },
                            className: 'bg-teal-500 text-white'
                        }
                    ]
                });
            }
        } catch (e) {
            setModalConfig({
                title: '❌ خطا',
                message: 'خطا در بازیابی: ' + e.message,
                buttons: [{ label: 'باشه', onClick: () => setModalConfig(null), className: 'bg-red-500 text-white' }]
            });
        }
    };

    const [backupInfo, setBackupInfo] = useState(() => getBackupInfo());

    // Firebase Recovery State
    const [alternateAppId, setAlternateAppId] = useState('');
    const [searchingFirebase, setSearchingFirebase] = useState(false);
    const [firebaseSearchResult, setFirebaseSearchResult] = useState(null);
    const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const SHARED_USER_ID = 'shared-user-mahdi';

    const searchFirebasePath = async (appIdToSearch) => {
        if (!firebaseServices?.db || !appIdToSearch.trim()) {
            setModalConfig({
                title: '❌ خطا',
                message: 'لطفاً یک App ID وارد کنید',
                buttons: [{ label: 'باشه', onClick: () => setModalConfig(null), className: 'bg-slate-200' }]
            });
            return;
        }

        setSearchingFirebase(true);
        setFirebaseSearchResult(null);

        try {
            const { doc, getDoc } = await import('firebase/firestore');
            const searchPath = `/artifacts/${appIdToSearch.trim()}/users/${SHARED_USER_ID}/data/main`;
            const docRef = doc(firebaseServices.db, searchPath);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const foundData = docSnap.data();
                const hasContent = foundData.lessons?.length > 0 ||
                    Object.values(foundData.knowledgeBase || {}).some(arr => arr?.length > 0);

                setFirebaseSearchResult({
                    found: true,
                    hasContent,
                    path: searchPath,
                    appId: appIdToSearch.trim(),
                    data: foundData,
                    lessonsCount: foundData.lessons?.length || 0,
                    knowledgeCount: Object.values(foundData.knowledgeBase || {}).flat().length
                });
            } else {
                setFirebaseSearchResult({
                    found: false,
                    path: searchPath,
                    appId: appIdToSearch.trim()
                });
            }
        } catch (error) {
            console.error("Error searching Firebase:", error);
            setModalConfig({
                title: '❌ خطا در جستجو',
                message: `خطا: ${error.message}`,
                buttons: [{ label: 'باشه', onClick: () => setModalConfig(null), className: 'bg-slate-200' }]
            });
        } finally {
            setSearchingFirebase(false);
        }
    };

    const migrateFromOldPath = async () => {
        if (!firebaseSearchResult?.data || !firebaseServices?.db) return;

        try {
            const { doc, setDoc } = await import('firebase/firestore');
            const currentPath = `/artifacts/${currentAppId}/users/${SHARED_USER_ID}/data/main`;
            const currentDocRef = doc(firebaseServices.db, currentPath);

            // Merge old data with current data (old data takes priority for non-empty arrays)
            const mergedData = { ...data };
            const oldData = firebaseSearchResult.data;

            // Merge lessons
            if (oldData.lessons?.length > 0) {
                const existingIds = new Set(mergedData.lessons?.map(l => l.id) || []);
                const newLessons = oldData.lessons.filter(l => !existingIds.has(l.id));
                mergedData.lessons = [...(mergedData.lessons || []), ...newLessons];
            }

            // Merge knowledge base
            if (oldData.knowledgeBase) {
                Object.keys(oldData.knowledgeBase).forEach(key => {
                    if (oldData.knowledgeBase[key]?.length > 0) {
                        const existingTerms = new Set((mergedData.knowledgeBase?.[key] || []).map(i => i.term));
                        const newItems = oldData.knowledgeBase[key].filter(i => !existingTerms.has(i.term));
                        mergedData.knowledgeBase = mergedData.knowledgeBase || {};
                        mergedData.knowledgeBase[key] = [...(mergedData.knowledgeBase[key] || []), ...newItems];
                    }
                });
            }

            // Merge journal
            if (oldData.journal?.length > 0) {
                const existingIds = new Set(mergedData.journal?.map(j => j.id) || []);
                const newEntries = oldData.journal.filter(j => !existingIds.has(j.id));
                mergedData.journal = [...(mergedData.journal || []), ...newEntries];
            }

            // Merge chat histories
            if (oldData.chatHistories) {
                mergedData.chatHistories = { ...mergedData.chatHistories, ...oldData.chatHistories };
            }

            // Save to Firebase and local state
            await setDoc(currentDocRef, mergedData, { merge: true });
            setData(mergedData);

            setModalConfig({
                title: '✅ انتقال موفق',
                message: `داده‌ها با موفقیت منتقل شدند!\n- ${firebaseSearchResult.lessonsCount} درس\n- ${firebaseSearchResult.knowledgeCount} آیتم دانش`,
                buttons: [{ label: 'عالی!', onClick: () => { setModalConfig(null); setFirebaseSearchResult(null); }, className: 'bg-teal-500 text-white' }]
            });
        } catch (error) {
            console.error("Error migrating data:", error);
            setModalConfig({
                title: '❌ خطا در انتقال',
                message: `خطا: ${error.message}`,
                buttons: [{ label: 'باشه', onClick: () => setModalConfig(null), className: 'bg-slate-200' }]
            });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-4xl font-bold text-slate-800">تنظیمات</h2>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-t-lg font-bold transition-all ${
                            activeTab === tab.id
                                ? 'bg-teal-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* General Settings Tab */}
            {activeTab === 'general' && (
                <div className="space-y-6">
                    <Card title="تنظیمات پیش‌فرض مکالمه">
                        <div className="space-y-4 text-sm">
                            <div><label className="font-bold">صدای استاد:</label><select value={defaultChatSettings.aiVoice} onChange={e => handleSettingChange('aiVoice', e.target.value)} className="w-full p-2 border rounded mt-1">{Object.entries(availableVoices).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></div>
                            <div className="border-t pt-3"><label className="font-bold">لهجه استاد:</label><div className="flex gap-4 mt-2"><label><input type="radio" name="accent" value="standard" checked={defaultChatSettings.accentMode === 'standard'} onChange={() => handleSettingChange('accentMode', 'standard')} /> استاندارد</label><label><input type="radio" name="accent" value="authentic" checked={defaultChatSettings.accentMode === 'authentic'} onChange={() => handleSettingChange('accentMode', 'authentic')} /> محاوره‌ای</label></div></div>
                            <div className="border-t pt-3"><label className="font-bold">سبک نوشتار:</label><select value={defaultChatSettings.writingStyle} onChange={e => handleSettingChange('writingStyle', e.target.value)} className="w-full p-2 border rounded mt-1"><option value="simple_arabic">عربی ساده</option><option value="finglish">فینگلیش (Arabizi)</option><option value="tashkeel">عربی با اعراب</option></select></div>
                            <div className="border-t pt-3"><label className="font-bold">نمایش ترجمه:</label><select value={defaultChatSettings.translationLanguage} onChange={e => handleSettingChange('translationLanguage', e.target.value)} className="w-full p-2 border rounded mt-1"><option value="none">بدون ترجمه</option><option value="persian">فارسی</option><option value="english">انگلیسی</option></select></div>
                            <div className="border-t pt-3"><label className="font-bold">پاسخ استاد:</label><div className="flex gap-4 mt-2"><label><input type="radio" name="receiveAs" value="audio" checked={defaultChatSettings.aiResponseType === 'audio'} onChange={() => handleSettingChange('aiResponseType', 'audio')} /> صدا</label><label><input type="radio" name="receiveAs" value="text" checked={defaultChatSettings.aiResponseType === 'text'} onChange={() => handleSettingChange('aiResponseType', 'text')} /> فقط متن</label></div></div>
                        </div>
                    </Card>

                    <Card title="⚙️ تنظیمات حالت مکالمه صوتی">
                        <div className="space-y-4 text-sm">
                            <p className="text-slate-600 text-xs">این تنظیمات فقط روی حالت مکالمه صوتی (دکمه تلفن بنفش) اعمال میشن.</p>
                            <div>
                                <label className="font-bold">تاخیر قبل از بوق (میلی‌ثانیه):</label>
                                <p className="text-xs text-slate-500 mb-1">بعد از پاسخ استاد، چند میلی‌ثانیه صبر کنه تا بوق بزنه</p>
                                <input type="range" min="0" max="2000" step="100" value={defaultChatSettings.voiceConversationBeepDelay || 500} onChange={e => handleSettingChange('voiceConversationBeepDelay', parseInt(e.target.value))} className="w-full" />
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>0</span>
                                    <span className="font-bold text-teal-600">{defaultChatSettings.voiceConversationBeepDelay || 500} ms</span>
                                    <span>2000</span>
                                </div>
                            </div>
                            <div className="border-t pt-3">
                                <label className="font-bold">آستانه سکوت برای ارسال (ثانیه):</label>
                                <p className="text-xs text-slate-500 mb-1">اگر این مدت سکوت کنید، صدا خودکار ارسال میشه</p>
                                <input type="range" min="1000" max="5000" step="500" value={defaultChatSettings.voiceConversationSilenceThreshold || 2000} onChange={e => handleSettingChange('voiceConversationSilenceThreshold', parseInt(e.target.value))} className="w-full" />
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>1 ثانیه</span>
                                    <span className="font-bold text-teal-600">{(defaultChatSettings.voiceConversationSilenceThreshold || 2000) / 1000} ثانیه</span>
                                    <span>5 ثانیه</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="📝 اصلاحات تلفظی یادگرفته شده">
                        <div className="space-y-3">
                            <p className="text-sm text-slate-600">این اصلاحات از آنالیز تماس‌های قبلی استخراج شدن و در تماس‌های بعدی به Live API ارسال میشن.</p>
                            {pronunciationCorrections.length === 0 ? (
                                <p className="text-center text-slate-400 py-4">هنوز اصلاحی ثبت نشده. بعد از هر تماس، سیستم خودکار آنالیز میکنه.</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {pronunciationCorrections.map((c, i) => (
                                        <div key={c.id || i} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-500 line-through">{c.wrong}</span>
                                                    <span className="text-slate-400">←</span>
                                                    <span className="text-green-600 font-bold">{c.correct}</span>
                                                </div>
                                                {c.date && <p className="text-xs text-slate-400 mt-1">{new Date(c.date).toLocaleDateString('fa-IR')}</p>}
                                            </div>
                                            <button onClick={() => removePronunciationCorrection && removePronunciationCorrection(c.id)} className="text-red-400 hover:text-red-600 p-1" title="حذف"><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="border-t pt-3 mt-3">
                                <p className="text-xs text-slate-500">💡 <strong>نحوه کار:</strong> وقتی تماس تموم میشه → آنالیز خودکار → اصلاحات ذخیره میشن → در تماس بعدی به Live API گفته میشه</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Prompt Management Tab */}
            {activeTab === 'prompts' && (
                <PromptManagement
                    customPrompts={customPrompts}
                    handlePromptChange={handlePromptChange}
                    resetPrompt={resetPrompt}
                    resetAllPrompts={resetAllPrompts}
                />
            )}

            {/* Flow Visualization Tab */}
            {activeTab === 'flow' && (
                <FlowVisualization />
            )}

            {/* Backup Tab */}
            {activeTab === 'backup' && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-500 to-teal-600 text-white p-4 rounded-xl">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Database size={24} /> سیستم پشتیبان‌گیری
                        </h3>
                        <p className="text-blue-100 text-sm mt-1">
                            از داده‌های خود نسخه پشتیبان بگیرید تا در صورت از دست رفتن داده‌ها بتوانید آنها را بازیابی کنید.
                        </p>
                    </div>

                    {/* Current Data Info */}
                    <Card title="📊 وضعیت فعلی داده‌ها">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-teal-50 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-teal-600">{data.lessons?.length || 0}</div>
                                <div className="text-sm text-slate-600">درس</div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-blue-600">{data.knowledgeBase?.vocabulary?.length || 0}</div>
                                <div className="text-sm text-slate-600">لغت</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-purple-600">{data.knowledgeBase?.grammar?.length || 0}</div>
                                <div className="text-sm text-slate-600">گرامر</div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-xl text-center">
                                <div className="text-3xl font-bold text-orange-600">{data.journal?.length || 0}</div>
                                <div className="text-sm text-slate-600">فعالیت</div>
                            </div>
                        </div>
                    </Card>

                    {/* Backup Status */}
                    <Card title="💾 وضعیت پشتیبان">
                        {backupInfo.exists ? (
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                                        <CheckCircle size={20} /> پشتیبان موجود است
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500">تاریخ:</span>
                                            <span className="mr-2 font-bold">{backupInfo.timestamp}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">تعداد دروس:</span>
                                            <span className="mr-2 font-bold">{backupInfo.lessonsCount}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">آیتم‌های دانش:</span>
                                            <span className="mr-2 font-bold">{backupInfo.knowledgeCount}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { manualBackup(); setBackupInfo(getBackupInfo()); }}
                                        className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 flex items-center justify-center gap-2"
                                    >
                                        <Save size={20} /> ذخیره پشتیبان جدید
                                    </button>
                                    <button
                                        onClick={restoreFromBackup}
                                        className="flex-1 bg-teal-500 text-white py-3 rounded-xl font-bold hover:bg-teal-600 flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw size={20} /> بازیابی از پشتیبان
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-yellow-700 font-bold">
                                        <AlertCircle size={20} /> هیچ پشتیبانی یافت نشد
                                    </div>
                                    <p className="text-sm text-yellow-600 mt-1">
                                        هنوز نسخه پشتیبانی ذخیره نشده. توصیه می‌شود همین الان یک پشتیبان بگیرید.
                                    </p>
                                </div>
                                <button
                                    onClick={() => { manualBackup(); setBackupInfo(getBackupInfo()); }}
                                    className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 flex items-center justify-center gap-2"
                                >
                                    <Save size={20} /> ذخیره پشتیبان
                                </button>
                            </div>
                        )}
                    </Card>

                    {/* Auto Backup Info */}
                    <Card title="ℹ️ پشتیبان‌گیری خودکار">
                        <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                            <p className="font-bold mb-2">سیستم پشتیبان‌گیری خودکار فعال است:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>هر بار که داده‌ها تغییر کنند، به صورت خودکار پشتیبان گرفته می‌شود</li>
                                <li>اگر داده‌های سرور خالی باشد، امکان بازیابی از پشتیبان داده می‌شود</li>
                                <li>پشتیبان در حافظه مرورگر (localStorage) ذخیره می‌شود</li>
                                <li>اگر مرورگر یا دستگاه تغییر کنید، پشتیبان در دسترس نخواهد بود</li>
                            </ul>
                        </div>
                    </Card>

                    {/* Firebase Recovery Tool */}
                    {firebaseServices?.db && (
                        <Card title="🔥 بازیابی از Firebase">
                            <div className="space-y-4">
                                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl">
                                    <p className="text-sm text-orange-800 mb-2">
                                        اگر داده‌های شما در مسیر دیگری در Firebase ذخیره شده، می‌توانید آنها را جستجو و منتقل کنید.
                                    </p>
                                    <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded font-mono">
                                        مسیر فعلی: /artifacts/<strong>{currentAppId}</strong>/users/{SHARED_USER_ID}/data/main
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="App ID قدیمی را وارد کنید..."
                                        value={alternateAppId}
                                        onChange={e => setAlternateAppId(e.target.value)}
                                        className="flex-1 p-3 border rounded-xl text-sm"
                                        dir="ltr"
                                    />
                                    <button
                                        onClick={() => searchFirebasePath(alternateAppId)}
                                        disabled={searchingFirebase || !alternateAppId.trim()}
                                        className="px-4 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {searchingFirebase ? <Loader className="animate-spin" size={18} /> : <Search size={18} />}
                                        جستجو
                                    </button>
                                </div>

                                {/* Search Result */}
                                {firebaseSearchResult && (
                                    <div className={`p-4 rounded-xl border ${firebaseSearchResult.found && firebaseSearchResult.hasContent ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        {firebaseSearchResult.found && firebaseSearchResult.hasContent ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-green-700 font-bold">
                                                    <CheckCircle size={20} /> داده پیدا شد!
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="bg-white p-2 rounded">
                                                        <span className="text-slate-500">دروس:</span>
                                                        <span className="mr-2 font-bold text-green-600">{firebaseSearchResult.lessonsCount}</span>
                                                    </div>
                                                    <div className="bg-white p-2 rounded">
                                                        <span className="text-slate-500">دانش:</span>
                                                        <span className="mr-2 font-bold text-green-600">{firebaseSearchResult.knowledgeCount}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={migrateFromOldPath}
                                                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                                                >
                                                    <Download size={20} /> انتقال به مسیر فعلی
                                                </button>
                                            </div>
                                        ) : firebaseSearchResult.found ? (
                                            <div className="flex items-center gap-2 text-yellow-700">
                                                <AlertCircle size={20} /> سند پیدا شد اما خالی است
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-700">
                                                <X size={20} /> داده‌ای در این مسیر یافت نشد
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                                    <strong>راهنما:</strong> App ID معمولاً یک رشته طولانی مثل <code className="bg-slate-200 px-1 rounded">abc123xyz-...</code> است.
                                    می‌توانید از کنسول Firebase در بخش Firestore لیست artifacts را ببینید.
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

// Prompt Management Component
function PromptManagement({ customPrompts, handlePromptChange, resetPrompt, resetAllPrompts }) {
    const [expandedCategory, setExpandedCategory] = useState('chat');
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const getPromptValue = (key) => customPrompts[key] !== undefined ? customPrompts[key] : defaultPrompts[key];
    const isModified = (key) => customPrompts[key] !== undefined;

    const filteredCategories = Object.entries(promptCategories).filter(([catKey, cat]) => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        if (cat.title.toLowerCase().includes(searchLower)) return true;
        return cat.prompts.some(promptKey =>
            promptLabels[promptKey]?.toLowerCase().includes(searchLower) ||
            getPromptValue(promptKey).toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-4 rounded-xl">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Brain size={24} /> مدیریت پرامپت‌های هوش مصنوعی
                </h3>
                <p className="text-purple-100 text-sm mt-1">
                    در این بخش می‌توانید تمام دستورات و پرامپت‌های استاد هوش مصنوعی را مشاهده و ویرایش کنید.
                </p>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="جستجو در پرامپت‌ها..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border rounded-lg"
                    />
                </div>
                <button
                    onClick={resetAllPrompts}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center gap-2 font-bold"
                >
                    <RotateCcw size={16} /> بازنشانی همه
                </button>
            </div>

            {/* Modified Count */}
            {Object.keys(customPrompts).length > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm">
                    <strong>{Object.keys(customPrompts).length}</strong> پرامپت تغییر یافته
                </div>
            )}

            {/* Categories */}
            <div className="space-y-3">
                {filteredCategories.map(([catKey, category]) => (
                    <div key={catKey} className="border rounded-xl overflow-hidden">
                        {/* Category Header */}
                        <button
                            onClick={() => setExpandedCategory(expandedCategory === catKey ? null : catKey)}
                            className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                                expandedCategory === catKey ? 'bg-slate-100' : 'bg-white hover:bg-slate-50'
                            }`}
                        >
                            <div className="text-right">
                                <h4 className="font-bold text-lg">{category.title}</h4>
                                <p className="text-xs text-slate-500">{category.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {category.prompts.some(p => isModified(p)) && (
                                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">ویرایش شده</span>
                                )}
                                <ChevronDown
                                    size={20}
                                    className={`transition-transform ${expandedCategory === catKey ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </button>

                        {/* Category Content */}
                        {expandedCategory === catKey && (
                            <div className="p-4 bg-slate-50 space-y-4">
                                {category.prompts.map(promptKey => {
                                    const isExpanded = editingPrompt === promptKey;
                                    const modified = isModified(promptKey);
                                    const value = getPromptValue(promptKey);

                                    return (
                                        <div
                                            key={promptKey}
                                            className={`bg-white rounded-lg border ${modified ? 'border-amber-300' : 'border-slate-200'} overflow-hidden`}
                                        >
                                            {/* Prompt Header */}
                                            <div
                                                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                                                onClick={() => setEditingPrompt(isExpanded ? null : promptKey)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-700">
                                                        {promptLabels[promptKey] || promptKey}
                                                    </span>
                                                    {modified && (
                                                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded">
                                                            تغییر یافته
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {modified && (
                                                        <button
                                                            onClick={e => { e.stopPropagation(); resetPrompt(promptKey); }}
                                                            className="text-slate-400 hover:text-red-500 p-1"
                                                            title="بازگشت به پیش‌فرض"
                                                        >
                                                            <RotateCcw size={14} />
                                                        </button>
                                                    )}
                                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </div>
                                            </div>

                                            {/* Prompt Editor */}
                                            {isExpanded && (
                                                <div className="px-4 pb-4 space-y-3">
                                                    <textarea
                                                        value={value}
                                                        onChange={e => handlePromptChange(promptKey, e.target.value)}
                                                        className="w-full h-48 p-3 border rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                        dir="auto"
                                                        placeholder="پرامپت را وارد کنید..."
                                                    />
                                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                                        <span>{value.length} کاراکتر</span>
                                                        <div className="flex gap-2">
                                                            {modified && (
                                                                <button
                                                                    onClick={() => resetPrompt(promptKey)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    بازنشانی به پیش‌فرض
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Show default if modified */}
                                                    {modified && (
                                                        <details className="text-xs">
                                                            <summary className="cursor-pointer text-slate-500 hover:text-slate-700">
                                                                مشاهده مقدار پیش‌فرض
                                                            </summary>
                                                            <pre className="mt-2 p-3 bg-slate-100 rounded-lg overflow-auto max-h-32 whitespace-pre-wrap text-slate-600" dir="auto">
                                                                {defaultPrompts[promptKey]}
                                                            </pre>
                                                        </details>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Help Section */}
            <Card title="💡 راهنما">
                <div className="text-sm space-y-2 text-slate-600">
                    <p><strong>چت متنی:</strong> دستورات برای مکالمه متنی با استاد در صفحه درس‌ها</p>
                    <p><strong>مکالمه صوتی:</strong> دستورات برای تماس صوتی Real-time (دکمه تلفن)</p>
                    <p><strong>تحلیل محتوا:</strong> دستورات برای استخراج محتوا از فایل‌های آموزشی</p>
                    <p><strong>ادغام جزوات:</strong> دستور نحوه ترکیب محتوای جدید با قبلی</p>
                    <p><strong>ساخت آزمون:</strong> دستورات برای تولید سوالات آزمون</p>
                    <p className="text-amber-600 mt-3">⚠️ تغییرات بلافاصله ذخیره می‌شوند و در تمام بخش‌های برنامه اعمال می‌شوند.</p>
                </div>
            </Card>
        </div>
    );
}

// ============================================
// FLOW VISUALIZATION COMPONENT
// ============================================

function FlowVisualization() {
    const { currentNode, flowHistory, activeFlow, clearHistory } = useExecutionFlow();
    const [selectedFlow, setSelectedFlow] = useState('all');
    const [tick, setTick] = useState(0);

    // Force re-render every 500ms to update recent nodes trail
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 500);
        return () => clearInterval(interval);
    }, []);

    // Flow colors
    const flowColors = {
        chat: '#3b82f6',
        chatVoice: '#8b5cf6',
        liveVoice: '#06b6d4',
        fileAnalysis: '#f59e0b',
        quiz: '#10b981'
    };

    const flowTitles = {
        chat: '💬 چت متنی',
        chatVoice: '🎤 چت صوتی',
        liveVoice: '📞 تماس زنده',
        fileAnalysis: '📁 تحلیل فایل',
        quiz: '📝 آزمون'
    };

    // Check if actively running
    const isRunning = activeFlow && currentNode !== 'idle' && currentNode !== 'complete' && currentNode !== 'error';

    // Filter history
    const filteredHistory = selectedFlow === 'all'
        ? flowHistory
        : flowHistory.filter(h => h.flowType === selectedFlow);
    const recentActivity = filteredHistory.slice(-10).reverse();

    // Calculate recently active nodes (within last 5 seconds) with their age
    const now = Date.now();
    const TRAIL_DURATION = 5000; // 5 seconds
    const recentNodes = useMemo(() => {
        const recent = {};
        flowHistory.forEach(entry => {
            const age = now - entry.timestamp;
            if (age < TRAIL_DURATION && entry.nodeId !== 'idle') {
                // Store the most recent timestamp for each node
                if (!recent[entry.nodeId] || entry.timestamp > recent[entry.nodeId].timestamp) {
                    recent[entry.nodeId] = {
                        timestamp: entry.timestamp,
                        age,
                        flowType: entry.flowType,
                        opacity: Math.max(0.2, 1 - (age / TRAIL_DURATION))
                    };
                }
            }
        });
        return recent;
    }, [flowHistory, tick]); // tick forces recalculation

    // Check if a node is active
    const isNodeActive = (nodeId, flowType) => {
        return activeFlow === flowType && currentNode === nodeId;
    };

    // Get color for current active flow
    const getActiveColor = () => flowColors[activeFlow] || '#64748b';

    // Unified Flowchart SVG
    const UnifiedFlowchart = () => {
        const svgWidth = 900;
        const svgHeight = 550;
        const isRunning = activeFlow && currentNode !== 'idle' && currentNode !== 'complete' && currentNode !== 'error';

        // Node positions for unified diagram
        const nodes = {
            // Central idle state
            idle: { x: 400, y: 30, label: 'آماده', icon: '⏸️', type: 'start' },

            // Chat branch (left)
            userInput: { x: 80, y: 120, label: 'ورودی متن', icon: '✍️', flow: 'chat' },
            buildingPrompt: { x: 80, y: 190, label: 'ساخت پرامپت', icon: '🔧', flow: 'chat' },
            callingGemini: { x: 80, y: 260, label: 'ارسال به AI', icon: '🤖', flow: 'chat' },
            receivingResponse: { x: 80, y: 330, label: 'دریافت پاسخ', icon: '📥', flow: 'chat' },
            generatingTTS: { x: 80, y: 400, label: 'ساخت صوت', icon: '🔊', flow: 'chat' },
            playingAudio: { x: 80, y: 470, label: 'پخش صدا', icon: '▶️', flow: 'chat' },

            // Voice Chat branch
            audioRecording: { x: 240, y: 120, label: 'ضبط صدا', icon: '🎤', flow: 'chatVoice' },
            audioTranscription: { x: 240, y: 190, label: 'تبدیل به متن', icon: '📝', flow: 'chatVoice' },

            // Live Voice branch (center-left)
            wsConnecting: { x: 400, y: 120, label: 'اتصال', icon: '🔌', flow: 'liveVoice' },
            wsConnected: { x: 400, y: 190, label: 'متصل', icon: '✅', flow: 'liveVoice' },
            liveListening: { x: 340, y: 270, label: 'گوش دادن', icon: '👂', flow: 'liveVoice' },
            liveStreaming: { x: 340, y: 350, label: 'ارسال صوت', icon: '📤', flow: 'liveVoice' },
            liveReceiving: { x: 460, y: 270, label: 'دریافت', icon: '📥', flow: 'liveVoice' },
            liveSpeaking: { x: 460, y: 350, label: 'پاسخ صوتی', icon: '🔊', flow: 'liveVoice' },

            // File Analysis branch (center-right)
            fileUploading: { x: 560, y: 120, label: 'آپلود فایل', icon: '📤', flow: 'fileAnalysis' },
            fileAnalyzing: { x: 560, y: 190, label: 'تحلیل', icon: '🔍', flow: 'fileAnalysis' },
            mergingContent: { x: 560, y: 260, label: 'ادغام', icon: '🔗', flow: 'fileAnalysis' },
            categorizingItems: { x: 560, y: 330, label: 'دسته‌بندی', icon: '📊', flow: 'fileAnalysis' },
            savingToLesson: { x: 560, y: 400, label: 'ذخیره', icon: '💾', flow: 'fileAnalysis' },

            // Quiz branch (right)
            generatingQuiz: { x: 720, y: 120, label: 'ساخت آزمون', icon: '📝', flow: 'quiz' },
            showingQuiz: { x: 720, y: 190, label: 'نمایش سوال', icon: '❓', flow: 'quiz' },
            checkingAnswer: { x: 720, y: 260, label: 'بررسی پاسخ', icon: '✔️', flow: 'quiz' },

            // End states
            complete: { x: 400, y: 500, label: 'تکمیل', icon: '✅', type: 'end' },
            error: { x: 560, y: 500, label: 'خطا', icon: '❌', type: 'error' }
        };

        // Connections: [fromNode, toNode, flowType]
        const connections = [
            // From idle to all branches
            ['idle', 'userInput', 'chat'],
            ['idle', 'audioRecording', 'chatVoice'],
            ['idle', 'wsConnecting', 'liveVoice'],
            ['idle', 'fileUploading', 'fileAnalysis'],
            ['idle', 'generatingQuiz', 'quiz'],

            // Chat flow
            ['userInput', 'buildingPrompt', 'chat'],
            ['buildingPrompt', 'callingGemini', 'chat'],
            ['callingGemini', 'receivingResponse', 'chat'],
            ['receivingResponse', 'generatingTTS', 'chat'],
            ['generatingTTS', 'playingAudio', 'chat'],
            ['playingAudio', 'complete', 'chat'],

            // Voice chat flow
            ['audioRecording', 'audioTranscription', 'chatVoice'],
            ['audioTranscription', 'buildingPrompt', 'chatVoice'],

            // Live voice flow (cyclic)
            ['wsConnecting', 'wsConnected', 'liveVoice'],
            ['wsConnected', 'liveListening', 'liveVoice'],
            ['liveListening', 'liveStreaming', 'liveVoice'],
            ['liveStreaming', 'wsConnected', 'liveVoice'],
            ['wsConnected', 'liveReceiving', 'liveVoice'],
            ['liveReceiving', 'liveSpeaking', 'liveVoice'],
            ['liveSpeaking', 'wsConnected', 'liveVoice'],

            // File analysis flow
            ['fileUploading', 'fileAnalyzing', 'fileAnalysis'],
            ['fileAnalyzing', 'mergingContent', 'fileAnalysis'],
            ['mergingContent', 'categorizingItems', 'fileAnalysis'],
            ['categorizingItems', 'savingToLesson', 'fileAnalysis'],
            ['savingToLesson', 'complete', 'fileAnalysis'],

            // Quiz flow
            ['generatingQuiz', 'showingQuiz', 'quiz'],
            ['showingQuiz', 'checkingAnswer', 'quiz'],
            ['checkingAnswer', 'complete', 'quiz']
        ];

        // Draw a node
        const renderNode = (nodeId, node) => {
            const isActive = currentNode === nodeId;
            const isInActiveFlow = node.flow === activeFlow || !node.flow;
            const recentInfo = recentNodes[nodeId];
            const isRecent = !isActive && recentInfo;
            const color = node.flow ? flowColors[node.flow] : '#64748b';

            // Determine fill color based on active/recent/flow state
            let fillColor = '#f1f5f9'; // default
            let strokeColor = '#cbd5e1'; // default
            let strokeWidth = 1.5;

            if (isActive) {
                fillColor = color;
                strokeColor = color;
                strokeWidth = 3;
            } else if (isRecent) {
                // Recently active node - show with fading effect
                const recentColor = recentInfo.flowType ? flowColors[recentInfo.flowType] : color;
                fillColor = `${recentColor}${Math.round(recentInfo.opacity * 60).toString(16).padStart(2, '0')}`;
                strokeColor = recentColor;
                strokeWidth = 2;
            } else if (isInActiveFlow && isRunning) {
                fillColor = `${color}40`;
                strokeColor = color;
            }

            return (
                <g key={nodeId} transform={`translate(${node.x - 50}, ${node.y - 18})`}>
                    {/* Glow effect for active - using custom CSS animation for stability */}
                    {isActive && (
                        <ellipse cx="50" cy="18" rx="55" ry="22"
                            fill={color}
                            className="flow-active-glow"
                        />
                    )}

                    {/* Trail glow for recently active */}
                    {isRecent && (
                        <ellipse cx="50" cy="18" rx="52" ry="20"
                            fill={flowColors[recentInfo.flowType] || color}
                            opacity={recentInfo.opacity * 0.2}
                        />
                    )}

                    {/* Node shape */}
                    <rect x="0" y="0" width="100" height="36" rx="8"
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        className="transition-all duration-300"
                    />

                    {/* Icon and label */}
                    <text x="20" y="24" fontSize="14" textAnchor="middle">{node.icon}</text>
                    <text x="60" y="24" fontSize="10" fill={isActive || isRecent ? '#1e293b' : '#64748b'}
                          textAnchor="middle" fontWeight={isActive ? 'bold' : 'normal'}
                          style={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                        {node.label}
                    </text>

                    {/* Active indicator - ring animation + pulsing dot */}
                    {isActive && (
                        <>
                            <circle cx="95" cy="5" r="5" fill="#22c55e" className="flow-active-ring" />
                            <circle cx="95" cy="5" r="5" fill="#22c55e" className="flow-active-dot" />
                        </>
                    )}

                    {/* Recent indicator - smaller, fading */}
                    {isRecent && (
                        <circle cx="95" cy="5" r="4"
                            fill={flowColors[recentInfo.flowType] || '#22c55e'}
                            opacity={recentInfo.opacity}
                        />
                    )}
                </g>
            );
        };

        // Draw a connection
        const renderConnection = ([fromId, toId, flowType], idx) => {
            const from = nodes[fromId];
            const to = nodes[toId];
            if (!from || !to) return null;

            const color = flowColors[flowType] || '#94a3b8';
            const isActiveConn = activeFlow === flowType && isRunning &&
                (currentNode === fromId || currentNode === toId);

            // Check if this connection was recently active
            const fromRecent = recentNodes[fromId];
            const toRecent = recentNodes[toId];
            const isRecentConn = !isActiveConn && (
                (fromRecent && fromRecent.flowType === flowType) ||
                (toRecent && toRecent.flowType === flowType)
            );
            const recentOpacity = isRecentConn ? Math.max(fromRecent?.opacity || 0, toRecent?.opacity || 0) : 0;

            // Calculate path
            const x1 = from.x;
            const y1 = from.y + 18;
            const x2 = to.x;
            const y2 = to.y - 18;

            let pathD;
            if (Math.abs(x1 - x2) < 10) {
                // Vertical line
                pathD = `M${x1},${y1} L${x2},${y2}`;
            } else {
                // Curved line
                const midY = (y1 + y2) / 2;
                pathD = `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`;
            }

            return (
                <g key={idx}>
                    <path d={pathD} fill="none" stroke="#e2e8f0" strokeWidth="2" />
                    {/* Recent connection trail */}
                    {isRecentConn && (
                        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5"
                              opacity={recentOpacity * 0.7}
                        />
                    )}
                    {/* Active connection with animation */}
                    {isActiveConn && (
                        <path d={pathD} fill="none" stroke={color} strokeWidth="3"
                              strokeDasharray="8,4"
                              style={{ animation: 'flowDash 1s linear infinite' }}
                        />
                    )}
                    {/* Arrow */}
                    <circle cx={x2} cy={y2 - 3} r="3"
                        fill={isActiveConn ? color : (isRecentConn ? color : '#cbd5e1')}
                        opacity={isActiveConn ? 1 : (isRecentConn ? recentOpacity : 1)}
                    />
                </g>
            );
        };

        return (
            <div className="bg-white rounded-xl border-2 border-slate-200 p-4 overflow-x-auto">
                <svg width={svgWidth} height={svgHeight} className="mx-auto" style={{ minWidth: svgWidth }}>
                    {/* Background grid */}
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Flow labels */}
                    <text x="80" y="85" fontSize="12" fill={flowColors.chat} fontWeight="bold" textAnchor="middle">چت متنی</text>
                    <text x="240" y="85" fontSize="12" fill={flowColors.chatVoice} fontWeight="bold" textAnchor="middle">چت صوتی</text>
                    <text x="400" y="85" fontSize="12" fill={flowColors.liveVoice} fontWeight="bold" textAnchor="middle">تماس زنده</text>
                    <text x="560" y="85" fontSize="12" fill={flowColors.fileAnalysis} fontWeight="bold" textAnchor="middle">تحلیل فایل</text>
                    <text x="720" y="85" fontSize="12" fill={flowColors.quiz} fontWeight="bold" textAnchor="middle">آزمون</text>

                    {/* Connections */}
                    {connections.map((conn, idx) => renderConnection(conn, idx))}

                    {/* Nodes */}
                    {Object.entries(nodes).map(([id, node]) => renderNode(id, node))}
                </svg>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header with current status */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <Activity size={28} className="animate-pulse" />
                            فلوچارت یکپارچه جریان الگوریتم
                        </h3>
                        <p className="text-indigo-100 mt-1 text-sm">
                            مشاهده زنده تمام عملیات‌ها در یک نمودار
                        </p>
                    </div>
                    <button onClick={clearHistory}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold">
                        پاک کردن تاریخچه
                    </button>
                </div>

                {/* Live status */}
                <div className="mt-4 flex flex-wrap gap-3">
                    <div className={`px-4 py-2 rounded-xl flex items-center gap-3 ${
                        isRunning ? 'bg-green-500/30 border-2 border-green-400' : 'bg-white/15'
                    }`}>
                        <span className="text-sm opacity-80">وضعیت:</span>
                        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                            {isRunning && (
                                <span className="w-3 h-3 rounded-full flow-active-dot"
                                      style={{ backgroundColor: flowColors[activeFlow] || '#22c55e' }}></span>
                            )}
                            <span className="text-xl">{FLOW_NODES[currentNode]?.icon || '⏸️'}</span>
                            <span className="font-bold">{FLOW_NODES[currentNode]?.label || 'آماده'}</span>
                        </div>
                    </div>
                    {isRunning && (
                        <div className="px-4 py-2 rounded-xl flex items-center gap-3 border-2"
                             style={{ backgroundColor: `${flowColors[activeFlow]}30`, borderColor: flowColors[activeFlow] }}>
                            <span className="w-3 h-3 rounded-full flow-active-dot"
                                  style={{ backgroundColor: flowColors[activeFlow] }}></span>
                            <span className="font-bold">{flowTitles[activeFlow]}</span>
                            <span className="text-xs opacity-70">در حال پردازش...</span>
                        </div>
                    )}
                    {/* Show recent nodes count */}
                    {Object.keys(recentNodes).length > 0 && (
                        <div className="px-4 py-2 bg-white/10 rounded-xl flex items-center gap-3">
                            <span className="text-sm opacity-80">نودهای اخیر:</span>
                            <div className="flex gap-1">
                                {Object.entries(recentNodes).slice(0, 5).map(([nodeId, info]) => (
                                    <span key={nodeId} className="text-lg" style={{ opacity: info.opacity }}>
                                        {FLOW_NODES[nodeId]?.icon || '?'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Unified Flowchart */}
            <UnifiedFlowchart />

            {/* Activity log */}
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold flex items-center gap-2">
                        <Circle size={12} className="text-green-400 animate-pulse" />
                        تاریخچه فعالیت
                    </h4>
                    <select value={selectedFlow} onChange={e => setSelectedFlow(e.target.value)}
                        className="bg-slate-800 text-white text-sm px-3 py-1 rounded border border-slate-700">
                        <option value="all">همه</option>
                        {Object.entries(flowTitles).map(([key, title]) => (
                            <option key={key} value={key}>{title}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-sm">
                    {recentActivity.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">هنوز فعالیتی ثبت نشده</p>
                    ) : (
                        recentActivity.map((entry, idx) => {
                            const node = FLOW_NODES[entry.nodeId];
                            const time = new Date(entry.timestamp).toLocaleTimeString('fa-IR');
                            const color = flowColors[entry.flowType];
                            const title = flowTitles[entry.flowType];

                            return (
                                <div
                                    key={`${entry.timestamp}-${idx}`}
                                    className="flex items-center gap-3 py-2 px-3 bg-slate-800/50 rounded-lg"
                                >
                                    <span className="text-slate-500 text-xs">{time}</span>
                                    <span className="text-lg">{node?.icon || '?'}</span>
                                    <span className="flex-1 text-sm">{node?.label || entry.nodeId}</span>
                                    {color && title && (
                                        <span
                                            className="text-xs px-2 py-0.5 rounded"
                                            style={{ backgroundColor: `${color}30`, color: color }}
                                        >
                                            {title}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Legend */}
            <Card title="🔑 راهنمای رنگ‌ها">
                <div className="flex flex-wrap gap-4">
                    {Object.entries(flowTitles).map(([key, title]) => (
                        <div key={key} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: flowColors[key] }} />
                            <span className="text-sm text-slate-600">{title}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* CSS for animations */}
            <style>{`
                @keyframes flowDash {
                    0% { stroke-dashoffset: 24; }
                    100% { stroke-dashoffset: 0; }
                }
                @keyframes activeGlow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.05); }
                }
                @keyframes activeRing {
                    0% { r: 5; opacity: 1; }
                    100% { r: 15; opacity: 0; }
                }
                @keyframes activePulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                .flow-active-glow {
                    animation: activeGlow 1.5s ease-in-out infinite;
                    transform-origin: center;
                    will-change: opacity, transform;
                }
                .flow-active-ring {
                    animation: activeRing 1.2s ease-out infinite;
                    will-change: r, opacity;
                }
                .flow-active-dot {
                    animation: activePulse 0.8s ease-in-out infinite;
                    will-change: opacity;
                }
            `}</style>
        </div>
    );
}

function CustomVoiceCreator({ customVoices, setCustomVoices, setModalConfig }) {
    const [name, setName] = useState('');
    const [gender, setGender] = useState('male');
    const [age, setAge] = useState('adult');
    const [file, setFile] = useState(null);
    const [editingVoice, setEditingVoice] = useState(null);
    const [editingName, setEditingName] = useState('');

    const handleAddVoice = () => {
        if (!name.trim() || !file) {
            setModalConfig({ title: "خطا", message: "لطفاً نام و فایل صوتی را مشخص کنید." });
            return;
        }
        const newVoice = { id: Date.now(), name: name, apiKey: gender === 'male' ? 'Puck' : 'Kore' };
        setCustomVoices(prev => [...prev, newVoice]);
        setName('');
        setFile(null);
    };

    const handleDeleteVoice = (id) => setCustomVoices(prev => prev.filter(v => v.id !== id));
    const handleEditVoiceClick = (voice) => { setEditingVoice(voice); setEditingName(voice.name); };
    const handleSaveEdit = () => {
        if (editingName.trim() && editingVoice) {
            setCustomVoices(prev => prev.map(v => v.id === editingVoice.id ? { ...v, name: editingName.trim() } : v));
        }
        setEditingVoice(null); setEditingName('');
    };
    const handleCloseEditModal = () => { setEditingVoice(null); setEditingName(''); };
    
    useEffect(() => {
        if (editingVoice) {
            setModalConfig({
                title: "ویرایش نام صدا",
                children: (
                    <div>
                        <label className="block font-bold mb-1">نام جدید:</label>
                        <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} className="w-full p-2 border rounded-lg" autoFocus />
                    </div>
                ),
                buttons: [
                    { label: "انصراف", onClick: handleCloseEditModal, className: "bg-slate-200" },
                    { label: "ذخیره", onClick: handleSaveEdit, className: "bg-teal-500 text-white" }
                ]
            });
        } else {
            setModalConfig(null);
        }
    }, [editingVoice, editingName]);

    return (
        <div className="space-y-3">
            <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
                 <h3 className="font-bold text-slate-700">افزودن صدای جدید</h3>
                <input type="text" placeholder="نام صدا (مثال: علی)" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded"/>
                <div className="flex gap-2">
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full p-2 border rounded"><option value="male">مرد</option><option value="female">زن</option></select>
                     <select value={age} onChange={e => setAge(e.target.value)} className="w-full p-2 border rounded"><option value="young">جوان</option><option value="adult">بزرگسال</option><option value="senior">سالمند</option></select>
                </div>
                <input type="file" onChange={e => setFile(e.target.files[0])} accept="audio/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                <button onClick={handleAddVoice} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 font-bold">افزودن صدا</button>
            </div>
            {customVoices.length > 0 && (
                <div className="pt-2">
                    <h4 className="font-bold mb-2 text-slate-700">صداهای شما:</h4>
                    <ul className="space-y-2">
                        {customVoices.map(voice => (
                            <li key={voice.id} className="flex justify-between items-center bg-slate-100 p-2 rounded-lg">
                                <span>{voice.name}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditVoiceClick(voice)} className="text-blue-600 hover:text-blue-800"><Edit size={16}/></button>
                                    <button onClick={() => handleDeleteVoice(voice.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16}/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function Dashboard({ stats, navigateTo, lessons, addLesson, addJournalEntry, knowledgeBase, updateKnowledgeBase, saveChatHistory, chatHistories, setModalConfig, data, setData, addPronunciationCorrection }) {
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const handleAddLesson = () => {
    if (newLessonTitle.trim()) {
      addLesson(newLessonTitle.trim());
      setNewLessonTitle('');
    }
  };
  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-slate-800">داشبورد شما</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="دروس تکمیل شده" value={stats.lessonsCompleted} icon={<BookOpen className="text-blue-500"/>} />
        <StatCard title="لغات آموخته شده" value={knowledgeBase.vocabulary.length} icon={<MessageSquare className="text-green-500"/>}/>
        <StatCard title="زمان مطالعه (دقیقه)" value={stats.studyTime} icon={<Clock className="text-yellow-500"/>}/>
        <StatCard title="نکات گرامری" value={knowledgeBase.grammar.length} icon={<CheckCircle className="text-red-500"/>}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card title="مرکز دانش شما">
             <KnowledgeBase knowledgeBase={knowledgeBase} />
           </Card>
          <Card title="شروع کنید">
            <h3 className="text-lg font-bold mb-4 text-slate-700">ایجاد درس جدید</h3>
            <div className="flex gap-2">
              <input type="text" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} placeholder="مثال: مکالمه در رستوران" className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition" />
              <button onClick={handleAddLesson} className="bg-teal-500 text-white px-5 py-3 rounded-xl hover:bg-teal-600 flex items-center gap-2 font-bold transition-transform hover:scale-105 flex-shrink-0 whitespace-nowrap"><Plus size={20} /> ایجاد</button>
            </div>
            <h3 className="text-lg font-bold mt-8 mb-4 text-slate-700">آخرین دروس</h3>
            <ul className="space-y-3">{lessons.slice(-3).reverse().map(lesson => (<li key={lesson.id} className="p-4 bg-slate-50 rounded-xl hover:bg-teal-50 cursor-pointer transition-colors" onClick={() => navigateTo('lesson', lesson)}>{lesson.title}</li>))}</ul>
          </Card>
        </div>
        <div><Card title="✨ تمرین با استاد هوش مصنوعی"><ChatInterface data={data} setData={setData} context="global" addJournalEntry={addJournalEntry} updateKnowledgeBase={updateKnowledgeBase} knowledgeBase={knowledgeBase} saveChatHistory={saveChatHistory} initialHistory={chatHistories.global} setModalConfig={setModalConfig} addPronunciationCorrection={addPronunciationCorrection} /></Card></div>
      </div>
    </div>
  );
}

function LessonList({ lessons, navigateTo, deleteLesson, editLesson, addLesson }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [filterBy, setFilterBy] = useState('all'); // all, withContent, empty
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddLesson = () => {
        if (newLessonTitle.trim()) {
            addLesson(newLessonTitle.trim());
            setNewLessonTitle('');
            setShowAddForm(false);
        }
    };

    const filteredAndSortedLessons = useMemo(() => {
        return lessons
            .filter(lesson => {
                // Text search
                const matchesSearch =
                    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    lesson.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (lesson.archivedNotes || '').toLowerCase().includes(searchTerm.toLowerCase());

                // Filter by content status
                const hasContent = lesson.archivedNotes && lesson.archivedNotes.trim().length > 50;
                const matchesFilter =
                    filterBy === 'all' ||
                    (filterBy === 'withContent' && hasContent) ||
                    (filterBy === 'empty' && !hasContent);

                return matchesSearch && matchesFilter;
            })
            .sort((a, b) => {
                if (sortOrder === 'newest') return b.id - a.id;
                if (sortOrder === 'oldest') return a.id - b.id;
                if (sortOrder === 'title') return a.title.localeCompare(b.title);
                if (sortOrder === 'progress') {
                    const pA = (a.progress?.learnedItems || 0) + (a.progress?.quizzesTaken || 0);
                    const pB = (b.progress?.learnedItems || 0) + (b.progress?.quizzesTaken || 0);
                    return pB - pA;
                }
                return 0;
            });
    }, [lessons, searchTerm, sortOrder, filterBy]);

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Fixed Header */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">📚 لیست دروس ({lessons.length} درس)</h2>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all"
                    >
                        <Plus size={20} />
                        درس جدید
                    </button>
                </div>

                {/* Add New Lesson Form */}
                {showAddForm && (
                    <div className="bg-white/20 p-4 rounded-xl mb-4 border border-teal-400">
                        <h3 className="font-bold mb-3">➕ ایجاد درس جدید</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
                                placeholder="مثال: مکالمه در رستوران..."
                                className="flex-1 p-3 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-white focus:outline-none"
                                autoFocus
                            />
                            <button
                                onClick={handleAddLesson}
                                disabled={!newLessonTitle.trim()}
                                className="bg-white text-teal-600 px-5 py-3 rounded-lg hover:bg-teal-50 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Plus size={18} />
                                ایجاد
                            </button>
                            <button
                                onClick={() => { setShowAddForm(false); setNewLessonTitle(''); }}
                                className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-lg transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="relative">
                        <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-200"/>
                        <input
                            type="text"
                            placeholder="جستجو در دروس..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 rounded-lg bg-white/20 text-white placeholder-teal-200 border border-teal-400 focus:bg-white/30 focus:outline-none"
                        />
                    </div>
                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value)}
                        className="p-2 rounded-lg bg-white/20 text-white border border-teal-400 focus:outline-none"
                    >
                        <option value="newest" className="text-slate-800">جدیدترین</option>
                        <option value="oldest" className="text-slate-800">قدیمی‌ترین</option>
                        <option value="title" className="text-slate-800">بر اساس عنوان</option>
                        <option value="progress" className="text-slate-800">بیشترین پیشرفت</option>
                    </select>
                    <select
                        value={filterBy}
                        onChange={e => setFilterBy(e.target.value)}
                        className="p-2 rounded-lg bg-white/20 text-white border border-teal-400 focus:outline-none"
                    >
                        <option value="all" className="text-slate-800">همه دروس</option>
                        <option value="withContent" className="text-slate-800">دارای محتوا</option>
                        <option value="empty" className="text-slate-800">بدون محتوا</option>
                    </select>
                </div>
            </div>

            {/* Scrollable Lessons List */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto p-4">
                <div className="space-y-4">
                    {filteredAndSortedLessons.length > 0 ? (
                        filteredAndSortedLessons.map(lesson => (
                            <LessonListItem
                                key={lesson.id}
                                lesson={lesson}
                                navigateTo={navigateTo}
                                deleteLesson={deleteLesson}
                                editLesson={editLesson}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-400 text-lg">درسی یافت نشد</p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-2 text-teal-500 hover:underline"
                                >
                                    پاک کردن جستجو
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Footer with count */}
            <div className="bg-slate-50 px-4 py-2 border-t text-sm text-slate-500 text-center">
                نمایش {filteredAndSortedLessons.length} از {lessons.length} درس
            </div>
        </div>
    );
}

function LessonListItem({ lesson, navigateTo, deleteLesson, editLesson }) {
    const [editingLesson, setEditingLesson] = useState(null);
    const handleEditClick = (e, lesson) => { e.stopPropagation(); setEditingLesson(lesson); };
    const handleSave = (id, newTitle, newSummary) => { editLesson(id, newTitle, newSummary); setEditingLesson(null); };

    // Calculate progress percentage
    const progress = lesson.progress || { totalItems: 0, learnedItems: 0, quizzesTaken: 0, correctAnswers: 0, chatPracticeCount: 0 };
    const hasContent = lesson.archivedNotes && lesson.archivedNotes.trim().length > 0;

    // Progress calculation based on ACTUAL learning, not just content
    // Content alone = 0%, progress comes from real learning activity
    let progressPercent = 0;

    // Only show progress if there's actual learning activity
    const hasLearningActivity = progress.learnedItems > 0 || progress.quizzesTaken > 0 ||
        progress.chatPracticeCount > 0 || (progress.correctResponses || 0) > 0;

    if (hasLearningActivity) {
        // Items learned from quizzes (40% max)
        const itemProgress = progress.totalItems > 0
            ? Math.min((progress.learnedItems / progress.totalItems) * 40, 40)
            : 0;

        // Quiz performance (30% max)
        const quizProgress = progress.quizzesTaken > 0
            ? Math.min(((progress.correctAnswers || 0) / Math.max(progress.quizzesTaken * 5, 1)) * 30, 30)
            : 0;

        // Chat practice (30% max) - based on practice + correct responses in chat
        const chatBaseProgress = Math.min(progress.chatPracticeCount * 5, 15);
        const correctResponseBonus = Math.min((progress.correctResponses || 0) * 3, 15);
        const chatProgress = chatBaseProgress + correctResponseBonus;

        progressPercent = itemProgress + quizProgress + chatProgress;
    }

    progressPercent = Math.min(Math.round(progressPercent), 100);

    // Progress bar color based on percentage
    const getProgressColor = (percent) => {
        if (percent < 25) return 'bg-red-400';
        if (percent < 50) return 'bg-orange-400';
        if (percent < 75) return 'bg-yellow-400';
        return 'bg-green-500';
    };

    return (
        <>
            {editingLesson && <EditLessonModal lesson={editingLesson} onSave={handleSave} onClose={() => setEditingLesson(null)} />}
            <div onClick={() => navigateTo('lesson', lesson)} className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-lg hover:border-teal-500 transition-all duration-200 cursor-pointer">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-teal-600">{lesson.title}</h3>
                        <p className="text-slate-600 mt-2">{lesson.summary}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={(e) => handleEditClick(e, lesson)} className="p-2 hover:bg-slate-200 rounded-full"><Edit size={18}/></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id); }} className="p-2 hover:bg-red-100 rounded-full text-red-600"><Trash2 size={18}/></button>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">پیشرفت یادگیری</span>
                        <span className="text-xs font-bold text-slate-600">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(progressPercent)}`}
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                    {progress.totalItems > 0 && (
                        <div className="flex gap-3 mt-2 text-xs text-slate-500">
                            <span>📚 {progress.learnedItems}/{progress.totalItems} مورد</span>
                            {progress.quizzesTaken > 0 && <span>📝 {progress.quizzesTaken} آزمون</span>}
                            {progress.chatPracticeCount > 0 && <span>💬 {progress.chatPracticeCount} تمرین</span>}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function LessonDetail({ lesson, addJournalEntry, updateLesson, updateKnowledgeBase, saveChatHistory, chatHistories, setModalConfig, knowledgeBase, data, setData, addPronunciationCorrection }) {
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [analyzedContent, setAnalyzedContent] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Store actual files for upload
  const [processingStatus, setProcessingStatus] = useState(''); // Show progress messages
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(lesson.archivedNotes || '');

  // Flow tracking
  const { setCurrentNode } = useExecutionFlow();

  // Debug: Check if context is working
  useEffect(() => {
    console.log('📍 LessonDetail mounted, setCurrentNode:', typeof setCurrentNode);
  }, [setCurrentNode]);

  // Sync editedNotes when lesson changes
  useEffect(() => {
    setEditedNotes(lesson.archivedNotes || '');
    setIsEditingNotes(false);
  }, [lesson.id]);

  // Load pending analysis if exists (persisted when user navigated away)
  useEffect(() => {
    if (lesson.pendingAnalysis && !analyzedContent) {
      setAnalyzedContent(lesson.pendingAnalysis);
      const timeSince = lesson.pendingAnalysisTime ? Math.round((Date.now() - lesson.pendingAnalysisTime) / 60000) : 0;
      setModalConfig({
        title: "تحلیل در انتظار",
        message: `یک تحلیل ${timeSince > 0 ? `از ${timeSince} دقیقه پیش` : ''} در انتظار تأیید شماست. می‌توانید آن را به درس اضافه کنید یا رد کنید.`
      });
    }
  }, [lesson.id, lesson.pendingAnalysis]);

  const handleSaveNotes = () => {
    updateLesson(lesson.id, { archivedNotes: editedNotes });
    setIsEditingNotes(false);
    addJournalEntry(`نکات درس "${lesson.title}" ویرایش شد.`);
    setModalConfig({ title: "ذخیره شد", message: "نکات درس با موفقیت ذخیره شد." });
  };

  const handleCancelEdit = () => {
    setEditedNotes(lesson.archivedNotes || '');
    setIsEditingNotes(false);
  };

  const handleFileChange = (event) => {
      const newFiles = Array.from(event.target.files);
      // Store actual File objects for upload
      setUploadedFiles(prev => [...prev, ...newFiles]);
      // Also update lesson metadata for display
      const fileMetadata = newFiles.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size
      }));
      updateLesson(lesson.id, { files: [...(lesson.files || []), ...fileMetadata] });
  };

  const removeFile = (fileId) => {
      updateLesson(lesson.id, { files: (lesson.files || []).filter(f => f.id !== fileId) });
      // Also remove from uploadedFiles by name match
      const fileToRemove = (lesson.files || []).find(f => f.id === fileId);
      if (fileToRemove) {
        setUploadedFiles(prev => prev.filter(f => f.name !== fileToRemove.name));
      }
  };
  
  const addAnalyzedContentToLesson = async () => {
      if (!analyzedContent) return;
      setIsProcessing(true);
      setCurrentNode('mergingContent', 'fileAnalysis');

      let mergedNotes = analyzedContent;
      const customPrompts = data.customPrompts || {};
      if (lesson.archivedNotes && lesson.archivedNotes.trim().length > 0) {
          const mergeSystemPrompt = getPrompt(customPrompts, 'mergeSystem');
          const systemPrompt = `${mergeSystemPrompt}

📋 ساختار خروجی نهایی:

---
## 📚 لغات و واژگان
| کلمه لبنانی | تلفظ | معنی فارسی | مثال |
|------------|------|-----------|------|
| [کلمه] | [تلفظ] | [معنی] | [مثال در جمله] |

## 💬 عبارات و اصطلاحات
- **[عبارت لبنانی]** → [معنی فارسی]
  - 💡 کاربرد: [توضیح]

## 📝 نکات گرامری
### 🔹 [عنوان نکته]
- توضیح: [توضیح کامل]
- مثال: [مثال]

## ✏️ تصحیحات رایج
- ✅ [جمله صحیح لبنانی] ~~❌ [جمله غلط/فصیح]~~

## 📌 نکات فرهنگی و مهم
- [نکته]
---

📁 **جزوه قبلی (همه محتوا باید حفظ شود):**
${lesson.archivedNotes}

📥 **محتوای جدید برای افزودن:**
${analyzedContent}

⚡ زبان: فارسی (با عبارات عربی در جدول‌ها).`;
          try {
              mergedNotes = await callGeminiAPI({ contents: [{ parts: [{ text: " " }] }], systemInstruction: { parts: [{ text: systemPrompt }] } });
          } catch (error) {
              console.error("Failed to merge notes:", error);
              mergedNotes = lesson.archivedNotes + "\n\n---\n## 📥 محتوای جدید\n---\n\n" + analyzedContent;
              setModalConfig({ title: "خطای ادغام", message: "ادغام هوشمند ناموفق بود. محتوای جدید به انتهای نکات اضافه شد." });
          }
      }
      
      updateLesson(lesson.id, { archivedNotes: mergedNotes });
      addJournalEntry(`نکات درس "${lesson.title}" به‌روزرسانی شد.`);

      // Categorize items for knowledge base
      setCurrentNode('categorizingItems', 'fileAnalysis');
      const categorizationPrompt = `از متن زیر که جزوه درس عربی لبنانی است، موارد را استخراج و دسته‌بندی کن.

دسته‌بندی‌ها:
- vocabulary: لغات (term: کلمه عربی, definition: معنی فارسی)
- grammar: نکات گرامری (term: عنوان قاعده, definition: توضیح)
- phrases: عبارات کاربردی (term: عبارت عربی, definition: معنی فارسی)
- verbs: افعال (term: فعل عربی, definition: معنی و صرف)
- pronouns: ضمایر (term: ضمیر, definition: معنی و کاربرد)
- adjectives: صفات (term: صفت عربی, definition: معنی فارسی)

فقط موارد صحیح و تصحیح‌شده را استخراج کن (موارد غلط را نادیده بگیر).
متن: ${mergedNotes}`;

      const schema = {
        type: "OBJECT",
        properties: {
          vocabulary: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } }, required: ["term", "definition"] } },
          grammar: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } }, required: ["term", "definition"] } },
          phrases: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } }, required: ["term", "definition"] } },
          verbs: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } }, required: ["term", "definition"] } },
          pronouns: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } }, required: ["term", "definition"] } },
          adjectives: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } }, required: ["term", "definition"] } }
        },
        required: ["vocabulary", "grammar", "phrases", "verbs", "pronouns", "adjectives"]
      };

      const payload = {
        contents: [{ parts: [{ text: categorizationPrompt }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: schema }
      };

      try {
          const response = await callGeminiAPI(payload);
          let categorizedItems;

          // Handle both string and object responses
          if (typeof response === 'string') {
            // Try to extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              categorizedItems = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('No valid JSON found in response');
            }
          } else {
            categorizedItems = response;
          }

          let itemsAdded = 0;
          const validCategories = ['vocabulary', 'grammar', 'phrases', 'verbs', 'pronouns', 'adjectives'];

          setCurrentNode('savingToLesson', 'fileAnalysis');
          for (const category of validCategories) {
            const items = categorizedItems[category];
            if (items && Array.isArray(items)) {
              for (const item of items) {
                if (item.term && item.definition && item.term.trim() && item.definition.trim()) {
                  updateKnowledgeBase(category, {
                    term: item.term.trim(),
                    definition: item.definition.trim(),
                    source: `درس: ${lesson.title}`,
                    learned: false,
                    correctCount: 0,
                    incorrectCount: 0
                  });
                  itemsAdded++;
                }
              }
            }
          }

          if (itemsAdded > 0) {
            // Update lesson progress with total items
            const currentProgress = lesson.progress || { totalItems: 0, learnedItems: 0, quizzesTaken: 0, correctAnswers: 0, chatPracticeCount: 0 };
            updateLesson(lesson.id, {
              progress: {
                ...currentProgress,
                totalItems: currentProgress.totalItems + itemsAdded
              }
            });
            setCurrentNode('complete', 'fileAnalysis');
            setModalConfig({ title: "موفقیت", message: `${itemsAdded} مورد با موفقیت به مرکز دانش اضافه شد.` });
          } else {
            setCurrentNode('complete', 'fileAnalysis');
            setModalConfig({ title: "توجه", message: "موردی برای افزودن به مرکز دانش یافت نشد. محتوا ذخیره شد." });
          }
      } catch (e) {
          console.error("Failed to auto-categorize:", e);
          setCurrentNode('error', 'fileAnalysis');
          // Still save the notes even if categorization fails
          setModalConfig({ title: "توجه", message: "نکات ذخیره شد. دسته‌بندی خودکار موفق نبود، اما می‌توانید از طریق چت با استاد هوش مصنوعی موارد را یاد بگیرید." });
      }

      // Clear both local state and persisted pending analysis
      setAnalyzedContent(null);
      setPastedText('');
      setIsProcessing(false);
      updateLesson(lesson.id, { pendingAnalysis: null, pendingAnalysisTime: null });
      setTimeout(() => setCurrentNode('idle'), 1500);
  };

  const handleAnalysis = async () => {
    console.log('📤 handleAnalysis started');
    const userInstructions = pastedText.trim();
    const hasFiles = uploadedFiles.length > 0;
    const hasText = userInstructions.length > 0;

    if (!hasFiles && !hasText) {
        setModalConfig({ title: "محتوا خالی است", message: "لطفاً متنی را پیست کنید یا فایلی را برای تحلیل پیوست نمایید." });
        return;
    }

    setIsProcessing(true);
    setAnalyzedContent(null);
    setProcessingStatus('در حال آماده‌سازی فایل‌ها...');
    console.log('📤 Calling setCurrentNode(fileUploading, fileAnalysis)');
    setCurrentNode('fileUploading', 'fileAnalysis');
    addJournalEntry(`پردازش محتوا برای درس "${lesson.title}" شروع شد.`);

    try {
      // Use new backend API for file analysis
      const formData = new FormData();

      // Add files to FormData
      for (const file of uploadedFiles) {
        formData.append('files', file);
        setProcessingStatus(`در حال آپلود ${file.name}...`);
      }

      // Add text content and instructions
      formData.append('textContent', userInstructions);
      formData.append('userInstructions', userInstructions);

      setProcessingStatus('در حال تحلیل محتوا (ممکن است چند دقیقه طول بکشد)...');
      setCurrentNode('fileAnalyzing', 'fileAnalysis');

      const response = await fetch('/api/analyze-files', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'خطا در تحلیل');
      }

      const result = await response.json();

      // IMPORTANT: Save analysis result to lesson immediately so it persists even if user navigates away
      updateLesson(lesson.id, {
        pendingAnalysis: result.analysis,
        pendingAnalysisTime: Date.now()
      });

      setAnalyzedContent(result.analysis);
      setCurrentNode('complete', 'fileAnalysis');

      // Store media items in lesson for embedding
      if (result.mediaItems && result.mediaItems.length > 0) {
        updateLesson(lesson.id, {
          mediaItems: [...(lesson.mediaItems || []), ...result.mediaItems]
        });
      }

      setProcessingStatus('');
      setModalConfig({ title: "تحلیل کامل شد", message: `${result.processedFiles?.length || 0} فایل با موفقیت تحلیل شد. نتیجه در درس ذخیره شد.` });

    } catch (error) {
      console.error('Analysis error:', error);
      setCurrentNode('error', 'fileAnalysis');
      setModalConfig({ title: "خطای تحلیل", message: error.message || "خطا در تحلیل محتوا." });
      setProcessingStatus('');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setCurrentNode('idle'), 1500);
    }
  };

  const generateFlashcards = async () => {
      setIsGeneratingFlashcards(true);
      addJournalEntry(`ایجاد فلش‌کارت برای درس "${lesson.title}"`);
      const systemPrompt = `Create a JSON array of up to 5 flashcards from these notes. Each object must have 'term' (Lebanese Arabic) and 'definition' (Persian). Return ONLY the JSON array.`;
      const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } };
      const payload = { contents: [{ parts: [{ text: `Lesson Notes: ${lesson.archivedNotes}` }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json", responseSchema: schema } };
      try {
          const generatedCards = JSON.parse(await callGeminiAPI(payload));
          setFlashcards(generatedCards);
          generatedCards.forEach(card => updateKnowledgeBase('vocabulary', { term: card.term, definition: card.definition, source: `درس: ${lesson.title}` }));
      } catch (error) {
          setModalConfig({ title: "خطا", message: "خطا در ساخت فلش‌کارت." });
      } finally {
          setIsGeneratingFlashcards(false);
      }
  };
  
  const analysisButtonText = () => {
      if (isProcessing) return processingStatus || 'در حال پردازش...';
      if (uploadedFiles.length > 0) return `✨ تحلیل ${uploadedFiles.length} فایل${pastedText.trim() ? ' و متن' : ''}`;
      if (pastedText.trim()) return '✨ تحلیل و تصحیح متن';
      return 'تحلیل محتوا';
  };

  const formatFileSize = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type) => {
      if (type?.startsWith('audio/')) return '🎵';
      if (type?.startsWith('video/')) return '🎬';
      if (type?.startsWith('image/')) return '🖼️';
      if (type === 'application/pdf') return '📄';
      return '📎';
  };

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold mb-2 text-slate-800">{lesson.title}</h2>
      <div className="flex items-center gap-2 text-slate-600 mb-6"><p className="text-lg">{lesson.summary}</p><TTSButton textToSpeak={lesson.summary} /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card title="افزودن و تحلیل محتوا">
               <div className="p-6 border-dashed border-2 border-slate-300 rounded-xl text-center mb-4 hover:border-teal-500 transition-colors">
                   <input type="file" multiple onChange={handleFileChange} id="file-upload" className="hidden" accept="audio/*,video/*,image/*,.pdf,.txt,.json" />
                   <label htmlFor="file-upload" className="cursor-pointer">
                     <span className="text-teal-600 font-bold block">برای آپلود فایل کلیک کنید</span>
                     <span className="text-slate-500 text-sm block mt-1">صوت، ویدیو، تصویر، PDF، متن (تا 500MB)</span>
                   </label>
               </div>
               {(lesson.files || []).length > 0 && (
                 <ul className="mb-4 space-y-2">
                   {lesson.files.map(file => (
                     <li key={file.id} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                       <div className="flex items-center gap-2">
                         <span className="text-xl">{getFileIcon(file.type)}</span>
                         <div>
                           <span className="font-medium">{file.name}</span>
                           {file.size && <span className="text-slate-500 text-sm mr-2">({formatFileSize(file.size)})</span>}
                         </div>
                       </div>
                       <button onClick={() => removeFile(file.id)} className="p-1 hover:bg-red-100 rounded-full text-red-500" title="حذف فایل">
                         <Trash2 size={16}/>
                       </button>
                     </li>
                   ))}
                 </ul>
               )}
               <textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)} rows="4" className="w-full p-3 border rounded-xl mb-2" placeholder="متن/جزوه خود را برای تحلیل و تصحیح اینجا پیست کنید... (سیستم اشتباهات عربی لبنانی را تصحیح می‌کند)"></textarea>
               {processingStatus && <div className="text-center text-teal-600 mb-2 flex items-center justify-center gap-2"><Loader className="animate-spin" size={16}/>{processingStatus}</div>}
               <button onClick={handleAnalysis} disabled={isProcessing || (uploadedFiles.length === 0 && !pastedText.trim())} className="w-full bg-teal-500 text-white px-4 py-3 rounded-xl hover:bg-teal-600 disabled:bg-slate-400 flex items-center justify-center gap-2 font-bold"><Sparkles size={18} />{analysisButtonText()}</button>
           </Card>
            {analyzedContent && (
                <Card title="نتایج تحلیل">
                    <MarkdownRenderer text={analyzedContent} />
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setAnalyzedContent(null)} className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300">نادیده گرفتن</button>
                        <button onClick={addAnalyzedContentToLesson} disabled={isProcessing} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400">{isProcessing ? 'در حال پردازش...' : 'افزودن به نکات و مرکز دانش'}</button>
                    </div>
                </Card>
            )}
            <Card
                title="📝 نکات ذخیره شده درس"
                actionButton={
                    !isEditingNotes ? (
                        <button
                            onClick={() => setIsEditingNotes(true)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 flex items-center gap-2"
                        >
                            <Edit size={16}/> ویرایش
                        </button>
                    ) : null
                }
            >
                {isEditingNotes ? (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                            💡 نکته: می‌توانید از فرمت Markdown استفاده کنید (## برای عنوان، ** برای بولد، ~~ برای خط‌خورده)
                        </div>
                        <textarea
                            value={editedNotes}
                            onChange={(e) => setEditedNotes(e.target.value)}
                            className="w-full h-96 p-4 border-2 border-slate-300 rounded-xl font-mono text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                            placeholder="نکات درس را اینجا بنویسید..."
                            dir="rtl"
                        />
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 border-2 border-slate-300 rounded-lg hover:bg-slate-100 font-medium"
                            >
                                انصراف
                            </button>
                            <button
                                onClick={handleSaveNotes}
                                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium flex items-center gap-2"
                            >
                                <Check size={18}/> ذخیره تغییرات
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto p-4 border rounded-lg bg-slate-50">
                        {lesson.archivedNotes && lesson.archivedNotes.trim() ? (
                            <MarkdownRenderer text={lesson.archivedNotes} />
                        ) : (
                            <p className="text-slate-500 text-center py-4">هنوز نکته‌ای به این درس اضافه نشده است.</p>
                        )}
                    </div>
                )}
            </Card>
            {(lesson.mediaItems || []).length > 0 && (
              <Card title="رسانه‌های استخراج شده">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lesson.mediaItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3 bg-slate-50">
                      <p className="font-medium mb-2 text-sm text-slate-600">{item.name}</p>
                      {item.type === 'audio' && (
                        <audio controls className="w-full" src={`data:${item.mimeType};base64,${item.data}`}>
                          مرورگر شما از پخش صوت پشتیبانی نمی‌کند.
                        </audio>
                      )}
                      {item.type === 'video' && (
                        <video controls className="w-full rounded" src={`data:${item.mimeType};base64,${item.data}`}>
                          مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                        </video>
                      )}
                      {item.type === 'image' && (
                        <img src={`data:${item.mimeType};base64,${item.data}`} alt={item.name} className="w-full rounded" />
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          <Card title="فلش‌کارت‌های هوشمند" actionButton={<button onClick={generateFlashcards} disabled={isGeneratingFlashcards || !lesson.archivedNotes?.trim()} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 disabled:bg-slate-400 flex items-center gap-2"><Sparkles size={16}/>{isGeneratingFlashcards ? '...' : 'ایجاد فلش‌کارت'}</button>}>
            {isGeneratingFlashcards && <div className="text-center p-4"><Loader className="animate-spin inline-block" /></div>}
            {flashcards.length > 0 ? (<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{flashcards.map((card, index) => <Flashcard key={index} term={card.term} definition={card.definition} />)}</div>) : <p className="text-slate-500 text-center py-4">برای ایجاد فلش‌کارت، ابتدا باید نکاتی به درس اضافه کنید.</p>}
          </Card>
        </div>
        <div><Card title="✨ تمرین مکالمه"><ChatInterface data={data} setData={setData} context={`lesson-${lesson.id}`} lessonTitle={lesson.title} lessonNotes={lesson.archivedNotes} addJournalEntry={addJournalEntry} updateKnowledgeBase={updateKnowledgeBase} knowledgeBase={knowledgeBase} saveChatHistory={saveChatHistory} initialHistory={chatHistories[`lesson-${lesson.id}`] || []} setModalConfig={setModalConfig} addPronunciationCorrection={addPronunciationCorrection} /></Card></div>
      </div>
    </div>
  );
}

function QuizCenter({ lessons, addJournalEntry, setModalConfig, setData, data }) {
    const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id?.toString() || '');
    const [quiz, setQuiz] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [questionCount, setQuestionCount] = useState(5);
    const [timeLimit, setTimeLimit] = useState(0);
    const [difficulty, setDifficulty] = useState('medium');
    const [questionTypes, setQuestionTypes] = useState({
        mcq: true,
        fillInBlank: false,
        translateToPersian: false,
        translateToArabic: false,
        wordOrder: false,
        matching: false
    });
    const [timeLeft, setTimeLeft] = useState(0);
    const [matchingAnswers, setMatchingAnswers] = useState({});
    const timerRef = useRef(null);

    const difficultyLabels = {
        easy: { label: 'آسان', desc: 'لغات و عبارات ساده' },
        medium: { label: 'متوسط', desc: 'ترکیب لغات و گرامر' },
        hard: { label: 'سخت', desc: 'جملات پیچیده و اصطلاحات' }
    };

    const questionTypeLabels = {
        mcq: { label: 'چهارگزینه‌ای', icon: '📝' },
        fillInBlank: { label: 'جای خالی', icon: '✏️' },
        translateToPersian: { label: 'ترجمه به فارسی', icon: '🇮🇷' },
        translateToArabic: { label: 'ترجمه به عربی', icon: '🇱🇧' },
        wordOrder: { label: 'مرتب‌سازی کلمات', icon: '🔤' },
        matching: { label: 'تطبیق', icon: '🔗' }
    };

    useEffect(() => {
        if (timeLeft > 0 && !submitted) {
            timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0 && quiz && !submitted && timeLimit > 0) {
            handleSubmit();
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, quiz, submitted]);

    const generateQuiz = async () => {
        const selectedTypes = Object.entries(questionTypes).filter(([, val]) => val).map(([key]) => key);
        if (selectedTypes.length === 0) {
            setModalConfig({ title: "خطا", message: "لطفاً حداقل یک نوع سوال انتخاب کنید." });
            return;
        }

        setIsLoading(true); setQuiz(null); setUserAnswers({}); setMatchingAnswers({}); setSubmitted(false); clearTimeout(timerRef.current);

        const lessonId = parseInt(selectedLessonId);
        const lesson = lessons.find(l => l.id === lessonId);

        if (!lesson) {
            setModalConfig({ title: "خطا", message: "لطفاً یک درس انتخاب کنید." });
            setIsLoading(false); return;
        }

        if (!lesson.archivedNotes?.trim() || lesson.archivedNotes.length < 50) {
            setModalConfig({ title: "خطا", message: "محتوای این درس برای ساخت آزمون کافی نیست. حداقل باید چند لغت و عبارت در درس وجود داشته باشد." });
            setIsLoading(false); return;
        }

        addJournalEntry(`ایجاد آزمون ${difficultyLabels[difficulty].label} برای درس "${lesson.title}"`);

        const typeDescriptions = {
            mcq: 'سوال چهارگزینه‌ای با یک پاسخ صحیح',
            fillInBlank: 'جمله با جای خالی که باید کلمه صحیح نوشته شود',
            translateToPersian: 'ترجمه جمله عربی لبنانی به فارسی',
            translateToArabic: 'ترجمه جمله فارسی به عربی لبنانی',
            wordOrder: 'مرتب کردن کلمات برای ساختن جمله صحیح',
            matching: 'تطبیق کلمات عربی با معانی فارسی (5 جفت)'
        };

        const customPrompts = data?.customPrompts || {};
        const quizSystemPrompt = getPrompt(customPrompts, 'quizSystem');
        const quizInstructions = getPrompt(customPrompts, 'quizInstructions');

        const systemPrompt = `${quizSystemPrompt} بر اساس محتوای درس زیر، یک آزمون ${questionCount} سوالی بساز.

سطح سختی: ${difficultyLabels[difficulty].label} (${difficultyLabels[difficulty].desc})

انواع سوالات مورد نیاز:
${selectedTypes.map(t => `- ${t}: ${typeDescriptions[t]}`).join('\n')}

${quizInstructions}

قوانین مهم:
1. سوالات باید از محتوای درس باشند
2. هر سوال باید پاسخ مشخص داشته باشد
3. برای mcq دقیقاً 4 گزینه بده
4. برای matching دقیقاً 5 جفت کلمه-معنی بده
5. برای wordOrder کلمات را به صورت آرایه بده

فرمت JSON خروجی:
[
  {
    "type": "mcq",
    "question": "سوال به فارسی یا عربی",
    "options": ["گزینه1", "گزینه2", "گزینه3", "گزینه4"],
    "correctAnswer": "گزینه صحیح"
  },
  {
    "type": "fill_in_blank",
    "question": "جمله با ___ برای جای خالی",
    "correctAnswer": "کلمه صحیح"
  },
  {
    "type": "translate_to_persian",
    "question": "جمله عربی لبنانی",
    "correctAnswer": "ترجمه فارسی"
  },
  {
    "type": "translate_to_arabic",
    "question": "جمله فارسی",
    "correctAnswer": "ترجمه عربی لبنانی"
  },
  {
    "type": "word_order",
    "words": ["کلمه1", "کلمه2", "کلمه3"],
    "correctAnswer": "جمله صحیح مرتب شده"
  },
  {
    "type": "matching",
    "pairs": [
      {"arabic": "کلمه عربی", "persian": "معنی فارسی"},
      ...
    ]
  }
]

محتوای درس:
${lesson.archivedNotes}`;

        const schema = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    type: { type: "STRING" },
                    question: { type: "STRING" },
                    options: { type: "ARRAY", items: { type: "STRING" } },
                    correctAnswer: { type: "STRING" },
                    words: { type: "ARRAY", items: { type: "STRING" } },
                    pairs: { type: "ARRAY", items: { type: "OBJECT", properties: { arabic: { type: "STRING" }, persian: { type: "STRING" } } } }
                }
            }
        };

        const payload = {
            contents: [{ parts: [{ text: "آزمون بساز" }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json", responseSchema: schema }
        };

        try {
            const response = await callGeminiAPI(payload);
            let generatedQuiz;

            try {
                generatedQuiz = JSON.parse(response);
            } catch (parseError) {
                // Try to extract JSON from response
                const jsonMatch = response.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    generatedQuiz = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Invalid JSON response');
                }
            }

            if (!Array.isArray(generatedQuiz) || generatedQuiz.length === 0) {
                throw new Error('Empty quiz');
            }

            // Filter and validate questions
            const validQuiz = generatedQuiz.filter(q => {
                if (!q || !q.type) return false;
                if (q.type === 'matching') return q.pairs && q.pairs.length >= 3;
                if (q.type === 'word_order') return q.words && q.words.length >= 2 && q.correctAnswer;
                return q.question && q.correctAnswer;
            });

            if (validQuiz.length === 0) {
                throw new Error('No valid questions');
            }

            setQuiz(validQuiz);
            if (timeLimit > 0) setTimeLeft(timeLimit * 60);

        } catch (error) {
            console.error('Quiz generation error:', error);
            setModalConfig({ title: "خطا", message: "خطا در ساخت آزمون. لطفاً دوباره تلاش کنید یا محتوای بیشتری به درس اضافه کنید." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswer = (qIndex, answer) => setUserAnswers(prev => ({...prev, [qIndex]: answer}));

    const handleMatchingAnswer = (qIndex, arabicWord, persianWord) => {
        setMatchingAnswers(prev => ({
            ...prev,
            [qIndex]: { ...(prev[qIndex] || {}), [arabicWord]: persianWord }
        }));
    };

    const handleWordOrderDrag = (qIndex, newOrder) => {
        setUserAnswers(prev => ({...prev, [qIndex]: newOrder.join(' ')}));
    };

    const calculateScore = () => {
        if (!quiz) return { score: 0, total: 0 };
        let score = 0;

        quiz.forEach((q, i) => {
            if (q.type === 'matching') {
                const userMatch = matchingAnswers[i] || {};
                const correctPairs = q.pairs || [];
                correctPairs.forEach(pair => {
                    if (userMatch[pair.arabic] === pair.persian) score += 1 / correctPairs.length;
                });
            } else {
                const userAns = (userAnswers[i] || '').trim().toLowerCase();
                const correctAns = (q.correctAnswer || '').trim().toLowerCase();
                if (userAns === correctAns) score++;
            }
        });

        return { score: Math.round(score * 10) / 10, total: quiz.length };
    };

    const handleSubmit = () => {
        if(!quiz) return;
        setSubmitted(true);
        clearTimeout(timerRef.current);

        const { score, total } = calculateScore();
        const finalScore = (score / total) * 100;
        addJournalEntry(`آزمون با امتیاز ${finalScore.toFixed(0)}% به پایان رسید.`);

        // Update lesson progress
        const lessonId = parseInt(selectedLessonId);
        const lesson = lessons.find(l => l.id === lessonId);
        if (lesson) {
            const currentProgress = lesson.progress || { totalItems: 0, learnedItems: 0, quizzesTaken: 0, correctAnswers: 0, chatPracticeCount: 0 };
            setData(prev => ({
                ...prev,
                lessons: prev.lessons.map(l => l.id === lessonId ? {
                    ...l,
                    progress: {
                        ...currentProgress,
                        quizzesTaken: currentProgress.quizzesTaken + 1,
                        correctAnswers: currentProgress.correctAnswers + Math.round(score),
                        learnedItems: Math.min(
                            currentProgress.totalItems,
                            currentProgress.learnedItems + Math.round(score)
                        )
                    }
                } : l)
            }));
        }
    };

    const renderQuestion = (q, qIndex) => {
        const isCorrect = (userAns, correctAns) =>
            (userAns || '').trim().toLowerCase() === (correctAns || '').trim().toLowerCase();

        switch (q.type) {
            case 'mcq':
                return (
                    <div className="space-y-2">
                        {(q.options || []).map((opt, aIndex) => (
                            <label key={aIndex} className={`block p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                submitted
                                    ? (opt === q.correctAnswer ? 'border-green-500 bg-green-100' : (userAnswers[qIndex] === opt ? 'border-red-500 bg-red-100' : 'border-slate-200'))
                                    : (userAnswers[qIndex] === opt ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-teal-300')
                            }`}>
                                <input type="radio" name={`q${qIndex}`} onChange={() => handleAnswer(qIndex, opt)} disabled={submitted} className="ml-3"/>
                                {opt}
                            </label>
                        ))}
                    </div>
                );

            case 'fill_in_blank':
                return (
                    <input
                        type="text"
                        value={userAnswers[qIndex] || ''}
                        onChange={e => handleAnswer(qIndex, e.target.value)}
                        disabled={submitted}
                        placeholder="پاسخ خود را بنویسید..."
                        className={`w-full p-3 border-2 rounded-xl ${
                            submitted
                                ? (isCorrect(userAnswers[qIndex], q.correctAnswer) ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                                : 'border-slate-300 focus:border-teal-500'
                        }`}
                    />
                );

            case 'translate_to_persian':
            case 'translate_to_arabic':
                return (
                    <div>
                        <div className="bg-slate-100 p-3 rounded-lg mb-3 text-lg font-medium flex items-center gap-2">
                            <span>{q.type === 'translate_to_persian' ? '🇱🇧' : '🇮🇷'}</span>
                            {q.question}
                            <TTSButton textToSpeak={q.question} />
                        </div>
                        <textarea
                            value={userAnswers[qIndex] || ''}
                            onChange={e => handleAnswer(qIndex, e.target.value)}
                            disabled={submitted}
                            placeholder={q.type === 'translate_to_persian' ? 'ترجمه فارسی...' : 'ترجمه عربی لبنانی...'}
                            rows={2}
                            className={`w-full p-3 border-2 rounded-xl ${
                                submitted
                                    ? (isCorrect(userAnswers[qIndex], q.correctAnswer) ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50')
                                    : 'border-slate-300 focus:border-teal-500'
                            }`}
                        />
                    </div>
                );

            case 'word_order':
                const words = q.words || [];
                const currentOrder = userAnswers[qIndex] ? userAnswers[qIndex].split(' ') : [...words].sort(() => Math.random() - 0.5);
                return (
                    <div>
                        <p className="text-sm text-slate-500 mb-2">کلمات را به ترتیب صحیح مرتب کنید:</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {currentOrder.map((word, wIndex) => (
                                <button
                                    key={wIndex}
                                    onClick={() => {
                                        if (submitted) return;
                                        const newOrder = [...currentOrder];
                                        if (wIndex > 0) {
                                            [newOrder[wIndex], newOrder[wIndex-1]] = [newOrder[wIndex-1], newOrder[wIndex]];
                                        }
                                        handleAnswer(qIndex, newOrder.join(' '));
                                    }}
                                    disabled={submitted}
                                    className={`px-4 py-2 rounded-lg border-2 font-medium ${
                                        submitted
                                            ? (isCorrect(userAnswers[qIndex], q.correctAnswer) ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100')
                                            : 'border-teal-500 bg-teal-50 hover:bg-teal-100 cursor-pointer'
                                    }`}
                                >
                                    {word}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400">💡 روی کلمات کلیک کنید تا جابجا شوند</p>
                    </div>
                );

            case 'matching':
                const pairs = q.pairs || [];
                const arabicWords = pairs.map(p => p.arabic);
                const persianWords = [...pairs.map(p => p.persian)].sort(() => Math.random() - 0.5);
                const userMatch = matchingAnswers[qIndex] || {};

                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="font-bold text-sm text-slate-600 mb-2">🇱🇧 کلمات عربی</p>
                            {arabicWords.map((arabic, aIndex) => {
                                const selectedPersian = userMatch[arabic];
                                const isMatchCorrect = submitted && selectedPersian === pairs.find(p => p.arabic === arabic)?.persian;
                                const isMatchWrong = submitted && selectedPersian && !isMatchCorrect;

                                return (
                                    <div key={aIndex} className={`p-3 rounded-lg border-2 ${
                                        isMatchCorrect ? 'border-green-500 bg-green-50' :
                                        isMatchWrong ? 'border-red-500 bg-red-50' :
                                        selectedPersian ? 'border-teal-500 bg-teal-50' : 'border-slate-200'
                                    }`}>
                                        <span className="font-medium">{arabic}</span>
                                        {selectedPersian && <span className="text-sm text-slate-500 mr-2">← {selectedPersian}</span>}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="space-y-2">
                            <p className="font-bold text-sm text-slate-600 mb-2">🇮🇷 معانی فارسی</p>
                            {persianWords.map((persian, pIndex) => {
                                const isSelected = Object.values(userMatch).includes(persian);
                                return (
                                    <button
                                        key={pIndex}
                                        onClick={() => {
                                            if (submitted) return;
                                            // Find first unmatched arabic word
                                            const unmatchedArabic = arabicWords.find(a => !userMatch[a]);
                                            if (unmatchedArabic && !isSelected) {
                                                handleMatchingAnswer(qIndex, unmatchedArabic, persian);
                                            }
                                        }}
                                        disabled={submitted || isSelected}
                                        className={`w-full p-3 rounded-lg border-2 text-right ${
                                            isSelected ? 'border-slate-300 bg-slate-100 opacity-50' : 'border-slate-200 hover:border-teal-500 cursor-pointer'
                                        }`}
                                    >
                                        {persian}
                                    </button>
                                );
                            })}
                        </div>
                        {!submitted && Object.keys(userMatch).length > 0 && (
                            <button
                                onClick={() => setMatchingAnswers(prev => ({ ...prev, [qIndex]: {} }))}
                                className="col-span-2 text-sm text-red-500 hover:text-red-700"
                            >
                                🔄 پاک کردن انتخاب‌ها
                            </button>
                        )}
                    </div>
                );

            default:
                return <p className="text-red-500">نوع سوال نامشخص</p>;
        }
    };

    const { score, total } = submitted ? calculateScore() : { score: 0, total: 0 };
    const scorePercent = total > 0 ? (score / total) * 100 : 0;

    return (
        <Card title="🎯 مرکز آزمون هوشمند">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl space-y-6">
                {/* Settings Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="font-bold text-slate-700 block mb-2">📚 انتخاب درس:</label>
                        <select
                            value={selectedLessonId}
                            onChange={(e) => setSelectedLessonId(e.target.value)}
                            className="w-full p-3 border-2 border-slate-300 rounded-xl focus:border-teal-500"
                        >
                            {lessons.length === 0 ? (
                                <option value="">هیچ درسی وجود ندارد</option>
                            ) : (
                                lessons.map(l => (
                                    <option key={l.id} value={l.id.toString()}>
                                        {l.title} {l.archivedNotes?.length > 50 ? '✅' : '⚠️'}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="font-bold text-slate-700 block mb-2">🔢 تعداد سوالات:</label>
                        <input
                            type="number"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(Math.max(1, Math.min(15, parseInt(e.target.value) || 5)))}
                            className="w-full p-3 border-2 border-slate-300 rounded-xl focus:border-teal-500"
                            min="1"
                            max="15"
                        />
                    </div>
                </div>

                {/* Settings Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="font-bold text-slate-700 block mb-2">⏱️ محدودیت زمانی (دقیقه):</label>
                        <input
                            type="number"
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full p-3 border-2 border-slate-300 rounded-xl focus:border-teal-500"
                            min="0"
                            placeholder="0 = بدون محدودیت"
                        />
                    </div>
                    <div>
                        <label className="font-bold text-slate-700 block mb-2">📊 سطح سختی:</label>
                        <div className="flex gap-2">
                            {Object.entries(difficultyLabels).map(([key, { label }]) => (
                                <button
                                    key={key}
                                    onClick={() => setDifficulty(key)}
                                    className={`flex-1 p-3 rounded-xl border-2 font-medium transition-all ${
                                        difficulty === key
                                            ? 'border-teal-500 bg-teal-500 text-white'
                                            : 'border-slate-300 hover:border-teal-300'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Question Types */}
                <div>
                    <label className="font-bold text-slate-700 block mb-3">📝 انواع سوالات:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(questionTypeLabels).map(([key, { label, icon }]) => (
                            <label
                                key={key}
                                className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                    questionTypes[key]
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-slate-200 hover:border-teal-300'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={questionTypes[key]}
                                    onChange={e => setQuestionTypes(p => ({...p, [key]: e.target.checked}))}
                                    className="w-4 h-4"
                                />
                                <span>{icon}</span>
                                <span className="text-sm font-medium">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={generateQuiz}
                    disabled={isLoading || lessons.length === 0}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4 rounded-xl hover:from-teal-600 hover:to-teal-700 disabled:from-slate-400 disabled:to-slate-500 flex items-center justify-center gap-3 font-bold text-lg shadow-lg transition-all"
                >
                    <Sparkles size={24} />
                    {isLoading ? 'در حال ساخت آزمون...' : '✨ ایجاد آزمون هوشمند'}
                </button>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="text-center p-10">
                    <Loader className="animate-spin inline-block text-teal-500" size={48}/>
                    <p className="mt-4 text-slate-600">در حال ساخت سوالات...</p>
                </div>
            )}

            {/* Quiz Display */}
            {quiz && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-6 p-4 bg-slate-100 rounded-xl">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">
                                📝 آزمون: {lessons.find(l => l.id === parseInt(selectedLessonId))?.title}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                {quiz.length} سوال | سطح {difficultyLabels[difficulty].label}
                            </p>
                        </div>
                        {timeLimit > 0 && (
                            <div className={`font-bold text-xl px-4 py-2 rounded-xl ${
                                timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                            }`}>
                                ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        {quiz.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
                                <div className="flex items-start gap-3 mb-4">
                                    <span className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                        {qIndex + 1}
                                    </span>
                                    <div className="flex-1">
                                        <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600">
                                            {questionTypeLabels[q.type.replace('_', '')]?.label || questionTypeLabels[Object.keys(questionTypeLabels).find(k => k.toLowerCase().replace(/[^a-z]/g, '') === q.type.toLowerCase().replace(/[^a-z]/g, ''))]?.label || q.type}
                                        </span>
                                        {q.question && q.type !== 'matching' && (
                                            <p className="font-bold text-lg mt-2 flex items-center gap-2">
                                                {q.question.replace('___', '_____')}
                                                {q.type !== 'translate_to_persian' && q.type !== 'translate_to_arabic' && (
                                                    <TTSButton textToSpeak={q.question} />
                                                )}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {renderQuestion(q, qIndex)}

                                {submitted && q.correctAnswer && (
                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-700 font-medium">✅ پاسخ صحیح: {q.correctAnswer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {!submitted ? (
                        <button
                            onClick={handleSubmit}
                            className="mt-8 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 font-bold text-lg shadow-lg"
                        >
                            ✅ ثبت پاسخ‌ها
                        </button>
                    ) : (
                        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border-2 border-blue-200">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-800 mb-2">
                                    🎉 آزمون تمام شد!
                                </p>
                                <p className="text-xl text-slate-600">
                                    امتیاز شما: <span className="font-bold text-teal-600">{score}</span> از <span className="font-bold">{total}</span>
                                </p>
                                <div className="w-full bg-slate-200 rounded-full h-4 mt-4">
                                    <div
                                        className={`h-4 rounded-full transition-all ${
                                            scorePercent >= 80 ? 'bg-green-500' :
                                            scorePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{ width: `${scorePercent}%` }}
                                    ></div>
                                </div>
                                <p className="text-lg font-bold mt-2" style={{ color: scorePercent >= 80 ? '#22c55e' : scorePercent >= 50 ? '#eab308' : '#ef4444' }}>
                                    {scorePercent >= 80 ? '🌟 عالی!' : scorePercent >= 50 ? '👍 خوب' : '💪 تلاش بیشتر'}
                                </p>
                                <button
                                    onClick={() => { setQuiz(null); setSubmitted(false); setUserAnswers({}); setMatchingAnswers({}); }}
                                    className="mt-4 bg-teal-500 text-white px-6 py-2 rounded-xl hover:bg-teal-600 font-medium"
                                >
                                    🔄 آزمون جدید
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

export function MarkdownRenderer({ text }) {
    const sections = text.split('---');
    return (
        <div className="prose max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2">
            {sections.map((section, index) => (
                <div key={index} className="mb-4 border-b border-slate-200 pb-2 last:border-b-0">
                    {section.split('\n').map((line, lineIndex) => {
                        if (line.startsWith('### ')) return <h3 key={lineIndex} className="font-bold text-lg">{line.substring(4)}</h3>;
                        if (line.startsWith('## ')) return <h2 key={lineIndex} className="font-bold text-xl">{line.substring(3)}</h2>;
                        if (line.startsWith('# ')) return <h1 key={lineIndex} className="font-bold text-2xl">{line.substring(2)}</h1>;
                        if (line.startsWith('* ')) return <li key={lineIndex} className="mr-4">{line.substring(2)}</li>;
                        if (line.includes('**')) { const parts = line.split('**'); return <p key={lineIndex}>{parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}</p>; }
                        if (line.includes('~~')) { const parts = line.split(/~~/g); return <p key={lineIndex}>{parts.map((part, i) => i % 2 === 1 ? <del key={i} className="text-red-500">{part}</del> : part)}</p>; }
                        return line.trim() ? <p key={lineIndex}>{line}</p> : null;
                    })}
                </div>
            ))}
        </div>
    );
}

function ProgressCenter({ lessons, journal, knowledgeBase, addJournalEntry, setModalConfig, data }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [goal, setGoal] = useState('');
    const [plan, setPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [dailyChallenge, setDailyChallenge] = useState(null);
    const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);

    // Calculate comprehensive stats
    const stats = useMemo(() => {
        const totalVocab = knowledgeBase.vocabulary.length;
        const totalGrammar = knowledgeBase.grammar.length;
        const totalPhrases = knowledgeBase.phrases.length;
        const totalVerbs = knowledgeBase.verbs?.length || 0;
        const totalItems = totalVocab + totalGrammar + totalPhrases + totalVerbs;

        // Lessons stats
        const lessonsWithContent = lessons.filter(l => l.archivedNotes?.trim().length > 50).length;
        const totalLessons = lessons.length;

        // Progress from lessons
        const totalProgress = lessons.reduce((acc, l) => {
            const p = l.progress || {};
            return {
                quizzesTaken: acc.quizzesTaken + (p.quizzesTaken || 0),
                correctAnswers: acc.correctAnswers + (p.correctAnswers || 0),
                chatPractice: acc.chatPractice + (p.chatPracticeCount || 0),
                learnedItems: acc.learnedItems + (p.learnedItems || 0)
            };
        }, { quizzesTaken: 0, correctAnswers: 0, chatPractice: 0, learnedItems: 0 });

        // Weekly activity
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const weeklyActivity = {};
        last7Days.forEach(day => weeklyActivity[day] = 0);
        journal.forEach(entry => {
            const entryDate = entry.date.split('T')[0];
            if (weeklyActivity[entryDate] !== undefined) weeklyActivity[entryDate]++;
        });

        const activeDays = Object.values(weeklyActivity).filter(v => v > 0).length;
        const streak = calculateStreak(journal);

        return {
            totalVocab, totalGrammar, totalPhrases, totalVerbs, totalItems,
            lessonsWithContent, totalLessons,
            ...totalProgress,
            weeklyActivity: Object.values(weeklyActivity),
            weeklyLabels: last7Days.map(d => new Date(d).toLocaleDateString('fa-IR', { weekday: 'short' })),
            activeDays, streak,
            totalActivities: journal.length
        };
    }, [lessons, journal, knowledgeBase]);

    function calculateStreak(journal) {
        if (journal.length === 0) return 0;
        const dates = [...new Set(journal.map(e => e.date.split('T')[0]))].sort().reverse();
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (dates[0] !== today && dates[0] !== yesterday) return 0;

        for (let i = 0; i < dates.length; i++) {
            const expected = new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0];
            if (dates[i] === expected || (i === 0 && dates[i] === yesterday)) {
                streak++;
            } else break;
        }
        return streak;
    }

    const generatePlan = async () => {
        if (!goal.trim()) {
            setModalConfig({ title: "خطا", message: "لطفاً هدف یادگیری خود را وارد کنید." });
            return;
        }
        setIsLoading(true); setPlan('');
        addJournalEntry(`ایجاد برنامه مطالعه برای هدف: "${goal}"`);

        const lessonInfo = lessons.map(l => `- ${l.title}: ${l.archivedNotes?.length > 50 ? 'دارای محتوا' : 'خالی'}`).join('\n');

        const systemPrompt = `تو یک مربی زبان عربی لبنانی برای فارسی‌زبانان هستی.

اطلاعات یادگیرنده:
- لغات آموخته شده: ${stats.totalVocab}
- نکات گرامری: ${stats.totalGrammar}
- اصطلاحات: ${stats.totalPhrases}
- آزمون‌های گذرانده: ${stats.quizzesTaken}
- روزهای فعال در هفته: ${stats.activeDays}

دروس موجود:
${lessonInfo}

هدف یادگیرنده: "${goal}"

یک برنامه مطالعه ۷ روزه دقیق و عملی به فارسی بنویس که شامل:
1. فعالیت‌های روزانه مشخص
2. اهداف کوچک قابل اندازه‌گیری
3. پیشنهاد دروس مرتبط
4. تمرینات مکالمه
5. نکات انگیزشی

از Markdown استفاده کن.`;

        try {
            setPlan(await callGeminiAPI({ contents: [{ parts: [{ text: " " }] }], systemInstruction: { parts: [{ text: systemPrompt }] } }));
        } catch (error) {
            setModalConfig({ title: "خطا", message: "خطا در ایجاد برنامه مطالعه." });
        } finally {
            setIsLoading(false);
        }
    };

    const generateDailyChallenge = async () => {
        setIsLoadingChallenge(true);
        const systemPrompt = `یک چالش یادگیری روزانه برای عربی لبنانی بساز. خروجی JSON:
{
  "title": "عنوان چالش",
  "description": "توضیح کوتاه",
  "tasks": ["کار ۱", "کار ۲", "کار ۳"],
  "reward": "پاداش/انگیزه",
  "difficulty": "آسان|متوسط|سخت",
  "estimatedTime": "۱۵ دقیقه"
}`;

        try {
            const response = await callGeminiAPI({
                contents: [{ parts: [{ text: "چالش روزانه" }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { responseMimeType: "application/json" }
            });
            setDailyChallenge(JSON.parse(response));
            addJournalEntry("چالش روزانه دریافت شد");
        } catch (error) {
            setModalConfig({ title: "خطا", message: "خطا در دریافت چالش روزانه." });
        } finally {
            setIsLoadingChallenge(false);
        }
    };

    const getAIRecommendation = async () => {
        setIsLoading(true);
        const systemPrompt = `بر اساس این آمار، ۳ توصیه شخصی‌سازی شده برای بهبود یادگیری بده:
- لغات: ${stats.totalVocab}
- گرامر: ${stats.totalGrammar}
- آزمون‌ها: ${stats.quizzesTaken}
- تمرین مکالمه: ${stats.chatPractice}
- روزهای فعال: ${stats.activeDays}/7

پاسخ به فارسی و کوتاه.`;

        try {
            const rec = await callGeminiAPI({ contents: [{ parts: [{ text: " " }] }], systemInstruction: { parts: [{ text: systemPrompt }] } });
            setPlan(rec);
            setActiveTab('plan');
        } catch (error) {
            setModalConfig({ title: "خطا", message: "خطا در دریافت توصیه." });
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', label: '📊 نمای کلی', icon: BarChart2 },
        { id: 'plan', label: '🎯 برنامه‌ریزی', icon: ClipboardList },
        { id: 'challenges', label: '🏆 چالش‌ها', icon: GraduationCap }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-800">🚀 مرکز پیشرفت</h2>
                <div className="flex gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'bg-teal-500 text-white shadow-lg'
                                    : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 rounded-2xl shadow-lg">
                            <p className="text-blue-100 text-sm">لغات آموخته</p>
                            <p className="text-3xl font-bold">{stats.totalVocab}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-5 rounded-2xl shadow-lg">
                            <p className="text-green-100 text-sm">نکات گرامری</p>
                            <p className="text-3xl font-bold">{stats.totalGrammar}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-5 rounded-2xl shadow-lg">
                            <p className="text-purple-100 text-sm">آزمون‌ها</p>
                            <p className="text-3xl font-bold">{stats.quizzesTaken}</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-5 rounded-2xl shadow-lg">
                            <p className="text-orange-100 text-sm">🔥 روزهای متوالی</p>
                            <p className="text-3xl font-bold">{stats.streak}</p>
                        </div>
                    </div>

                    {/* Progress Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="📈 روند فعالیت هفتگی">
                            <div className="h-48 flex items-end justify-around gap-2 bg-slate-50 p-4 rounded-xl">
                                {stats.weeklyActivity.map((height, index) => (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg transition-all duration-500 min-h-[4px]"
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                        ></div>
                                        <span className="text-xs text-slate-500">{stats.weeklyLabels[index]}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-sm text-slate-500 mt-2">
                                {stats.activeDays} روز فعال از ۷ روز گذشته
                            </p>
                        </Card>

                        <Card title="📚 وضعیت دروس">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>دروس با محتوا</span>
                                    <span className="font-bold text-teal-600">{stats.lessonsWithContent} / {stats.totalLessons}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-3">
                                    <div
                                        className="bg-teal-500 h-3 rounded-full transition-all"
                                        style={{ width: `${stats.totalLessons > 0 ? (stats.lessonsWithContent / stats.totalLessons) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-teal-600">{stats.chatPractice}</p>
                                        <p className="text-xs text-slate-500">تمرین مکالمه</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-blue-600">{stats.totalActivities}</p>
                                        <p className="text-xs text-slate-500">کل فعالیت‌ها</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* AI Recommendation */}
                    <button
                        onClick={getAIRecommendation}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 font-bold flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Sparkles size={20} />
                        {isLoading ? 'در حال تحلیل...' : '✨ دریافت توصیه‌های شخصی‌سازی شده AI'}
                    </button>
                </div>
            )}

            {activeTab === 'plan' && (
                <div className="space-y-6">
                    <Card title="🎯 هدف‌گذاری و برنامه‌ریزی">
                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold mb-2 text-slate-700">هدف یادگیری شما چیست؟</label>
                                <textarea
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    rows="3"
                                    className="w-full p-4 border-2 border-slate-300 rounded-xl focus:border-teal-500"
                                    placeholder="مثال: می‌خواهم بتوانم در رستوران غذا سفارش دهم و با راننده تاکسی صحبت کنم..."
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={generatePlan}
                                    disabled={isLoading}
                                    className="bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 disabled:bg-slate-400 font-bold flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={18} />
                                    {isLoading ? 'در حال ایجاد...' : 'ایجاد برنامه هفتگی'}
                                </button>
                                <button
                                    onClick={() => setGoal('')}
                                    className="bg-slate-200 text-slate-700 p-3 rounded-xl hover:bg-slate-300 font-medium"
                                >
                                    پاک کردن
                                </button>
                            </div>
                        </div>
                    </Card>

                    {isLoading && (
                        <div className="text-center p-10">
                            <Loader className="animate-spin inline-block text-teal-500" size={48}/>
                            <p className="mt-4 text-slate-600">در حال ایجاد برنامه شخصی‌سازی شده...</p>
                        </div>
                    )}

                    {plan && (
                        <Card title="📋 برنامه پیشنهادی شما">
                            <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border">
                                <MarkdownRenderer text={plan} />
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === 'challenges' && (
                <div className="space-y-6">
                    <Card title="🏆 چالش روزانه">
                        {!dailyChallenge ? (
                            <div className="text-center py-8">
                                <p className="text-slate-500 mb-4">چالش روزانه خود را دریافت کنید و مهارت‌هایتان را تقویت کنید!</p>
                                <button
                                    onClick={generateDailyChallenge}
                                    disabled={isLoadingChallenge}
                                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-yellow-600 hover:to-orange-600 font-bold flex items-center justify-center gap-2 mx-auto"
                                >
                                    {isLoadingChallenge ? <Loader className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                                    {isLoadingChallenge ? 'در حال ایجاد...' : 'دریافت چالش امروز'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-slate-800">{dailyChallenge.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        dailyChallenge.difficulty === 'آسان' ? 'bg-green-100 text-green-700' :
                                        dailyChallenge.difficulty === 'متوسط' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {dailyChallenge.difficulty}
                                    </span>
                                </div>
                                <p className="text-slate-600">{dailyChallenge.description}</p>
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <p className="font-bold mb-2">📝 وظایف:</p>
                                    <ul className="space-y-2">
                                        {dailyChallenge.tasks?.map((task, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <input type="checkbox" className="w-5 h-5 rounded"/>
                                                <span>{task}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex justify-between items-center text-sm text-slate-500">
                                    <span>⏱️ زمان تقریبی: {dailyChallenge.estimatedTime}</span>
                                    <span>🎁 {dailyChallenge.reward}</span>
                                </div>
                                <button
                                    onClick={() => setDailyChallenge(null)}
                                    className="w-full bg-slate-200 text-slate-700 p-2 rounded-lg hover:bg-slate-300 text-sm"
                                >
                                    چالش جدید
                                </button>
                            </div>
                        )}
                    </Card>

                    {/* Achievements */}
                    <Card title="🏅 دستاوردها">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className={`p-4 rounded-xl text-center ${stats.totalVocab >= 10 ? 'bg-yellow-100' : 'bg-slate-100 opacity-50'}`}>
                                <span className="text-3xl">📚</span>
                                <p className="font-bold mt-2">۱۰ لغت اول</p>
                                <p className="text-xs text-slate-500">{stats.totalVocab >= 10 ? '✅ کسب شد' : `${stats.totalVocab}/10`}</p>
                            </div>
                            <div className={`p-4 rounded-xl text-center ${stats.quizzesTaken >= 5 ? 'bg-blue-100' : 'bg-slate-100 opacity-50'}`}>
                                <span className="text-3xl">🎯</span>
                                <p className="font-bold mt-2">۵ آزمون</p>
                                <p className="text-xs text-slate-500">{stats.quizzesTaken >= 5 ? '✅ کسب شد' : `${stats.quizzesTaken}/5`}</p>
                            </div>
                            <div className={`p-4 rounded-xl text-center ${stats.streak >= 7 ? 'bg-orange-100' : 'bg-slate-100 opacity-50'}`}>
                                <span className="text-3xl">🔥</span>
                                <p className="font-bold mt-2">۷ روز متوالی</p>
                                <p className="text-xs text-slate-500">{stats.streak >= 7 ? '✅ کسب شد' : `${stats.streak}/7`}</p>
                            </div>
                            <div className={`p-4 rounded-xl text-center ${stats.chatPractice >= 10 ? 'bg-green-100' : 'bg-slate-100 opacity-50'}`}>
                                <span className="text-3xl">💬</span>
                                <p className="font-bold mt-2">۱۰ مکالمه</p>
                                <p className="text-xs text-slate-500">{stats.chatPractice >= 10 ? '✅ کسب شد' : `${stats.chatPractice}/10`}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

function CulturalInsights({ addJournalEntry, setModalConfig, knowledgeBase, updateKnowledgeBase }) {
    const [selectedCategory, setSelectedCategory] = useState('food');
    const [insight, setInsight] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [relatedPhrases, setRelatedPhrases] = useState([]);

    const categories = {
        food: { label: '🍽️ غذا و رستوران', icon: '🥙', topics: ['غذاهای معروف لبنانی', 'آداب غذا خوردن', 'سفارش در رستوران', 'چای و قهوه لبنانی'] },
        social: { label: '🤝 آداب اجتماعی', icon: '👋', topics: ['سلام و احوالپرسی', 'تعارف لبنانی', 'مهمان‌نوازی', 'رفتار در مهمانی'] },
        family: { label: '👨‍👩‍👧‍👦 خانواده', icon: '🏠', topics: ['ساختار خانواده', 'نقش بزرگترها', 'جشن‌های خانوادگی', 'ازدواج لبنانی'] },
        religion: { label: '🕌 مذهب و سنت', icon: '⛪', topics: ['تنوع مذهبی', 'جشن‌های مذهبی', 'رمضان در لبنان', 'کریسمس لبنانی'] },
        music: { label: '🎵 موسیقی و هنر', icon: '🎤', topics: ['فیروز و موسیقی لبنانی', 'دبکه (رقص سنتی)', 'هنر و معماری', 'سینمای لبنان'] },
        business: { label: '💼 کسب‌وکار', icon: '🏢', topics: ['فرهنگ کاری', 'مذاکره تجاری', 'وقت‌شناسی', 'روابط کاری'] },
        daily: { label: '🌅 زندگی روزمره', icon: '☕', topics: ['یک روز معمولی', 'خرید و بازار', 'حمل‌ونقل', 'تفریح و سرگرمی'] },
        language: { label: '🗣️ زبان و لهجه', icon: '💬', topics: ['تفاوت لهجه‌ها', 'کلمات فرانسوی', 'اصطلاحات خاص', 'شوخی و طنز'] }
    };

    const getInsight = async (topic) => {
        setIsLoading(true);
        setInsight(null);
        setRelatedPhrases([]);
        addJournalEntry(`درخواست نکته فرهنگی: ${topic}`);

        const systemPrompt = `تو یک راهنمای فرهنگی لبنان برای فارسی‌زبانان هستی.

درباره موضوع "${topic}" توضیح بده. خروجی JSON:
{
  "title": "عنوان",
  "content": "توضیح کامل به فارسی (حداقل ۲۰۰ کلمه)",
  "funFacts": ["نکته جالب ۱", "نکته جالب ۲", "نکته جالب ۳"],
  "doAndDont": {
    "do": ["کار درست ۱", "کار درست ۲"],
    "dont": ["کار نادرست ۱", "کار نادرست ۲"]
  },
  "relatedPhrases": [
    {"arabic": "عبارت عربی", "pronunciation": "تلفظ", "persian": "معنی فارسی", "usage": "موقعیت استفاده"}
  ],
  "culturalTip": "یک نکته مهم فرهنگی"
}`;

        try {
            const response = await callGeminiAPI({
                contents: [{ parts: [{ text: topic }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { responseMimeType: "application/json" }
            });

            const data = JSON.parse(response);
            setInsight(data);
            setRelatedPhrases(data.relatedPhrases || []);
        } catch (error) {
            console.error(error);
            setModalConfig({ title: "خطا", message: "خطا در دریافت اطلاعات فرهنگی. لطفاً دوباره تلاش کنید." });
        } finally {
            setIsLoading(false);
        }
    };

    const savePhraseToKnowledge = (phrase) => {
        updateKnowledgeBase('phrases', {
            term: phrase.arabic,
            definition: `${phrase.persian} (${phrase.usage})`,
            source: 'نکات فرهنگی'
        });
        setModalConfig({ title: "ذخیره شد", message: `عبارت "${phrase.arabic}" به مرکز دانش اضافه شد.` });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-800">🇱🇧 فرهنگ و آداب لبنان</h2>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(categories).map(([key, cat]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`p-4 rounded-2xl text-center transition-all ${
                            selectedCategory === key
                                ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg scale-105'
                                : 'bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-teal-300'
                        }`}
                    >
                        <span className="text-3xl block mb-2">{cat.icon}</span>
                        <span className="font-medium text-sm">{cat.label.split(' ').slice(1).join(' ')}</span>
                    </button>
                ))}
            </div>

            {/* Topics for Selected Category */}
            <Card title={categories[selectedCategory].label}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categories[selectedCategory].topics.map((topic, index) => (
                        <button
                            key={index}
                            onClick={() => getInsight(topic)}
                            disabled={isLoading}
                            className="p-4 bg-gradient-to-r from-slate-50 to-white border-2 border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-md transition-all text-right flex items-center justify-between group"
                        >
                            <span className="font-medium">{topic}</span>
                            <span className="text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">←</span>
                        </button>
                    ))}
                </div>
            </Card>

            {/* Loading */}
            {isLoading && (
                <div className="text-center p-10 bg-white rounded-2xl">
                    <Loader className="animate-spin inline-block text-teal-500" size={48}/>
                    <p className="mt-4 text-slate-600">در حال دریافت اطلاعات فرهنگی...</p>
                </div>
            )}

            {/* Insight Display */}
            {insight && (
                <div className="space-y-6">
                    <Card title={`📖 ${insight.title}`}>
                        <div className="prose max-w-none">
                            <p className="text-slate-700 leading-relaxed text-lg">{insight.content}</p>
                        </div>
                    </Card>

                    {/* Fun Facts */}
                    {insight.funFacts && (
                        <Card title="💡 نکات جالب">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {insight.funFacts.map((fact, i) => (
                                    <div key={i} className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                                        <span className="text-2xl">💡</span>
                                        <p className="mt-2 text-slate-700">{fact}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Do and Don't */}
                    {insight.doAndDont && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card title="✅ این کارها را انجام دهید">
                                <ul className="space-y-3">
                                    {insight.doAndDont.do?.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg">
                                            <span className="text-green-500">✓</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                            <Card title="❌ این کارها را انجام ندهید">
                                <ul className="space-y-3">
                                    {insight.doAndDont.dont?.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 bg-red-50 p-3 rounded-lg">
                                            <span className="text-red-500">✗</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </div>
                    )}

                    {/* Related Phrases */}
                    {relatedPhrases.length > 0 && (
                        <Card title="🗣️ عبارات مرتبط">
                            <div className="space-y-3">
                                {relatedPhrases.map((phrase, i) => (
                                    <div key={i} className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl font-bold text-teal-600">{phrase.arabic}</span>
                                                <TTSButton textToSpeak={phrase.arabic} />
                                                <span className="text-sm text-slate-400">({phrase.pronunciation})</span>
                                            </div>
                                            <p className="text-slate-700 mt-1">{phrase.persian}</p>
                                            <p className="text-xs text-slate-500 mt-1">💡 {phrase.usage}</p>
                                        </div>
                                        <button
                                            onClick={() => savePhraseToKnowledge(phrase)}
                                            className="bg-teal-100 text-teal-700 px-3 py-2 rounded-lg hover:bg-teal-200 text-sm font-medium"
                                        >
                                            + ذخیره
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Cultural Tip */}
                    {insight.culturalTip && (
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl">
                            <p className="text-lg font-bold mb-2">⭐ نکته مهم فرهنگی</p>
                            <p className="text-purple-100">{insight.culturalTip}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// StatsReport removed - merged into ProgressCenter
function Journal({ entries }) { return (<Card title="ژورنال فعالیت‌ها"><div className="space-y-4 max-h-[600px] overflow-y-auto">{entries.map(entry => (<div key={entry.id} className="p-4 bg-slate-50 border-r-4 border-teal-500 rounded-r-lg"><p className="text-sm text-slate-500 mb-1">{new Date(entry.date).toLocaleString('fa-IR')}</p><p>{entry.entry}</p></div>))}</div></Card>); }

function ChatInterface({ data, setData, context, lessonTitle, lessonNotes, addJournalEntry, updateKnowledgeBase, knowledgeBase, saveChatHistory, initialHistory, setModalConfig, addPronunciationCorrection }) {
  const { defaultChatSettings = initialData.defaultChatSettings, archivedConversations = [] } = data;
  const [chatHistory, setChatHistory] = useState(initialHistory || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Execution flow tracking
  const { setCurrentNode } = useExecutionFlow();

  // Live chat context - for floating voice chat (both Live and Voice Conversation)
  const {
    openLiveChat, isLiveChatActive, minimizeLiveChat,
    openVoiceConv, closeVoiceConv, isVoiceConvActive, isVoiceConvMinimized, voiceConvConfig, voiceConvStatus, minimizeVoiceConv, maximizeVoiceConv, updateVoiceConvStatus,
    shouldAutoStartRecording, markAudioFinishedWhileMinimized, clearAutoStartRecording,
    saveVoiceConvState, voiceConvAudioRef
  } = useLiveChat();

  // === ALL REFS MUST BE DEFINED BEFORE useEffect HOOKS ===
  const chatWindowRef = useRef(null);
  const [customScenarioName, setCustomScenarioName] = useState('');
  const [customScenarioDetails, setCustomScenarioDetails] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false); // Ref to track recording state in async callbacks
  const recordingStartPendingRef = useRef(false); // Prevent duplicate recording starts
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToSave, setItemToSave] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const [voiceConversationMode, setVoiceConversationMode] = useState(false);
  const voiceConversationModeRef = useRef(false); // Ref to track mode in callbacks
  const chatHistoryRef = useRef(chatHistory); // Ref to track latest chatHistory for async callbacks
  const currentAudioRef = useRef(null);
  const sessionIdRef = useRef(Date.now()); // Unique session ID to prevent stale responses from triggering new recordings
  const isVoiceConvActiveRef = useRef(false); // Ref to track global voice conv state for cleanup decisions
  const isMountedRef = useRef(true); // Track if component is mounted for async callbacks
  const [pendingAutoStartRecording, setPendingAutoStartRecording] = useState(false); // Flag to trigger auto-start after return

  // Silence detection refs for voice conversation mode
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const silenceCheckIntervalRef = useRef(null);
  const streamRef = useRef(null);
  const hasSpokenRef = useRef(false); // Track if user has spoken at all
  const markAudioFinishedWhileMinimizedRef = useRef(markAudioFinishedWhileMinimized);

  // === NOW useEffect HOOKS CAN SAFELY USE ALL REFS ===

  // Cleanup when component unmounts (NOT when dependencies change)
  // Using empty deps to only run on actual unmount
  useEffect(() => {
    isMountedRef.current = true; // Mark as mounted

    return () => {
      isMountedRef.current = false; // Mark as unmounted for async callbacks

      // Check if voice conversation is being minimized (still globally active)
      // If so, DON'T do aggressive cleanup - let audio continue playing
      if (isVoiceConvActiveRef.current) {
        console.log('Voice conv minimizing - keeping audio and handlers alive');
        // Only stop recording if in progress, but let audio continue
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        // Keep voiceConversationModeRef true so audio onended knows conversation is still active
        isRecordingRef.current = false;
        recordingStartPendingRef.current = false;
        return;
      }

      // Full cleanup when voice conversation is actually closed (not just minimized)
      console.log('Voice conv closed - full cleanup');

      // DON'T pause audio here - let it finish playing
      // Just clear the onended handler to prevent triggering new recordings
      if (currentAudioRef.current) {
        currentAudioRef.current.onended = null;
      }

      // Stop MediaRecorder if recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      // Stop stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Cleanup silence detection
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }

      // Mark that this component's voice conversation mode is inactive
      // This prevents old callbacks from triggering new recordings
      voiceConversationModeRef.current = false;
      isRecordingRef.current = false;
      recordingStartPendingRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate effect for minimizing chats when leaving the page
  useEffect(() => {
    return () => {
      if (isLiveChatActive) {
        minimizeLiveChat();
      }
      if (isVoiceConvActive) {
        saveChatHistory(context, chatHistoryRef.current);
        // Save state to provider so FloatingVoiceConvWidget can continue
        saveVoiceConvState(chatHistoryRef.current, currentAudioRef.current);
        minimizeVoiceConv();
      }
    };
  }, [isLiveChatActive, minimizeLiveChat, isVoiceConvActive, minimizeVoiceConv, context, saveChatHistory, saveVoiceConvState]);

  // Keep refs synced with global voice conv state (for cleanup and onended handler decisions)
  useEffect(() => {
    isVoiceConvActiveRef.current = isVoiceConvActive;
    markAudioFinishedWhileMinimizedRef.current = markAudioFinishedWhileMinimized;
  }, [isVoiceConvActive, markAudioFinishedWhileMinimized]);

  // Restore voice conversation mode when returning to page with active voice conv
  useEffect(() => {
    if (isVoiceConvActive && !isVoiceConvMinimized && voiceConvConfig?.context === context) {
      // Returning to the page where voice conversation was active
      if (!voiceConversationModeRef.current) {
        voiceConversationModeRef.current = true;
        setVoiceConversationMode(true);

        // If audio finished while we were away, schedule auto-start recording
        if (shouldAutoStartRecording) {
          console.log('Scheduling auto-start recording after return - audio finished while minimized');
          clearAutoStartRecording();
          setPendingAutoStartRecording(true);
        }
      }
    }
  }, [isVoiceConvActive, isVoiceConvMinimized, voiceConvConfig, context, shouldAutoStartRecording, clearAutoStartRecording]);
  const wakeLockRef = useRef(null);

  // Wake Lock to prevent screen sleep during voice conversation
  useEffect(() => {
    const requestWakeLock = async () => {
      if (voiceConversationMode && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('Wake Lock activated');
        } catch (err) {
          console.log('Wake Lock failed:', err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake Lock released');
      }
    };

    if (voiceConversationMode) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => releaseWakeLock();
  }, [voiceConversationMode]);

  // Sync voice conversation status to context for floating widget
  useEffect(() => {
    if (voiceConversationMode) {
      updateVoiceConvStatus({
        isRecording,
        isLoading,
        isPlaying: currentAudioRef.current && !currentAudioRef.current.paused
      });
    }
  }, [voiceConversationMode, isRecording, isLoading, updateVoiceConvStatus]);

  const [selectedTopics, setSelectedTopics] = useState(['general']);
  const [writingStyle, setWritingStyle] = useState(defaultChatSettings.writingStyle);
  const [translationLanguage, setTranslationLanguage] = useState(defaultChatSettings.translationLanguage);
  const [aiVoice, setAiVoice] = useState(defaultChatSettings.aiVoice);
  const [accentMode, setAccentMode] = useState(defaultChatSettings.accentMode);
  const [aiResponseType, setAiResponseType] = useState(defaultChatSettings.aiResponseType);
  const [sendVoiceAs, setSendVoiceAs] = useState(defaultChatSettings.sendVoiceAs);
  
  const kbCategories = { vocabulary: 'لغات', grammar: 'گرامر', phrases: 'اصطلاحات', verbs: 'افعال', pronouns: 'ضمایر', adjectives: 'صفات' };
  const availableVoices = { 'Charon': 'مرد - استاندارد', 'Kore': 'زن - محکم', 'Zephyr': 'زن - روشن', 'Puck': 'مرد - شاد', 'Leda': 'زن - جوان', 'Fenrir': 'مرد - هیجان‌زده' };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'ar-LB';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => handleSend(event.results[0][0].transcript);
      recognitionRef.current.onerror = () => setModalConfig({title: "خطای تشخیص گفتار", message: "متاسفانه در تشخیص گفتار شما مشکلی پیش آمد."});
    }
  }, []);

  useEffect(() => {
    // Don't reset conversation during voice conversation mode (local or from context)
    if (voiceConversationModeRef.current) return;
    // Also don't reset if voice conv is active from context and we're the target page
    if (isVoiceConvActive && voiceConvConfig?.context === context) return;
    if (!initialHistory || initialHistory.length === 0) {
        startNewConversation();
    }
  }, [context, lessonTitle, initialHistory, isVoiceConvActive, voiceConvConfig]);

  const startNewConversation = (archiveCurrent = false) => {
    // Don't start new conversation during voice conversation mode
    if (voiceConversationModeRef.current) return;

    if (archiveCurrent && chatHistory.length > 1) {
        const conversationTitle = chatHistory[1]?.parts[0]?.text.substring(0, 30) + '...';
        const newArchive = [...(data.archivedConversations || []), { id: Date.now(), title: conversationTitle, history: chatHistory }];
        saveChatHistory(context, []); // Clear current history

        // Track chat practice progress for lessons
        if (context.startsWith('lesson-')) {
            const lessonId = parseInt(context.replace('lesson-', ''));
            setData(prev => ({
                ...prev,
                archivedConversations: newArchive,
                lessons: prev.lessons.map(l => {
                    if (l.id === lessonId) {
                        const currentProgress = l.progress || { totalItems: 0, learnedItems: 0, quizzesTaken: 0, correctAnswers: 0, chatPracticeCount: 0 };
                        return {
                            ...l,
                            progress: {
                                ...currentProgress,
                                chatPracticeCount: currentProgress.chatPracticeCount + 1
                            }
                        };
                    }
                    return l;
                })
            }));
        } else {
            setData(prev => ({...prev, archivedConversations: newArchive}));
        }
    }

    let initialText = 'أهلاً فيك! أنا جاد، معلمك. كيفك اليوم؟';
    if (context.startsWith('lesson')) {
        initialText = `أهلاً فيك! خلينا نمرّن شوي على درس "${lessonTitle}". شو أول كلمة تعلمتها من هيدا الدرس؟`;
    }
    setChatHistory([{ role: 'model', parts: [{ text: initialText, type: 'text' }] }]);
  };

  useEffect(() => { chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight); }, [chatHistory]);

  // Keep chatHistoryRef in sync with chatHistory state (for async callbacks)
  useEffect(() => { chatHistoryRef.current = chatHistory; }, [chatHistory]);

  const handleTopicChange = (topicKey) => {
    startNewConversation(true);
    setSelectedTopics(prev => {
        const isGeneralOrCustom = prev.includes('general') || prev.includes('custom_scenario');
        if (topicKey === 'general' || topicKey === 'custom_scenario') return [topicKey];
        const newTopics = isGeneralOrCustom ? [] : [...prev];
        const index = newTopics.indexOf(topicKey);
        if (index > -1) newTopics.splice(index, 1);
        else newTopics.push(topicKey);
        return newTopics.length === 0 ? ['general'] : newTopics;
    });
  };
  
  const handleStartCustomScenario = () => {
    if (!customScenarioName.trim() || !customScenarioDetails.trim()) {
        setModalConfig({ title: "اطلاعات ناقص", message: "لطفا نام و جزئیات سناریو را وارد کنید."});
        return;
    }
    startNewConversation(true);
    const scenarioPrompt = `[کاربر سناریوی جدیدی را شروع کرد: "${customScenarioName}"]`;
    handleSend(scenarioPrompt);
  };

  const handleSend = async (textToSend, audioBlobUrl = null) => {
    const messageText = textToSend || input;
    if ((!messageText.trim() && !attachedFile && !audioBlobUrl) || isLoading) return;

    // Track session ID to detect stale responses (for voice conversation loop prevention)
    const currentSessionId = sessionIdRef.current;

    // Track flow: User input received
    setCurrentNode(audioBlobUrl ? 'audioRecording' : 'userInput', audioBlobUrl ? 'chatVoice' : 'chat');

    let fullMessage = messageText;
    if (attachedFile) {
        fullMessage = `[User has attached a file named: ${attachedFile.name}]\n${messageText}`;
    }

    // In voice conversation mode, always send audio; otherwise respect sendVoiceAs setting
    const messageType = audioBlobUrl && (voiceConversationMode || sendVoiceAs === 'audio') ? 'audio' : 'text';
    const newUserMessage = { role: 'user', parts: [{ text: fullMessage, type: messageType, audioUrl: audioBlobUrl }] };
    // Use ref to get latest history (avoids stale closure in voice conversation mode)
    let newHistory = [...chatHistoryRef.current, newUserMessage];
    setChatHistory(newHistory);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    // Track flow: Building prompt
    setCurrentNode('buildingPrompt');

    // Build system prompt using customPrompts (from settings) or defaults
    const customPrompts = data.customPrompts || {};
    let systemPrompt = getPrompt(customPrompts, 'chatBase');
    if (writingStyle === 'finglish') {
        systemPrompt += ` ${getPrompt(customPrompts, 'chatFinglish')}`;
    } else if (writingStyle === 'tashkeel') {
        systemPrompt += ` ${getPrompt(customPrompts, 'chatTashkeel')}`;
    }
    if (translationLanguage !== 'none') {
        systemPrompt += ` After your Lebanese Arabic response, provide a ${translationLanguage} translation on a new line, formatted as 'TRANSLATION: [text]'.`;
    }

    if (context.startsWith('lesson')) {
        // Strip out erroneous content (strikethrough text marked with ~~ or ❌)
        // Only keep correct content for the AI to learn from
        let cleanedNotes = lessonNotes || "No notes available.";
        if (lessonNotes) {
            // Remove strikethrough markdown content (~~error~~)
            cleanedNotes = cleanedNotes.replace(/~~[^~]+~~/g, '');
            // Remove error emoji markers and their content patterns like ❌ [text]
            cleanedNotes = cleanedNotes.replace(/❌[^\n]*/g, '');
            // Remove parenthetical corrections like (جمله غلط)
            cleanedNotes = cleanedNotes.replace(/\([^)]*غلط[^)]*\)/g, '');
            // Clean up extra whitespace and empty lines
            cleanedNotes = cleanedNotes.replace(/\n{3,}/g, '\n\n').trim();
        }
        systemPrompt += `\n${getPrompt(customPrompts, 'chatLessonContext')} \n---\n${cleanedNotes}\n---`;
        // Add feedback instruction for lesson contexts to track correct/incorrect responses
        systemPrompt += `\n${getPrompt(customPrompts, 'chatFeedbackInstruction')}`;
    } else {
        const currentTopic = selectedTopics[0];
        if (currentTopic === 'custom_scenario') {
            systemPrompt += `\n${getPrompt(customPrompts, 'chatScenario')} Scenario: "${customScenarioName}". Details: "${customScenarioDetails}". Act out your role.`;
        } else if (currentTopic !== 'general') {
            const itemsToPractice = selectedTopics.flatMap(topic => knowledgeBase[topic]?.map(item => `${item.term}: ${item.definition}`) || []).join(', ');
            systemPrompt += `\n${getPrompt(customPrompts, 'chatTopicFocus')} [${itemsToPractice}].`;
        }
    }

    // Build contents for API - transcribe audio first if needed
    let contentsForApi = [];
    let historyNeedsUpdate = false;

    for (let i = 0; i < newHistory.length; i++) {
      const m = newHistory[i];
      if (m.parts[0].type === 'audio' && m.parts[0].audioUrl) {
        // Skip if already transcribed
        if (m.parts[0].transcribedText) {
          contentsForApi.push({ role: m.role, parts: [{ text: `[پیام صوتی کاربر]: ${m.parts[0].transcribedText}` }] });
          continue;
        }

        // Transcribe audio to text first
        setCurrentNode('audioTranscription');
        try {
          const response = await fetch(m.parts[0].audioUrl);
          if (!response.ok) {
            throw new Error(`Blob fetch failed: ${response.status}`);
          }
          const blob = await response.blob();
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
          });

          // Call Gemini to transcribe the audio
          const transcribeResponse = await fetch('/api/gemini/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [
                  { text: "Transcribe this audio exactly as spoken. If it's Arabic/Lebanese dialect, write it in Arabic script. If it's another language, write it in that language. Only output the transcription, nothing else:" },
                  { inline_data: { mime_type: blob.type || 'audio/webm', data: base64 } }
                ]
              }],
              includeAudio: true
            })
          });

          if (transcribeResponse.ok) {
            const transcribeData = await transcribeResponse.json();
            const transcribedText = transcribeData.candidates?.[0]?.content?.parts?.[0]?.text || '[پیام صوتی]';
            // Update the message in history with transcribed text (immutable update)
            newHistory = newHistory.map((msg, idx) =>
              idx === i ? { ...msg, parts: [{ ...msg.parts[0], transcribedText }] } : msg
            );
            historyNeedsUpdate = true;
            contentsForApi.push({ role: m.role, parts: [{ text: `[پیام صوتی کاربر]: ${transcribedText}` }] });
          } else {
            contentsForApi.push({ role: m.role, parts: [{ text: '[پیام صوتی - خطا در تبدیل]' }] });
          }
        } catch (e) {
          console.error('Error transcribing audio:', e);
          // For expired/invalid blob URLs, mark as old audio so we don't retry
          newHistory = newHistory.map((msg, idx) =>
            idx === i ? { ...msg, parts: [{ ...msg.parts[0], transcribedText: '[پیام صوتی قدیمی]' }] } : msg
          );
          historyNeedsUpdate = true;
          contentsForApi.push({ role: m.role, parts: [{ text: '[پیام صوتی قدیمی]' }] });
        }
      } else if (m.parts[0].text?.trim()) {
        contentsForApi.push({ role: m.role, parts: [{ text: m.parts[0].text }] });
      }
    }

    // Update chat history once after all transcriptions are done (not inside loop)
    if (historyNeedsUpdate) {
      setChatHistory([...newHistory]);
    }

    const payload = { contents: contentsForApi, systemInstruction: { parts: [{ text: systemPrompt }] } };

    try {
        // Track flow: Calling Gemini API
        setCurrentNode('callingGemini');
        let aiResponseText = await callGeminiAPI(payload);

        // Check if session changed (stale response - user navigated away and back)
        if (currentSessionId !== sessionIdRef.current) {
          console.log('Session changed, discarding stale response');
          return;
        }

        // Track flow: Received response
        setCurrentNode('receivingResponse');

        // Parse feedback marker for lesson contexts and update progress
        if (context.startsWith('lesson-')) {
            const feedbackMatch = aiResponseText.match(/\[FEEDBACK:(correct|incorrect|partial)\]/i);
            if (feedbackMatch) {
                const feedbackType = feedbackMatch[1].toLowerCase();
                const lessonId = parseInt(context.replace('lesson-', ''));

                // Update lesson progress based on feedback
                setData(prev => ({
                    ...prev,
                    lessons: prev.lessons.map(l => {
                        if (l.id === lessonId) {
                            const currentProgress = l.progress || { totalItems: 0, learnedItems: 0, quizzesTaken: 0, correctAnswers: 0, chatPracticeCount: 0, correctResponses: 0, incorrectResponses: 0 };
                            const updates = { ...currentProgress };

                            if (feedbackType === 'correct') {
                                updates.correctResponses = (currentProgress.correctResponses || 0) + 1;
                            } else if (feedbackType === 'incorrect') {
                                updates.incorrectResponses = (currentProgress.incorrectResponses || 0) + 1;
                                // Decrease correctResponses if positive (but not below 0)
                                updates.correctResponses = Math.max((currentProgress.correctResponses || 0) - 1, 0);
                            } else if (feedbackType === 'partial') {
                                // Partial correct - add half credit
                                updates.correctResponses = (currentProgress.correctResponses || 0) + 0.5;
                            }

                            return { ...l, progress: updates };
                        }
                        return l;
                    })
                }));

                // Strip feedback marker from displayed text
                aiResponseText = aiResponseText.replace(/\[FEEDBACK:(correct|incorrect|partial)\]/gi, '').trim();
            }
        }

        let ttsPrompt = `Say in a clear, ${accentMode === 'standard' ? 'standard' : 'authentic, colloquial Beirut'} Lebanese accent: ${aiResponseText.split('TRANSLATION:')[0]}`;

        // Track flow: Generating TTS (if needed)
        if (aiResponseType === 'audio' || voiceConversationMode) {
            setCurrentNode('generatingTTS');
        }

        const audioPromise = (aiResponseType === 'audio' || voiceConversationMode) ? callGeminiTTS(ttsPrompt, aiVoice) : Promise.resolve(null);
        const audioResult = await audioPromise;

        // Check again after TTS if session changed
        if (currentSessionId !== sessionIdRef.current) {
          console.log('Session changed after TTS, discarding response');
          return;
        }

        const audioUrl = audioResult ? getWavUrl(audioResult.audioData, audioResult.mimeType) : null;
        const newAiMessage = { role: 'model', parts: [{ text: aiResponseText, type: 'text', audioUrl }] };
        newHistory = [...newHistory, newAiMessage];
        setChatHistory(newHistory);
        saveChatHistory(context, newHistory);

        // Play audio and handle voice conversation mode
        if ((aiResponseType === 'audio' || voiceConversationMode) && audioUrl) {
            // Track flow: Playing audio
            setCurrentNode('playingAudio');
            const audio = new Audio(audioUrl);
            currentAudioRef.current = audio;

            const beepDelay = defaultChatSettings.voiceConversationBeepDelay || 500;
            let recordingTriggered = false; // Local flag to prevent duplicate recording starts

            const triggerNextRecording = async () => {
                // Prevent duplicate triggers from both onended and error handlers
                if (recordingTriggered) return;
                // CRITICAL: Check if this response is from a stale session
                if (currentSessionId !== sessionIdRef.current) {
                    console.log('Stale session detected, not triggering next recording');
                    return;
                }
                if (!voiceConversationModeRef.current) return;

                // Check if component is unmounted (minimized) - mark for auto-start on return
                if (!isMountedRef.current) {
                    console.log('Component unmounted (minimized) - marking for auto-start on return');
                    recordingTriggered = true;
                    if (markAudioFinishedWhileMinimizedRef.current) {
                        markAudioFinishedWhileMinimizedRef.current();
                    }
                    return;
                }

                if (isRecordingRef.current || recordingStartPendingRef.current) return;

                recordingTriggered = true;
                recordingStartPendingRef.current = true;

                setTimeout(async () => {
                    // Double-check all conditions before starting (including session check)
                    if (currentSessionId === sessionIdRef.current && voiceConversationModeRef.current && !isRecordingRef.current && isMountedRef.current) {
                        await playBeepSound(800, 150);
                        startVoiceRecording(true);
                    }
                    recordingStartPendingRef.current = false;
                }, beepDelay);
            };

            audio.onended = async () => {
                currentAudioRef.current = null;
                // Update status - audio finished
                if (isMountedRef.current) {
                    updateVoiceConvStatus({ isPlaying: false });
                }
                await triggerNextRecording();
            };

            audio.play().then(() => {
                // Update status - audio playing
                updateVoiceConvStatus({ isPlaying: true });
            }).catch(async err => {
                console.error('Audio playback error:', err);
                await triggerNextRecording();
            });
        }
    } catch(error) {
        // Ignore AbortError - it's intentional when user navigates away or starts new request
        if (error.name === 'AbortError') {
          console.log('Request was intentionally aborted');
          return;
        }
        // Also ignore if session changed (stale request)
        if (currentSessionId !== sessionIdRef.current) {
          console.log('Session changed, ignoring error from stale request');
          return;
        }
        // Track flow: Error occurred
        setCurrentNode('error');
        const errorAiMessage = { role: 'model', parts: [{ text: "متاسفانه مشکلی پیش آمد.", type: 'text', isError: true }] };
        setChatHistory(prev => [...prev, errorAiMessage]);
        // Stop voice conversation mode on error
        if (voiceConversationMode) {
            voiceConversationModeRef.current = false;
            setVoiceConversationMode(false);
        }
    } finally {
        // Only update loading state if this is still the current session
        if (currentSessionId === sessionIdRef.current) {
          setIsLoading(false);
          // Track flow: Back to idle (after a short delay to show complete)
          setTimeout(() => setCurrentNode('idle'), 1500);
        }
    }
  };

  // Cleanup silence detection resources
  const cleanupSilenceDetection = () => {
    if (silenceCheckIntervalRef.current) {
      clearInterval(silenceCheckIntervalRef.current);
      silenceCheckIntervalRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    hasSpokenRef.current = false;
  };

  // Start voice recording function (used by both manual click and voice conversation mode)
  // useVoiceConversation parameter overrides the state check for immediate use when toggling
  const startVoiceRecording = async (useVoiceConversation = false) => {
    const isVoiceConvMode = useVoiceConversation || voiceConversationMode;
    // Use both state and ref to prevent race conditions
    if (isRecording || isRecordingRef.current || isLoading) return false;

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setModalConfig({ title: "خطا", message: "مرورگر شما از ضبط صدا پشتیبانی نمی‌کند. لطفاً از مرورگر دیگری استفاده کنید." });
      return false;
    }

    try {
      // Enhanced audio settings for better voice recognition
      const audioConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
          // Increase sensitivity
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googEchoCancellation: true
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      streamRef.current = stream;

      // Check supported mimeTypes
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
                       MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' :
                       MediaRecorder.isTypeSupported('audio/ogg') ? 'audio/ogg' : '';

      mediaRecorderRef.current = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      audioChunksRef.current = [];

      // Setup silence detection for voice conversation mode
      const silenceThreshold = defaultChatSettings.voiceConversationSilenceThreshold || 2000;

      if (isVoiceConvMode) {
        try {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
          analyserRef.current = audioContextRef.current.createAnalyser();
          const source = audioContextRef.current.createMediaStreamSource(stream);
          source.connect(analyserRef.current);

          analyserRef.current.fftSize = 256;
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          hasSpokenRef.current = false;
          let silenceStart = null;

          // Check audio level every 100ms
          silenceCheckIntervalRef.current = setInterval(() => {
            if (!analyserRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
              return;
            }

            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;

            // Threshold for silence (adjust as needed, 10-15 is typical for silence)
            const isSilent = average < 12;

            if (!isSilent) {
              // User is speaking
              hasSpokenRef.current = true;
              silenceStart = null;
            } else if (hasSpokenRef.current) {
              // User has spoken before and is now silent
              if (!silenceStart) {
                silenceStart = Date.now();
              } else if (Date.now() - silenceStart >= silenceThreshold) {
                // Silence threshold reached - auto stop recording
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  mediaRecorderRef.current.stop();
                  cleanupSilenceDetection();
                }
              }
            }
          }, 100);
        } catch (silenceErr) {
          console.error('Silence detection setup error:', silenceErr);
          // Continue without silence detection if it fails
        }
      }

      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        // Important: Reset recording state first so next recording can start
        isRecordingRef.current = false;
        setIsRecording(false);

        // Cleanup silence detection
        cleanupSilenceDetection();

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (audioChunksRef.current.length === 0) {
          if (!voiceConversationModeRef.current) {
            setModalConfig({ title: "خطا", message: "صدایی ضبط نشد. لطفا دوباره تلاش کنید." });
          }
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (sendVoiceAs === 'text' && recognitionRef.current && !voiceConversationModeRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            handleSend("[پیام صوتی]", audioUrl);
          }
        } else {
          handleSend("[پیام صوتی]", audioUrl);
        }
      };

      mediaRecorderRef.current.onerror = (err) => {
        console.error('MediaRecorder error:', err);
        cleanupSilenceDetection();
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        isRecordingRef.current = false;
        setIsRecording(false);
        if (voiceConversationMode) {
          voiceConversationModeRef.current = false;
          setVoiceConversationMode(false);
        }
        setModalConfig({ title: "خطای ضبط", message: "مشکلی در ضبط صدا پیش آمد." });
      };

      mediaRecorderRef.current.start();
      isRecordingRef.current = true;
      setIsRecording(true);
      return true;
    } catch (err) {
      console.error('Microphone error:', err);
      cleanupSilenceDetection();
      if (voiceConversationMode) {
        voiceConversationModeRef.current = false;
        setVoiceConversationMode(false);
        // Also close global voice conversation state to prevent FloatingWidget from retrying
        closeVoiceConv();
      }

      // Provide specific error messages
      let errorMessage = "دسترسی به میکروفون امکان‌پذیر نیست.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = "دسترسی به میکروفون رد شد. لطفاً در تنظیمات مرورگر اجازه دسترسی بدهید.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = "میکروفونی یافت نشد. لطفاً میکروفون را وصل کنید.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = "میکروفون در حال استفاده توسط برنامه دیگری است.";
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = "تنظیمات میکروفون پشتیبانی نمی‌شود.";
      } else if (err.name === 'TypeError') {
        errorMessage = "خطای فنی در دسترسی به میکروفون.";
      }

      setModalConfig({ title: "خطای میکروفون", message: errorMessage });
      return false;
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    cleanupSilenceDetection();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    isRecordingRef.current = false;
    setIsRecording(false);
  };

  // Effect to handle auto-start recording after returning from minimized state
  useEffect(() => {
    if (pendingAutoStartRecording && voiceConversationMode && !isRecording) {
      setPendingAutoStartRecording(false);
      // Small delay to let the component fully stabilize
      const timer = setTimeout(() => {
        if (voiceConversationModeRef.current && !isRecordingRef.current && !recordingStartPendingRef.current) {
          console.log('Auto-starting recording now');
          startVoiceRecording(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAutoStartRecording, voiceConversationMode, isRecording]);

  // Toggle voice conversation mode
  const toggleVoiceConversationMode = async () => {
    if (voiceConversationMode) {
      // Turning off - stop any ongoing audio/recording
      voiceConversationModeRef.current = false;

      cleanupSilenceDetection();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.onended = null;
        currentAudioRef.current = null;
      }
      stopVoiceRecording();
      setVoiceConversationMode(false);
      // Close voice conv in context
      closeVoiceConv();
    } else {
      // Turning on - start voice conversation mode and begin recording
      voiceConversationModeRef.current = true;
      setVoiceConversationMode(true);
      // Pass true to indicate voice conversation mode since state hasn't updated yet
      // Wait for recording to start successfully before opening voice conv
      const success = await startVoiceRecording(true);
      if (success) {
        // Only open voice conv context if recording started successfully
        openVoiceConv({
          context,
          lessonTitle,
          selectedTopics,
          customScenarioName,
          customScenarioDetails,
          aiVoice,
          accentMode
        });
      } else {
        // Recording failed - reset state
        voiceConversationModeRef.current = false;
        setVoiceConversationMode(false);
      }
    }
  };

  // Stop current audio playback without ending voice conversation mode
  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.onended = null;
      currentAudioRef.current = null;
      updateVoiceConvStatus({ isPlaying: false });
      // Start recording again after a short delay
      if (voiceConversationModeRef.current && !isRecordingRef.current && !isRecording) {
        setTimeout(() => {
          if (voiceConversationModeRef.current && !isRecordingRef.current) {
            playBeepSound(800, 150).then(() => startVoiceRecording(true));
          }
        }, 300);
      }
    }
  };

  const handleMicClick = async (e) => {
    e.preventDefault();

    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const handleFileAttach = (event) => {
    const file = event.target.files[0];
    if (file) {
        setAttachedFile(file);
        const fileMessage = { role: 'system', parts: [{ text: `فایل "${file.name}" برای تحلیل پیوست شد.`, type: 'system' }] };
        setChatHistory(prev => [...prev, fileMessage]);
    }
    event.target.value = null;
  };

  const openSaveModal = (text) => { setItemToSave(text); setModalOpen(true); };

  return (
    <>
      <SaveToKnowledgeBaseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} item={itemToSave} updateKnowledgeBase={updateKnowledgeBase} addJournalEntry={addJournalEntry} setModalConfig={setModalConfig} />
      <div className="h-[calc(100vh-200px)] min-h-[400px] max-h-[700px] flex flex-col bg-slate-100 rounded-xl p-2 sm:p-3">
        <div className="flex justify-between items-center mb-2">
          {context === 'global' && (
              <div className={`relative group flex-1 ${voiceConversationMode ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button className="w-full p-2 border rounded-lg text-sm text-left" disabled={voiceConversationMode}>انتخاب موضوع تمرین ({selectedTopics.includes('general') || selectedTopics.includes('custom_scenario') ? 1 : selectedTopics.length})</button>
                  <div className={`${voiceConversationMode ? 'hidden' : 'hidden group-hover:block'} absolute z-10 bg-white shadow-lg rounded-lg p-2 w-full space-y-1`}>
                      {Object.entries(kbCategories).map(([key, value]) => (<label key={key} className="flex items-center gap-2 p-1 rounded hover:bg-slate-100"><input type="checkbox" checked={selectedTopics.includes(key)} onChange={() => handleTopicChange(key)} disabled={!knowledgeBase[key]?.length || voiceConversationMode}/>{value}</label>))}
                      <div className="border-t pt-1 mt-1"><label className="flex items-center gap-2 p-1 rounded hover:bg-slate-100"><input type="radio" name="topic-mode" checked={selectedTopics.includes('general')} onChange={() => handleTopicChange('general')} disabled={voiceConversationMode}/>مکالمه عمومی</label><label className="flex items-center gap-2 p-1 rounded hover:bg-slate-100"><input type="radio" name="topic-mode" checked={selectedTopics.includes('custom_scenario')} onChange={() => handleTopicChange('custom_scenario')} disabled={voiceConversationMode}/>سناریوی سفارشی</label></div>
                  </div>
              </div>
          )}
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 text-slate-500 hover:text-teal-600"><Settings size={20}/></button>
        </div>
        {showSettings && (
          <div className="p-3 border rounded-xl bg-white mb-2 text-sm space-y-3">
              <div><label className="font-bold">صدای استاد:</label><select value={aiVoice} onChange={e => setAiVoice(e.target.value)} className="w-full p-1 border rounded mt-1">{Object.entries(availableVoices).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></div>
              <div className="border-t pt-2"><label className="font-bold">لهجه استاد:</label><div className="flex gap-4 mt-1"><label><input type="radio" name="accent" value="standard" checked={accentMode === 'standard'} onChange={() => setAccentMode('standard')} /> استاندارد</label><label><input type="radio" name="accent" value="authentic" checked={accentMode === 'authentic'} onChange={() => setAccentMode('authentic')} /> محاوره‌ای</label></div></div>
              <div className="border-t pt-2"><label className="font-bold">سبک نوشتار:</label><select value={writingStyle} onChange={e => setWritingStyle(e.target.value)} className="w-full p-1 border rounded mt-1"><option value="simple_arabic">عربی ساده</option><option value="finglish">فینگلیش (Arabizi)</option><option value="tashkeel">عربی با اعراب</option></select></div>
              <div className="border-t pt-2"><label className="font-bold">نمایش ترجمه:</label><select value={translationLanguage} onChange={e => setTranslationLanguage(e.target.value)} className="w-full p-1 border rounded mt-1"><option value="none">بدون ترجمه</option><option value="persian">فارسی</option><option value="english">انگلیسی</option></select></div>
              <div className="border-t pt-2"><label className="font-bold">پاسخ استاد:</label><div className="flex gap-4 mt-1"><label><input type="radio" name="receiveAs" value="audio" checked={aiResponseType === 'audio'} onChange={() => setAiResponseType('audio')} /> صدا</label><label><input type="radio" name="receiveAs" value="text" checked={aiResponseType === 'text'} onChange={() => setAiResponseType('text')} /> فقط متن</label></div></div>
              <div className="border-t pt-2"><label className="font-bold">ارسال پیام صوتی:</label><div className="flex gap-4 mt-1"><label><input type="radio" name="sendAs" value="audio" checked={sendVoiceAs === 'audio'} onChange={() => setSendVoiceAs('audio')} /> فایل صوتی</label><label><input type="radio" name="sendAs" value="text" checked={sendVoiceAs === 'text'} onChange={() => setSendVoiceAs('text')} /> تبدیل به متن</label></div></div>
          </div>
        )}
        {selectedTopics.includes('custom_scenario') && context === 'global' && (
            <div className="p-3 border rounded-xl bg-slate-200 mb-2 space-y-2">
                <input type="text" placeholder="نام سناریو..." value={customScenarioName} onChange={(e) => setCustomScenarioName(e.target.value)} className="w-full p-2 border rounded text-sm"/>
                <textarea placeholder="جزئیات سناریو..." value={customScenarioDetails} onChange={(e) => setCustomScenarioDetails(e.target.value)} className="w-full p-2 border rounded text-sm" rows="2"/>
                <button onClick={handleStartCustomScenario} className="w-full bg-teal-500 text-white p-2 rounded-lg text-sm font-bold">شروع سناریو</button>
            </div>
        )}
        <div ref={chatWindowRef} className="flex-1 overflow-y-auto p-2 space-y-4">
          {chatHistory.map((msg, index) => (<ChatMessage key={`${index}-${msg.parts[0].text?.slice(0, 10) || 'audio'}`} message={msg.parts[0]} role={msg.role} onSave={openSaveModal} voice={aiVoice} msgType={msg.type} audioData={msg.audioData} mimeType={msg.mimeType} isVoiceCall={msg.isVoiceCall} isVoiceCallHeader={msg.isVoiceCallHeader} isCallAnalysis={msg.isCallAnalysis} />))}
          {isLoading && (<div className="flex justify-start"><div className="max-w-[80%] py-2 px-4 rounded-2xl bg-white text-slate-500 rounded-bl-none shadow-sm">...</div></div>)}
        </div>
        <div className="pt-2 flex-shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} className="flex-1 p-3 border rounded-xl text-base bg-white" placeholder="پیام خود را بنویسید..." disabled={isLoading || voiceConversationMode} />
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => fileInputRef.current.click()} className="p-2 border rounded-xl hover:bg-slate-200 flex-shrink-0" disabled={voiceConversationMode}><Paperclip size={20}/></button>
              <input type="file" ref={fileInputRef} onChange={handleFileAttach} className="hidden" />
              <button onClick={handleMicClick} className={`p-2 border rounded-xl flex-shrink-0 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-slate-200'}`} disabled={voiceConversationMode}><Mic size={20}/></button>
              <button
                onClick={toggleVoiceConversationMode}
                className={`p-2 border rounded-xl flex items-center gap-1 flex-shrink-0 ${voiceConversationMode ? 'bg-purple-500 text-white' : 'hover:bg-purple-100 text-purple-600 border-purple-300'}`}
                title="حالت مکالمه صوتی (با تشخیص سکوت خودکار)"
              >
                <MessageCircle size={20}/>
                <span className="text-xs font-bold hidden sm:inline">گفتگو</span>
              </button>
              <button
                onClick={() => openLiveChat({
                  context,
                  lessonTitle,
                  selectedTopics,
                  customScenarioName,
                  customScenarioDetails,
                  aiVoice,
                  accentMode,
                  knowledgeBase,
                  initialHistory: chatHistory
                })}
                disabled={isLiveChatActive}
                className={`p-2 border rounded-xl flex items-center gap-1 flex-shrink-0 ${isLiveChatActive ? 'bg-pink-200 text-pink-400 border-pink-200 cursor-not-allowed' : 'hover:bg-pink-100 text-pink-600 border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50'}`}
                title="مکالمه زنده با جاد (Gemini Live)"
              >
                <Phone size={20}/>
                <span className="text-xs font-bold">Live</span>
              </button>
            </div>
            <button onClick={() => handleSend()} className="bg-teal-500 text-white px-6 py-2 rounded-xl hover:bg-teal-600 disabled:bg-slate-400 font-bold flex-shrink-0 mr-auto" disabled={isLoading || voiceConversationMode}>{isLoading ? '...' : 'ارسال'}</button>
          </div>
          {/* Voice Conversation Mode Indicator — sits below the action buttons so
              it never overlaps the chat (works on web and mobile). */}
          {voiceConversationMode && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <MessageCircle size={20} className="animate-pulse flex-shrink-0" />
                <span className="font-bold">حالت مکالمه صوتی</span>
                {isRecording && <span className="text-sm bg-white/20 px-2 py-1 rounded-full animate-pulse flex items-center gap-1"><Mic size={14} /> صحبت کنید...</span>}
                {isLoading && <span className="text-sm bg-white/20 px-2 py-1 rounded-full">در حال پاسخگویی...</span>}
                {!isRecording && !isLoading && voiceConvStatus?.isPlaying && <span className="text-sm bg-white/20 px-2 py-1 rounded-full flex items-center gap-1"><Volume2 size={14} /> استاد صحبت میکنه...</span>}
                {!isRecording && !isLoading && !voiceConvStatus?.isPlaying && <span className="text-sm bg-white/20 px-2 py-1 rounded-full">منتظر بوق...</span>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {voiceConvStatus?.isPlaying && (
                  <button onClick={stopCurrentAudio} className="bg-red-500/60 hover:bg-red-500 p-2 rounded-lg flex items-center gap-1" title="قطع صدا">
                    <Square size={16} fill="currentColor" />
                    <span className="text-xs">قطع صدا</span>
                  </button>
                )}
                <button onClick={toggleVoiceConversationMode} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg flex items-center gap-1" title="پایان مکالمه">
                  <PhoneOff size={18} />
                  <span className="text-xs">پایان</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* LiveVoiceChat is now rendered globally at App level via GlobalLiveVoiceChat */}
    </>
  );
}

// Format analysis text into nice structured display
function AnalysisDisplay({ text }) {
  const sections = useMemo(() => {
    if (!text) return { general: '', pronunciations: [], words: [] };

    const result = { general: '', pronunciations: [], words: [] };

    // Extract general analysis
    const generalMatch = text.match(/---تحليل---\s*([\s\S]*?)(?=---اصلاحات|---نهاية|$)/);
    if (generalMatch) {
      result.general = generalMatch[1].trim();
    }

    // Extract pronunciation corrections
    const pronMatch = text.match(/---اصلاحات-تلفظ---\s*([\s\S]*?)(?=---اصلاحات-كلمات|---نهاية|$)/);
    if (pronMatch) {
      const pronText = pronMatch[1];
      const corrections = [];
      let current = {};

      pronText.split('\n').forEach(line => {
        const wrongMatch = line.match(/غلط:\s*(.+)/);
        const correctMatch = line.match(/صح:\s*(.+)/);
        const explainMatch = line.match(/شرح:\s*(.+)/);

        if (wrongMatch) {
          if (current.wrong) corrections.push(current);
          current = { wrong: wrongMatch[1].trim() };
        } else if (correctMatch && current.wrong) {
          current.correct = correctMatch[1].trim();
        } else if (explainMatch && current.wrong) {
          current.explanation = explainMatch[1].trim();
          corrections.push(current);
          current = {};
        }
      });

      if (current.wrong && current.correct) corrections.push(current);
      result.pronunciations = corrections;
    }

    // Extract word corrections
    const wordMatch = text.match(/---اصلاحات-كلمات---\s*([\s\S]*?)(?=---نهاية|$)/);
    if (wordMatch) {
      const wordText = wordMatch[1];
      const corrections = [];
      let current = {};

      wordText.split('\n').forEach(line => {
        const wrongMatch = line.match(/غلط:\s*(.+)/);
        const correctMatch = line.match(/صح:\s*(.+)/);

        if (wrongMatch) {
          if (current.wrong) corrections.push(current);
          current = { wrong: wrongMatch[1].trim() };
        } else if (correctMatch && current.wrong) {
          current.correct = correctMatch[1].trim();
          corrections.push(current);
          current = {};
        }
      });

      if (current.wrong && current.correct) corrections.push(current);
      result.words = corrections;
    }

    // If no sections found, it might be simple text like "اللهجة ممتازة!"
    if (!result.general && result.pronunciations.length === 0 && result.words.length === 0) {
      result.general = text.replace(/---[^-]+---/g, '').trim();
    }

    return result;
  }, [text]);

  const hasCorrections = sections.pronunciations.length > 0 || sections.words.length > 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 text-purple-700 font-bold text-sm border-b border-purple-200 pb-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        تحلیل لهجه تماس
      </div>

      {/* General analysis */}
      {sections.general && (
        <div className="bg-purple-50 rounded-lg p-3 text-sm text-slate-700">
          {sections.general}
        </div>
      )}

      {/* Pronunciation corrections */}
      {sections.pronunciations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-orange-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            اصلاحات تلفظی
          </h4>
          {sections.pronunciations.map((corr, i) => (
            <div key={i} className="bg-orange-50 rounded-lg p-2 text-sm border-r-4 border-orange-400">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded line-through">{corr.wrong}</span>
                <span className="text-slate-400">→</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">{corr.correct}</span>
              </div>
              {corr.explanation && (
                <p className="text-xs text-slate-600 mt-1 pr-2">{corr.explanation}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Word corrections */}
      {sections.words.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-blue-600 flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            اصلاحات کلمات
          </h4>
          {sections.words.map((corr, i) => (
            <div key={i} className="bg-blue-50 rounded-lg p-2 text-sm border-r-4 border-blue-400">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">{corr.wrong}</span>
                <span className="text-slate-400">→</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">{corr.correct}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success message when no corrections needed */}
      {!hasCorrections && sections.general && sections.general.includes('ممتاز') && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          عالی! لهجه درست بود
        </div>
      )}
    </div>
  );
}

function ChatMessage({ message, role, onSave, voice, disableSave = false, msgType, audioData, mimeType, isVoiceCall, isVoiceCallHeader, isCallAnalysis }) {
    const isError = message.isError;
    const [mainText, translation] = useMemo(() => {
        if (!message.text) return ['', ''];
        const parts = message.text.split('TRANSLATION:');
        return [parts[0].trim(), parts[1]?.trim()];
    }, [message.text]);

    // Create audio URL for live audio messages or voice calls
    const liveAudioUrl = useMemo(() => {
        if ((msgType === 'live_audio' || isVoiceCall) && audioData) {
            try {
                return getWavUrl(audioData, mimeType || 'audio/pcm;rate=24000');
            } catch (e) {
                console.error('Error creating audio URL:', e);
                return null;
            }
        }
        return null;
    }, [msgType, audioData, mimeType, isVoiceCall]);

    // Handle voice call header
    if (isVoiceCallHeader) {
        return (
            <div className="flex justify-center my-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-full text-sm font-medium">
                    {mainText}
                </div>
            </div>
        );
    }

    // Handle call analysis - nicely formatted
    if (isCallAnalysis) {
        return (
            <div className="flex justify-start my-2">
                <div className="max-w-[90%] bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 shadow-sm border border-purple-100">
                    <AnalysisDisplay text={mainText} />
                </div>
            </div>
        );
    }

    // Handle voice call messages
    if (isVoiceCall) {
        return (
            <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] py-2 px-4 rounded-2xl ${
                    role === 'user'
                        ? 'bg-teal-500 text-white rounded-br-none'
                        : 'bg-gradient-to-r from-purple-100 to-pink-100 text-slate-800 rounded-bl-none shadow-sm border border-purple-200'
                }`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Phone size={14} className={role === 'user' ? 'text-white' : 'text-purple-600'} />
                        <span className="text-xs opacity-80">تماس صوتی</span>
                    </div>
                    {mainText && <p className="text-sm">{mainText}</p>}
                    {liveAudioUrl && (
                        <audio src={liveAudioUrl} controls className="h-8 mt-2 w-full" />
                    )}
                </div>
            </div>
        );
    }

    // Handle live audio messages (from Live Voice Chat)
    if (msgType === 'live_audio' && audioData) {
        return (
            <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] py-2 px-4 rounded-2xl ${role === 'user' ? 'bg-teal-500 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none shadow-sm'}`}>
                    <div className="flex items-center gap-2">
                        {role === 'user' ? <Mic size={16} /> : <Volume2 size={16} />}
                        <span className="text-sm">{role === 'user' ? 'پیام صوتی شما' : 'پاسخ صوتی جاد'}</span>
                    </div>
                    {liveAudioUrl && (
                        <audio src={liveAudioUrl} controls className="h-10 mt-2 w-full" />
                    )}
                </div>
            </div>
        );
    }

    if (message.type === 'audio' && role === 'user') {
        return (
            <div className="flex justify-end">
                <div className="max-w-[80%] py-2 px-4 rounded-2xl bg-teal-500 text-white rounded-br-none">
                    <audio src={message.audioUrl} controls className="h-10" />
                    {message.transcribedText && (
                        <p className="text-sm mt-2 pt-2 border-t border-white/30 text-white/90">
                            📝 {message.transcribedText}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-end gap-2 ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {role === 'model' && !isError && !disableSave && <button onClick={() => onSave(mainText)} className="p-1 text-slate-400 hover:text-blue-600"><Plus size={16}/></button>}
            <div className={`max-w-[80%] py-2 px-4 rounded-2xl ${role === 'user' ? 'bg-teal-500 text-white rounded-br-none' : isError ? 'bg-red-100 text-red-800 rounded-bl-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>
                <p>{mainText}</p>
                {translation && <p className="text-xs pt-2 mt-2 border-t border-slate-300 opacity-70 italic">{translation}</p>}
            </div>
            {role === 'model' && !isError && message.audioUrl && <TTSButton textToSpeak={mainText} voice={voice} audioUrl={message.audioUrl} />}
        </div>
    );
}


// --- Utility Components ---
const Card = ({ title, children, actionButton }) => (<div className="bg-white p-6 rounded-2xl shadow-md"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-slate-800">{title}</h3>{actionButton}</div><div>{children}</div></div>);
const StatCard = ({ title, value, icon }) => (<div className="bg-white p-5 rounded-2xl shadow-md flex items-center gap-4"><div className="bg-slate-100 p-3 rounded-full">{icon}</div><div><h4 className="text-slate-500 font-bold">{title}</h4><p className="text-2xl font-bold text-slate-800 mt-1">{value}</p></div></div>);

// Only one chat TTS clip may play at a time across all message speaker buttons.
// Tracking the active <audio> at module scope means starting any clip (or an
// orphaned one left over after a re-render) reliably stops the previous one,
// so clicks never stack audio-over-audio.
let activeTtsAudio = null;
function stopActiveTtsAudio() {
    if (activeTtsAudio) {
        try { activeTtsAudio.pause(); activeTtsAudio.currentTime = 0; } catch { /* ignore */ }
        activeTtsAudio = null;
    }
}

function TTSButton({ textToSpeak, voice, audioUrl }) {
    const { stopVoiceConvAudio } = useLiveChat();
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const playAudio = async () => {
        if (!textToSpeak) return;

        // Clicking while THIS clip plays → stop it (toggle off).
        if (isPlaying && audioRef.current) {
            if (activeTtsAudio === audioRef.current) activeTtsAudio = null;
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            return;
        }

        // Otherwise stop whatever else is playing first (another message clip,
        // an orphaned clip, or the live voice-conversation audio).
        stopActiveTtsAudio();
        stopVoiceConvAudio();

        const startAudio = (url, onEnd) => {
            const audio = new Audio(url);
            audioRef.current = audio;
            activeTtsAudio = audio;
            audio.onplay = () => setIsPlaying(true);
            audio.onpause = () => setIsPlaying(false);
            audio.onerror = () => { setIsPlaying(false); if (activeTtsAudio === audio) activeTtsAudio = null; };
            audio.onended = () => {
                setIsPlaying(false);
                if (activeTtsAudio === audio) activeTtsAudio = null;
                if (onEnd) onEnd();
            };
            audio.play().catch(() => { setIsPlaying(false); if (activeTtsAudio === audio) activeTtsAudio = null; });
        };

        // If we have a pre-generated audio URL, use it.
        if (audioUrl) {
            startAudio(audioUrl);
            return;
        }

        // Generate new TTS.
        if (isLoading) return;
        setIsLoading(true);

        const result = await callGeminiTTS(`Say: ${textToSpeak}`, voice);
        if (result) {
            const newAudioUrl = getWavUrl(result.audioData, result.mimeType);
            startAudio(newAudioUrl, () => URL.revokeObjectURL(newAudioUrl));
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={playAudio}
            disabled={isLoading}
            className={`p-1 ${isPlaying ? 'text-teal-600' : 'text-slate-500 hover:text-teal-600'} disabled:text-slate-300`}
        >
            {isLoading ? <Loader size={18} className="animate-spin" /> : <Volume2 size={18} className={isPlaying ? 'animate-pulse' : ''} />}
        </button>
    );
}

// --- Floating Voice Conversation Widget (minimized view with conversation continuation) ---
function FloatingVoiceConvWidget() {
  const {
    isVoiceConvActive,
    isVoiceConvMinimized,
    voiceConvConfig,
    voiceConvStatus,
    maximizeVoiceConv,
    closeVoiceConv,
    navigateTo,
    updateVoiceConvStatus,
    voiceConvChatHistory,
    voiceConvAudioRef,
    voiceConvActiveRef,
    updateVoiceConvChatHistory,
    data
  } = useLiveChat();

  // Refs for voice conversation continuation
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const currentAudioRef = useRef(null);
  const isRecordingRef = useRef(false);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const silenceCheckIntervalRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const isProcessingRef = useRef(false);
  const startRecordingRef = useRef(null); // Ref to avoid circular dependency
  const processRecordingRef = useRef(null); // Ref to get latest processRecording
  const isVoiceConvMinimizedRef = useRef(isVoiceConvMinimized); // Ref to use in async callbacks

  // Keep minimized ref in sync
  useEffect(() => {
    isVoiceConvMinimizedRef.current = isVoiceConvMinimized;
  }, [isVoiceConvMinimized]);

  const { defaultChatSettings = {} } = data || {};

  // Cleanup function
  const cleanupRecording = useCallback(() => {
    if (silenceCheckIntervalRef.current) {
      clearInterval(silenceCheckIntervalRef.current);
      silenceCheckIntervalRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    isRecordingRef.current = false;
  }, []);

  // Start recording in minimized mode
  const startMinimizedRecording = useCallback(async () => {
    if (isRecordingRef.current || isProcessingRef.current || !voiceConvActiveRef.current) {
      console.log('FloatingWidget: Cannot start recording - already recording or processing');
      return;
    }

    console.log('FloatingWidget: Starting recording');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Double-check ref after async operation - voice conv might have been closed while waiting for mic
      if (!voiceConvActiveRef.current) {
        console.log('FloatingWidget: Voice conv closed during mic access, cleaning up');
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('FloatingWidget: Recording stopped, processing...');
        if (audioChunksRef.current.length === 0 || !voiceConvActiveRef.current) {
          cleanupRecording();
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (processRecordingRef.current) {
          await processRecordingRef.current(audioBlob);
        }
      };

      // Setup silence detection
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      hasSpokenRef.current = false;

      const silenceThreshold = defaultChatSettings.silenceThreshold || 10;
      const silenceDuration = defaultChatSettings.silenceDuration || 1500;

      silenceCheckIntervalRef.current = setInterval(() => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;

        if (average > silenceThreshold) {
          hasSpokenRef.current = true;
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        } else if (hasSpokenRef.current && !silenceTimeoutRef.current) {
          silenceTimeoutRef.current = setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              console.log('FloatingWidget: Silence detected, stopping recording');
              mediaRecorderRef.current.stop();
            }
          }, silenceDuration);
        }
      }, 100);

      mediaRecorder.start();
      isRecordingRef.current = true;
      updateVoiceConvStatus({ isRecording: true, isPlaying: false, isLoading: false });
      await playBeepSound(800, 150);

    } catch (err) {
      console.error('FloatingWidget: Microphone error:', err);
      cleanupRecording();
      updateVoiceConvStatus({ isRecording: false });
      // Close voice conversation on microphone error to prevent infinite retry loop
      closeVoiceConv();
    }
  }, [cleanupRecording, defaultChatSettings, updateVoiceConvStatus, closeVoiceConv]);

  // Keep ref updated to avoid circular dependency
  useEffect(() => {
    startRecordingRef.current = startMinimizedRecording;
  }, [startMinimizedRecording]);

  // Process recording and get AI response (defined first, then ref is set)
  // Note: processRecordingRef is set after processRecording is defined below

  // Process recording and get AI response
  const processRecording = useCallback(async (audioBlob) => {
    if (!voiceConvActiveRef.current) {
      cleanupRecording();
      return;
    }

    isProcessingRef.current = true;
    isRecordingRef.current = false;
    updateVoiceConvStatus({ isRecording: false, isLoading: true });
    cleanupRecording();

    try {
      // Convert audio to base64
      const reader = new FileReader();
      const audioBase64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Build chat history for API
      const currentHistory = voiceConvChatHistory || [];
      const userMessage = {
        role: 'user',
        parts: [{ inlineData: { mimeType: 'audio/webm', data: audioBase64 } }]
      };

      // Build system prompt
      const customPrompts = data?.customPrompts || {};
      const systemPrompt = `${customPrompts.chatBase || "You are Jad, a friendly Lebanese Arabic tutor."}\n${customPrompts.liveVoiceRules || ""}\n${customPrompts.chatTashkeel || ""}`;

      // Call API
      const payload = {
        history: [...currentHistory, userMessage],
        systemPrompt,
        userMessage: '[Voice input from user]',
        writingStyle: defaultChatSettings.writingStyle || 'tashkeel'
      };

      const textResponse = await callGeminiAPI(payload);

      if (!voiceConvActiveRef.current) {
        isProcessingRef.current = false;
        return;
      }

      // Update chat history
      const aiMessage = { role: 'model', parts: [{ text: textResponse, type: 'text' }] };
      const newHistory = [...currentHistory, userMessage, aiMessage];
      updateVoiceConvChatHistory(newHistory);

      // Get TTS
      const voiceName = defaultChatSettings.aiVoice || 'Charon';
      const ttsResult = await callGeminiTTS(textResponse, voiceName);

      if (!voiceConvActiveRef.current || !ttsResult) {
        isProcessingRef.current = false;
        updateVoiceConvStatus({ isLoading: false });
        return;
      }

      // Play audio response
      const audioUrl = getWavUrl(ttsResult.audioData, ttsResult.mimeType);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      voiceConvAudioRef.current = audio;

      audio.onended = () => {
        currentAudioRef.current = null;
        voiceConvAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
        updateVoiceConvStatus({ isPlaying: false });
        isProcessingRef.current = false;

        // Continue conversation if still active and minimized - use refs for all checks
        if (voiceConvActiveRef.current && isVoiceConvMinimizedRef.current) {
          setTimeout(() => {
            if (voiceConvActiveRef.current && isVoiceConvMinimizedRef.current && startRecordingRef.current) {
              startRecordingRef.current();
            }
          }, defaultChatSettings.voiceConversationBeepDelay || 500);
        }
      };

      audio.onerror = () => {
        currentAudioRef.current = null;
        voiceConvAudioRef.current = null;
        updateVoiceConvStatus({ isPlaying: false, isLoading: false });
        isProcessingRef.current = false;
      };

      updateVoiceConvStatus({ isLoading: false, isPlaying: true });
      audio.play().catch(err => {
        console.error('FloatingWidget: Audio play error:', err);
        isProcessingRef.current = false;
      });

    } catch (err) {
      console.error('FloatingWidget: Error processing recording:', err);
      updateVoiceConvStatus({ isLoading: false });
      isProcessingRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanupRecording, voiceConvChatHistory, data, defaultChatSettings, updateVoiceConvStatus, updateVoiceConvChatHistory, isVoiceConvMinimized]);

  // Keep processRecording ref updated
  useEffect(() => {
    processRecordingRef.current = processRecording;
  }, [processRecording]);

  // Watch for audio ending when minimized
  useEffect(() => {
    if (!isVoiceConvActive || !isVoiceConvMinimized) return;

    const audio = voiceConvAudioRef.current;
    if (!audio) {
      // No audio playing, start recording if not already
      if (!isRecordingRef.current && !isProcessingRef.current) {
        console.log('FloatingWidget: No audio, starting recording');
        const timer = setTimeout(() => {
          // Use refs for all checks to avoid stale closures
          if (voiceConvActiveRef.current && isVoiceConvMinimizedRef.current && !isRecordingRef.current && !isProcessingRef.current && startRecordingRef.current) {
            startRecordingRef.current();
          }
        }, 500);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Audio is playing, set up onended handler
    const originalOnended = audio.onended;
    audio.onended = () => {
      console.log('FloatingWidget: Audio ended');
      if (originalOnended) originalOnended();
      voiceConvAudioRef.current = null;
      currentAudioRef.current = null;
      updateVoiceConvStatus({ isPlaying: false });

      // Start recording after delay - use refs for all checks
      setTimeout(() => {
        if (voiceConvActiveRef.current && isVoiceConvMinimizedRef.current && !isRecordingRef.current && !isProcessingRef.current && startRecordingRef.current) {
          startRecordingRef.current();
        }
      }, defaultChatSettings.voiceConversationBeepDelay || 500);
    };

    return () => {
      // Restore original handler if component unmounts while audio is still playing
      if (audio && originalOnended) {
        audio.onended = originalOnended;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoiceConvActive, isVoiceConvMinimized, defaultChatSettings, updateVoiceConvStatus]);

  // Cleanup on close
  useEffect(() => {
    return () => {
      cleanupRecording();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, [cleanupRecording]);

  if (!isVoiceConvActive || !isVoiceConvMinimized) return null;

  const { isRecording, isPlaying, isLoading } = voiceConvStatus;

  const getStatusColor = () => {
    if (isLoading) return 'bg-yellow-500 animate-pulse';
    if (isRecording) return 'bg-red-500 animate-pulse';
    if (isPlaying) return 'bg-purple-500 animate-pulse';
    return 'bg-slate-500';
  };

  const getStatusText = () => {
    if (isLoading) return 'در حال پردازش...';
    if (isRecording) return 'در حال ضبط...';
    if (isPlaying) return 'در حال پخش...';
    return 'متوقف شده';
  };

  // Navigate back to the chat page
  const handleMaximize = () => {
    // Stop recording before maximizing
    cleanupRecording();
    if (voiceConvConfig?.context && navigateTo) {
      if (voiceConvConfig.context === 'global') {
        navigateTo('dashboard');
      } else if (voiceConvConfig.context.startsWith('lesson-')) {
        const lessonId = parseInt(voiceConvConfig.context.replace('lesson-', ''));
        navigateTo('lesson', { id: lessonId });
      }
    }
    maximizeVoiceConv();
  };

  const handleClose = () => {
    cleanupRecording();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    closeVoiceConv();
  };

  // Stop current audio and start recording again
  const handleStopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.onended = null;
      currentAudioRef.current = null;
    }
    if (voiceConvAudioRef.current) {
      voiceConvAudioRef.current.pause();
      voiceConvAudioRef.current.onended = null;
      voiceConvAudioRef.current = null;
    }
    updateVoiceConvStatus({ isPlaying: false });
    isProcessingRef.current = false;

    // Start recording after a short delay
    setTimeout(() => {
      if (voiceConvActiveRef.current && isVoiceConvMinimizedRef.current && !isRecordingRef.current && startRecordingRef.current) {
        startRecordingRef.current();
      }
    }, 300);
  };

  return (
    <div
      className="fixed bottom-24 right-6 z-50"
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl border border-purple-400/30 overflow-hidden w-72">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-black/20">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-white" />
            <span className="text-white font-medium text-sm">گفتگو با جاد</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleMaximize}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="بازگشت به صفحه چت"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg bg-red-500/50 hover:bg-red-500 text-white transition-colors"
              title="پایان گفتگو"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="p-4 flex items-center justify-center gap-3">
          <div className="relative">
            <div className={`w-16 h-16 rounded-full ${getStatusColor()} flex items-center justify-center shadow-lg`}>
              {isLoading ? (
                <Loader size={28} className="text-white animate-spin" />
              ) : isRecording ? (
                <Mic size={28} className="text-white" />
              ) : isPlaying ? (
                <Volume2 size={28} className="text-white animate-pulse" />
              ) : (
                <MicOff size={28} className="text-white" />
              )}
            </div>
            {/* Stop audio button overlay - only show when playing */}
            {isPlaying && (
              <button
                onClick={handleStopAudio}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors"
                title="قطع صدا"
              >
                <Square size={12} fill="currentColor" className="text-white" />
              </button>
            )}
          </div>
          <div className="text-white">
            <div className="font-medium">{getStatusText()}</div>
            {voiceConvConfig?.lessonTitle ? (
              <div className="text-white/60 text-sm truncate max-w-[120px]">
                {voiceConvConfig.lessonTitle}
              </div>
            ) : (
              <div className="text-white/60 text-sm">داشبورد</div>
            )}
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={handleMaximize}
          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>بازگشت به چت</span>
          <ChevronUp size={16} />
        </button>
      </div>
    </div>
  );
}

// --- Floating Live Chat Widget (minimized view) ---
function FloatingLiveChatWidget() {
  const {
    isLiveChatActive,
    isMinimized,
    liveChatConfig,
    maximizeLiveChat,
    closeLiveChat
  } = useLiveChat();

  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Listen to global live chat state (will be set by LiveVoiceChat)
  useEffect(() => {
    const handleLiveChatStatus = (e) => {
      if (e.detail) {
        if (e.detail.connectionStatus !== undefined) setConnectionStatus(e.detail.connectionStatus);
        if (e.detail.isListening !== undefined) setIsListening(e.detail.isListening);
        if (e.detail.isSpeaking !== undefined) setIsSpeaking(e.detail.isSpeaking);
      }
    };
    window.addEventListener('liveChatStatusUpdate', handleLiveChatStatus);
    return () => window.removeEventListener('liveChatStatusUpdate', handleLiveChatStatus);
  }, []);

  if (!isLiveChatActive || !isMinimized) return null;

  const getStatusColor = () => {
    if (connectionStatus === 'disconnected') return 'bg-slate-500';
    if (connectionStatus === 'connecting') return 'bg-yellow-500 animate-pulse';
    if (connectionStatus === 'error') return 'bg-red-500';
    if (isListening) return 'bg-red-500 animate-pulse';
    if (isSpeaking) return 'bg-purple-500 animate-pulse';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (connectionStatus === 'disconnected') return 'قطع';
    if (connectionStatus === 'connecting') return 'اتصال...';
    if (connectionStatus === 'error') return 'خطا';
    if (isListening) return 'گوش دادن...';
    if (isSpeaking) return 'صحبت می‌کند';
    return 'متصل';
  };

  return (
    <div
      className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300"
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div className="bg-gradient-to-br from-purple-800 via-purple-700 to-pink-800 rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden w-72">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-black/20">
          <div className="flex items-center gap-2">
            <Phone size={18} className="text-white" />
            <span className="text-white font-medium text-sm">تماس با جاد</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={maximizeLiveChat}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="بازگشت به تمام صفحه"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            </button>
            <button
              onClick={closeLiveChat}
              className="p-1.5 rounded-lg bg-red-500/50 hover:bg-red-500 text-white transition-colors"
              title="پایان تماس"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="p-4 flex items-center justify-center gap-3">
          <div className={`w-16 h-16 rounded-full ${getStatusColor()} flex items-center justify-center shadow-lg`}>
            {connectionStatus === 'connecting' ? (
              <Loader size={28} className="text-white animate-spin" />
            ) : isListening ? (
              <Mic size={28} className="text-white" />
            ) : isSpeaking ? (
              <Volume2 size={28} className="text-white animate-pulse" />
            ) : connectionStatus === 'connected' ? (
              <Phone size={28} className="text-white" />
            ) : (
              <PhoneOff size={28} className="text-white" />
            )}
          </div>
          <div className="text-white">
            <div className="font-medium">{getStatusText()}</div>
            {liveChatConfig?.lessonTitle && (
              <div className="text-white/60 text-sm truncate max-w-[120px]">
                {liveChatConfig.lessonTitle}
              </div>
            )}
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={maximizeLiveChat}
          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>باز کردن تمام صفحه</span>
          <ChevronUp size={16} />
        </button>
      </div>
    </div>
  );
}

// --- Gemini Live API Real-time Voice Chat ---
function LiveVoiceChat({
  isOpen,
  onClose,
  onMinimize,
  chatHistory,
  setChatHistory,
  saveChatHistory,
  context,
  lessonTitle,
  selectedTopics,
  customScenarioName,
  customScenarioDetails,
  aiVoice,
  accentMode,
  addJournalEntry,
  knowledgeBase,
  pronunciationCorrections = [],
  addPronunciationCorrection,
  customPrompts = {},
  isMinimized = false
}) {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(aiVoice || 'Aoede');
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionWrong, setCorrectionWrong] = useState('');
  const [correctionCorrect, setCorrectionCorrect] = useState('');

  // Flow tracking
  const { setCurrentNode } = useExecutionFlow();

  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);

  // Reconnect bookkeeping for the Live Voice socket. `userClosedRef` distinguishes
  // a deliberate disconnect (user pressed stop) from an unexpected drop so we only
  // auto-reconnect the latter; `reconnectAttemptsRef` drives the exponential
  // backoff (see ../utils/wsReconnect.js) and `reconnectTimerRef` holds the
  // pending retry timer so it can be cancelled on disconnect/unmount.
  const userClosedRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);

  // Recording refs
  const conversationRef = useRef([]); // Stores {role, text, audioData, mimeType}
  const currentAiAudioChunksRef = useRef([]); // Collects audio chunks for current AI response
  const currentAiTextRef = useRef(''); // Collects text for current AI response

  // Voices optimized for Arabic - Aoede and Charon seem better
  const availableVoices = {
    'Aoede': 'صدای ۱ (پیشنهادی)',
    'Charon': 'صدای ۲ - مرد',
    'Fenrir': 'صدای ۳ - مرد',
    'Kore': 'صدای ۴ - زن',
    'Puck': 'صدای ۵ - مرد'
  };

  // Wake Lock ref for preventing screen sleep
  const wakeLockRef = useRef(null);

  // Wake Lock to prevent screen sleep during live voice chat
  useEffect(() => {
    const requestWakeLock = async () => {
      if (isOpen && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          console.log('LiveChat Wake Lock activated');
        } catch (err) {
          console.log('Wake Lock failed:', err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('LiveChat Wake Lock released');
      }
    };

    if (isOpen) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => releaseWakeLock();
  }, [isOpen]);

  useEffect(() => {
    if (aiVoice && availableVoices[aiVoice]) setSelectedVoice(aiVoice);
  }, [aiVoice]);

  // Broadcast status to floating widget
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('liveChatStatusUpdate', {
      detail: { connectionStatus, isListening, isSpeaking }
    }));
  }, [connectionStatus, isListening, isSpeaking]);

  useEffect(() => {
    return () => disconnect();
  }, []);

  useEffect(() => {
    if (isOpen && connectionStatus === 'disconnected') {
      // Don't auto-connect, wait for user to press start
    } else if (!isOpen && connectionStatus !== 'disconnected') {
      disconnect();
    }
  }, [isOpen]);

  const connect = () => {
    // A fresh user-initiated connect clears any pending auto-reconnect and the
    // "user closed" flag so the backoff curve starts over for this session.
    userClosedRef.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    // Reset state for new connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    conversationRef.current = [];
    currentAiAudioChunksRef.current = [];
    currentAiTextRef.current = '';
    audioQueueRef.current = [];
    isPlayingRef.current = false;

    setConnectionStatus('connecting');
    setCurrentNode('wsConnecting', 'liveVoice');
    setTranscript([]);

    // Resolve the Live Voice endpoint: honours VITE_WS_URL when set, otherwise
    // falls back to this origin's /ws/live (see ../utils/wsUrl.js).
    const wsUrl = resolveLiveWsUrl();

    try {
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        // A successful handshake resets the backoff so the next unexpected drop
        // retries quickly (1s) rather than continuing a long backoff curve.
        reconnectAttemptsRef.current = 0;
      };
      wsRef.current.onmessage = (event) => {
        try {
          handleGeminiMessage(JSON.parse(event.data));
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
      wsRef.current.onerror = (e) => {
        console.error('WebSocket error:', e);
        setConnectionStatus('error');
        setCurrentNode('error', 'liveVoice');
      };
      wsRef.current.onclose = (e) => {
        console.log('WebSocket closed:', e.code, e.reason);
        setCurrentNode('idle', 'liveVoice');
        stopListening();
        scheduleReconnect();
      };
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
      setCurrentNode('error', 'liveVoice');
      scheduleReconnect();
    }
  };

  // Schedule an automatic reconnect after an UNEXPECTED close using bounded
  // exponential backoff (1s, 2s, 4s, 8s, 16s, 30s; see ../utils/wsReconnect.js).
  // A deliberate disconnect (userClosedRef) or exhausting the attempt budget
  // leaves the socket disconnected and surfaces that to the user via
  // connectionStatus instead of retrying forever and flooding the server.
  const scheduleReconnect = () => {
    if (userClosedRef.current) {
      setConnectionStatus('disconnected');
      return;
    }
    if (!shouldReconnect(reconnectAttemptsRef.current)) {
      console.error('WebSocket reconnect attempts exhausted; giving up');
      setConnectionStatus('error');
      setCurrentNode('error', 'liveVoice');
      return;
    }
    reconnectAttemptsRef.current += 1;
    const delay = nextReconnectDelay(reconnectAttemptsRef.current);
    console.warn(`WebSocket reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
    setConnectionStatus('connecting');
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      if (!userClosedRef.current) connect();
    }, delay);
  };

  // Combine multiple audio chunks into one
  const combineAudioChunks = (chunks) => {
    if (!chunks || chunks.length === 0) return { data: null, mimeType: null };
    if (chunks.length === 1) return { data: chunks[0].data, mimeType: chunks[0].mimeType };

    // Combine base64 PCM chunks
    const mimeType = chunks[0].mimeType;

    // Collect all binary strings
    const binaryStrings = [];
    for (const chunk of chunks) {
      try {
        binaryStrings.push(atob(chunk.data));
      } catch (e) {
        console.warn('Invalid base64 chunk, skipping');
      }
    }

    // Calculate total length
    let totalLength = 0;
    for (const str of binaryStrings) {
      totalLength += str.length;
    }

    // Create Uint8Array and fill it
    const allBytes = new Uint8Array(totalLength);
    let offset = 0;
    for (const str of binaryStrings) {
      for (let i = 0; i < str.length; i++) {
        allBytes[offset++] = str.charCodeAt(i);
      }
    }

    // Convert to base64 in chunks to avoid stack overflow
    const CHUNK_SIZE = 0x8000; // 32KB chunks
    let result = '';
    for (let i = 0; i < allBytes.length; i += CHUNK_SIZE) {
      const chunk = allBytes.subarray(i, Math.min(i + CHUNK_SIZE, allBytes.length));
      result += String.fromCharCode.apply(null, chunk);
    }
    const combined = btoa(result);
    return { data: combined, mimeType };
  };

  const disconnect = () => {
    // Mark this as a deliberate close so the socket's onclose handler does NOT
    // auto-reconnect, and cancel any retry already scheduled by a prior drop.
    userClosedRef.current = true;
    reconnectAttemptsRef.current = 0;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    stopListening();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
    setCurrentNode('idle', 'liveVoice');
    setTranscript([]);
  };

  const analyzeCallForDialect = async (conversationTexts) => {
    // Build the conversation text for analysis
    const conversationSummary = conversationTexts
      .filter(c => c.text && c.text !== '🎤 پیام صوتی' && c.text !== '🔊 پاسخ صوتی')
      .map(c => `${c.role === 'ai' ? 'جاد' : 'کاربر'}: ${c.text}`)
      .join('\n');

    if (!conversationSummary.trim()) return null;

    const analysisPrompt = `انت خبير باللهجة اللبنانية البيروتية وبتفهم كتير منيح كيف اللبنانية لازم تنلفظ.

راجع كلام جاد (المعلم) بهيدي المحادثة:

المحادثة:
${conversationSummary}

=== مهمتك الأساسية ===

1. تحليل التلفظ والحركات:
   - شوف إذا الكلمات لازم تنكتب بحركات مختلفة للتلفظ اللبناني الصحيح
   - مثلاً: "كَيفَك" مش "كَيْفُك"، "شو بَدَّك" مش "شو بِدُّك"
   - اللبناني بيحذف حركات كتير وبيسكّن أواخر الكلمات

2. تحليل اختيار الكلمات:
   - شوف إذا استخدم كلمات فصحى بدل اللبنانية
   - مثلاً: "ماذا" بدل "شو"، "الآن" بدل "هلأ"

3. تحليل طريقة النطق:
   - القاف لازم تكون همزة: قلب ← ألب
   - الثاء لازم تكون ت: ثلاثة ← تلاتة
   - الذال لازم تكون د: هذا ← هيدا

=== فورمات الجواب ===

---تحليل---
[ملاحظاتك العامة]

---اصلاحات-تلفظ---
غلط: [الكلمة كما قيلت]
صح: [الكلمة بالحركات الصحيحة للتلفظ اللبناني - استخدم الحركات: َ ِ ُ ْ ّ]
شرح: [كيف لازم تنلفظ]

---اصلاحات-كلمات---
غلط: [الكلمة الفصحى]
صح: [البديل اللبناني]

---نهاية---

مهم: اكتب الكلمات الصحيحة بالحركات الكاملة حتى تنقرأ صح!
إذا ما في أخطاء، اكتب "اللهجة ممتازة!" بس.`;

    try {
      console.log('🔍 Starting dialect analysis...');
      console.log('📝 Conversation summary:', conversationSummary.substring(0, 200));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }]
        })
      });

      console.log('📡 Analysis response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Analysis result received');
        return data.text || data.candidates?.[0]?.content?.parts?.[0]?.text;
      } else {
        const errorText = await response.text();
        console.error('❌ Analysis API error:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error analyzing call:', error);
    }
    return null;
  };

  const parseCorrectionsFromAnalysis = (analysisText) => {
    if (!analysisText) return [];
    const corrections = [];
    const lines = analysisText.split('\n');

    let currentWrong = null;
    for (const line of lines) {
      const wrongMatch = line.match(/غلط:\s*(.+)/);
      const correctMatch = line.match(/صح:\s*(.+)/);

      if (wrongMatch) {
        currentWrong = wrongMatch[1].trim();
      } else if (correctMatch && currentWrong) {
        corrections.push({
          wrong: currentWrong,
          correct: correctMatch[1].trim()
        });
        currentWrong = null;
      }
    }
    return corrections;
  };

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async (forceClose = false) => {
    // Prevent double-closing
    if (isClosing) return;
    setIsClosing(true);

    // First disconnect and close UI immediately
    disconnect();

    // First, save any remaining unsaved audio chunks
    if (currentAiAudioChunksRef.current.length > 0 || currentAiTextRef.current) {
      const combinedAudio = combineAudioChunks(currentAiAudioChunksRef.current);
      conversationRef.current.push({
        role: 'ai',
        text: currentAiTextRef.current || '🔊 پاسخ صوتی',
        audioData: combinedAudio.data,
        mimeType: combinedAudio.mimeType
      });
      currentAiAudioChunksRef.current = [];
      currentAiTextRef.current = '';
    }

    // Save conversation to chat history
    if (conversationRef.current.length > 0) {
      console.log('Saving conversation with', conversationRef.current.length, 'messages');

      // Limit audio data to avoid performance issues - only keep last 20 messages with audio
      const limitedConversation = conversationRef.current.map((msg, index) => {
        const keepAudio = index >= conversationRef.current.length - 20;
        return {
          ...msg,
          audioData: keepAudio ? msg.audioData : null,
          mimeType: keepAudio ? msg.mimeType : null
        };
      });

      const callMessages = limitedConversation.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }],
        audioData: msg.audioData,
        mimeType: msg.mimeType,
        isVoiceCall: true
      }));

      // Add a header message for the call
      const callHeader = {
        role: 'model',
        parts: [{ text: '📞 تماس صوتی ضبط شده:' }],
        isVoiceCallHeader: true
      };

      let newHistory = [...chatHistory, callHeader, ...callMessages];

      // If force close, skip analysis
      if (forceClose) {
        setChatHistory(newHistory);
        saveChatHistory(context, newHistory);
        conversationRef.current = [];
        setIsClosing(false);
        onClose();
        return;
      }

      // Analyze the call for dialect issues
      const conversationTexts = conversationRef.current.filter(c => c.text);
      if (conversationTexts.length > 0) {
        // Add analyzing message
        const analyzingMsg = {
          role: 'model',
          parts: [{ text: '🔍 در حال تحلیل مکالمه برای بررسی لهجه...' }],
          isAnalyzing: true
        };
        newHistory = [...newHistory, analyzingMsg];
        setChatHistory(newHistory);
        saveChatHistory(context, newHistory);

        // Close UI now, analysis continues in background
        onClose();

        // Perform analysis with timeout
        let analysis = null;
        try {
          const analysisPromise = analyzeCallForDialect(conversationTexts);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 15000)
          );
          analysis = await Promise.race([analysisPromise, timeoutPromise]);
        } catch (err) {
          console.error('Analysis failed or timed out:', err);
        }

        // Always remove analyzing message
        newHistory = newHistory.filter(m => !m.isAnalyzing);

        if (analysis) {
          const analysisMessage = {
            role: 'model',
            parts: [{ text: analysis }],
            isCallAnalysis: true
          };
          newHistory = [...newHistory, analysisMessage];

          // Parse and save corrections automatically
          const foundCorrections = parseCorrectionsFromAnalysis(analysis);
          if (foundCorrections.length > 0 && addPronunciationCorrection) {
            for (const corr of foundCorrections) {
              addPronunciationCorrection(corr.wrong, corr.correct);
            }
            // Add message about saved corrections
            const savedMsg = {
              role: 'model',
              parts: [{ text: `✅ ${foundCorrections.length} اصلاح تلفظی ذخیره شد` }]
            };
            newHistory = [...newHistory, savedMsg];
          }
        } else {
          // Analysis failed - add failure message
          const failMsg = {
            role: 'model',
            parts: [{ text: '⚠️ تحلیل لهجه انجام نشد. تماس ذخیره شد.' }]
          };
          newHistory = [...newHistory, failMsg];
        }

        setChatHistory(newHistory);
        saveChatHistory(context, newHistory);
        conversationRef.current = [];
        setIsClosing(false);
        return;
      }

      setChatHistory(newHistory);
      saveChatHistory(context, newHistory);
    }

    // Reset recording refs
    conversationRef.current = [];
    setIsClosing(false);
    onClose();
  };

  const handleGeminiMessage = (message) => {
    if (message.type === 'ws_ready') {
      let contextInfo = '';
      if (context?.startsWith('lesson') && lessonTitle) {
        contextInfo = `الطالب بيتعلم درس: "${lessonTitle}". `;
      } else if (selectedTopics?.includes('custom_scenario') && customScenarioName) {
        contextInfo = `سيناريو: "${customScenarioName}". `;
      }

      // Build chat history summary for context (last 15 messages)
      let chatHistorySummary = '';
      if (chatHistory && chatHistory.length > 0) {
        const recentMessages = chatHistory
          .filter(msg => msg.parts?.[0]?.text && !msg.isVoiceCallHeader && !msg.isAnalyzing && !msg.isCallAnalysis)
          .slice(-15)
          .map(msg => {
            const text = msg.parts[0].text;
            // Truncate long messages
            const truncated = text.length > 100 ? text.substring(0, 100) + '...' : text;
            return `${msg.role === 'user' ? 'الطالب' : 'جاد'}: ${truncated}`;
          })
          .join('\n');

        if (recentMessages) {
          chatHistorySummary = `\n\n=== سجل المحادثة السابقة ===\nهيدي آخر الرسائل يلي حكيتوها قبل التماس. إذا الطالب سألك عن شي حكيتوه قبل، ارجع لهالسجل:\n${recentMessages}\n`;
        }
      }

      // Build corrections string for system prompt
      let correctionsInfo = '';
      if (pronunciationCorrections && pronunciationCorrections.length > 0) {
        correctionsInfo = '\n\n=== تصحيحات التلفظ - مهم جداً! ===\n' +
          'هيدي الكلمات لازم تلفظها بالضبط متل ما مكتوبة بالحركات:\n' +
          pronunciationCorrections.map(c => `- بدل "${c.wrong}" قول بالضبط: "${c.correct}"`).join('\n') +
          '\n\nانتبه للحركات (فتحة، ضمة، كسرة، سكون) وقولها بالضبط!';
      }

      // Build custom live voice prompts if any
      const liveVoicePrompts = {};
      const liveVoiceKeys = ['liveVoiceIntro', 'liveVoiceRules', 'liveVoiceSimplified', 'liveVoiceAuthentic',
                             'liveVoicePronunciation', 'liveVoiceVocabulary', 'liveVoiceVerbs',
                             'liveVoiceExpressions', 'liveVoiceExamples', 'liveVoiceStyle',
                             'liveVoiceImportantRules', 'liveVoiceClosing'];
      liveVoiceKeys.forEach(key => {
        if (customPrompts[key]) liveVoicePrompts[key] = customPrompts[key];
      });

      wsRef.current?.send(JSON.stringify({
        type: 'setup',
        voice: selectedVoice,
        context: contextInfo + chatHistorySummary,
        corrections: correctionsInfo,
        accentMode: accentMode,
        customPrompts: Object.keys(liveVoicePrompts).length > 0 ? liveVoicePrompts : null
      }));

      // Show what corrections are being applied
      if (pronunciationCorrections && pronunciationCorrections.length > 0) {
        setTranscript([
          { role: 'system', text: 'در حال اتصال...' },
          { role: 'system', text: `📚 ${pronunciationCorrections.length} اصلاح تلفظی در حال اعمال...` }
        ]);
        console.log('Applying corrections to Live API:', pronunciationCorrections);
      } else {
        setTranscript([{ role: 'system', text: 'در حال اتصال...' }]);
      }
      return;
    }

    if (message.type === 'connected') {
      setConnectionStatus('connected');
      setCurrentNode('wsConnected', 'liveVoice');
      const connectMsg = pronunciationCorrections && pronunciationCorrections.length > 0
        ? `متصل شدم! ${pronunciationCorrections.length} اصلاح تلفظی اعمال شد. دکمه رو نگه دارید.`
        : 'متصل شدم! دکمه رو نگه دارید و صحبت کنید';
      setTranscript(prev => [...prev.filter(p => !p.text.includes('در حال')), { role: 'system', text: connectMsg }]);
      return;
    }

    if (message.type === 'disconnected' || message.error) {
      setConnectionStatus(message.error ? 'error' : 'disconnected');
      setCurrentNode(message.error ? 'error' : 'idle', 'liveVoice');
      if (message.error) setTranscript(prev => [...prev, { role: 'error', text: message.error }]);
      return;
    }

    // AI-issued command: validate the selector/url before acting (see
    // handleCommand / isValidSelector / isValidUrl above). Invalid commands are
    // dropped instead of executed.
    if (message.type === 'command') {
      handleCommand(message, {
        click: (selector) => {
          const el = document.querySelector(selector);
          if (el && typeof el.click === 'function') el.click();
        },
        navigate: (url) => {
          window.location.assign(url);
        },
      });
      return;
    }

    if (message.serverContent) {
      // Handle output transcription (AI's speech to text)
      if (message.serverContent.outputTranscription?.text) {
        const transcriptText = message.serverContent.outputTranscription.text;
        console.log('📝 AI transcript:', transcriptText);
        currentAiTextRef.current += transcriptText;
        setTranscript(prev => [...prev, { role: 'ai', text: transcriptText }]);
      }

      // Handle input transcription (User's speech to text)
      if (message.serverContent.inputTranscription?.text) {
        const userText = message.serverContent.inputTranscription.text;
        console.log('🎤 User transcript:', userText);
        setCurrentNode('liveStreaming', 'liveVoice');
        // Update the last user message if exists, or add new one
        const lastUserIndex = conversationRef.current.length - 1;
        if (lastUserIndex >= 0 && conversationRef.current[lastUserIndex].role === 'user') {
          conversationRef.current[lastUserIndex].text = userText;
        }
        setTranscript(prev => [...prev, { role: 'user', text: userText }]);
      }

      const parts = message.serverContent.modelTurn?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('audio/')) {
          setCurrentNode('liveSpeaking', 'liveVoice');
          playAudioChunk(part.inlineData.data, part.inlineData.mimeType);
          // Store audio chunk for recording
          currentAiAudioChunksRef.current.push({
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType
          });
          setIsSpeaking(true);
        }
        if (part.text) {
          setCurrentNode('liveReceiving', 'liveVoice');
          currentAiTextRef.current += part.text;
          setTranscript(prev => [...prev, { role: 'ai', text: part.text }]);
        }
      }

      // Save on turnComplete OR when we have audio and turn is ending
      const shouldSave = message.serverContent.turnComplete ||
                         message.serverContent.interrupted ||
                         (parts.length === 0 && currentAiAudioChunksRef.current.length > 0);

      if (shouldSave || message.serverContent.turnComplete) {
        setIsSpeaking(false);
        setCurrentNode('wsConnected', 'liveVoice');
        // Save completed AI response to conversation
        if (currentAiAudioChunksRef.current.length > 0 || currentAiTextRef.current) {
          const combinedAudio = combineAudioChunks(currentAiAudioChunksRef.current);
          conversationRef.current.push({
            role: 'ai',
            text: currentAiTextRef.current || '🔊 پاسخ صوتی',
            audioData: combinedAudio.data,
            mimeType: combinedAudio.mimeType
          });
          console.log('Saved AI response, total:', conversationRef.current.length);
          currentAiAudioChunksRef.current = [];
          currentAiTextRef.current = '';
        }
      }
    }
  };

  const playAudioChunk = async (base64Data, mimeType) => {
    try {
      const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)?.[1] || '24000', 10);
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

      const pcmData = new Int16Array(bytes.buffer);
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) floatData[i] = pcmData[i] / 32768.0;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, floatData.length, sampleRate);
      audioBuffer.getChannelData(0).set(floatData);
      audioQueueRef.current.push(audioBuffer);

      if (!isPlayingRef.current) playNextInQueue();
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const playNextInQueue = () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }
    isPlayingRef.current = true;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioQueueRef.current.shift();
    source.connect(audioContextRef.current.destination);
    source.onended = playNextInQueue;
    source.start();
  };

  const startListening = async () => {
    if (connectionStatus !== 'connected') return;
    try {
      setCurrentNode('liveListening', 'liveVoice');
      // Enhanced audio settings for better voice recognition
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          // Additional settings for better sensitivity
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googEchoCancellation: true
        }
      });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = { audioContext, processor };

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          const bytes = new Uint8Array(pcmData.buffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);

          wsRef.current.send(JSON.stringify({
            realtimeInput: { mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: btoa(binary) }] }
          }));
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setIsListening(true);
    } catch (error) {
      setCurrentNode('error', 'liveVoice');
      setTranscript(prev => [...prev, { role: 'error', text: 'خطا در میکروفون' }]);
    }
  };

  const stopListening = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.processor.disconnect();
      processorRef.current.audioContext.close();
      processorRef.current = null;
    }

    // When user stops talking, save any pending AI response and mark user turn
    if (currentAiAudioChunksRef.current.length > 0 || currentAiTextRef.current) {
      const combinedAudio = combineAudioChunks(currentAiAudioChunksRef.current);
      conversationRef.current.push({
        role: 'ai',
        text: currentAiTextRef.current || '🔊 پاسخ صوتی',
        audioData: combinedAudio.data,
        mimeType: combinedAudio.mimeType
      });
      currentAiAudioChunksRef.current = [];
      currentAiTextRef.current = '';
    }

    // Mark that user spoke (without audio data since we can't record user's voice easily)
    conversationRef.current.push({
      role: 'user',
      text: '🎤 پیام صوتی',
      audioData: null,
      mimeType: null
    });

    setCurrentNode('wsConnected', 'liveVoice');
    setIsListening(false);
  };

  if (!isOpen) return null;

  // When minimized, render nothing visible but keep the component mounted
  // This allows the voice chat to continue working in background
  if (isMinimized) {
    return null; // The FloatingLiveChatWidget will show the minimized UI
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Phone size={24} />
          تماس زنده با جاد
        </h2>
        <div className="flex items-center gap-2">
          {/* Minimize button - only show when connected */}
          {connectionStatus !== 'disconnected' && onMinimize && (
            <button
              onClick={onMinimize}
              className="p-2 rounded-full hover:bg-white/20 bg-white/10"
              title="کوچک کردن"
            >
              <ChevronDown size={24} />
            </button>
          )}
          {connectionStatus !== 'disconnected' && (
            <button
              onClick={() => handleClose(true)}
              className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-sm font-medium"
              title="بستن سریع بدون تحلیل"
            >
              بستن سریع
            </button>
          )}
          <button
            onClick={() => handleClose(false)}
            disabled={isClosing}
            className={`p-2 rounded-full ${isClosing ? 'bg-white/10 cursor-not-allowed' : 'hover:bg-white/20 bg-white/10'}`}
          >
            {isClosing ? <Loader size={24} className="animate-spin" /> : <X size={24} />}
          </button>
        </div>
      </div>

      {connectionStatus === 'disconnected' && (
        <div className="px-4 py-2">
          <div className="bg-white/10 rounded-xl p-3 max-w-md mx-auto">
            <label className="block text-white/80 text-sm mb-2 text-center">انتخاب صدا:</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full p-2 rounded-lg bg-white/20 text-white border border-white/30 text-center"
            >
              {Object.entries(availableVoices).map(([key, name]) => (
                <option key={key} value={key} className="bg-purple-800">{name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="text-center text-white/80 text-sm py-2">
        {connectionStatus === 'connecting' && 'در حال اتصال...'}
        {connectionStatus === 'connected' && (isListening ? '🎤 در حال گوش دادن...' : 'دکمه رو نگه دارید')}
        {connectionStatus === 'disconnected' && 'روی دکمه سبز بزنید'}
        {connectionStatus === 'error' && 'خطا! دوباره تلاش کنید'}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {transcript.map((item, index) => (
          <div key={index} className={`p-3 rounded-xl max-w-[80%] ${
            item.role === 'ai' ? 'bg-white/20 text-white mr-auto' :
            item.role === 'user' ? 'bg-teal-500 text-white ml-auto' :
            item.role === 'error' ? 'bg-red-500/50 text-white mx-auto' :
            'bg-white/10 text-white/70 mx-auto text-center text-sm'
          }`}>
            {item.text}
          </div>
        ))}
      </div>

      <div className="p-6 flex flex-col items-center gap-4">
        {connectionStatus === 'disconnected' && (
          <button onClick={connect} className="w-24 h-24 rounded-full bg-green-500 hover:bg-green-400 shadow-lg shadow-green-500/50 flex items-center justify-center">
            <Phone size={40} className="text-white" />
          </button>
        )}

        {connectionStatus === 'connecting' && (
          <div className="w-24 h-24 rounded-full bg-yellow-500 animate-pulse shadow-lg flex items-center justify-center">
            <Loader size={40} className="text-white animate-spin" />
          </div>
        )}

        {connectionStatus === 'connected' && (
          <button
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isListening ? 'bg-red-500 animate-pulse shadow-red-500/50' :
              isSpeaking ? 'bg-purple-500 shadow-purple-500/50' :
              'bg-teal-500 hover:bg-teal-400 shadow-teal-500/50'
            } shadow-lg`}
          >
            {isSpeaking ? <Volume2 size={40} className="text-white animate-pulse" /> : <Mic size={40} className="text-white" />}
          </button>
        )}

        {connectionStatus === 'error' && (
          <button onClick={connect} className="w-24 h-24 rounded-full bg-red-500 hover:bg-red-400 shadow-lg flex items-center justify-center">
            <Phone size={40} className="text-white" />
          </button>
        )}

        <p className="text-white/60 text-sm text-center">
          {connectionStatus === 'connected' ? (isListening ? 'بزنید تا جاد جواب بده' : 'بزنید و صحبت کنید') :
           connectionStatus === 'connecting' ? 'صبر کنید...' : 'شروع کنید'}
        </p>

        {/* Button to report pronunciation issues */}
        {connectionStatus === 'disconnected' && (
          <button
            onClick={() => setShowCorrectionModal(true)}
            className="mt-2 text-white/70 text-xs underline hover:text-white"
          >
            ✏️ گزارش اشتباه تلفظی
          </button>
        )}
      </div>

      {/* Pronunciation Correction Modal */}
      {showCorrectionModal && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">گزارش اشتباه تلفظی</h3>
            <p className="text-sm text-slate-600 mb-4">اگر جاد کلمه‌ای رو اشتباه تلفظ کرد، اینجا بنویسید تا در تماس‌های بعدی درست بگه.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-700 mb-1">تلفظ اشتباه:</label>
                <input
                  type="text"
                  value={correctionWrong}
                  onChange={(e) => setCorrectionWrong(e.target.value)}
                  className="w-full p-2 border rounded-lg text-right"
                  placeholder="مثلا: قهوة"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">تلفظ درست:</label>
                <input
                  type="text"
                  value={correctionCorrect}
                  onChange={(e) => setCorrectionCorrect(e.target.value)}
                  className="w-full p-2 border rounded-lg text-right"
                  placeholder="مثلا: أهوة"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (correctionWrong && correctionCorrect && addPronunciationCorrection) {
                    addPronunciationCorrection(correctionWrong, correctionCorrect);
                    setCorrectionWrong('');
                    setCorrectionCorrect('');
                    setShowCorrectionModal(false);
                  }
                }}
                className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600"
              >
                ذخیره
              </button>
              <button
                onClick={() => {
                  setCorrectionWrong('');
                  setCorrectionCorrect('');
                  setShowCorrectionModal(false);
                }}
                className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300"
              >
                لغو
              </button>
            </div>

            {/* Show existing corrections */}
            {pronunciationCorrections && pronunciationCorrections.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-slate-600 mb-2">تصحیحات قبلی:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {pronunciationCorrections.map((c, i) => (
                    <div key={i} className="text-xs bg-slate-100 p-2 rounded flex justify-between items-center">
                      <span>"{c.wrong}" → "{c.correct}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Global Live Voice Chat Wrapper (rendered at App level) ---
function GlobalLiveVoiceChat() {
  const {
    isLiveChatActive,
    isMinimized,
    liveChatConfig,
    chatHistory,
    setChatHistory,
    closeLiveChat,
    minimizeLiveChat,
    data,
    addJournalEntry,
    addPronunciationCorrection,
    saveChatHistory
  } = useLiveChat();

  if (!isLiveChatActive || !liveChatConfig) return null;

  return (
    <LiveVoiceChat
      isOpen={isLiveChatActive}
      onClose={closeLiveChat}
      onMinimize={minimizeLiveChat}
      chatHistory={chatHistory}
      setChatHistory={setChatHistory}
      saveChatHistory={() => saveChatHistory(liveChatConfig.context, chatHistory)}
      context={liveChatConfig.context}
      lessonTitle={liveChatConfig.lessonTitle}
      selectedTopics={liveChatConfig.selectedTopics}
      customScenarioName={liveChatConfig.customScenarioName}
      customScenarioDetails={liveChatConfig.customScenarioDetails}
      aiVoice={liveChatConfig.aiVoice}
      accentMode={liveChatConfig.accentMode}
      addJournalEntry={addJournalEntry}
      knowledgeBase={liveChatConfig.knowledgeBase}
      pronunciationCorrections={data?.pronunciationCorrections || []}
      addPronunciationCorrection={addPronunciationCorrection}
      customPrompts={data?.customPrompts || {}}
      isMinimized={isMinimized}
    />
  );
}

function Flashcard({ term, definition }) {
    const [isFlipped, setIsFlipped] = useState(false);
    return (
        <div className="perspective-1000" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-28 transform-style-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-2 text-center bg-white border-2 rounded-xl"><p className="font-bold text-teal-700 text-lg">{term}</p></div>
                <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-2 text-center bg-teal-500 text-white rounded-xl"><p>{definition}</p></div>
            </div>
            <style>{`.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .rotate-y-180 { transform: rotateY(180deg); } .backface-hidden { backface-visibility: hidden; }`}</style>
        </div>
    );
}

function KnowledgeBase({ knowledgeBase }) {
    const [activeTab, setActiveTab] = useState('vocabulary');
    const [searchTerm, setSearchTerm] = useState('');
    
    const renderContent = () => {
        const items = (knowledgeBase[activeTab] || []).filter(item => item.term.toLowerCase().includes(searchTerm.toLowerCase()) || item.definition.toLowerCase().includes(searchTerm.toLowerCase()));
        if (items.length === 0) return <p className="text-center text-slate-500 py-4">موردی یافت نشد.</p>;
        return (<ul className="space-y-3">{items.map((item, index) => (<li key={`${item.id}-${index}`} className="p-3 bg-slate-100 rounded-lg"><p className="font-bold">{item.term}</p><p className="text-sm text-slate-600">{item.definition}</p><p className="text-xs text-teal-600 mt-1">منبع: {item.source}</p></li>))}</ul>);
    };

    const categories = { vocabulary: 'لغات', grammar: 'گرامر', phrases: 'اصطلاحات', verbs: 'افعال', pronouns: 'ضمایر', adjectives: 'صفات' };

    return (
        <div>
            <div className="flex border-b mb-4 overflow-x-auto">{Object.keys(categories).map(key => (<button key={key} onClick={() => setActiveTab(key)} className={`px-4 py-2 font-bold whitespace-nowrap ${activeTab === key ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500'}`}>{categories[key]}</button>))}</div>
            <div className="relative mb-4">
                <input type="text" placeholder={`جستجو در ${categories[activeTab]}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 border rounded-lg" />
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="max-h-64 overflow-y-auto pr-2">{renderContent()}</div>
        </div>
    );
}

function SaveToKnowledgeBaseModal({ isOpen, onClose, item, updateKnowledgeBase, addJournalEntry }) {
    const [category, setCategory] = useState('vocabulary');
    const [term, setTerm] = useState('');
    const [definition, setDefinition] = useState('');
    const [error, setError] = useState('');

    useEffect(() => { if (item) { setTerm(item); setDefinition(''); setError(''); } }, [item]);

    const handleSave = () => {
        if (!term.trim() || !definition.trim()) { setError("لطفاً هر دو فیلد را پر کنید."); return; }
        updateKnowledgeBase(category, { term, definition, source: 'چت با استاد' });
        addJournalEntry(`مورد جدید "${term}" به مرکز دانش اضافه شد.`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md" dir="rtl">
                <h2 className="text-2xl font-bold mb-4">افزودن به مرکز دانش</h2>
                <div className="space-y-4">
                    <div><label className="block font-bold mb-1">دسته بندی:</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded-lg"><option value="vocabulary">لغت</option><option value="grammar">نکته گرامری</option><option value="phrases">اصطلاح</option><option value="verbs">فعل</option><option value="pronouns">ضمیر</option><option value="adjectives">صفت</option></select></div>
                    <div><label className="block font-bold mb-1">کلمه یا عبارت (به لبنانی):</label><input type="text" value={term} onChange={(e) => setTerm(e.target.value)} className="w-full p-2 border rounded-lg" /></div>
                    <div><label className="block font-bold mb-1">معنی یا تعریف (به فارسی):</label><input type="text" value={definition} onChange={(e) => setDefinition(e.target.value)} className="w-full p-2 border rounded-lg" /></div>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                </div>
                <div className="flex justify-end gap-3 mt-6"><button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300">انصراف</button><button onClick={handleSave} className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600">ذخیره</button></div>
            </div>
        </div>
    );
}

function GlobalSearchModal({ isOpen, onClose, data, navigateTo }) {
    const [searchTerm, setSearchTerm] = useState('');
    const results = useMemo(() => {
        if (!searchTerm.trim()) return null;
        const term = searchTerm.toLowerCase();
        const found = { lessons: [], knowledge: [], journal: [] };
        data.lessons.forEach(l => { if (l.title.toLowerCase().includes(term) || l.summary.toLowerCase().includes(term) || l.archivedNotes?.toLowerCase().includes(term)) found.lessons.push(l); });
        Object.values(data.knowledgeBase).flat().forEach(i => { if (i.term.toLowerCase().includes(term) || i.definition.toLowerCase().includes(term)) found.knowledge.push(i); });
        data.journal.forEach(j => { if (j.entry.toLowerCase().includes(term)) found.journal.push(j); });
        return found;
    }, [searchTerm, data]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 pt-20">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl" dir="rtl">
                <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">جستجوی سراسری</h2><button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X size={24}/></button></div>
                <div className="relative"><input type="text" placeholder="در تمام برنامه جستجو کنید..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 border-2 rounded-xl focus:border-teal-500" autoFocus /><Search size={22} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /></div>
                <div className="mt-6 max-h-[60vh] overflow-y-auto">{results && (<div className="space-y-6">{results.lessons.length > 0 && <div><h3 className="font-bold mb-2">دروس:</h3><ul className="space-y-2">{results.lessons.map(l => <li key={l.id} onClick={() => navigateTo('lesson', l)} className="p-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-teal-100">{l.title}</li>)}</ul></div>}{results.knowledge.length > 0 && <div><h3 className="font-bold mb-2">مرکز دانش:</h3><ul className="space-y-2">{results.knowledge.map(k => <li key={k.id} className="p-2 bg-slate-100 rounded-lg">{k.term}: {k.definition}</li>)}</ul></div>}{results.journal.length > 0 && <div><h3 className="font-bold mb-2">ژورنال:</h3><ul className="space-y-2">{results.journal.map(j => <li key={j.id} className="p-2 bg-slate-100 rounded-lg text-sm">{j.entry}</li>)}</ul></div>}</div>)}</div>
            </div>
        </div>
    );
}

function EditLessonModal({ lesson, onSave, onClose }) {
    const [title, setTitle] = useState(lesson.title);
    const [summary, setSummary] = useState(lesson.summary);
    const handleSave = () => onSave(lesson.id, title, summary);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md" dir="rtl">
                <h2 className="text-2xl font-bold mb-4">ویرایش درس</h2>
                <div className="space-y-4">
                    <div><label className="block font-bold mb-1">عنوان درس:</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded-lg" /></div>
                    <div><label className="block font-bold mb-1">خلاصه درس:</label><textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full p-2 border rounded-lg" rows="3"></textarea></div>
                </div>
                <div className="flex justify-end gap-3 mt-6"><button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300">انصراف</button><button onClick={handleSave} className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600">ذخیره تغییرات</button></div>
            </div>
        </div>
    );
}

function Modal({ config, onClose }) {
    const { title, message, children, buttons } = config;
    const displayButtons = buttons && buttons.length > 0 ? buttons : [{ label: "باشه", onClick: onClose, className: "bg-teal-500 text-white hover:bg-teal-600" }];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md" dir="rtl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{title}</h2><button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full"><X size={20}/></button></div>
                {message && <p className="text-slate-600 mb-6">{message}</p>}
                {children}
                <div className="flex justify-end gap-3 mt-6">{displayButtons.map((btn, index) => (<button key={index} onClick={btn.onClick} className={`px-5 py-2 rounded-lg font-bold ${btn.className}`}>{btn.label}</button>))}</div>
            </div>
        </div>
    );
}

// New Global Assistant Component
function GlobalAssistant({ onClose, updateKnowledgeBase, setModalConfig, addJournalEntry }) {
    const [history, setHistory] = useState([{ role: 'model', parts: [{ text: "سلام! من دستیار هوش مصنوعی شما هستم. چطور می‌توانم به شما کمک کنم؟" }] }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [analyzedContent, setAnalyzedContent] = useState(null);
    const chatWindowRef = useRef(null);

    useEffect(() => { chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight); }, [history, analyzedContent]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const newUserMessage = { role: 'user', parts: [{ text: input }] };
        const newHistory = [...history, newUserMessage];
        setHistory(newHistory);
        setInput('');
        setIsLoading(true);
        setAnalyzedContent(null);

        const systemPrompt = `You are a helpful AI assistant for a student learning Lebanese Arabic. You can answer questions, analyze text for learning points, or provide general help. If the user asks you to analyze text, extract key items and categorize them into 'vocabulary', 'grammar', 'phrases', 'verbs', 'pronouns', 'adjectives'. Format the output as a clear Markdown list.`;
        const payload = { contents: newHistory, systemInstruction: { parts: [{ text: systemPrompt }] } };

        try {
            const responseText = await callGeminiAPI(payload);
            // Check if the response is an analysis
            if (responseText.includes('**لغات و اصطلاحات جدید:**') || responseText.includes('**نکات گرامری کلیدی:**')) {
                setAnalyzedContent(responseText);
            }
            const newAiMessage = { role: 'model', parts: [{ text: responseText }] };
            setHistory(prev => [...prev, newAiMessage]);
        } catch (error) {
            const errorMsg = { role: 'model', parts: [{ text: "متاسفانه خطایی رخ داد." }] };
            setHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const addAnalysisToKnowledgeBase = async () => {
        if (!analyzedContent) return;
        setIsLoading(true);
        const systemPrompt = `Analyze the following text. Categorize each item into 'vocabulary', 'grammar', 'phrases', 'verbs', 'pronouns', 'adjectives'. Return ONLY a valid JSON object with these keys. Each key must have an array of objects with 'term' and 'definition'. If a category has no items, return an empty array. Text: ${analyzedContent}`;
        const schema = { type: "OBJECT", properties: { vocabulary: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } }, grammar: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } }, phrases: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } }, verbs: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } }, pronouns: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } }, adjectives: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } } } };
        const payload = { contents: [{ parts: [{ text: " " }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json", responseSchema: schema } };

        try {
            const categorizedItems = JSON.parse(await callGeminiAPI(payload));
            let itemsAdded = 0;
            Object.entries(categorizedItems).forEach(([category, items]) => {
                if (items && Array.isArray(items)) {
                    items.forEach(item => {
                        if (item.term && item.definition) {
                            updateKnowledgeBase(category, { ...item, source: 'دستیار هوش مصنوعی' });
                            itemsAdded++;
                        }
                    });
                }
            });
            addJournalEntry(`${itemsAdded} مورد از دستیار به مرکز دانش اضافه شد.`);
            setModalConfig({ title: "موفقیت", message: `${itemsAdded} مورد با موفقیت به مرکز دانش اضافه شد.` });
        } catch (e) {
            setModalConfig({ title: "خطا", message: "خطا در دسته‌بندی خودکار موارد." });
        } finally {
            setAnalyzedContent(null);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[85vh] sm:h-[80vh] flex flex-col" dir="rtl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-teal-500"/> دستیار هوش مصنوعی</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X size={24}/></button>
                </div>
                <div ref={chatWindowRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] py-2 px-4 rounded-2xl ${msg.role === 'user' ? 'bg-teal-500 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                                <MarkdownRenderer text={msg.parts[0].text} />
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><div className="py-2 px-4 rounded-2xl bg-slate-100">...</div></div>}
                    {analyzedContent && (
                        <div className="p-4 border-t mt-4">
                            <h3 className="font-bold mb-2">تحلیل انجام شد. آیا مایل به افزودن موارد به مرکز دانش هستید؟</h3>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setAnalyzedContent(null)} className="px-4 py-2 text-sm rounded-lg bg-slate-200 hover:bg-slate-300">انصراف</button>
                                <button onClick={addAnalysisToKnowledgeBase} className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">بله، اضافه کن</button>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} className="flex-1 p-3 border rounded-xl" placeholder="سوال خود را بپرسید یا متنی را برای تحلیل وارد کنید..." disabled={isLoading} />
                        <button onClick={handleSend} className="bg-teal-500 text-white px-5 py-3 rounded-xl hover:bg-teal-600 disabled:bg-slate-400 font-bold" disabled={isLoading}>{isLoading ? '...' : 'ارسال'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArchivedConversations({ conversations, setData, setModalConfig }) {
  const [viewingConversation, setViewingConversation] = useState(null);

  const deleteConversation = (id) => {
    setModalConfig({
        title: "تایید حذف",
        message: "آیا از حذف این مکالمه مطمئن هستید؟",
        buttons: [
            { label: "انصراف", onClick: () => setModalConfig(null) },
            { label: "حذف", className: "bg-red-600 text-white", onClick: () => {
                setData(prev => ({
                  ...prev,
                  archivedConversations: prev.archivedConversations.filter(c => c.id !== id)
                }));
                setModalConfig(null);
            }}
        ]
    });
  };

  return (
    <>
      {viewingConversation && (
        <ConversationViewerModal
          conversation={viewingConversation}
          onClose={() => setViewingConversation(null)}
        />
      )}
      <Card title="مکالمات بایگانی شده">
        <div className="space-y-4">
          {conversations.length > 0 ? (
            conversations.map(convo => (
              <div key={convo.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold">{convo.title}</p>
                  <p className="text-sm text-slate-500">{new Date(convo.id).toLocaleString('fa-IR')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setViewingConversation(convo)} className="px-4 py-2 text-sm rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200">مشاهده</button>
                  <button onClick={() => deleteConversation(convo.id)} className="p-2 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={18}/></button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500 py-4">هیچ مکالمه‌ای بایگانی نشده است.</p>
          )}
        </div>
      </Card>
    </>
  );
}

function ConversationViewerModal({ conversation, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[85vh] sm:h-[80vh] flex flex-col" dir="rtl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-3 sm:p-4 border-b">
          <h2 className="text-lg sm:text-xl font-bold truncate">{conversation.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X size={24}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.history.map((msg, index) => (
            <ChatMessage key={`${index}-${msg.parts[0].text.slice(0, 10)}`} message={msg.parts[0]} role={msg.role} onSave={() => {}} voice="Charon" disableSave={true} />
          ))}
        </div>
      </div>
    </div>
  );
}
