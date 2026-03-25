'use client'

import { useState } from 'react'

interface FlashcardData {
  front: string
  back: string
  example?: string
}

interface Props {
  data: Record<string, unknown>
  onAnswer: (answer: string) => void
}

export default function FlashcardExercise({ data, onAnswer }: Props) {
  const [flipped, setFlipped] = useState(false)
  const d = data as unknown as FlashcardData

  return (
    <div className="text-center">
      <style>{`
        .flashcard-scene { perspective: 1000px; }
        .flashcard-card {
          width: 100%; height: 200px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.5s ease;
          cursor: pointer;
        }
        .flashcard-card.flipped { transform: rotateY(180deg); }
        .flashcard-face {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 1rem;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          border: 2px solid #E2E8F0;
          background: white;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .flashcard-back { transform: rotateY(180deg); }
      `}</style>

      <div className="flashcard-scene mb-6" onClick={() => setFlipped(!flipped)}>
        <div className={`flashcard-card ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="flashcard-face">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-3">Tiếng Đức</span>
            <span className="text-3xl font-bold text-[#334155]">{d.front}</span>
            <span className="text-xs text-[#64748B] mt-4">Bấm để xem nghĩa</span>
          </div>
          {/* Back */}
          <div className="flashcard-face flashcard-back">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#64748B] mb-3">Tiếng Việt</span>
            <span className="text-2xl font-bold text-[#2563EB] mb-3">{d.back}</span>
            {d.example && (
              <span className="text-sm text-[#64748B] italic text-center">"{d.example}"</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-[#64748B] text-sm mb-6">
        {flipped ? 'Bạn có nhớ từ này không?' : 'Bấm vào thẻ để xem nghĩa'}
      </p>

      {flipped && (
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => onAnswer('unknown')}
            className="px-8 py-3 rounded-xl border-2 border-red-200 text-red-500 bg-red-50 hover:bg-red-100 font-medium transition-colors"
          >
            Chưa nhớ ✗
          </button>
          <button
            onClick={() => onAnswer('known')}
            className="px-8 py-3 rounded-xl border-2 border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-medium transition-colors"
          >
            Đã nhớ ✓
          </button>
        </div>
      )}
    </div>
  )
}
