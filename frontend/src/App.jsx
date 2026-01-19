import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, BookOpen, MessageSquare, BarChart2, Edit3, Download, Upload, Trash2, ChevronDown, Sparkles, Volume2, Loader, ClipboardList, LifeBuoy, Users, GraduationCap, Clock, CheckCircle, Mic, MicOff, Settings, BrainCircuit, Search, X, Edit, FileText, Paperclip, Archive, Phone, PhoneOff, MessageCircle } from 'lucide-react';

// --- Firebase Imports ---
// Import Firebase services for database and authentication.
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, setLogLevel } from 'firebase/firestore';


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
  },
  archivedConversations: [],
};

// --- Gemini API Helpers ---
// Calls backend API for Gemini chat (API key is secure on server)
async function callGeminiAPI(payload, retries = 3, delay = 1000) {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    if (response.status === 429 && retries > 0) {
      await new Promise(res => setTimeout(res, delay));
      return callGeminiAPI(payload, retries - 1, delay * 2);
    }
    const error = new Error(`HTTP error! status: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const result = await response.json();
  return result.text;
}

// Calls backend API for Gemini TTS
async function callGeminiTTS(fullPrompt, voiceName = "Kore") {
  try {
    const response = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: fullPrompt, voice: voiceName })
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    if (result.audioData && result.mimeType) {
      return { audioData: result.audioData, mimeType: result.mimeType };
    }
    throw new Error("Invalid audio data received.");
  } catch (error) {
    console.error("Error with TTS API:", error);
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

  // localStorage helper functions
  const STORAGE_KEY = 'lebanese_dialect_app_data';

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

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

    // If no Firebase config, use localStorage
    if (!firebaseConfig) {
        console.log("Firebase not configured - using localStorage for data persistence");
        const savedData = loadFromLocalStorage();
        setData(savedData);
        setUserId('local-user');
        setIsAuthReady(true);
        return;
    }

    // Firebase setup with SHARED user ID for cross-device sync
    // Using a fixed user ID so all devices share the same data
    const SHARED_USER_ID = 'shared-user-mahdi';

    setLogLevel('debug');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    setFirebaseServices({ auth, db });

    // Sign in anonymously (required for Firestore access) but use shared user ID for data
    const setupFirestore = async () => {
      try {
        await signInAnonymously(auth);
        console.log("Signed in anonymously, using shared user ID for data sync");

        setUserId(SHARED_USER_ID);
        const userDocRef = doc(db, `/artifacts/${appId}/users/${SHARED_USER_ID}/data/main`);

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            console.log("Data loaded from Firestore (shared)");
            setData(prevData => ({...initialData, ...docSnap.data()}));
          } else {
            console.log("Creating initial document in Firestore");
            setDoc(userDocRef, initialData).catch(err => console.error("Error creating initial document:", err));
            setData(initialData);
          }
          setIsAuthReady(true);
        }, (error) => {
            console.error("Error listening to document:", error);
            // Fallback to localStorage if Firestore fails
            const savedData = loadFromLocalStorage();
            setData(savedData);
            setUserId('local-user');
            setIsAuthReady(true);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Authentication failed:", error);
        // Fallback to localStorage
        const savedData = loadFromLocalStorage();
        setData(savedData);
        setUserId('local-user');
        setIsAuthReady(true);
      }
    };

    let unsubscribe = null;
    setupFirestore().then(unsub => { unsubscribe = unsub; });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAuthReady || !userId) return;

    // Save to localStorage if using local storage mode
    if (userId === 'local-user') {
      const handler = setTimeout(() => {
        saveToLocalStorage(dataRef.current);
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
            .catch(err => console.error("Error saving data to Firestore:", err));
    }, 1000);

    return () => clearTimeout(handler);
  }, [data, userId, isAuthReady, firebaseServices]);
  
  const selectedLesson = useMemo(() => {
      if (!selectedLessonId) return null;
      return data.lessons.find(l => l.id === selectedLessonId);
  }, [selectedLessonId, data.lessons]);

  const addLesson = (title) => {
    const newLesson = { id: Date.now(), title, summary: "خلاصه‌ای ایجاد نشده.", files: [], archivedNotes: "" };
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

  const saveChatHistory = (context, history) => {
    setData(prev => ({ ...prev, chatHistories: { ...prev.chatHistories, [context]: history } }));
  };

  const addJournalEntry = (entry) => {
    const newEntry = { id: Date.now(), date: new Date().toISOString(), entry };
    setData(prev => ({ ...prev, journal: [newEntry, ...prev.journal] }));
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
    const commonProps = { navigateTo, addJournalEntry, setModalConfig, data, setData };
    switch (activeView) {
      case 'dashboard': return <Dashboard {...commonProps} stats={data.stats} lessons={data.lessons} addLesson={addLesson} knowledgeBase={data.knowledgeBase} updateKnowledgeBase={updateKnowledgeBase} saveChatHistory={saveChatHistory} chatHistories={data.chatHistories} />;
      case 'lessons': return <LessonList {...commonProps} lessons={data.lessons} deleteLesson={confirmDeleteLesson} editLesson={editLesson} />;
      case 'lesson': return selectedLesson ? <LessonDetail {...commonProps} key={selectedLesson.id} lesson={selectedLesson} updateLesson={updateLesson} updateKnowledgeBase={updateKnowledgeBase} saveChatHistory={saveChatHistory} chatHistories={data.chatHistories} knowledgeBase={data.knowledgeBase} /> : <div>درسی انتخاب نشده است.</div>;
      case 'quiz': return <QuizCenter {...commonProps} lessons={data.lessons} />;
      case 'planner': return <StudyPlanner {...commonProps} lessons={data.lessons} />;
      case 'cultural': return <CulturalInsights {...commonProps} />;
      case 'stats': return <StatsReport {...commonProps} stats={data.stats} journal={data.journal} knowledgeBase={data.knowledgeBase} />;
      case 'journal': return <Journal {...commonProps} entries={data.journal} />;
      case 'settings': return <SettingsPage {...commonProps} />;
      case 'archivedConversations': return <ArchivedConversations {...commonProps} conversations={data.archivedConversations || []} />;
      default: return <Dashboard {...commonProps} stats={data.stats} lessons={data.lessons} addLesson={addLesson} knowledgeBase={data.knowledgeBase} updateKnowledgeBase={updateKnowledgeBase} saveChatHistory={saveChatHistory} chatHistories={data.chatHistories} />;
    }
  };

  return (
    <>
      <Fonts />
      <div className="bg-slate-50 text-slate-800" dir="rtl" onMouseUp={handleGlobalMouseUp}>
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar navigateTo={navigateTo} activeView={activeView} exportData={exportData} importData={importData} onSearchClick={() => setIsSearchOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 md:p-8 bg-slate-100">{renderContent()}</main>
          <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} data={data} navigateTo={navigateTo} />
          {modalConfig && <Modal config={modalConfig} onClose={() => setModalConfig(null)} />}
          <button onClick={() => setIsAssistantOpen(true)} className="fixed bottom-6 right-6 bg-teal-500 text-white rounded-full p-4 shadow-lg hover:bg-teal-600 transition-transform hover:scale-110 z-40">
            <Sparkles size={28} />
          </button>
          {isAssistantOpen && <GlobalAssistant onClose={() => setIsAssistantOpen(false)} updateKnowledgeBase={updateKnowledgeBase} setModalConfig={setModalConfig} addJournalEntry={addJournalEntry} />}
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
    </>
  );
}

// --- Components ---

function Sidebar({ navigateTo, activeView, exportData, importData, onSearchClick }) {
    const fileInputRef = useRef(null);
    const handleImportClick = () => fileInputRef.current.click();
    const NavLink = ({ view, icon: Icon, label }) => (
        <li>
            <button onClick={() => navigateTo(view)} className={`w-full flex items-center gap-3 py-3 px-4 rounded-lg text-right transition-colors duration-200 text-slate-300 hover:bg-slate-700 hover:text-white ${activeView === view ? 'bg-slate-900 text-white font-bold' : ''}`}>
                <Icon size={22} /><span>{label}</span>
            </button>
        </li>
    );
    return (
        <nav className="w-full md:w-72 bg-slate-800 text-white p-6 flex flex-col shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-teal-500 p-2 rounded-lg"><GraduationCap size={28} /></div>
                <h1 className="text-2xl font-bold">لهجه لبنانی</h1>
            </div>
             <div className="mb-8">
                <button onClick={onSearchClick} className="w-full flex items-center gap-3 py-3 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                    <Search size={20} /><span>جستجوی کلی...</span>
                </button>
            </div>
            <ul className="space-y-3 flex-1">
                <NavLink view="dashboard" icon={BarChart2} label="داشبورد" />
                <NavLink view="lessons" icon={BookOpen} label="لیست دروس" />
                <NavLink view="quiz" icon={Edit3} label="مرکز آزمون" />
                <NavLink view="planner" icon={ClipboardList} label="برنامه ریزی هوشمند" />
                <NavLink view="cultural" icon={LifeBuoy} label="نکات فرهنگی" />
                <NavLink view="stats" icon={BarChart2} label="آمار و ارزیابی" />
                <NavLink view="journal" icon={Edit3} label="ژورنال فعالیت‌ها" />
                <NavLink view="archivedConversations" icon={Archive} label="مکالمات بایگانی شده" />
            </ul>
            <div className="space-y-2 pt-4 border-t border-slate-700">
                <button onClick={() => navigateTo('settings')} className="w-full flex items-center gap-3 py-2 px-4 rounded-lg text-right transition-colors text-slate-400 hover:bg-slate-700 hover:text-white"><Settings size={20} /><span>تنظیمات و شخصی‌سازی</span></button>
                <button onClick={exportData} className="w-full flex items-center gap-3 py-2 px-4 rounded-lg text-right transition-colors text-slate-400 hover:bg-slate-700 hover:text-white"><Download size={20} /><span>خروجی (JSON)</span></button>
                <button onClick={handleImportClick} className="w-full flex items-center gap-3 py-2 px-4 rounded-lg text-right transition-colors text-slate-400 hover:bg-slate-700 hover:text-white"><Upload size={20} /><span>بارگذاری (JSON)</span></button>
                <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
            </div>
        </nav>
    );
}

function SettingsPage({ data, setData, setModalConfig }) {
    const handleSettingChange = (key, value) => {
        setData(prev => ({
            ...prev,
            defaultChatSettings: {
                ...prev.defaultChatSettings,
                [key]: value,
            }
        }));
    };
    const { defaultChatSettings = initialData.defaultChatSettings } = data;
    const availableVoices = { 'Charon': 'مرد - استاندارد', 'Kore': 'زن - محکم', 'Zephyr': 'زن - روشن', 'Puck': 'مرد - شاد', 'Leda': 'زن - جوان', 'Fenrir': 'مرد - هیجان‌زده' };

    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-bold text-slate-800">تنظیمات</h2>
            <Card title="تنظیمات پیش‌فرض مکالمه">
                <div className="space-y-4 text-sm">
                    <div><label className="font-bold">صدای استاد:</label><select value={defaultChatSettings.aiVoice} onChange={e => handleSettingChange('aiVoice', e.target.value)} className="w-full p-2 border rounded mt-1">{Object.entries(availableVoices).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></div>
                    <div className="border-t pt-3"><label className="font-bold">لهجه استاد:</label><div className="flex gap-4 mt-2"><label><input type="radio" name="accent" value="standard" checked={defaultChatSettings.accentMode === 'standard'} onChange={() => handleSettingChange('accentMode', 'standard')} /> استاندارد</label><label><input type="radio" name="accent" value="authentic" checked={defaultChatSettings.accentMode === 'authentic'} onChange={() => handleSettingChange('accentMode', 'authentic')} /> محاوره‌ای</label></div></div>
                    <div className="border-t pt-3"><label className="font-bold">سبک نوشتار:</label><select value={defaultChatSettings.writingStyle} onChange={e => handleSettingChange('writingStyle', e.target.value)} className="w-full p-2 border rounded mt-1"><option value="simple_arabic">عربی ساده</option><option value="finglish">فینگلیش (Arabizi)</option><option value="tashkeel">عربی با اعراب</option></select></div>
                    <div className="border-t pt-3"><label className="font-bold">نمایش ترجمه:</label><select value={defaultChatSettings.translationLanguage} onChange={e => handleSettingChange('translationLanguage', e.target.value)} className="w-full p-2 border rounded mt-1"><option value="none">بدون ترجمه</option><option value="persian">فارسی</option><option value="english">انگلیسی</option></select></div>
                    <div className="border-t pt-3"><label className="font-bold">پاسخ استاد:</label><div className="flex gap-4 mt-2"><label><input type="radio" name="receiveAs" value="audio" checked={defaultChatSettings.aiResponseType === 'audio'} onChange={() => handleSettingChange('aiResponseType', 'audio')} /> صدا</label><label><input type="radio" name="receiveAs" value="text" checked={defaultChatSettings.aiResponseType === 'text'} onChange={() => handleSettingChange('aiResponseType', 'text')} /> فقط متن</label></div></div>
                </div>
            </Card>
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

function Dashboard({ stats, navigateTo, lessons, addLesson, addJournalEntry, knowledgeBase, updateKnowledgeBase, saveChatHistory, chatHistories, setModalConfig, data, setData }) {
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
              <button onClick={handleAddLesson} className="bg-teal-500 text-white px-5 py-3 rounded-xl hover:bg-teal-600 flex items-center gap-2 font-bold transition-transform hover:scale-105"><Plus size={20} /> ایجاد</button>
            </div>
            <h3 className="text-lg font-bold mt-8 mb-4 text-slate-700">آخرین دروس</h3>
            <ul className="space-y-3">{lessons.slice(-3).reverse().map(lesson => (<li key={lesson.id} className="p-4 bg-slate-50 rounded-xl hover:bg-teal-50 cursor-pointer transition-colors" onClick={() => navigateTo('lesson', lesson)}>{lesson.title}</li>))}</ul>
          </Card>
        </div>
        <div><Card title="✨ تمرین با استاد هوش مصنوعی"><ChatInterface data={data} setData={setData} context="global" addJournalEntry={addJournalEntry} updateKnowledgeBase={updateKnowledgeBase} knowledgeBase={knowledgeBase} saveChatHistory={saveChatHistory} initialHistory={chatHistories.global} setModalConfig={setModalConfig} /></Card></div>
      </div>
    </div>
  );
}

function LessonList({ lessons, navigateTo, deleteLesson, editLesson }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    const filteredAndSortedLessons = useMemo(() => {
        return lessons
            .filter(lesson => 
                lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lesson.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (lesson.archivedNotes || '').toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (sortOrder === 'newest') return b.id - a.id;
                if (sortOrder === 'oldest') return a.id - b.id;
                if (sortOrder === 'title') return a.title.localeCompare(b.title);
                return 0;
            });
    }, [lessons, searchTerm, sortOrder]);

    return (
        <Card title="لیست تمام دروس">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="جستجو در دروس..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border rounded-lg"
                />
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="p-2 border rounded-lg">
                    <option value="newest">جدیدترین</option>
                    <option value="oldest">قدیمی‌ترین</option>
                    <option value="title">عنوان</option>
                </select>
            </div>
            <div className="space-y-4">
                {filteredAndSortedLessons.length > 0 ? filteredAndSortedLessons.map(lesson => (
                    <LessonListItem key={lesson.id} lesson={lesson} navigateTo={navigateTo} deleteLesson={confirmDeleteLesson} editLesson={editLesson} />
                )) : <p className="text-center text-slate-500 py-4">درسی یافت نشد.</p>}
            </div>
        </Card>
    );
}

function LessonListItem({ lesson, navigateTo, deleteLesson, editLesson }) {
    const [editingLesson, setEditingLesson] = useState(null);
    const handleEditClick = (e, lesson) => { e.stopPropagation(); setEditingLesson(lesson); };
    const handleSave = (id, newTitle, newSummary) => { editLesson(id, newTitle, newSummary); setEditingLesson(null); };

    return (
        <>
            {editingLesson && <EditLessonModal lesson={editingLesson} onSave={handleSave} onClose={() => setEditingLesson(null)} />}
            <div onClick={() => navigateTo('lesson', lesson)} className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-lg hover:border-teal-500 transition-all duration-200 flex justify-between items-center cursor-pointer">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-teal-600">{lesson.title}</h3>
                    <p className="text-slate-600 mt-2">{lesson.summary}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={(e) => handleEditClick(e, lesson)} className="p-2 hover:bg-slate-200 rounded-full"><Edit size={18}/></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id); }} className="p-2 hover:bg-red-100 rounded-full text-red-600"><Trash2 size={18}/></button>
                </div>
            </div>
        </>
    );
}

function LessonDetail({ lesson, addJournalEntry, updateLesson, updateKnowledgeBase, saveChatHistory, chatHistories, setModalConfig, knowledgeBase, data, setData }) {
  const [pastedText, setPastedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [analyzedContent, setAnalyzedContent] = useState(null);

  const handleFileChange = (event) => {
      const newFiles = Array.from(event.target.files).map(file => ({ id: Date.now() + Math.random(), name: file.name, type: file.type }));
      updateLesson(lesson.id, { files: [...(lesson.files || []), ...newFiles] });
  };
  
  const addAnalyzedContentToLesson = async () => {
      if (!analyzedContent) return;
      setIsProcessing(true);

      let mergedNotes = analyzedContent;
      if (lesson.archivedNotes && lesson.archivedNotes.trim().length > 0) {
          const systemPrompt = `You are a text editor. Intelligently merge the following "Old Notes" and "New Content" about Lebanese Arabic. Combine related topics, remove redundancies, and structure the final text logically with clear Markdown headings. The final output must be in Persian.\n\n**Old Notes:**\n${lesson.archivedNotes}\n\n**New Content:**\n${analyzedContent}`;
          try {
              mergedNotes = await callGeminiAPI({ contents: [{ parts: [{ text: " " }] }], systemInstruction: { parts: [{ text: systemPrompt }] } });
          } catch (error) {
              console.error("Failed to merge notes:", error);
              mergedNotes = lesson.archivedNotes + "\n\n--- نکات استخراج شده جدید ---\n" + analyzedContent;
              setModalConfig({ title: "خطای ادغام", message: "ادغام هوشمند ناموفق بود. محتوای جدید به انتهای نکات اضافه شد." });
          }
      }
      
      updateLesson(lesson.id, { archivedNotes: mergedNotes });
      addJournalEntry(`نکات درس "${lesson.title}" به‌روزرسانی شد.`);

      const categorizationPrompt = `Analyze the following text from a Lebanese Arabic lesson. Extract and categorize every single item into the appropriate categories: 'vocabulary', 'grammar', 'phrases', 'verbs', 'pronouns', 'adjectives'. Return ONLY a valid JSON object with these exact keys. Each key must have an array of objects, with 'term' and 'definition'. If a category has no items, return an empty array. Text: ${mergedNotes}`;
      const schema = { type: "OBJECT", properties: { vocabulary: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } }, grammar: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } }, phrases: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } }, verbs: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } }, pronouns: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } }, adjectives: { type: "ARRAY", items: { type: "OBJECT", properties: { term: { type: "STRING" }, definition: { type: "STRING" } } } } } };
      const payload = { contents: [{ parts: [{ text: " " }] }], systemInstruction: { parts: [{ text: categorizationPrompt }] }, generationConfig: { responseMimeType: "application/json", responseSchema: schema } };

      try {
          const categorizedItems = JSON.parse(await callGeminiAPI(payload));
          let itemsAdded = 0;
          Object.entries(categorizedItems).forEach(([category, items]) => {
              if (items && Array.isArray(items)) {
                  items.forEach(item => {
                      if (item.term && item.definition) {
                          updateKnowledgeBase(category, { ...item, source: `درس: ${lesson.title}` });
                          itemsAdded++;
                      }
                  });
              }
          });
          setModalConfig({ title: "موفقیت", message: `${itemsAdded} مورد با موفقیت به مرکز دانش اضافه شد.` });
      } catch (e) {
          console.error("Failed to auto-categorize:", e);
          setModalConfig({ title: "خطا", message: "خطا در دسته‌بندی خودکار موارد. لطفاً به صورت دستی اضافه کنید." });
      }

      setAnalyzedContent(null);
      setPastedText('');
      setIsProcessing(false);
  };

  const handleAnalysis = async () => {
    const userInstructions = pastedText.trim();
    let contentToAnalyze = userInstructions || (lesson.files && lesson.files.length > 0 ? lesson.files.map(f => `محتوای فایل ${f.name}: [محتوای شبیه‌سازی شده برای تحلیل]`).join('\n\n') : '');
    if (!contentToAnalyze) {
        setModalConfig({ title: "محتوا خالی است", message: "لطفاً متنی را پیست کنید یا فایلی را برای تحلیل پیوست نمایید." });
        return;
    }
    setIsProcessing(true);
    setAnalyzedContent(null);
    addJournalEntry(`پردازش محتوا برای درس "${lesson.title}" شروع شد.`);
    const systemPrompt = `You are an expert linguistic analyzer for a Persian-speaking student learning Lebanese Arabic. Proofread the text, then extract key information into these Persian Markdown sections: **لغات و اصطلاحات جدید:**, **نکات گرامری کلیدی:**, and **عبارات کاربردی:**. Prioritize user instructions: "${userInstructions}"`;
    const payload = { contents: [{ parts: [{ text: `Content to Analyze:\n${contentToAnalyze}` }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
    try {
        setAnalyzedContent(await callGeminiAPI(payload));
    } catch (error) {
        setModalConfig({ title: "خطای API", message: "خطا در تحلیل محتوا." });
    } finally {
        setIsProcessing(false);
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
      if (isProcessing) return 'در حال پردازش...';
      if (pastedText.trim()) return '✨ تحلیل و تصحیح متن';
      if (lesson.files && lesson.files.length > 0) return '✨ تحلیل فایل‌های پیوست شده';
      return 'تحلیل محتوا';
  };

  return (
    <div className="space-y-8">
      <h2 className="text-4xl font-bold mb-2 text-slate-800">{lesson.title}</h2>
      <div className="flex items-center gap-2 text-slate-600 mb-6"><p className="text-lg">{lesson.summary}</p><TTSButton textToSpeak={lesson.summary} /></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card title="افزودن و تحلیل محتوا">
               <div className="p-6 border-dashed border-2 border-slate-300 rounded-xl text-center mb-4">
                   <input type="file" multiple onChange={handleFileChange} id="file-upload" className="hidden" />
                   <label htmlFor="file-upload" className="cursor-pointer text-teal-600 font-bold">برای آپلود فایل (صوت، ویدیو، متن) اینجا کلیک کنید</label>
               </div>
               {(lesson.files || []).length > 0 && (<ul className="mb-4 space-y-2">{lesson.files.map(file => (<li key={file.id} className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg"><FileText size={16} className="text-slate-500"/><span>{file.name}</span></li>))}</ul>)}
               <textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)} rows="4" className="w-full p-3 border rounded-xl mb-2" placeholder="متن/جزوه خود را برای تحلیل و تصحیح اینجا پیست کنید..."></textarea>
               <button onClick={handleAnalysis} disabled={isProcessing || (!pastedText.trim() && (!lesson.files || lesson.files.length === 0))} className="w-full bg-teal-500 text-white px-4 py-3 rounded-xl hover:bg-teal-600 disabled:bg-slate-400 flex items-center justify-center gap-2 font-bold"><Sparkles size={18} />{analysisButtonText()}</button>
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
            <Card title="نکات ذخیره شده درس">
                <div className="max-h-96 overflow-y-auto p-4 border rounded-lg bg-slate-50">
                    {lesson.archivedNotes && lesson.archivedNotes.trim() ? <MarkdownRenderer text={lesson.archivedNotes} /> : <p className="text-slate-500 text-center py-4">هنوز نکته‌ای به این درس اضافه نشده است.</p>}
                </div>
            </Card>
          <Card title="فلش‌کارت‌های هوشمند" actionButton={<button onClick={generateFlashcards} disabled={isGeneratingFlashcards || !lesson.archivedNotes?.trim()} className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 disabled:bg-slate-400 flex items-center gap-2"><Sparkles size={16}/>{isGeneratingFlashcards ? '...' : 'ایجاد فلش‌کارت'}</button>}>
            {isGeneratingFlashcards && <div className="text-center p-4"><Loader className="animate-spin inline-block" /></div>}
            {flashcards.length > 0 ? (<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{flashcards.map((card, index) => <Flashcard key={index} term={card.term} definition={card.definition} />)}</div>) : <p className="text-slate-500 text-center py-4">برای ایجاد فلش‌کارت، ابتدا باید نکاتی به درس اضافه کنید.</p>}
          </Card>
        </div>
        <div><Card title="✨ تمرین مکالمه"><ChatInterface data={data} setData={setData} context={`lesson-${lesson.id}`} lessonTitle={lesson.title} lessonNotes={lesson.archivedNotes} addJournalEntry={addJournalEntry} updateKnowledgeBase={updateKnowledgeBase} knowledgeBase={knowledgeBase} saveChatHistory={saveChatHistory} initialHistory={chatHistories[`lesson-${lesson.id}`] || []} setModalConfig={setModalConfig} /></Card></div>
      </div>
    </div>
  );
}

function QuizCenter({ lessons, addJournalEntry, setModalConfig }) {
    const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id || '');
    const [quiz, setQuiz] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [questionCount, setQuestionCount] = useState(5);
    const [timeLimit, setTimeLimit] = useState(0); // Now in minutes
    const [questionTypes, setQuestionTypes] = useState({ mcq: true, fillInBlank: false });
    const [timeLeft, setTimeLeft] = useState(0); // Now in seconds
    const timerRef = useRef(null);

    useEffect(() => {
        if (timeLeft > 0 && !submitted) {
            timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        } else if (timeLeft === 0 && quiz && !submitted) {
            handleSubmit();
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, quiz, submitted]);

    const generateQuiz = async () => {
        setIsLoading(true); setQuiz(null); setUserAnswers({}); setSubmitted(false); clearTimeout(timerRef.current);
        const lesson = lessons.find(l => l.id == selectedLessonId);
        if (!lesson || !lesson.archivedNotes?.trim()) {
            setModalConfig({ title: "خطا", message: "محتوای این درس برای ساخت آزمون کافی نیست." });
            setIsLoading(false); return;
        }
        addJournalEntry(`ایجاد آزمون برای درس "${lesson.title}"`);
        const selectedTypes = Object.entries(questionTypes).filter(([, val]) => val).map(([key]) => key).join(', ');
        const systemPrompt = `Create a ${questionCount}-question quiz in Lebanese Arabic based on lesson notes for a Persian speaker. Include these question types: [${selectedTypes}]. Return ONLY a valid JSON array of objects, each with 'type' ('mcq' or 'fill_in_blank'), 'question', 'options' (for mcq), and 'correctAnswer'. For fill_in_blank, use "___" for the blank.`;
        const schema = { type: "ARRAY", items: { type: "OBJECT", properties: { type: { type: "STRING" }, question: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } }, correctAnswer: { type: "STRING" } } } };
        const payload = { contents: [{ parts: [{ text: `Lesson Notes: ${lesson.archivedNotes}` }] }], systemInstruction: { parts: [{ text: systemPrompt }] }, generationConfig: { responseMimeType: "application/json", responseSchema: schema } };
        
        try {
            const generatedQuiz = JSON.parse(await callGeminiAPI(payload));
            setQuiz(generatedQuiz.filter(q => q && q.question && q.correctAnswer)); // Filter out invalid questions
            if (timeLimit > 0) setTimeLeft(timeLimit * 60);
        } catch (error) {
            setModalConfig({ title: "خطا", message: "خطا در ساخت آزمون." });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnswer = (qIndex, answer) => setUserAnswers(prev => ({...prev, [qIndex]: answer}));
    const handleSubmit = () => {
        if(!quiz) return;
        setSubmitted(true);
        clearTimeout(timerRef.current);
        let score = quiz.reduce((acc, q, i) => acc + (userAnswers[i]?.toLowerCase() === q.correctAnswer.toLowerCase() ? 1 : 0), 0);
        const finalScore = (score / quiz.length) * 100;
        addJournalEntry(`آزمون با امتیاز ${finalScore.toFixed(0)}% به پایان رسید.`);
    };

    return (
        <Card title="مرکز آزمون">
            <div className="bg-slate-100 p-6 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="font-bold">درس:</label><select value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)} className="w-full p-2 border rounded">{lessons.map(l => (<option key={l.id} value={l.id}>{l.title}</option>))}</select></div>
                <div><label className="font-bold">تعداد سوالات:</label><input type="number" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} className="w-full p-2 border rounded" min="1" max="10"/></div>
                <div><label className="font-bold">محدودیت زمانی (دقیقه):</label><input type="number" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} className="w-full p-2 border rounded" min="0" placeholder="0 برای نامحدود" /></div>
                <div><label className="font-bold">نوع سوالات:</label><div className="flex gap-4 mt-2"><label><input type="checkbox" checked={questionTypes.mcq} onChange={e => setQuestionTypes(p => ({...p, mcq: e.target.checked}))}/> تستی</label><label><input type="checkbox" checked={questionTypes.fillInBlank} onChange={e => setQuestionTypes(p => ({...p, fillInBlank: e.target.checked}))}/> جای خالی</label></div></div>
                <div className="md:col-span-2"><button onClick={generateQuiz} disabled={isLoading || lessons.length === 0} className="w-full bg-teal-500 text-white px-4 py-3 rounded-xl hover:bg-teal-600 disabled:bg-slate-400 flex items-center justify-center gap-2 font-bold"><Sparkles size={18} />{isLoading ? 'در حال ساخت آزمون...' : '✨ ایجاد آزمون هوشمند'}</button></div>
            </div>
            {isLoading && <div className="text-center p-10"><Loader className="animate-spin inline-block text-teal-500" size={40}/></div>}
            {quiz && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold">آزمون: {lessons.find(l => l.id == selectedLessonId)?.title}</h3>{timeLimit > 0 && <div className="font-bold text-lg bg-slate-200 px-3 py-1 rounded-lg">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>}</div>
                    <div className="space-y-6">
                        {quiz.map((q, qIndex) => (
                            <div key={qIndex}>
                                <div className="flex items-center gap-2 mb-2"><p className="font-bold text-lg">{qIndex + 1}. {q.question.replace('___', '_____')}</p><TTSButton textToSpeak={q.question} /></div>
                                {q.type === 'mcq' && <div className="space-y-3 pr-4">{q.options.map((opt, aIndex) => (<label key={aIndex} className={`block p-3 rounded-xl border-2 ${submitted ? (opt === q.correctAnswer ? 'border-green-500 bg-green-100' : (userAnswers[qIndex] === opt ? 'border-red-500 bg-red-100' : '')) : 'hover:border-teal-500'}`}><input type="radio" name={`q${qIndex}`} onChange={() => handleAnswer(qIndex, opt)} disabled={submitted} className="ml-3"/>{opt}</label>))}</div>}
                                {q.type === 'fill_in_blank' && <input type="text" onChange={e => handleAnswer(qIndex, e.target.value)} disabled={submitted} className={`w-full p-2 border-2 rounded ${submitted ? (userAnswers[qIndex]?.toLowerCase() === q.correctAnswer.toLowerCase() ? 'border-green-500' : 'border-red-500') : ''}`} />}
                                {submitted && <p className="text-sm text-green-700 mt-2 font-bold">پاسخ صحیح: {q.correctAnswer}</p>}
                            </div>
                        ))}
                    </div>
                    {!submitted ? (<button onClick={handleSubmit} className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold">ثبت پاسخ‌ها</button>) : (<div className="mt-8 p-4 bg-blue-100 rounded-xl text-center font-bold text-blue-800">آزمون تمام شد!</div>)}
                </div>
            )}
        </Card>
    );
}

function MarkdownRenderer({ text }) {
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

function StudyPlanner({ lessons, addJournalEntry, setModalConfig }) {
    const [goal, setGoal] = useState('');
    const [plan, setPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generatePlan = async () => {
        if (!goal.trim()) return;
        setIsLoading(true); setPlan('');
        addJournalEntry(`ایجاد برنامه مطالعه برای هدف: "${goal}"`);
        const lessonTitles = lessons.map(l => l.title).join(', ');
        const systemPrompt = `You are a language learning coach for a Persian speaker learning Lebanese Arabic. Their goal is: "${goal}". Create a simple, actionable 1-week study plan in Persian. Use Markdown. Suggest which of these available lessons might be helpful: [${lessonTitles}].`;
        const payload = { contents: [{ parts: [{ text: " " }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
        
        try {
            setPlan(await callGeminiAPI(payload));
        } catch (error) {
            setModalConfig({ title: "خطا", message: "خطا در ایجاد برنامه مطالعه." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="✨ برنامه ریزی هوشمند">
            <div className="bg-slate-100 p-6 rounded-xl">
                <label htmlFor="goal" className="block font-bold mb-2 text-slate-700">هدف یادگیری خود را اینجا بنویسید:</label>
                <textarea id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} rows="3" className="w-full p-3 border rounded-xl mb-4" placeholder="مثال: می‌خواهم تا دو هفته دیگر بتوانم در یک رستوران لبنانی به راحتی غذا سفارش دهم."></textarea>
                <button onClick={generatePlan} disabled={isLoading} className="w-full bg-teal-500 text-white px-4 py-3 rounded-xl hover:bg-teal-600 disabled:bg-slate-400 flex items-center justify-center gap-2 font-bold">
                    <Sparkles size={18} />{isLoading ? 'در حال ایجاد برنامه...' : 'ایجاد برنامه مطالعه با Gemini'}
                </button>
            </div>
            {isLoading && <div className="text-center p-10"><Loader className="animate-spin inline-block text-teal-500" size={40}/></div>}
            {plan && (<div className="mt-8"><h3 className="text-2xl font-bold mb-4">برنامه مطالعه پیشنهادی شما:</h3><div className="bg-white p-6 rounded-xl border"><MarkdownRenderer text={plan} /></div></div>)}
        </Card>
    );
}

function CulturalInsights({ addJournalEntry, setModalConfig }) {
    const [topic, setTopic] = useState('Food');
    const [insight, setInsight] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getInsight = async () => {
        setIsLoading(true); setInsight('');
        addJournalEntry(`درخواست نکته فرهنگی در مورد: ${topic}`);
        const systemPrompt = `You are a cultural guide for Lebanon. Briefly explain the Lebanese cultural topic of "${topic}" in a simple, engaging way for a Persian-speaking learner. Respond in Persian using Markdown.`;
        const payload = { contents: [{ parts: [{ text: " " }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
        
        try {
            setInsight(await callGeminiAPI(payload));
        } catch (error) {
            setModalConfig({ title: "خطا", message: "خطا در دریافت اطلاعات فرهنگی." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="✨ نکات فرهنگی">
            <div className="bg-slate-100 p-6 rounded-xl">
                <label htmlFor="topic" className="block font-bold mb-2 text-slate-700">یک موضوع فرهنگی انتخاب کنید:</label>
                <select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-3 border rounded-xl mb-4">
                    <option value="Food">غذا</option><option value="Music">موسیقی</option><option value="Social Etiquette">آداب اجتماعی</option><option value="Holidays">تعطیلات و جشن‌ها</option>
                </select>
                <button onClick={getInsight} disabled={isLoading} className="w-full bg-teal-500 text-white px-4 py-3 rounded-xl hover:bg-teal-600 disabled:bg-slate-400 flex items-center justify-center gap-2 font-bold">
                    <Sparkles size={18} />{isLoading ? 'در حال دریافت اطلاعات...' : 'دریافت نکات فرهنگی با Gemini'}
                </button>
            </div>
            {isLoading && <div className="text-center p-10"><Loader className="animate-spin inline-block text-teal-500" size={40}/></div>}
            {insight && (<div className="mt-8"><h3 className="text-2xl font-bold mb-4">درباره {topic}:</h3><div className="bg-white p-6 rounded-xl border"><MarkdownRenderer text={insight} /></div></div>)}
        </Card>
    );
}

function StatsReport({ journal, knowledgeBase }) {
    const weeklyActivity = useMemo(() => {
        const activity = {};
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        last7Days.forEach(day => activity[day] = 0);

        journal.forEach(entry => {
            const entryDate = entry.date.split('T')[0];
            if (activity[entryDate] !== undefined) {
                activity[entryDate]++;
            }
        });
        
        const values = Object.values(activity);
        const max = Math.max(...values);
        return values.map(v => max > 0 ? (v / max) * 100 : 0);
    }, [journal]);

    return (
        <Card title="آمار و ارزیابی عملکرد">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-100 p-6 rounded-xl">
                    <h3 className="font-bold mb-2 text-slate-700">خلاصه دانش</h3>
                    <p><strong>لغات آموخته شده:</strong> {knowledgeBase.vocabulary.length}</p>
                    <p><strong>نکات گرامری:</strong> {knowledgeBase.grammar.length}</p>
                    <p><strong>اصطلاحات:</strong> {knowledgeBase.phrases.length}</p>
                </div>
                <div className="bg-slate-100 p-6 rounded-xl">
                    <h3 className="font-bold mb-2 text-slate-700">فعالیت اخیر</h3>
                    <p><strong>تعداد کل فعالیت‌ها:</strong> {journal.length}</p>
                    <p><strong>فعالیت در ۷ روز گذشته:</strong> {Object.values(weeklyActivity).reduce((a, b) => a + (b > 0 ? 1 : 0), 0)} روز</p>
                </div>
            </div>
            <div className="mt-8">
                <h3 className="font-bold mb-4 text-lg">روند پیشرفت هفتگی</h3>
                <div className="bg-slate-200 p-4 rounded-xl h-64 flex items-end justify-around">
                    {weeklyActivity.map((height, index) => (
                        <div key={index} className="w-8 bg-teal-500 rounded-t-lg transition-all duration-500" style={{ height: `${height}%` }}></div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
function Journal({ entries }) { return (<Card title="ژورنال فعالیت‌ها"><div className="space-y-4 max-h-[600px] overflow-y-auto">{entries.map(entry => (<div key={entry.id} className="p-4 bg-slate-50 border-r-4 border-teal-500 rounded-r-lg"><p className="text-sm text-slate-500 mb-1">{new Date(entry.date).toLocaleString('fa-IR')}</p><p>{entry.entry}</p></div>))}</div></Card>); }

function ChatInterface({ data, setData, context, lessonTitle, lessonNotes, addJournalEntry, updateKnowledgeBase, knowledgeBase, saveChatHistory, initialHistory, setModalConfig }) {
  const { defaultChatSettings = initialData.defaultChatSettings, archivedConversations = [] } = data;
  const [chatHistory, setChatHistory] = useState(initialHistory || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef(null);
  const [customScenarioName, setCustomScenarioName] = useState('');
  const [customScenarioDetails, setCustomScenarioDetails] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToSave, setItemToSave] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const [voiceConversationMode, setVoiceConversationMode] = useState(false);
  const currentAudioRef = useRef(null);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  
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
    if (!initialHistory || initialHistory.length === 0) {
        startNewConversation();
    }
  }, [context, lessonTitle, initialHistory]);

  const startNewConversation = (archiveCurrent = false) => {
    if (archiveCurrent && chatHistory.length > 1) {
        const conversationTitle = chatHistory[1]?.parts[0]?.text.substring(0, 30) + '...';
        const newArchive = [...(data.archivedConversations || []), { id: Date.now(), title: conversationTitle, history: chatHistory }];
        saveChatHistory(context, []); // Clear current history
        setData(prev => ({...prev, archivedConversations: newArchive}));
    }

    let initialText = 'أهلاً فيك! أنا جاد، معلمك. كيفك اليوم؟';
    if (context.startsWith('lesson')) {
        initialText = `أهلاً فيك! خلينا نمرّن شوي على درس "${lessonTitle}". شو أول كلمة تعلمتها من هيدا الدرس؟`;
    }
    setChatHistory([{ role: 'model', parts: [{ text: initialText, type: 'text' }] }]);
  };

  useEffect(() => { chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight); }, [chatHistory]);

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

    let fullMessage = messageText;
    if (attachedFile) {
        fullMessage = `[User has attached a file named: ${attachedFile.name}]\n${messageText}`;
    }

    const messageType = audioBlobUrl && sendVoiceAs === 'audio' ? 'audio' : 'text';
    const newUserMessage = { role: 'user', parts: [{ text: fullMessage, type: messageType, audioUrl: audioBlobUrl }] };
    let newHistory = [...chatHistory, newUserMessage];
    setChatHistory(newHistory);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    let systemPrompt = `You are "Jad", a friendly Lebanese Arabic tutor for a Persian beginner. Your entire response MUST be in simple Lebanese Arabic.`;
    if (writingStyle === 'finglish') {
        systemPrompt += ` Write your responses using Arabizi (Lebanese chat alphabet). For example: 'Mni7 ktir! Shu 3melt lyoum?'. Use numbers for specific letters: 7 for ح, 3 for ع, 2 for ء, 6 for ط, 9 for ص.`;
    } else if (writingStyle === 'tashkeel') {
        systemPrompt += ` Write your responses in Arabic script with full Lebanese dialect vowel markings (Tashkeel) to aid pronunciation.`;
    }
    if (translationLanguage !== 'none') {
        systemPrompt += ` After your Lebanese Arabic response, provide a ${translationLanguage} translation on a new line, formatted as 'TRANSLATION: [text]'.`;
    }

    if (context.startsWith('lesson')) {
        systemPrompt += `\nYour conversation MUST be based on the provided lesson notes: \n---\n${lessonNotes || "No notes available."}\n---`;
    } else {
        const currentTopic = selectedTopics[0];
        if (currentTopic === 'custom_scenario') {
            systemPrompt += `\nYou are role-playing. Scenario: "${customScenarioName}". Details: "${customScenarioDetails}". Act out your role.`;
        } else if (currentTopic !== 'general') {
            const itemsToPractice = selectedTopics.flatMap(topic => knowledgeBase[topic]?.map(item => `${item.term}: ${item.definition}`) || []).join(', ');
            systemPrompt += `\nFocus the conversation on these items: [${itemsToPractice}].`;
        }
    }

    // Build contents for API - transcribe audio first if needed
    let contentsForApi = [];
    for (const m of newHistory) {
      if (m.parts[0].type === 'audio' && m.parts[0].audioUrl) {
        // Transcribe audio to text first
        try {
          const response = await fetch(m.parts[0].audioUrl);
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
            // Update the message in history with transcribed text
            m.parts[0].transcribedText = transcribedText;
            // Update chat history to show transcription
            setChatHistory([...newHistory]);
            contentsForApi.push({ role: m.role, parts: [{ text: `[پیام صوتی کاربر]: ${transcribedText}` }] });
          } else {
            contentsForApi.push({ role: m.role, parts: [{ text: '[پیام صوتی - خطا در تبدیل]' }] });
          }
        } catch (e) {
          console.error('Error transcribing audio:', e);
          if (m.parts[0].text?.trim()) {
            contentsForApi.push({ role: m.role, parts: [{ text: m.parts[0].text }] });
          }
        }
      } else if (m.parts[0].text?.trim()) {
        contentsForApi.push({ role: m.role, parts: [{ text: m.parts[0].text }] });
      }
    }

    const payload = { contents: contentsForApi, systemInstruction: { parts: [{ text: systemPrompt }] } };

    try {
        const aiResponseText = await callGeminiAPI(payload);
        let ttsPrompt = `Say in a clear, ${accentMode === 'standard' ? 'standard' : 'authentic, colloquial Beirut'} Lebanese accent: ${aiResponseText.split('TRANSLATION:')[0]}`;
        const audioPromise = (aiResponseType === 'audio' || voiceConversationMode) ? callGeminiTTS(ttsPrompt, aiVoice) : Promise.resolve(null);
        const audioResult = await audioPromise;
        const audioUrl = audioResult ? getWavUrl(audioResult.audioData, audioResult.mimeType) : null;
        const newAiMessage = { role: 'model', parts: [{ text: aiResponseText, type: 'text', audioUrl }] };
        newHistory = [...newHistory, newAiMessage];
        setChatHistory(newHistory);
        saveChatHistory(context, newHistory);

        // Play audio and handle voice conversation mode
        if ((aiResponseType === 'audio' || voiceConversationMode) && audioUrl) {
            const audio = new Audio(audioUrl);
            currentAudioRef.current = audio;

            audio.onended = () => {
                currentAudioRef.current = null;
                // Auto-start recording if voice conversation mode is active
                if (voiceConversationMode) {
                    setTimeout(() => startVoiceRecording(), 500);
                }
            };

            audio.play().catch(err => {
                console.error('Audio playback error:', err);
                // Still try to start recording if in voice conversation mode
                if (voiceConversationMode) {
                    setTimeout(() => startVoiceRecording(), 500);
                }
            });
        }
    } catch(error) {
        const errorAiMessage = { role: 'model', parts: [{ text: "متاسفانه مشکلی پیش آمد.", type: 'text', isError: true }] };
        setChatHistory(prev => [...prev, errorAiMessage]);
        // Stop voice conversation mode on error
        if (voiceConversationMode) {
            setVoiceConversationMode(false);
        }
    } finally {
        setIsLoading(false);
    }
  };

  // Start voice recording function (used by both manual click and voice conversation mode)
  const startVoiceRecording = async () => {
    if (isRecording || isLoading) return;

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setModalConfig({ title: "خطا", message: "مرورگر شما از ضبط صدا پشتیبانی نمی‌کند. لطفاً از مرورگر دیگری استفاده کنید." });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Check supported mimeTypes
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
                       MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' :
                       MediaRecorder.isTypeSupported('audio/ogg') ? 'audio/ogg' : '';

      mediaRecorderRef.current = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        stream.getTracks().forEach(track => track.stop());

        if (audioChunksRef.current.length === 0) {
          if (!voiceConversationMode) {
            setModalConfig({ title: "خطا", message: "صدایی ضبط نشد. لطفا دوباره تلاش کنید." });
          }
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (sendVoiceAs === 'text' && recognitionRef.current && !voiceConversationMode) {
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
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        if (voiceConversationMode) {
          setVoiceConversationMode(false);
        }
        setModalConfig({ title: "خطای ضبط", message: "مشکلی در ضبط صدا پیش آمد." });
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      if (voiceConversationMode) {
        setVoiceConversationMode(false);
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
    }
  };

  // Stop voice recording
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Toggle voice conversation mode
  const toggleVoiceConversationMode = () => {
    if (voiceConversationMode) {
      // Turning off - stop any ongoing audio/recording
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      stopVoiceRecording();
      setVoiceConversationMode(false);
    } else {
      // Turning on - start voice conversation mode and begin recording
      setVoiceConversationMode(true);
      startVoiceRecording();
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
              <div className="relative group flex-1">
                  <button className="w-full p-2 border rounded-lg text-sm text-left">انتخاب موضوع تمرین ({selectedTopics.includes('general') || selectedTopics.includes('custom_scenario') ? 1 : selectedTopics.length})</button>
                  <div className="hidden group-hover:block absolute z-10 bg-white shadow-lg rounded-lg p-2 w-full space-y-1">
                      {Object.entries(kbCategories).map(([key, value]) => (<label key={key} className="flex items-center gap-2 p-1 rounded hover:bg-slate-100"><input type="checkbox" checked={selectedTopics.includes(key)} onChange={() => handleTopicChange(key)} disabled={!knowledgeBase[key]?.length}/>{value}</label>))}
                      <div className="border-t pt-1 mt-1"><label className="flex items-center gap-2 p-1 rounded hover:bg-slate-100"><input type="radio" name="topic-mode" checked={selectedTopics.includes('general')} onChange={() => handleTopicChange('general')}/>مکالمه عمومی</label><label className="flex items-center gap-2 p-1 rounded hover:bg-slate-100"><input type="radio" name="topic-mode" checked={selectedTopics.includes('custom_scenario')} onChange={() => handleTopicChange('custom_scenario')}/>سناریوی سفارشی</label></div>
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
          {chatHistory.map((msg, index) => (<ChatMessage key={`${index}-${msg.parts[0].text?.slice(0, 10) || 'audio'}`} message={msg.parts[0]} role={msg.role} onSave={openSaveModal} voice={aiVoice} msgType={msg.type} audioData={msg.audioData} mimeType={msg.mimeType} isVoiceCall={msg.isVoiceCall} isVoiceCallHeader={msg.isVoiceCallHeader} />))}
          {isLoading && (<div className="flex justify-start"><div className="max-w-[80%] py-2 px-4 rounded-2xl bg-white text-slate-500 rounded-bl-none shadow-sm">...</div></div>)}
        </div>
        {/* Voice Conversation Mode Indicator */}
        {voiceConversationMode && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone size={20} className="animate-pulse" />
              <span className="font-bold">حالت مکالمه صوتی فعال</span>
              {isRecording && <span className="text-sm bg-white/20 px-2 py-1 rounded-full">در حال گوش دادن...</span>}
              {isLoading && <span className="text-sm bg-white/20 px-2 py-1 rounded-full">در حال پاسخگویی...</span>}
            </div>
            <button onClick={toggleVoiceConversationMode} className="bg-white/20 hover:bg-white/30 p-2 rounded-lg">
              <PhoneOff size={18} />
            </button>
          </div>
        )}

        <div className="pt-2 flex-shrink-0 space-y-2">
          <div className="flex items-center gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} className="flex-1 p-3 border rounded-xl text-base bg-white" placeholder="پیام خود را بنویسید..." disabled={isLoading || voiceConversationMode} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current.click()} className="p-2 border rounded-xl hover:bg-slate-200" disabled={voiceConversationMode}><Paperclip size={20}/></button>
              <input type="file" ref={fileInputRef} onChange={handleFileAttach} className="hidden" />
              <button onClick={handleMicClick} className={`p-2 border rounded-xl ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-slate-200'}`} disabled={voiceConversationMode}><Mic size={20}/></button>
              <button
                onClick={toggleVoiceConversationMode}
                className={`p-2 border rounded-xl flex items-center gap-1 ${voiceConversationMode ? 'bg-purple-500 text-white' : 'hover:bg-purple-100 text-purple-600 border-purple-300'}`}
                title="حالت مکالمه صوتی"
              >
                <Phone size={20}/>
              </button>
              <button
                onClick={() => setIsLiveChatOpen(true)}
                className="p-2 border rounded-xl flex items-center gap-1 hover:bg-pink-100 text-pink-600 border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50"
                title="مکالمه زنده با جاد (Gemini Live)"
              >
                <Phone size={20}/>
                <span className="text-xs font-bold">Live</span>
              </button>
            </div>
            <button onClick={() => handleSend()} className="bg-teal-500 text-white px-6 py-2 rounded-xl hover:bg-teal-600 disabled:bg-slate-400 font-bold" disabled={isLoading || voiceConversationMode}>{isLoading ? '...' : 'ارسال'}</button>
          </div>
        </div>
      </div>
      <LiveVoiceChat
        isOpen={isLiveChatOpen}
        onClose={() => setIsLiveChatOpen(false)}
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        saveChatHistory={() => saveChatHistory(context, chatHistory)}
        context={context}
        lessonTitle={lessonTitle}
        selectedTopics={selectedTopics}
        customScenarioName={customScenarioName}
        customScenarioDetails={customScenarioDetails}
        aiVoice={aiVoice}
        accentMode={accentMode}
        addJournalEntry={addJournalEntry}
        knowledgeBase={knowledgeBase}
      />
    </>
  );
}

