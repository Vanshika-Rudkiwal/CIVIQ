'use client';

interface Props {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  highContrast: boolean;
  onHighContrastToggle: () => void;
  simplified: boolean;
  onSimplifiedToggle: () => void;
  autoReadAloud: boolean;
  onAutoReadAloudToggle: () => void;
  pwdMode: boolean;
  onPwdModeToggle: () => void;
  onSpeakLast: () => void;
  onStopSpeaking: () => void;
  sidebar?: boolean;
}

export default function AccessibilityToolbar({
  fontSize, onFontSizeChange,
  highContrast, onHighContrastToggle,
  simplified, onSimplifiedToggle,
  autoReadAloud, onAutoReadAloudToggle,
  pwdMode, onPwdModeToggle,
  onSpeakLast, onStopSpeaking,
  sidebar = false,
}: Props) {
  const btnBase = sidebar
    ? 'w-full text-left text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-2'
    : 'text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-2';

  const activeClass = 'bg-[#2d52c8] text-white';
  const inactiveClass = sidebar
    ? 'text-gray-300 hover:bg-white/10'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  return (
    <div
      role="toolbar"
      aria-label="Accessibility settings"
      className={sidebar ? 'space-y-1.5' : 'flex flex-wrap gap-2'}
    >
      {/* PwD Mode */}
      <button
        onClick={onPwdModeToggle}
        className={`${btnBase} ${pwdMode ? activeClass : inactiveClass} font-semibold`}
        aria-pressed={pwdMode}
        title="Enable all accessibility features"
      >
        <span>♿</span>
        <span>PwD Mode {pwdMode ? 'ON' : 'OFF'}</span>
      </button>

      {/* Font size */}
      <div className={sidebar ? 'flex items-center gap-2 px-1' : 'flex items-center gap-1'}>
        <span className={`text-xs ${sidebar ? 'text-gray-400' : 'text-gray-500'}`}>Text:</span>
        <button
          onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
          className={`${btnBase} ${inactiveClass} px-2`}
          aria-label="Decrease font size"
          title="Smaller text"
        >
          A-
        </button>
        <span className={`text-xs ${sidebar ? 'text-gray-300' : 'text-gray-600'} w-8 text-center`}>
          {fontSize}
        </span>
        <button
          onClick={() => onFontSizeChange(Math.min(24, fontSize + 2))}
          className={`${btnBase} ${inactiveClass} px-2`}
          aria-label="Increase font size"
          title="Larger text"
        >
          A+
        </button>
      </div>

      {/* High contrast */}
      <button
        onClick={onHighContrastToggle}
        className={`${btnBase} ${highContrast ? activeClass : inactiveClass}`}
        aria-pressed={highContrast}
        title="Toggle high contrast mode"
      >
        <span>◑</span>
        <span>Contrast</span>
      </button>

      {/* Simplified language */}
      <button
        onClick={onSimplifiedToggle}
        className={`${btnBase} ${simplified ? activeClass : inactiveClass}`}
        aria-pressed={simplified}
        title="Use simpler language in responses"
      >
        <span>📖</span>
        <span>Simple words</span>
      </button>

      {/* Auto read aloud */}
      <button
        onClick={onAutoReadAloudToggle}
        className={`${btnBase} ${autoReadAloud ? activeClass : inactiveClass}`}
        aria-pressed={autoReadAloud}
        title="Automatically read responses aloud"
      >
        <span>🔊</span>
        <span>Auto-read</span>
      </button>

      {/* Read last message */}
      <button
        onClick={onSpeakLast}
        className={`${btnBase} ${inactiveClass}`}
        title="Read the last response aloud"
      >
        <span>▶</span>
        <span>Read last</span>
      </button>

      {/* Stop speaking */}
      <button
        onClick={onStopSpeaking}
        className={`${btnBase} ${inactiveClass}`}
        title="Stop speaking"
      >
        <span>⏹</span>
        <span>Stop</span>
      </button>
    </div>
  );
}
