'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { speak, preloadVoices } from '@/lib/tts'

interface DictationData {
  audio_text?: string
  sentence?: string
  answer: string
  hint?: string
  audio_file?: string  // pre-generated mp3 filename
}

function normalize(s: string) {
  return s.toLowerCase().trim()
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ')
}

function WordComparison({ userAnswer, correctAnswer }: { userAnswer: string; correctAnswer: string }) {
  const correctWords = normalize(correctAnswer).split(' ')
  const userWords    = normalize(userAnswer).split(' ')
  const maxLen = Math.max(correctWords.length, userWords.length)
  return (
    <div className="flex flex-wrap gap-1 justify-center mt-2">
      {Array.from({ length: maxLen }).map((_, i) => {
        const cw   = correctWords[i] || ''
        const uw   = userWords[i]   || ''
        const match = normalize(uw) === normalize(cw)
        return (
          <span key={i} className={`px-2 py-0.5 rounded text-sm font-medium ${match ? 'bg-green-100 text-[#10B981]' : 'bg-red-100 text-[#EF4444]'}`}>
            {cw}
          </span>
        )
      })}
    </div>
  )
}

// MD5-like hash to find audio file (mirrors gen_audio.py logic)
async function getAudioFilename(text: string): Promise<string | null> {
  try {
    const res = await fetch('/audio/dictation/mapping.json')
    if (!res.ok) return null
    const map = await res.json() as Record<string, string>
    return map[text] ?? null
  } catch {
    return null
  }
}

let _mapping: Record<string, string> | null = null
let _mappingLoaded = false

async function loadMapping(): Promise<Record<string, string>> {
  if (_mappingLoaded && _mapping) return _mapping
  try {
    const res = await fetch('/audio/dictation/mapping.json')
    _mapping = res.ok ? await res.json() : {}
  } catch {
    _mapping = {}
  }
  _mappingLoaded = true
  return _mapping!
}

export default function DictationExercise({
  question,
  data,
  value,
  submitted,
  correct,
  onChange,
}: {
  question: string
  data: DictationData
  value: string
  submitted: boolean
  correct?: boolean
  onChange: (v: string) => void
}) {
  const audioText    = data.audio_text ?? data.sentence ?? ''
  const hint         = data.hint ?? ''
  const [playing, setPlaying]         = useState(false)
  const [showHint, setShowHint]       = useState(false)
  const [playCount, setPlayCount]     = useState(0)
  const [audioSrc, setAudioSrc]       = useState<string | null>(null)
  const [audioReady, setAudioReady]   = useState(false)
  const audioRef  = useRef<HTMLAudioElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  // Load mapping on mount
  useEffect(() => {
    preloadVoices()
    if (!audioText) return
    loadMapping().then(map => {
      const filename = map[audioText]
      if (filename) {
        setAudioSrc(`/audio/dictation/${filename}`)
        setAudioReady(true)
      }
    })
  }, [audioText])

  const isCorrect = normalize(value) === normalize(data.answer)

  const playAudio = useCallback(() => {
    if (!audioText) return

    const slower = playCount >= 2

    if (audioReady && audioSrc && audioRef.current) {
      // Play pre-generated mp3 (Vbee — human voice)
      const audio = audioRef.current
      audio.playbackRate = slower ? 0.75 : 1.0
      audio.currentTime = 0
      audio.play()
        .then(() => {
          setPlaying(true)
          setPlayCount(c => c + 1)
        })
        .catch(() => {
          // Fallback to Web Speech
          speak(audioText, {
            rate: slower ? 0.7 : 0.85,
            onStart: () => setPlaying(true),
            onEnd: () => { setPlaying(false); setPlayCount(c => c + 1) },
          })
        })
    } else {
      // Fallback: Web Speech API
      speak(audioText, {
        rate: slower ? 0.7 : 0.85,
        onStart: () => setPlaying(true),
        onEnd: () => { setPlaying(false); setPlayCount(c => c + 1) },
        onError: () => setPlaying(false),
      })
    }
  }, [audioText, audioReady, audioSrc, playCount])

  // Auto-focus after playing
  useEffect(() => {
    if (!playing && playCount > 0 && !submitted) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [playing, playCount, submitted])

  return (
    <div className="max-w-lg mx-auto">
      {/* Hidden audio element for mp3 playback */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="auto"
          onEnded={() => setPlaying(false)}
          onError={() => setAudioReady(false)}
        />
      )}

      <p className="text-[#64748B] text-sm text-center mb-6">{question}</p>

      {/* Audio player button */}
      <div className="flex flex-col items-center mb-6">
        <button
          onClick={playAudio}
          disabled={playing}
          className={`w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:cursor-default ${
            playing ? 'bg-blue-400 animate-pulse' : 'bg-[#2563EB] hover:bg-blue-700'
          }`}
          title={playing ? 'Đang phát...' : 'Nghe lại'}
        >
          {audioReady ? (
            // MP3 icon — show headphones to indicate high quality
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z"/>
              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z"/>
              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z"/>
            </svg>
          )}
        </button>
        <div className="flex items-center gap-2 mt-3">
          <p className="text-[#64748B] text-xs">
            {playing ? 'Đang phát...' : playCount === 0 ? 'Bấm để nghe' : `Đã nghe ${playCount} lần`}
          </p>
          {playCount >= 2 && !playing && (
            <span className="text-[10px] text-[#94A3B8]">(tốc độ chậm hơn)</span>
          )}
        </div>
      </div>

      {/* Input */}
      <textarea
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={submitted}
        placeholder="Gõ những gì bạn nghe được..."
        rows={3}
        className={`w-full text-center text-lg bg-white border-2 rounded-xl px-6 py-4 focus:outline-none transition-all shadow-sm resize-none ${
          submitted
            ? isCorrect
              ? 'border-[#10B981] text-[#10B981] bg-green-50'
              : 'border-[#EF4444] text-[#EF4444] bg-red-50'
            : 'border-[#E2E8F0] focus:border-[#2563EB] text-[#334155]'
        }`}
      />

      {/* Hint */}
      {hint && !submitted && (
        <div className="flex flex-col items-center mt-3 gap-1">
          <button onClick={() => setShowHint(h => !h)} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
            💡 {showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}
          </button>
          {showHint && <p className="text-center text-[#64748B] text-xs mt-1">{hint}</p>}
        </div>
      )}

      {/* Result */}
      {submitted && (
        <div className={`mt-4 p-4 rounded-xl border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {isCorrect ? (
            <p className="text-[#10B981] text-sm font-medium text-center">Chính xác! 🎉</p>
          ) : (
            <>
              <p className="text-[#64748B] text-sm font-medium mb-2 text-center">Câu đúng:</p>
              <p className="text-[#334155] text-sm font-semibold text-center mb-2">{data.answer}</p>
              <WordComparison userAnswer={value} correctAnswer={data.answer} />
            </>
          )}
          <div className="flex justify-center mt-3">
            <button
              onClick={playAudio}
              disabled={playing}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                playing
                  ? 'bg-blue-100 border-blue-300 text-blue-600'
                  : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]'
              }`}
            >
              🔊 {playing ? 'Đang phát...' : 'Phát lại'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