function ChatMessage({ message, role, onSave, voice, disableSave = false, msgType, audioData, mimeType, isVoiceCall, isVoiceCallHeader }) {
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

const getWavUrl = (base64, mimeType) => {
    const sampleRateMatch = mimeType.match(/rate=(\d+)/);
    const sampleRate = sampleRateMatch ? parseInt(sampleRateMatch[1], 10) : 24000;
    const base64ToArrayBuffer = (base64) => { const s = window.atob(base64), l = s.length, b = new Uint8Array(l); for (let i = 0; i < l; i++) b[i] = s.charCodeAt(i); return b.buffer; };
    const pcmToWav = (pcm, rate) => { const d = pcm.byteLength, b = new ArrayBuffer(44 + d), v = new DataView(b); v.setUint32(0, 1380533830, false); v.setUint32(4, 36 + d, true); v.setUint32(8, 1463899717, false); v.setUint32(12, 1718449184, false); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); v.setUint32(36, 1684108385, false); v.setUint32(40, d, true); const p = new Int16Array(pcm); for (let i = 0; i < p.length; i++) v.setInt16(44 + i * 2, p[i], true); return new Blob([v], { type: 'audio/wav' }); };
    const pcmData = base64ToArrayBuffer(base64);
    const wavBlob = pcmToWav(pcmData, sampleRate);
    return URL.createObjectURL(wavBlob);
};

