/**
 * TTS helper — iOS Safari / Chrome / Android safe
 *
 * iOS Safari quirks:
 *  1. speak() MUST be called synchronously inside a user-gesture handler (no setTimeout, no await before it)
 *  2. voiceschanged never fires on iOS — voices available immediately after first getVoices() call
 *  3. Setting utt.voice to a non-matching voice causes silence — must pick carefully
 *  4. speechSynthesis.cancel() right before speak() can cause silence on iOS — add tiny pause trick
 *  5. Rate < 0.7 may not work on some iOS voices
 */

let _voices: SpeechSynthesisVoice[] = []
let _voicesLoaded = false

function ensureVoices(): SpeechSynthesisVoice[] {
  if (!_voicesLoaded) {
    _voices = window.speechSynthesis?.getVoices() ?? []
    if (_voices.length) _voicesLoaded = true
  }
  return _voices
}

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = ensureVoices()
  if (!voices.length) return null

  const langLower = lang.toLowerCase()
  const primary   = langLower.slice(0, 2) // e.g. 'de'

  // Human-sounding voice names (iOS enhanced/premium voices for German)
  // iOS: "Anna" (de-DE enhanced), "Markus", "Yannick", "Petra", "Lena"
  // Android/Chrome: Google Deutsch
  const humanNames = ['anna', 'markus', 'yannick', 'petra', 'lena', 'thomas', 'google']

  const deVoices = voices.filter(v => v.lang.toLowerCase().startsWith(primary))

  if (deVoices.length) {
    // 1st priority: enhanced/premium German (contains 'enhanced' or 'premium' in name)
    const enhanced = deVoices.find(v =>
      v.name.toLowerCase().includes('enhanced') || v.name.toLowerCase().includes('premium')
    )
    if (enhanced) return enhanced

    // 2nd priority: known human-sounding voice names
    const human = deVoices.find(v =>
      humanNames.some(n => v.name.toLowerCase().includes(n))
    )
    if (human) return human

    // 3rd: any German voice
    return deVoices[0]
  }

  // No German voice at all — English fallback
  return (
    voices.find(v => v.lang.toLowerCase().startsWith('en')) ||
    voices[0] ||
    null
  )
}

function isIOS(): boolean {
  return typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream
}

export function speak(
  text: string,
  opts?: {
    lang?: string
    rate?: number
    onStart?: () => void
    onEnd?: () => void
    onError?: () => void
  }
): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false

  const lang  = opts?.lang ?? 'de-DE'
  const rate  = opts?.rate ?? 0.85
  const ios   = isIOS()

  // iOS: DO NOT cancel before speak — causes silence.
  // Non-iOS: cancel is fine.
  if (!ios) window.speechSynthesis.cancel()

  const utt = new SpeechSynthesisUtterance(text)
  utt.lang  = lang
  utt.rate  = Math.max(0.7, Math.min(rate, 2.0)) // iOS rate clamp
  utt.pitch = 1.0

  // Only set voice if we found a real match — do NOT set if null (iOS will auto-pick)
  const voice = pickVoice(lang)
  if (voice) utt.voice = voice

  utt.onstart = () => opts?.onStart?.()
  utt.onend   = () => opts?.onEnd?.()
  utt.onerror = (e) => {
    // 'interrupted' is normal when cancel() is called before new speak
    if (e.error !== 'interrupted' && e.error !== 'canceled') opts?.onError?.()
  }

  // iOS: speak() must be called SYNCHRONOUSLY inside user gesture
  // — no setTimeout, no await. Call directly.
  window.speechSynthesis.speak(utt)

  // iOS Safari bug: sometimes speech pauses after ~15s due to a known WebKit bug.
  // Workaround: resume every 10s.
  if (ios) {
    const resumeTimer = setInterval(() => {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume()
    }, 10000)
    utt.onend = () => {
      clearInterval(resumeTimer)
      opts?.onEnd?.()
    }
    utt.onerror = (e) => {
      clearInterval(resumeTimer)
      if (e.error !== 'interrupted' && e.error !== 'canceled') opts?.onError?.()
    }
  }

  return true
}

/** 
 * Call this inside a useEffect to pre-warm voice list.
 * On iOS, voices are available synchronously — no event needed.
 */
export function preloadVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  // Try immediately (works on iOS)
  const v = window.speechSynthesis.getVoices()
  if (v.length) { _voices = v; _voicesLoaded = true; return }

  // Chrome desktop fires voiceschanged asynchronously
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    _voices = window.speechSynthesis.getVoices()
    _voicesLoaded = _voices.length > 0
  }, { once: true })
}
