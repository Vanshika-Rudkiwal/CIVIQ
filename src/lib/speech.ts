'use client';

// Voice Input — Web Speech Recognition API
export function startSpeechRecognition(
  onResult: (transcript: string) => void,
  onError?: (error: string) => void
): (() => void) | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError?.('Speech recognition is not supported in this browser. Try Chrome.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN';

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError?.(event.error === 'no-speech' ? 'No speech detected. Please try again.' : `Error: ${event.error}`);
  };

  recognition.start();
  return () => recognition.stop();
}

// Voice Output — Web Speech Synthesis API
export function speakText(
  text: string,
  options?: { rate?: number; pitch?: number; simplified?: boolean }
): void {
  if (typeof window === 'undefined') return;
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.rate = options?.rate ?? 0.9;
  utterance.pitch = options?.pitch ?? 1;
  utterance.volume = 1;

  // Try to use an Indian English voice if available
  const voices = window.speechSynthesis.getVoices();
  const indianVoice = voices.find(v => v.lang === 'en-IN');
  if (indianVoice) utterance.voice = indianVoice;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  window.speechSynthesis?.cancel();
}

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
  );
}

export function isSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!window.speechSynthesis;
}
