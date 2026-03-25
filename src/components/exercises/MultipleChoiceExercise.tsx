'use client'

interface MultipleChoiceData {
  options: string[]
  answer: string
  explanation?: string
}

interface Props {
  question: string
  data: Record<string, unknown>
  value: string
  onChange: (val: string) => void
  submitted: boolean
  correct: boolean
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function MultipleChoiceExercise({ question, data, value, onChange, submitted, correct: _correct }: Props) {
  const d = data as unknown as MultipleChoiceData

  function getStyle(opt: string) {
    if (!submitted) {
      return value === opt
        ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
        : 'border-[#E2E8F0] bg-white text-[#334155] hover:border-blue-300 hover:bg-blue-50'
    }
    // After submitted
    if (opt === d.answer) {
      return 'border-[#10B981] bg-green-50 text-[#10B981]'
    }
    if (opt === value && opt !== d.answer) {
      return 'border-[#EF4444] bg-red-50 text-[#EF4444]'
    }
    return 'border-[#E2E8F0] bg-slate-50 text-[#64748B] opacity-60'
  }

  return (
    <div className="max-w-lg mx-auto">
      <p className="text-xl font-semibold text-[#334155] mb-6 text-center leading-relaxed">
        {question}
      </p>

      <div className="space-y-3">
        {d.options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => !submitted && onChange(opt)}
            disabled={submitted}
            className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium shadow-sm flex items-center gap-3 ${getStyle(opt)}`}
          >
            <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
              {LABELS[i]}
            </span>
            <span>{opt}</span>
            {submitted && opt === d.answer && <span className="ml-auto">✓</span>}
            {submitted && opt === value && opt !== d.answer && <span className="ml-auto">✗</span>}
          </button>
        ))}
      </div>

      {submitted && d.explanation && (
        <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-[#2563EB] font-medium mb-1">Giải thích:</p>
          <p className="text-sm text-[#334155]">{d.explanation}</p>
        </div>
      )}

      {!submitted && (
        <p className="text-center text-[#64748B] text-xs mt-5">
          Chọn một đáp án
        </p>
      )}
    </div>
  )
}
