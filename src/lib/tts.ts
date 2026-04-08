/**
 * Text-to-Speech helper cho tiếng Đức
 * Ưu tiên giọng de-DE thực sự, fallback về giọng tiếng Anh/khác
 * Xử lý các quirk trên Chrome, Safari, mobile browsers
 */

let cachedGermanVoice: SpeechSynthesisVoice | null | undefined = undefined

export function getGermanVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  if (cachedGermanVoice !== undefined) return cachedGermanVoice

  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null // voices not loaded yet

  // Priority list — pick the first matching
  const prio = [
    // Best: native German voices
    (v: SpeechSynthesisVoice) => v.lang.startsWith('de') && !v.localService, // Google/cloud German
    (v: SpeechSynthesisVoice) => v.lang === 'de-DE',
    (v: SpeechSynthesisVoice) => v.lang.startsWith('de'),
    // Fallback: any voice that can handle Latin chars
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && !v.localService, // Google English
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
    () => true, // last resort: whatever browser has
  ]

  for (const match of prio) {
    const found = voices.find(match)
    if (found) { cachedGermanVoice = found; return found }
  }

  cachedGermanVoice = null
  return null
}

export function speak(
  text: string,
  opts?: { rate?: number; onStart?: () => void; onEnd?: () => void; onError?: () => void }
): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false
  window.speechSynthesis.cancel()

  const voice = getGermanVoice()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'de-DE'
  utt.rate = opts?.rate ?? 0.85
  utt.pitch = 1.0
  if (voice) utt.voice = voice

  // Workaround: Chrome desktop sometimes won't play unless voice is set async
  // We fire with a short timeout to ensure voices are loaded
  let started = false
  const startTimer = setTimeout(() => {
    // If onstart didn't fire in 300ms, assume it started (mobile Chrome quirk)
    if (!started) { started = true; opts?.onStart?.() }
  }, 300)

  utt.onstart = () => {
    started = true
    clearTimeout(startTimer)
    opts?.onStart?.()
  }
  utt.onend = () => {
    clearTimeout(startTimer)
    opts?.onEnd?.()
  }
  utt.onerror = (e) => {
    clearTimeout(startTimer)
    if (e.error !== 'interrupted') opts?.onError?.()
  }

  window.speechSynthesis.speak(utt)
  return true
}

/** Call once at app boot to pre-load voices (some browsers lazy-load) */
export function preloadVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const load = () => { cachedGermanVoice = undefined; getGermanVoice() }
  if (window.speechSynthesis.getVoices().length) { load(); return }
  window.speechSynthesis.addEventListener('voiceschanged', load, { once: true })
}
