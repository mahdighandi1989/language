// Live-chat context — shared state for the floating voice chat, covering both
// the Gemini Live mode and the turn-based Voice Conversation mode. Extracted
// from the former monolithic src/App.jsx so each context lives in its own file.
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';

const LiveChatContext = createContext(null);

export function useLiveChat() {
  const context = useContext(LiveChatContext);
  if (!context) {
    console.warn('⚠️ useLiveChat: No context available');
    return {
      // Live chat (Gemini Live)
      isLiveChatActive: false,
      isMinimized: false,
      liveChatConfig: null,
      openLiveChat: () => {},
      closeLiveChat: () => {},
      minimizeLiveChat: () => {},
      maximizeLiveChat: () => {},
      // Voice conversation mode
      isVoiceConvActive: false,
      isVoiceConvMinimized: false,
      voiceConvConfig: null,
      openVoiceConv: () => {},
      closeVoiceConv: () => {},
      minimizeVoiceConv: () => {},
      maximizeVoiceConv: () => {},
      updateVoiceConvStatus: () => {},
      stopVoiceConvAudio: () => false,
      voiceConvStatus: {},
      shouldAutoStartRecording: false,
      markAudioFinishedWhileMinimized: () => {},
      clearAutoStartRecording: () => {},
      voiceConvChatHistory: [],
      voiceConvAudioRef: { current: null },
      voiceConvActiveRef: { current: false },
      saveVoiceConvState: () => {},
      updateVoiceConvChatHistory: () => {},
    };
  }
  return context;
}