function TTSButton({ textToSpeak, voice, audioUrl }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const playAudio = async () => {
        if (!textToSpeak) return;

        // If already playing, stop it
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            return;
        }

        // If we have a pre-generated audio URL, use it
        if (audioUrl) {
            // Stop any existing audio
            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onplay = () => setIsPlaying(true);
            audio.onended = () => setIsPlaying(false);
            audio.onerror = () => setIsPlaying(false);
            audio.onpause = () => setIsPlaying(false);

            audio.play().catch(() => setIsPlaying(false));
            return;
        }

        // Generate new TTS
        if (isLoading) return;
        setIsLoading(true);

        const result = await callGeminiTTS(`Say: ${textToSpeak}`, voice);
        if (result) {
            const newAudioUrl = getWavUrl(result.audioData, result.mimeType);
            const audio = new Audio(newAudioUrl);
            audioRef.current = audio;

            audio.onplay = () => setIsPlaying(true);
            audio.onended = () => {
                setIsPlaying(false);
                setIsLoading(false);
                URL.revokeObjectURL(newAudioUrl);
            };
            audio.onerror = () => { setIsPlaying(false); setIsLoading(false); };

            audio.play().catch(() => { setIsPlaying(false); setIsLoading(false); });
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

// --- Gemini Live API Real-time Voice Chat ---
function LiveVoiceChat({
  isOpen,
  onClose,
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
  knowledgeBase
}) {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(aiVoice || 'Aoede');

  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);

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

  useEffect(() => {
    if (aiVoice && availableVoices[aiVoice]) setSelectedVoice(aiVoice);
  }, [aiVoice]);

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
    setTranscript([]);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;

    try {
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onopen = () => console.log('WebSocket connected');
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
      };
      wsRef.current.onclose = (e) => {
        console.log('WebSocket closed:', e.code, e.reason);
        setConnectionStatus('disconnected');
        stopListening();
      };
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    }
  };

  // Combine multiple audio chunks into one
  const combineAudioChunks = (chunks) => {
    if (!chunks || chunks.length === 0) return { data: null, mimeType: null };
    if (chunks.length === 1) return { data: chunks[0].data, mimeType: chunks[0].mimeType };

    // Combine base64 PCM chunks
    const mimeType = chunks[0].mimeType;
    const allBytes = [];
    for (const chunk of chunks) {
      const binary = atob(chunk.data);
      for (let i = 0; i < binary.length; i++) {
        allBytes.push(binary.charCodeAt(i));
      }
    }
    const combined = btoa(String.fromCharCode(...allBytes));
    return { data: combined, mimeType };
  };

  const disconnect = () => {
    stopListening();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
    setTranscript([]);
  };

  const handleClose = () => {
    // Save conversation to chat history before closing
    if (conversationRef.current.length > 0) {
      const callMessages = conversationRef.current.map(msg => ({
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

      const newHistory = [...chatHistory, callHeader, ...callMessages];
      setChatHistory(newHistory);
      saveChatHistory(context, newHistory);
    }

    // Reset recording refs
    conversationRef.current = [];
    currentAiAudioChunksRef.current = [];
    currentAiTextRef.current = '';

    disconnect();
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

      wsRef.current?.send(JSON.stringify({
        type: 'setup',
        voice: selectedVoice,
        context: contextInfo
      }));
      setTranscript([{ role: 'system', text: 'در حال اتصال...' }]);
      return;
    }

    if (message.type === 'connected') {
      setConnectionStatus('connected');
      setTranscript([{ role: 'system', text: 'متصل شدم! دکمه رو نگه دارید و صحبت کنید' }]);
      return;
    }

    if (message.type === 'disconnected' || message.error) {
      setConnectionStatus(message.error ? 'error' : 'disconnected');
      if (message.error) setTranscript(prev => [...prev, { role: 'error', text: message.error }]);
      return;
    }

    if (message.serverContent) {
      const parts = message.serverContent.modelTurn?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith('audio/')) {
          playAudioChunk(part.inlineData.data, part.inlineData.mimeType);
          // Store audio chunk for recording
          currentAiAudioChunksRef.current.push({
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType
          });
          setIsSpeaking(true);
        }
        if (part.text) {
          currentAiTextRef.current += part.text;
          setTranscript(prev => [...prev, { role: 'ai', text: part.text }]);
        }
      }
      if (message.serverContent.turnComplete) {
        setIsSpeaking(false);
        // Save completed AI response to conversation
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true }
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
    setIsListening(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 text-white">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Phone size={24} />
          تماس زنده با جاد
        </h2>
        <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-full">
          <X size={24} />
        </button>
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
            onMouseDown={startListening}
            onMouseUp={stopListening}
            onMouseLeave={stopListening}
            onTouchStart={startListening}
            onTouchEnd={stopListening}
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
          {connectionStatus === 'connected' ? (isListening ? 'رها کنید تا جاد جواب بده' : 'نگه دارید و صحبت کنید') :
           connectionStatus === 'connecting' ? 'صبر کنید...' : 'شروع کنید'}
        </p>
      </div>
    </div>
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
