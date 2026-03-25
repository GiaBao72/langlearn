'use client'

import { useState, useEffect } from 'react'

interface SortWordsData {
  words: string[]
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

export default function SortWordsExercise({ question, data, value, onChange, submitted, correct }: Props) {
  const d = data as unknown as SortWordsData

  // Scramble words once on mount
  const [bank, setBank] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    const shuffled = [...d.words].sort(() => Math.random() - 0.5)
    setBank(shuffled)
    setSelected([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function pickFromBank(word: string, idx: number) {
    if (submitted) return
    const newBank = [...bank]
    newBank.splice(idx, 1)
    const newSelected = [...selected, word]
    setBank(newBank)
    setSelected(newSelected)
    onChange(newSelected.join(' '))
  }

  function returnToBank(word: string, idx: number) {
    if (submitted) return
    const newSelected = [...selected]
    newSelected.splice(idx, 1)
    const newBank = [...bank, word]
    setBank(newBank)
    setSelected(newSelected)
    onChange(newSelected.join(' '))
  }

  return (
    <div className="max-w-lg mx-auto">
      <p className="text-xl font-semibold text-[#334155] mb-6 text-center leading-relaxed">
        {question}
      </p>

      {/* Answer area */}
      <div
        className={`min-h-[60px] p-4 rounded-xl border-2 mb-4 flex flex-wrap gap-2 transition-colors ${
          submitted
            ? correct
              ? 'border-[#10B981] bg-green-50'
              : 'border-[#EF4444] bg-red-50'
            : 'border-[#2563EB] bg-blue-50'
        }`}
      >
        {selected.length === 0 && !submitted && (
          <span className="text-[#64748B] text-sm italic">Bấm từ bên dưới để sắp xếp...</span>
        )}
        {selected.map((word, i) => (
          <button
            key={`${word}-${i}`}
            onClick={() => returnToBank(word, i)}
            disabled={submitted}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              submitted
                ? correct
                  ? 'border-[#10B981] bg-green-100 text-[#10B981]'
                  : 'border-[#EF4444] bg-red-100 text-[#EF4444]'
                : 'border-[#2563EB] bg-white text-[#2563EB] hover:bg-blue-100'
            }`}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 justify-center p-4 bg-slate-100 rounded-xl min-h-[60px]">
        {bank.map((word, i) => (
          <button
            key={`${word}-${i}`}
            onClick={() => pickFromBank(word, i)}
            disabled={submitted}
            className="px-3 py-1.5 rounded-lg text-sm font-medium border-2 border-[#E2E8F0] bg-white text-[#334155] hover:border-[#2563EB] hover:bg-blue-50 transition-all shadow-sm"
          >
            {word}
          </button>
        ))}
        {bank.length === 0 && !submitted && (
          <span className="text-[#64748B] text-sm italic">Tất cả từ đã được sắp xếp</span>
        )}
      </div>

      {submitted && !correct && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-[#64748B] text-sm mb-1 text-center">Đáp án đúng:</p>
          <p className="text-[#10B981] font-semibold text-center">{d.answer}</p>
        </div>
      )}
      {submitted && correct && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-center">
          <p className="text-[#10B981] text-sm font-medium">Chính xác! 🎉</p>
        </div>
      )}
    </div>
  )
}
