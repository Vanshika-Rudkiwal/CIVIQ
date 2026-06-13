'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { StudentProfile, ChatMessage } from '@/types/student';
import { MatchedScheme } from '@/types/scheme';
import { speakText, stopSpeaking, startSpeechRecognition, isSpeechSupported } from '@/lib/speech';
import SchemeCard from '@/components/SchemeCard';
import AccessibilityToolbar from '@/components/AccessibilityToolbar';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm CIVIQ, your government scheme advisor. 👋\n\nTell me about yourself and your educational background — I'll find every scheme you qualify for.\n\nFor example: \"I'm a 2nd year BTech student from Delhi. Family income is 3 lakh. I'm OBC category.\"",
  timestamp: new Date(),
  stage: 'intake',
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<StudentProfile>>({});
  const [matchedSchemes, setMatchedSchemes] = useState<MatchedScheme[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [simplified, setSimplified] = useState(false);
  const [pwdMode, setPwdMode] = useState(false);
  const [autoReadAloud, setAutoReadAloud] = useState(false);
  const stopListeningRef = useRef<(() => void) | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push('/login'); return; }
      setUser(u);
      // Load saved profile
      try {
        const res = await fetch(`/api/profile?uid=${u.uid}`);
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          const welcomeMsg: ChatMessage = {
            id: 'returning',
            role: 'assistant',
            content: `Welcome back, ${data.profile.name || u.displayName || 'there'}! 👋\n\nI found your saved profile. Has anything changed — like your year of study, income, or category?`,
            timestamp: new Date(),
          };
          setMessages([welcomeMsg]);
        } else if (u.displayName) {
          setProfile(p => ({ ...p, name: u.displayName! }));
        }
      } catch {}
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  // PwD mode enables all accessibility features
  useEffect(() => {
    if (pwdMode) {
      setFontSize(18);
      setHighContrast(true);
      setSimplified(true);
      setAutoReadAloud(true);
    }
  }, [pwdMode]);

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, profile, simplified }),
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || data.error || 'Something went wrong.',
        timestamp: new Date(),
        stage: data.stage,
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (data.profile) setProfile(data.profile);
      if (data.matchedSchemes) setMatchedSchemes(data.matchedSchemes);
      if (data.complete && data.matchedSchemes?.length > 0) {
        setShowResults(true);
        // Save profile to Firestore
        if (user) {
          fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: user.uid, profile: data.profile }),
          });
        }
      }

      if (autoReadAloud) speakText(assistantMsg.content);

    } catch {
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: 'Network error. Please check your connection and try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, profile, simplified, user, autoReadAloud]);

  const handleVoiceInput = () => {
    if (isListening) {
      stopListeningRef.current?.();
      setIsListening(false);
      return;
    }
    const stop = startSpeechRecognition(
      (transcript) => {
        setInput(transcript);
        setIsListening(false);
        sendMessage(transcript);
      },
      (err) => {
        setIsListening(false);
        setMessages(prev => [...prev, {
          id: 'voice-err',
          role: 'assistant',
          content: `Voice error: ${err}`,
          timestamp: new Date(),
        }]);
      }
    );
    if (stop) {
      stopListeningRef.current = stop;
      setIsListening(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const profileComplete = matchedSchemes.length > 0;
  const speechSupported = isSpeechSupported();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-72 bg-[#1a1a3a] flex flex-col text-white shrink-0"
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2d52c8] rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">C</span>
            </div>
            <span className="font-black text-white text-xl">CIVIQ</span>
          </div>
          <p className="text-xs text-blue-300 mt-1">Stop Missing. Start Claiming.</p>
        </div>

        {/* User info */}
        {user && (
          <div className="px-5 py-4 border-b border-white/10">
            <div className="text-sm font-semibold text-white truncate">{user.displayName || user.email}</div>
            <div className="text-xs text-blue-300 truncate">{user.email}</div>
          </div>
        )}

        {/* Profile summary */}
        {Object.keys(profile).length > 0 && (
          <div className="px-5 py-4 border-b border-white/10">
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wide mb-3">Your Profile</div>
            <div className="space-y-1.5 text-sm">
              {profile.name && <div className="text-gray-200">{profile.name}</div>}
              {profile.course && <div className="text-gray-300">{profile.course}{profile.year ? `, Yr ${profile.year}` : ''}</div>}
              {profile.state && <div className="text-gray-300">{profile.state}</div>}
              {profile.category && <div className="text-gray-300">{profile.category.toUpperCase()}</div>}
              {profile.familyIncome && <div className="text-gray-300">₹{profile.familyIncome.toLocaleString('en-IN')}/yr</div>}
              {profile.isPWD && <div className="text-yellow-300">♿ PwD</div>}
            </div>
          </div>
        )}

        {/* Results link */}
        {profileComplete && (
          <div className="px-5 py-4 border-b border-white/10">
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wide mb-2">Results</div>
            <button
              onClick={() => setShowResults(!showResults)}
              className="w-full text-left text-sm bg-[#2d52c8] hover:bg-[#3d62d8] px-3 py-2 rounded-lg transition-colors"
            >
              🎯 {matchedSchemes.length} schemes found
            </button>
          </div>
        )}

        {/* Accessibility */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="text-xs font-bold text-blue-300 uppercase tracking-wide mb-3">Accessibility</div>
          <AccessibilityToolbar
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            highContrast={highContrast}
            onHighContrastToggle={() => setHighContrast(h => !h)}
            simplified={simplified}
            onSimplifiedToggle={() => setSimplified(s => !s)}
            autoReadAloud={autoReadAloud}
            onAutoReadAloudToggle={() => setAutoReadAloud(a => !a)}
            pwdMode={pwdMode}
            onPwdModeToggle={() => setPwdMode(p => !p)}
            onSpeakLast={() => {
              const last = messages.filter(m => m.role === 'assistant').at(-1);
              if (last) speakText(last.content);
            }}
            onStopSpeaking={stopSpeaking}
            sidebar
          />
        </div>

        {/* Sign out */}
        <div className="mt-auto px-5 py-4">
          <button
            onClick={() => signOut(auth).then(() => router.push('/login'))}
            className="w-full text-sm text-gray-400 hover:text-white transition-colors text-left"
          >
            ← Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-bold text-gray-900">CIVIQ Advisor</h1>
            <p className="text-xs text-gray-500">6-stage AI pipeline · Deterministic eligibility engine</p>
          </div>
          {showResults && (
            <button
              onClick={() => setShowResults(false)}
              className="text-sm text-[#2d52c8] font-semibold hover:underline"
            >
              ← Back to chat
            </button>
          )}
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-hidden" id="main-content">
          {showResults ? (
            // Results panel
            <ResultsPanel
              matchedSchemes={matchedSchemes}
              profile={profile as StudentProfile}
              onBack={() => setShowResults(false)}
            />
          ) : (
            // Chat interface
            <div className="flex flex-col h-full">
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
                role="log"
                aria-live="polite"
                aria-label="Conversation"
              >
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 message-enter ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold ${
                      msg.role === 'assistant'
                        ? 'bg-[#2d52c8] text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {msg.role === 'assistant' ? 'C' : (user?.displayName?.[0] || 'U')}
                    </div>
                    {/* Bubble */}
                    <div className={`max-w-2xl rounded-2xl px-4 py-3 ${
                      msg.role === 'assistant'
                        ? 'bg-white border border-gray-100 shadow-sm text-gray-800'
                        : 'bg-[#2d52c8] text-white'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <div className={`flex items-center gap-2 mt-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <span className="text-xs opacity-40">
                          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => speakText(msg.content)}
                            className="text-xs text-gray-400 hover:text-[#2d52c8] transition-colors"
                            aria-label="Read message aloud"
                            title="Read aloud"
                          >
                            🔊
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#2d52c8] flex items-center justify-center text-white font-bold text-sm">C</div>
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3">
                      <div className="flex gap-1 items-center h-5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full dot-1" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full dot-2" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full dot-3" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies when profile complete */}
              {profileComplete && !loading && (
                <div className="px-6 pb-2 flex gap-2 flex-wrap">
                  {['Download my action plan PDF', 'Show my matched schemes', 'Update my profile'].map(q => (
                    <button
                      key={q}
                      onClick={() => {
                        if (q === 'Show my matched schemes') { setShowResults(true); return; }
                        sendMessage(q);
                      }}
                      className="text-xs px-3 py-1.5 bg-blue-50 text-[#2d52c8] rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input bar */}
              <div className="px-6 pb-6 pt-2 bg-white border-t border-gray-100">
                <div className="flex items-end gap-3 bg-gray-50 border-2 border-gray-200 rounded-2xl p-3 focus-within:border-[#2d52c8] transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isListening ? '🎤 Listening…' : 'Tell me about yourself…'}
                    rows={1}
                    className="flex-1 bg-transparent resize-none text-sm text-gray-900 placeholder-gray-400 focus:outline-none max-h-32"
                    style={{ fontSize: `${Math.max(fontSize - 2, 13)}px` }}
                    aria-label="Type your message"
                    disabled={loading}
                  />
                  <div className="flex gap-2 shrink-0">
                    {speechSupported && (
                      <button
                        onClick={handleVoiceInput}
                        className={`p-2 rounded-xl transition-colors ${
                          isListening
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                        title="Voice input"
                      >
                        🎤
                      </button>
                    )}
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || loading}
                      className="px-4 py-2 bg-[#2d52c8] text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#1a3399] transition-colors"
                      aria-label="Send message"
                    >
                      Send
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  CIVIQ is an advisor, not a guarantee. Verify at official portals.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Results panel component
function ResultsPanel({
  matchedSchemes,
  profile,
  onBack,
}: {
  matchedSchemes: MatchedScheme[];
  profile: StudentProfile;
  onBack: () => void;
}) {
  const [generating, setGenerating] = useState(false);

  const downloadPDF = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();

      // Generate PDF client-side
      const { generateActionPlanPDF } = await import('@/lib/pdf');
      const pdfBytes = await generateActionPlanPDF(profile, matchedSchemes, data.explanations || {});
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `civiq-action-plan-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('PDF generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              🎯 {matchedSchemes.length} Schemes Found
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              For {profile.name || 'you'} · {profile.course}, Year {profile.year} · {profile.state}
            </p>
          </div>
          <button
            onClick={downloadPDF}
            disabled={generating}
            className="px-5 py-2.5 bg-[#ee8620] text-white font-bold rounded-xl hover:bg-[#d4751a] disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {generating ? '⏳ Generating…' : '📄 Download Action Plan PDF'}
          </button>
        </div>

        {/* Conflict warnings summary */}
        {matchedSchemes.some(m => m.conflictWarnings.length > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-red-700 mb-2">⚠️ Conflict Warnings</h3>
            {matchedSchemes
              .filter(m => m.conflictWarnings.length > 0)
              .map(m => (
                <div key={m.scheme.id} className="text-sm text-red-600">
                  {m.conflictWarnings.map((w, i) => <p key={i}>{w}</p>)}
                </div>
              ))}
          </div>
        )}

        {/* Scheme cards */}
        <div className="space-y-4">
          {matchedSchemes.map(matched => (
            <SchemeCard key={matched.scheme.id} matched={matched} profile={profile} />
          ))}
        </div>
      </div>
    </div>
  );
}
