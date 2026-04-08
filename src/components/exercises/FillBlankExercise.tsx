'use client'

interface FillBlankData {
  answer: string
  answers?: string[]
  hint?: string
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
  const parts = question.split('___')

  const allAnswers: string[] = Array.isArray(d.answers) && d.answers.length > 0
    ? d.answers
    : d.answer ? [d.answer] : []

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
              {value || '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'}
            </span>
            {parts[1]}
          </>
        ) : (
          question
        )}
      </p>

      {!submitted && (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSubmit?.()}
          placeholder="Nhập đáp án..."
          autoFocus
          className="w-full border-2 border-[#E2E8F0] rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:border-[#2563EB] transition-colors"
        />
      )}

      {d.hint && !submitted && (
        <p className="mt-3 text-center text-xs text-[#94A3B8] italic">
          💡 {d.hint}
        </p>
      )}

      {submitted && !correct && allAnswers.length > 1 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-[#94A3B8]">
            Các đáp án hợp lệ:
            <span className="font-semibold text-[#334155] ml-1">
              {allAnswers.join(' / ')}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
