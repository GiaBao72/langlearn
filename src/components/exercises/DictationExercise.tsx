'use client'

import { useState, useEffect } from 'react'

interface DictationData {
  audio: string
  answer: string
}

interface Props {
  question: string
  data: Record<string, unknown>
  value: string
  onChange: (val: string) => void
  submitted: boolean
  correct: boolean
}

function WordComparison({ userAnswer, correctAnswer }: { userAnswer: string; correctAnswer: string }) {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/[.!?,]/g, '').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
  const userWords = userAnswer.trim().split(/\s+/)
  const correctWords = correctAnswer.trim().split(/\s+/)
  const maxLen = Math.max(userWords.length, correctWords.length)

  return (
    <div className="flex flex-wrap gap-1 justify-center mt-2">
      {Array.from({ length: maxLen }).map((_, i) => {
        const cw = correctWords[i] || ''
        const uw = userWords[i] || ''
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

export default function DictationExercise({ question, data, value, onChange, submitted, correct }: Props) {
  const d = data as unknown as DictationData
  const audioText = d.audio || d.answer || question
  const [speechAvailable, setSpeechAvailable] = useState(true)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    // Check nếu SpeechSynthesis không có (Safari iOS cũ, một số Android)
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSpeechAvailable(false)
    }
  }, [])

  function playAudio() {
    if (!speechAvailable) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(audioText)
    utterance.lang = 'de-DE'
    utterance.rate = 0.8
    utterance.onstart = () => setPlaying(true)
    utterance.onend = () => setPlaying(false)
    utterance.onerror = () => setPlaying(false)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="max-w-lg mx-auto">
      <p className="text-[#64748B] text-sm text-center mb-6">{question}</p>

      {/* Audio player */}
      <div className="flex flex-col items-center mb-6">
        {speechAvailable ? (
          <>
            <button
              onClick={playAudio}
              className={`w-20 h-20 rounded-full text-white flex items-center justify-center shadow-lg transition-all active:scale-95 ${
                playing ? 'bg-blue-400 animate-pulse' : 'bg-[#2563EB] hover:bg-blue-700'
              }`}
              title="Nghe lại"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>
            <p className="text-[#64748B] text-xs mt-3">{playing ? 'Đang phát...' : 'Bấm để nghe'}</p>
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
            <p className="text-amber-600 text-sm font-medium">🔇 Trình duyệt không hỗ trợ phát âm</p>
            <p className="text-amber-500 text-xs mt-1">Dùng Chrome để nghe audio tốt nhất</p>
            <p className="text-[#64748B] text-sm mt-2 font-medium">Câu cần chép: <span className="text-[#334155] font-bold">{audioText}</span></p>
          </div>
        )}
      </div>

      {/* Input */}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={submitted}
        placeholder="Gõ những gì bạn nghe được..."
        rows={3}
        autoFocus
        className={`w-full text-center text-lg bg-white border-2 rounded-xl px-6 py-4 focus:outline-none transition-all shadow-sm resize-none ${
          submitted
            ? correct
              ? 'border-[#10B981] text-[#10B981] bg-green-50'
              : 'border-[#EF4444] text-[#EF4444] bg-red-50'
            : 'border-[#E2E8F0] focus:border-[#2563EB] text-[#334155]'
        }`}
      />

      {submitted && (
        <div className={`mt-4 p-4 rounded-xl border ${correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {correct ? (
            <p className="text-[#10B981] text-sm font-medium text-center">Chính xác! 🎉</p>
          ) : (
            <>
              <p className="text-[#64748B] text-sm font-medium mb-2 text-center">Câu đúng:</p>
              <p className="text-[#334155] text-sm font-semibold text-center mb-2">{d.answer}</p>
              <WordComparison userAnswer={value} correctAnswer={d.answer} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
