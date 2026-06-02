// Execution-flow tracking context.
//
// Tracks the app's current "node" in the chat / live-voice / file-analysis /
// quiz pipelines and (optionally) mirrors that state to Firestore so progress
// is visible across browsers/devices. Extracted from the former monolithic
// src/App.jsx so each context lives in its own module.
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// Flow nodes definition - represents all possible states in the system
export const FLOW_NODES = {
  // Chat flow
  idle: { id: 'idle', label: 'آماده', icon: '⏸️', category: 'start' },
  userInput: { id: 'userInput', label: 'ورودی کاربر', icon: '✍️', category: 'input' },
  audioRecording: { id: 'audioRecording', label: 'ضبط صدا', icon: '🎤', category: 'input' },
  audioTranscription: { id: 'audioTranscription', label: 'تبدیل صوت به متن', icon: '📝', category: 'processing' },
  buildingPrompt: { id: 'buildingPrompt', label: 'ساخت پرامپت', icon: '🔧', category: 'processing' },
  callingGemini: { id: 'callingGemini', label: 'ارسال به Gemini', icon: '🤖', category: 'api' },
  receivingResponse: { id: 'receivingResponse', label: 'دریافت پاسخ', icon: '📥', category: 'api' },
  generatingTTS: { id: 'generatingTTS', label: 'ساخت صوت', icon: '🔊', category: 'processing' },
  playingAudio: { id: 'playingAudio', label: 'پخش صدا', icon: '▶️', category: 'output' },

  // Live voice flow
  wsConnecting: { id: 'wsConnecting', label: 'اتصال WebSocket', icon: '🔌', category: 'connection' },
  wsConnected: { id: 'wsConnected', label: 'متصل', icon: '✅', category: 'connection' },
  liveListening: { id: 'liveListening', label: 'گوش دادن', icon: '👂', category: 'input' },
  liveStreaming: { id: 'liveStreaming', label: 'ارسال صوت زنده', icon: '📡', category: 'api' },
  liveReceiving: { id: 'liveReceiving', label: 'دریافت صوت زنده', icon: '📻', category: 'api' },
  liveSpeaking: { id: 'liveSpeaking', label: 'استاد صحبت می‌کند', icon: '🗣️', category: 'output' },

  // File analysis flow
  fileUploading: { id: 'fileUploading', label: 'آپلود فایل', icon: '📤', category: 'input' },
  fileProcessing: { id: 'fileProcessing', label: 'پردازش فایل', icon: '⚙️', category: 'processing' },
  fileAnalyzing: { id: 'fileAnalyzing', label: 'تحلیل محتوا', icon: '🔍', category: 'api' },
  mergingContent: { id: 'mergingContent', label: 'ادغام محتوا', icon: '🔀', category: 'processing' },
  categorizingItems: { id: 'categorizingItems', label: 'دسته‌بندی', icon: '📊', category: 'processing' },
  savingToLesson: { id: 'savingToLesson', label: 'ذخیره در درس', icon: '💾', category: 'output' },

  // Quiz flow
  generatingQuiz: { id: 'generatingQuiz', label: 'ساخت آزمون', icon: '📝', category: 'api' },
  showingQuiz: { id: 'showingQuiz', label: 'نمایش آزمون', icon: '❓', category: 'output' },
  checkingAnswer: { id: 'checkingAnswer', label: 'بررسی پاسخ', icon: '✔️', category: 'processing' },

  // Common
  error: { id: 'error', label: 'خطا', icon: '❌', category: 'error' },
  complete: { id: 'complete', label: 'تکمیل', icon: '✅', category: 'end' }
};

// Flow categories with colors
export const FLOW_CATEGORIES = {
  start: { color: '#64748b', label: 'شروع' },
  input: { color: '#3b82f6', label: 'ورودی' },
  processing: { color: '#f59e0b', label: 'پردازش' },
  api: { color: '#8b5cf6', label: 'API' },
  output: { color: '#10b981', label: 'خروجی' },
  connection: { color: '#06b6d4', label: 'اتصال' },
  error: { color: '#ef4444', label: 'خطا' },
  end: { color: '#22c55e', label: 'پایان' }
};

// Context for execution flow
const ExecutionFlowContext = createContext(null);

// Custom hook for using execution flow
export function useExecutionFlow() {
  const context = useContext(ExecutionFlowContext);
  if (!context) {
    console.warn('⚠️ useExecutionFlow: No context available - using dummy functions');
    // Return dummy functions if not in provider (for components that may render outside)
    return {
      setCurrentNode: () => { console.log('⚠️ Dummy setCurrentNode called'); },
      addToHistory: () => {},
      clearHistory: () => {},
      currentNode: 'idle',
      flowHistory: [],
      activeFlow: null
    };
  }
  return context;
}

