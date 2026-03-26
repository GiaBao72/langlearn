'use client'

interface FillBlankData {
  answer: string
  hint?: string
  onSubmit?: () => void
}

interface Props {
  question: string
  data: Record<string, unknown>
  value: string
  onChange: (val: string) => void
  onSubmit?: () => void
  submitted: boolean
  correct: boolean
}

export default function FillBlankExercise({ question, data, value, onChange, onSubmit, submitted, correct }: Props) {
  const d = data as unknown as FillBlankData

  // Replace ___ in question with input box display
  const parts = question.split('___')

  return (
    <div className="max-w-lg mx-auto">
      <p className="text-lg font-medium text-[#334155] mb-6 text-center leading-relaxed">
        {parts.length > 1 ? (
          <>
            {parts[0]}
            <span className={`inline-block border-b-2 min-w-[80px] px-2 font-bold ${
              submitted
                ? correct
                  ? 'border-[#10B981] text-[#10B981]'
                  : 'border-[#EF4444] text-[#EF4444]'
                : 'border-[#2563EB] text-[#2563EB]'
            }`}>
              {value || '\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0'}
            </span>
            {parts[1]}
          </>
        ) : question}
      </p>

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !submitted && onSubmit?.()}
        disabled={submitted}
        placeholder="Điền vào đây..."
        autoFocus
        className={`w-full text-center text-xl bg-white border-2 rounded-xl px-6 py-4 focus:outline-none transition-all shadow-sm ${
          submitted
            ? correct
              ? 'border-[#10B981] text-[#10B981] bg-green-50'
              : 'border-[#EF4444] text-[#EF4444] bg-red-50'
            : 'border-[#E2E8F0] focus:border-[#2563EB] text-[#334155]'
        }`}
      />

      {d.hint && !submitted && (
        <p className="text-center text-[#64748B] text-xs mt-3">
          Gợi ý: {d.hint}
        </p>
      )}

      {submitted && !correct && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-[#64748B] text-sm">
            Đáp án đúng: <span className="font-bold text-[#10B981]">{d.answer}</span>
          </p>
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
