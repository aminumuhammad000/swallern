'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { JourneyMilestone } from '@/components/journey/JourneyRoadmap';
import { audioService } from '@/lib/learning/audio';

interface SwaCompanionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle: string;
  topicSummary: string;
  keyConcepts?: string[];
  currentMilestone?: JourneyMilestone | null;
  completedCount: number;
  totalCount: number;
  onTriggerDance?: () => void;
  /** Swa's absolute X position in the roadmap canvas (px) */
  swaX?: number;
  /** Swa's absolute Y position in the roadmap canvas (px) */
  swaY?: number;
  /** Which direction Swa is facing (1 = right, -1 = left) */
  swaFacing?: 1 | -1;
  /** Total width of the roadmap container */
  containerWidth?: number;
}

interface ChatMessage {
  id: string;
  sender: 'swa' | 'user';
  text: string;
  timestamp: string;
  isVoice?: boolean;
}

type VisiblePair = {
  user: ChatMessage | null;
  swa: ChatMessage | null;
};

export const SwaCompanionDialog: React.FC<SwaCompanionDialogProps> = ({
  isOpen,
  onClose,
  topicTitle,
  topicSummary,
  keyConcepts = [],
  currentMilestone,
  completedCount,
  totalCount,
  onTriggerDance,
  swaX = 220,
  swaY = 100,
  swaFacing = 1,
  containerWidth = 440,
}) => {
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [visiblePair, setVisiblePair] = useState<VisiblePair>({ user: null, swa: null });
  const [fadingOut, setFadingOut] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceAloudEnabled, setVoiceAloudEnabled] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize companion welcome message when opened
  useEffect(() => {
    if (isOpen) {
      if (allMessages.length === 0) {
        const welcome: ChatMessage = {
          id: 'msg-welcome',
          sender: 'swa',
          text: `Hey! I'm Swa 👋 We're learning ${topicTitle} together! What should we explore?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setAllMessages([welcome]);
        setVisiblePair({ user: null, swa: welcome });
        if (voiceAloudEnabled) {
          audioService.speakChunks([welcome.text]);
        }
      } else if (!visiblePair.swa && !visiblePair.user) {
        // Restore last conversation exchange so chat doesn't appear empty upon reopening
        const lastSwa = [...allMessages].reverse().find(m => m.sender === 'swa') || null;
        const lastUser = [...allMessages].reverse().find(m => m.sender === 'user') || null;
        setVisiblePair({ user: lastUser, swa: lastSwa });
      }
    }
  }, [isOpen, topicTitle, voiceAloudEnabled, allMessages.length]);

  // Auto-scroll history container when showHistory is active or new messages arrive
  useEffect(() => {
    if (showHistory && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [showHistory, allMessages, isThinking]);

  // Stop audio on close
  useEffect(() => {
    if (!isOpen) {
      audioService.stop();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
      setIsListening(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Learning companion tone — friendly study partner exploring alongside the user
  const generateSwaResponse = (userText: string): string => {
    const lower = userText.toLowerCase().trim();

    if (lower.includes('dance') || lower.includes('jump') || lower.includes('wiggle')) {
      onTriggerDance?.();
      return "Woohoo! Look at us celebrate! We're crushing this journey together! 🎉💃";
    }
    if (lower.includes('goal') || lower.includes('next') || lower.includes('what next')) {
      if (currentMilestone) {
        return `Ooh, our next stop together is "${currentMilestone.title}"! We've already completed ${completedCount} milestones as a team. Ready to tackle it?`;
      }
      return `${totalCount - completedCount} milestones left on our map — let's keep moving together!`;
    }
    if (lower.includes('tip') || lower.includes('advice') || lower.includes('help') || lower.includes('stuck') || lower.includes('hard') || lower.includes('confus')) {
      const hint = keyConcepts.length > 0 ? keyConcepts[0] : 'the main takeaway';
      return `No worries at all, I found this tricky at first too! What helped me was connecting it with "${hint}". What part feels confusing?`;
    }
    if (lower.includes('explain') || lower.includes('what is') || lower.includes('summary')) {
      const cleanSummary = topicSummary.length > 130 ? topicSummary.slice(0, 127) + '…' : topicSummary;
      return `Here's how I understand it so far: ${cleanSummary}. Pretty neat, right? What do you think about it?`;
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return `Hey friend! So glad we're exploring this together. What should we look into next?`;
    }
    if (lower.includes('thank')) {
      return `Anytime! We make an awesome team. Let's keep exploring! ⭐`;
    }
    const concepts = keyConcepts.slice(0, 2).join(' and ');
    return `That's a great question! As we explore ${concepts || 'this journey'}, I'm learning right alongside you. Should we check out the next step together?`;
  };

  const handleSendMessage = useCallback((textToSend?: string, isVoiceNote: boolean = false) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice: isVoiceNote,
    };

    setAllMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // If an exchange is already visible, smoothly fog-transition out the old exchange
    if (visiblePair.swa || visiblePair.user) {
      setFadingOut(true);
      setTimeout(() => {
        setFadingOut(false);
        setVisiblePair({ user: userMsg, swa: null });
        setIsThinking(true);

        setTimeout(() => {
          const replyText = generateSwaResponse(query);
          const swaMsg: ChatMessage = {
            id: `swa-${Date.now()}`,
            sender: 'swa',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setAllMessages(prev => [...prev, swaMsg]);
          setIsThinking(false);
          // Set visible pair — stays visible indefinitely until next message or chat close!
          setVisiblePair({ user: userMsg, swa: swaMsg });

          if (voiceAloudEnabled) {
            audioService.speakChunks([replyText]);
          }
        }, 600);
      }, 300);
    } else {
      // First message — show user message immediately
      setVisiblePair({ user: userMsg, swa: null });
      setIsThinking(true);

      setTimeout(() => {
        const replyText = generateSwaResponse(query);
        const swaMsg: ChatMessage = {
          id: `swa-${Date.now()}`,
          sender: 'swa',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setAllMessages(prev => [...prev, swaMsg]);
        setIsThinking(false);
        // Stays visible indefinitely!
        setVisiblePair({ user: userMsg, swa: swaMsg });

        if (voiceAloudEnabled) {
          audioService.speakChunks([replyText]);
        }
      }, 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, voiceAloudEnabled, visiblePair, keyConcepts, currentMilestone, completedCount, totalCount, topicSummary]);

  const toggleVoiceRecording = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-GB';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) handleSendMessage(transcript, true);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  // Adaptive chat panel width and horizontal clamping
  const maxAllowedWidth = Math.max(200, (containerWidth || 440) - 20);
  const chatWidth = Math.min(310, Math.max(250, Math.min(maxAllowedWidth, (containerWidth || 440) * 0.70)));
  const baseLeft = Math.round(swaX + 44);
  // Ensure chat does not get pushed outside the screen on narrow screens
  const safeLeft = Math.max(10, Math.min((containerWidth || 440) - chatWidth - 10, baseLeft));

  return (
    <>
      {/* Keyframe & custom scrollbar injection */}
      <style>{`
        @keyframes swaSpeechIn {
          from { opacity: 0; transform: scale(0.92) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes swaThinkDot {
          0%, 80%, 100% { transform: scale(0.2); opacity: 0.3; }
          40%            { transform: scale(1);   opacity: 1; }
        }
        @keyframes swaFogDrift {
          0%   { opacity: 1;   transform: translateY(0) scale(1); filter: blur(0px); }
          50%  { opacity: 0.4; transform: translateY(-8px) scale(0.97); filter: blur(2px); }
          100% { opacity: 0;   transform: translateY(-18px) scale(0.94); filter: blur(5px); }
        }
        .swa-speech-bubble  { animation: swaSpeechIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .swa-fog-exit       { animation: swaFogDrift 0.35s ease-in forwards; pointer-events: none; }

        /* ─── Ultra-thin, colored, translucent scrollbar for Swa Chat ─── */
        .swa-chat-scrollbar::-webkit-scrollbar {
          width: 3px;
          height: 3px;
        }
        .swa-chat-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .swa-chat-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.32);
          border-radius: 999px;
        }
        .swa-chat-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(124, 58, 237, 0.65);
        }
        .swa-chat-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.32) transparent;
        }
      `}</style>

      {/* ─── Main Panel: placed on Swa's RIGHT, aligned with Swa's mouth, input lower down ─── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Chat with Swa"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          // Positioned on Swa's side with safe bounds
          left: `${safeLeft}px`,
          top: `${Math.round(swaY - 20)}px`,
          width: `${chatWidth}px`,
          zIndex: 95,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'auto',
        }}
      >
        {/* ─── CHAT AREA: Either Scrollable History OR Current Active Exchange ─── */}
        {showHistory ? (
          /* When user clicks history: current chat becomes scrollable so user can scroll previous messages */
          <div
            ref={scrollContainerRef}
            className="swa-speech-bubble swa-chat-scrollbar"
            style={{
              maxHeight: '230px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '6px 6px 6px 0',
              scrollBehavior: 'smooth',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px 2px 2px' }}>
              <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Chat History · Scrollable
              </span>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                title="Collapse history"
                className="swallern-press"
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '1px 5px',
                  borderRadius: '6px',
                }}
              >
                ✕ Close
              </button>
            </div>

            {allMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '88%',
                    padding: '7px 11px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: msg.sender === 'user'
                      ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                      : 'rgba(255, 255, 255, 0.96)',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                    fontSize: '0.77rem',
                    lineHeight: 1.42,
                    border: msg.sender === 'swa' ? '1.2px solid rgba(139, 92, 246, 0.22)' : 'none',
                    boxShadow: msg.sender === 'user'
                      ? '0 3px 10px rgba(37, 99, 235, 0.2)'
                      : '0 3px 12px rgba(15, 23, 42, 0.06)',
                  }}
                >
                  {msg.isVoice && <span style={{ fontSize: '0.65rem', marginRight: '4px' }}>🎙️</span>}
                  {msg.text}
                </div>
              </div>
            ))}

            {isThinking && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.94)',
                  border: '1.2px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '14px',
                  padding: '7px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  alignSelf: 'flex-start',
                }}
              >
                <span style={{ fontSize: '0.67rem', fontWeight: 700, color: '#7C3AED', marginRight: '3px' }}>
                  Swa is thinking
                </span>
                {[0, 0.15, 0.3].map((delay, i) => (
                  <div
                    key={i}
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: '#8B5CF6',
                      animation: `swaThinkDot 1s ${delay}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default: Only the current active exchange, stays visible until next message or closed! */
          (visiblePair.user || visiblePair.swa || isThinking) && (
            <div
              className={fadingOut ? 'swa-fog-exit' : 'swa-speech-bubble'}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {/* Swa's reply — speech bubble with pointer directed at Swa's mouth */}
              {visiblePair.swa && (
                <div
                  style={{
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1.2px solid rgba(139, 92, 246, 0.22)',
                    borderRadius: '16px',
                    padding: '9px 13px',
                    fontSize: '0.80rem',
                    color: '#0F172A',
                    lineHeight: 1.45,
                    boxShadow: '0 4px 18px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(139, 92, 246, 0.06)',
                  }}
                >
                  {/* Speech pointer tail on the LEFT pointing at Swa's mouth */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '-8px',
                      borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      borderRight: '8px solid rgba(255, 255, 255, 0.96)',
                      width: 0,
                      height: 0,
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Swa · Companion
                    </span>
                  </div>
                  {visiblePair.swa.text}
                </div>
              )}

              {/* Swa Thinking indicator */}
              {isThinking && (
                <div
                  style={{
                    position: 'relative',
                    background: 'rgba(255, 255, 255, 0.94)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1.2px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '14px',
                    padding: '8px 14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    alignSelf: 'flex-start',
                    boxShadow: '0 3px 12px rgba(15, 23, 42, 0.06)',
                  }}
                >
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7C3AED', marginRight: '3px' }}>
                    Swa is thinking
                  </span>
                  {[0, 0.15, 0.3].map((delay, i) => (
                    <div
                      key={i}
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: '#8B5CF6',
                        animation: `swaThinkDot 1s ${delay}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* User message — blue pill */}
              {visiblePair.user && !isThinking && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      borderRadius: '14px 14px 4px 14px',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      color: '#FFFFFF',
                      lineHeight: 1.4,
                      maxWidth: '88%',
                      boxShadow: '0 3px 12px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    {visiblePair.user.isVoice && (
                      <span style={{ fontSize: '0.65rem', marginRight: '4px' }}>🎙️</span>
                    )}
                    {visiblePair.user.text}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* ─── Input Bar — positioned lower down along Swa's side ─── */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.2px solid rgba(139, 92, 246, 0.28)',
            borderRadius: '999px',
            padding: '3px 4px 3px 10px',
            minHeight: '38px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(139, 92, 246, 0.08)',
          }}
        >
          {/* History toggle: clicking allows current chat to be scrollable to see previous ones */}
          {allMessages.length > 1 && (
            <button
              type="button"
              onClick={() => setShowHistory(prev => !prev)}
              title={showHistory ? 'Show only current chat' : 'Scroll past messages'}
              className="swallern-press"
              style={{
                flexShrink: 0,
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: 'none',
                background: showHistory ? '#7C3AED' : '#EDE9FE',
                color: showHistory ? '#FFFFFF' : '#7C3AED',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                margin: 0,
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}

          {/* Text input form */}
          <form
            onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              minWidth: 0,
              margin: 0,
              padding: 0,
            }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={isListening ? '🎙 Listening…' : 'Ask companion Swa…'}
              disabled={isListening}
              style={{
                flex: 1,
                height: '28px',
                border: 'none',
                background: 'transparent',
                fontSize: '0.80rem',
                color: '#0F172A',
                outline: 'none',
                minWidth: 0,
                padding: '0 4px',
                margin: 0,
              }}
            />

            {/* Actions group for voice and send buttons */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
              }}
            >
              {/* Voice button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                title={isListening ? 'Stop' : 'Voice note'}
                className="swallern-press"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  background: isListening ? '#FEE2E2' : '#F5F3FF',
                  color: isListening ? '#EF4444' : '#7C3AED',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  margin: 0,
                  flexShrink: 0,
                }}
              >
                {isListening ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>

              {/* Read aloud toggle */}
              <button
                type="button"
                onClick={() => {
                  setVoiceAloudEnabled(v => {
                    const next = !v;
                    if (!next) audioService.stop();
                    return next;
                  });
                }}
                title={voiceAloudEnabled ? 'Voice reply enabled' : 'Voice reply muted'}
                className="swallern-press"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  background: voiceAloudEnabled ? '#EDE9FE' : 'transparent',
                  color: voiceAloudEnabled ? '#7C3AED' : '#CBD5E1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  margin: 0,
                  flexShrink: 0,
                }}
              >
                {voiceAloudEnabled ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                )}
              </button>

              {/* Send button */}
              <button
                type="submit"
                disabled={!inputValue.trim()}
                aria-label="Send message"
                className="swallern-press"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  background: inputValue.trim()
                    ? 'linear-gradient(135deg, #7C3AED, #3B82F6)'
                    : '#F1F5F9',
                  color: inputValue.trim() ? '#FFFFFF' : '#94A3B8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputValue.trim() ? 'pointer' : 'default',
                  padding: 0,
                  margin: 0,
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  boxShadow: inputValue.trim() ? '0 2px 8px rgba(124, 58, 237, 0.35)' : 'none',
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transform: 'translate(0.5px, -0.5px)' }}
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