// Provider component - now with Firebase sync for cross-browser/device visibility
export function ExecutionFlowProvider({ children, firebaseServices, userId }) {
  const [currentNode, setCurrentNodeState] = useState('idle');
  const [flowHistory, setFlowHistory] = useState([]);
  const [activeFlow, setActiveFlowState] = useState(null);
  const activeFlowRef = useRef(null);
  const maxHistoryLength = 50;
  const isLocalUpdateRef = useRef(false); // Track if update is from local action

  // Keep ref in sync with state
  useEffect(() => {
    activeFlowRef.current = activeFlow;
  }, [activeFlow]);

  // Subscribe to Firebase flow updates for real-time cross-browser sync
  useEffect(() => {
    if (!firebaseServices?.db || !userId) return;

    const flowDocRef = doc(firebaseServices.db, `artifacts/${userId}/flowState/current`);

    const unsubscribe = onSnapshot(flowDocRef, (docSnap) => {
      // Skip if this update was triggered by our own local action
      if (isLocalUpdateRef.current) {
        isLocalUpdateRef.current = false;
        return;
      }

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.currentNode) setCurrentNodeState(data.currentNode);
        if (data.activeFlow !== undefined) setActiveFlowState(data.activeFlow);
        if (data.flowHistory) setFlowHistory(data.flowHistory);
        console.log('📡 Flow state synced from Firebase:', data.currentNode, data.activeFlow);
      }
    }, (error) => {
      console.error('Error listening to flow state:', error);
    });

    return () => unsubscribe();
  }, [firebaseServices?.db, userId]);

  // Sync flow state to Firebase
  const syncToFirebase = useCallback((nodeId, flowType, history) => {
    if (!firebaseServices?.db || !userId) return;

    isLocalUpdateRef.current = true; // Mark as local update to avoid echo
    const flowDocRef = doc(firebaseServices.db, `artifacts/${userId}/flowState/current`);

    setDoc(flowDocRef, {
      currentNode: nodeId,
      activeFlow: flowType,
      flowHistory: history.slice(-20), // Only sync last 20 entries to keep it lightweight
      lastUpdated: Date.now()
    }, { merge: true }).catch(err => {
      console.error('Error syncing flow state to Firebase:', err);
      isLocalUpdateRef.current = false;
    });
  }, [firebaseServices?.db, userId]);

  const setActiveFlow = useCallback((flowType) => {
    activeFlowRef.current = flowType;
    setActiveFlowState(flowType);
  }, []);

  const setCurrentNode = useCallback((nodeId, flowType = null) => {
    console.log('🔄 Flow Update:', nodeId, flowType); // Debug log
    const timestamp = Date.now();
    setCurrentNodeState(nodeId);

    // Set active flow if provided
    if (flowType) {
      setActiveFlow(flowType);
    }

    // Clear active flow when going to idle without flowType
    if (nodeId === 'idle' && !flowType) {
      setActiveFlow(null);
    }

    // Add to history and sync to Firebase
    setFlowHistory(prev => {
      const newEntry = { nodeId, timestamp, flowType: flowType || activeFlowRef.current };
      const updated = [...prev, newEntry].slice(-maxHistoryLength);

      // Sync to Firebase for cross-browser visibility
      syncToFirebase(nodeId, flowType || activeFlowRef.current, updated);

      return updated;
    });
  }, [setActiveFlow, syncToFirebase]);

  const addToHistory = useCallback((nodeId, flowType = null) => {
    const timestamp = Date.now();
    setFlowHistory(prev => {
      const newEntry = { nodeId, timestamp, flowType: flowType || activeFlowRef.current };
      const updated = [...prev, newEntry].slice(-maxHistoryLength);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setFlowHistory([]);
    setCurrentNodeState('idle');
    setActiveFlow(null);

    // Also clear in Firebase
    if (firebaseServices?.db && userId) {
      const flowDocRef = doc(firebaseServices.db, `artifacts/${userId}/flowState/current`);
      setDoc(flowDocRef, {
        currentNode: 'idle',
        activeFlow: null,
        flowHistory: [],
        lastUpdated: Date.now()
      }).catch(err => console.error('Error clearing flow state in Firebase:', err));
    }
  }, [setActiveFlow, firebaseServices?.db, userId]);

  const value = useMemo(() => ({
    currentNode,
    setCurrentNode,
    flowHistory,
    addToHistory,
    clearHistory,
    activeFlow,
    setActiveFlow
  }), [currentNode, setCurrentNode, flowHistory, addToHistory, clearHistory, activeFlow, setActiveFlow]);

  return (
    <ExecutionFlowContext.Provider value={value}>
      {children}
    </ExecutionFlowContext.Provider>
  );
}