export function LiveChatProvider({ children, data, setData, addJournalEntry, addPronunciationCorrection, saveChatHistory, navigateTo }) {
  // ===== Live Chat (Gemini Live) State =====
  const [isLiveChatActive, setIsLiveChatActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [liveChatConfig, setLiveChatConfig] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  // ===== Voice Conversation Mode State =====
  const [isVoiceConvActive, setIsVoiceConvActive] = useState(false);
  const [isVoiceConvMinimized, setIsVoiceConvMinimized] = useState(false);
  const [voiceConvConfig, setVoiceConvConfig] = useState(null);
  const [voiceConvStatus, setVoiceConvStatus] = useState({
    isRecording: false,
    isPlaying: false,
    isLoading: false,
  });
  const [shouldAutoStartRecording, setShouldAutoStartRecording] = useState(false); // Track if audio finished while minimized
  const [voiceConvChatHistory, setVoiceConvChatHistory] = useState([]); // Chat history for minimized voice conv
  const voiceConvAudioRef = useRef(null); // Reference to current audio for minimized mode
  const voiceConvActiveRef = useRef(false); // Track if voice conv is active for async callbacks

  // ===== Live Chat Functions =====
  const openLiveChat = useCallback((config) => {
    setLiveChatConfig(config);
    setIsLiveChatActive(true);
    setIsMinimized(false);
    setChatHistory(config.initialHistory || []);
  }, []);

  const closeLiveChat = useCallback(() => {
    setIsLiveChatActive(false);
    setIsMinimized(false);
    setLiveChatConfig(null);
  }, []);

  const minimizeLiveChat = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizeLiveChat = useCallback(() => {
    setIsMinimized(false);
  }, []);

  // ===== Voice Conversation Functions =====
  const openVoiceConv = useCallback((config) => {
    setVoiceConvConfig(config);
    setIsVoiceConvActive(true);
    setIsVoiceConvMinimized(false);
  }, []);

  const closeVoiceConv = useCallback(() => {
    // Update ref synchronously FIRST to prevent any pending timeouts from starting new recordings
    voiceConvActiveRef.current = false;

    // Stop any playing audio
    if (voiceConvAudioRef.current) {
      voiceConvAudioRef.current.pause();
      voiceConvAudioRef.current.onended = null;
      voiceConvAudioRef.current = null;
    }
    setIsVoiceConvActive(false);
    setIsVoiceConvMinimized(false);
    setVoiceConvConfig(null);
    setVoiceConvStatus({ isRecording: false, isPlaying: false, isLoading: false });
    setShouldAutoStartRecording(false); // Clear auto-start flag
    setVoiceConvChatHistory([]); // Clear chat history
  }, []);

  const minimizeVoiceConv = useCallback(() => {
    setIsVoiceConvMinimized(true);
  }, []);

  const maximizeVoiceConv = useCallback(() => {
    setIsVoiceConvMinimized(false);
  }, []);

  const updateVoiceConvStatus = useCallback((status) => {
    setVoiceConvStatus(prev => ({ ...prev, ...status }));
  }, []);

  // Called when audio finishes while minimized - triggers auto-recording on return
  const markAudioFinishedWhileMinimized = useCallback(() => {
    setShouldAutoStartRecording(true);
  }, []);

  // Clear the auto-start flag when used or when conversation is closed
  const clearAutoStartRecording = useCallback(() => {
    setShouldAutoStartRecording(false);
  }, []);

  // Save voice conv state when minimizing (for continuation in floating widget)
  const saveVoiceConvState = useCallback((chatHistory, audio) => {
    setVoiceConvChatHistory(chatHistory);
    voiceConvAudioRef.current = audio;
  }, []);

  // Update voice conv chat history (used by floating widget)
  const updateVoiceConvChatHistory = useCallback((updater) => {
    setVoiceConvChatHistory(prev => typeof updater === 'function' ? updater(prev) : updater);
  }, []);

  // Stop any currently playing voice conversation audio
  const stopVoiceConvAudio = useCallback(() => {
    if (voiceConvAudioRef.current) {
      voiceConvAudioRef.current.pause();
      voiceConvAudioRef.current.onended = null;
      voiceConvAudioRef.current = null;
      setVoiceConvStatus(prev => ({ ...prev, isPlaying: false }));
      return true; // Audio was stopped
    }
    return false; // No audio was playing
  }, []);

  // Keep activeRef synced
  useEffect(() => {
    voiceConvActiveRef.current = isVoiceConvActive;
  }, [isVoiceConvActive]);

  const value = useMemo(() => ({
    // Live chat
    isLiveChatActive,
    isMinimized,
    liveChatConfig,
    chatHistory,
    setChatHistory,
    openLiveChat,
    closeLiveChat,
    minimizeLiveChat,
    maximizeLiveChat,
    // Voice conversation
    isVoiceConvActive,
    isVoiceConvMinimized,
    voiceConvConfig,
    voiceConvStatus,
    openVoiceConv,
    closeVoiceConv,
    minimizeVoiceConv,
    maximizeVoiceConv,
    updateVoiceConvStatus,
    stopVoiceConvAudio,
    shouldAutoStartRecording,
    markAudioFinishedWhileMinimized,
    clearAutoStartRecording,
    voiceConvChatHistory,
    voiceConvAudioRef,
    voiceConvActiveRef,
    saveVoiceConvState,
    updateVoiceConvChatHistory,
    // Shared
    data,
    setData,
    addJournalEntry,
    addPronunciationCorrection,
    saveChatHistory,
    navigateTo
  }), [
    isLiveChatActive, isMinimized, liveChatConfig, chatHistory, openLiveChat, closeLiveChat, minimizeLiveChat, maximizeLiveChat,
    isVoiceConvActive, isVoiceConvMinimized, voiceConvConfig, voiceConvStatus, openVoiceConv, closeVoiceConv, minimizeVoiceConv, maximizeVoiceConv, updateVoiceConvStatus, stopVoiceConvAudio,
    shouldAutoStartRecording, markAudioFinishedWhileMinimized, clearAutoStartRecording,
    voiceConvChatHistory, saveVoiceConvState, updateVoiceConvChatHistory,
    data, setData, addJournalEntry, addPronunciationCorrection, saveChatHistory, navigateTo
  ]);

  return (
    <LiveChatContext.Provider value={value}>
      {children}
    </LiveChatContext.Provider>
  );
}
