'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ExerciseType = 'FLASHCARD' | 'FILL_BLANK' | 'MULTIPLE_CHOICE' | 'DICTATION' | 'SORT_WORDS'

const TYPE_PLACEHOLDERS: Record<ExerciseType, string> = {
  FLASHCARD: JSON.stringify(
    {
      front: 'der Hund',
      back: 'con chó',
      audioText: 'der Hund',
      example: 'Das ist mein Hund.',
      exampleTranslation: 'Đây là con chó của tôi.',
    },
    null,
    2
  ),
  FILL_BLANK: JSON.stringify(
    {
      sentence: 'Ich ___ Student.',
      answer: 'bin',
      hint: 'Động từ "sein" (thì/là) chia cho "ich"',
      fullSentence: 'Ich bin Student.',
      translation: 'Tôi là sinh viên.',
    },
    null,
    2
  ),
  MULTIPLE_CHOICE: JSON.stringify(
    {
      options: [
        { label: 'A', text: 'der' },
        { label: 'B', text: 'die' },
        { label: 'C', text: 'das' },
        { label: 'D', text: 'den' },
      ],
      answer: 'B',
      explanation: '"die Katze" — danh từ giống cái dùng mạo từ "die"',
    },
    null,
    2
  ),
  DICTATION: JSON.stringify(
    {
      audioText: 'Guten Morgen! Wie geht es Ihnen?',
      answer: 'Guten Morgen! Wie geht es Ihnen?',
      translation: 'Chào buổi sáng! Bạn có khỏe không?',
      hint: 'Câu chào hỏi buổi sáng lịch sự',
    },
    null,
    2
  ),
  SORT_WORDS: JSON.stringify(
    {
      words: ['ich', 'heiße', 'Max', 'und', 'komme', 'aus', 'Deutschland'],
      answer: 'ich heiße Max und komme aus Deutschland',
      translation: 'Tôi tên là Max và đến từ Đức.',
      hint: 'Động từ luôn đứng vị trí thứ 2 trong câu',
    },
    null,
    2
  ),
}

interface LessonOption {
  id: string
  title: string
  course: { title: string }
}

export default function NewExercisePage() {
  const router = useRouter()

  const [lessons, setLessons] = useState<LessonOption[]>([])
  const [lessonId, setLessonId] = useState('')
  const [type, setType] = useState<ExerciseType>('FLASHCARD')
  const [question, setQuestion] = useState('')
  const [points, setPoints] = useState(10)
  const [data, setData] = useState(TYPE_PLACEHOLDERS['FLASHCARD'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lessonLoading, setLessonLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/lessons')
      .then((r) => r.json())
      .then((d) => {
        setLessons(d.lessons || [])
        if (d.lessons?.length > 0) setLessonId(d.lessons[0].id)
      })
      .catch(() => setError('Lỗi tải danh sách bài học'))
      .finally(() => setLessonLoading(false))
  }, [])

  function handleTypeChange(newType: ExerciseType) {
    setType(newType)
    setData(TYPE_PLACEHOLDERS[newType])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!lessonId) {
      setError('Vui long chon bai hoc')
      return
    }
    if (!question.trim()) {
      setError('Vui long nhap cau hoi')
      return
    }

    let parsedData: unknown
    try {
      parsedData = JSON.parse(data)
    } catch {
      setError('Du lieu JSON khong hop le. Kiem tra lai truong Data.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, type, question: question.trim(), points, data: parsedData }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Lỗi tạo bài tập')
        return
      }
      router.push('/admin/exercises')
    } catch {
      setError('Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link href="/admin/exercises" className="hover:text-[#2563EB] transition-colors">
            Bài tập
          </Link>
          <span>/</span>
          <span className="text-foreground">Thêm mới</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          Tạo bài tập mới
        </h1>
      </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Lesson */}
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">
              Bai hoc *
            </label>
            {lessonLoading ? (
              <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                required
                className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] focus:outline-none focus:border-blue-400 transition-colors h-12 text-sm"
              >
                {lessons.length === 0 && (
                  <option value="">-- Chua co bai hoc --</option>
                )}
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.course.title} / {l.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">
              Loai bai tap *
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as ExerciseType)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] focus:outline-none focus:border-blue-400 transition-colors h-12 text-sm"
            >
              <option value="FLASHCARD">Thẻ từ vựng (Flashcard)</option>
              <option value="FILL_BLANK">Điền vào chỗ trống</option>
              <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
              <option value="DICTATION">Nghe và viết lại</option>
              <option value="SORT_WORDS">Sắp xếp từ</option>
            </select>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">
              Cau hoi *
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              placeholder="Nhap cau hoi hoac tieu de bai tap..."
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:border-blue-400 transition-colors h-12 text-sm"
            />
          </div>

          {/* Points */}
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">
              Diem so
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              min={1}
              max={100}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] focus:outline-none focus:border-blue-400 transition-colors h-12 text-sm"
            />
          </div>

          {/* Data JSON */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[#334155]">
                Du lieu (JSON) *
              </label>
              <span className="text-xs text-[#64748B] bg-slate-100 px-2 py-0.5 rounded font-mono">
                {type}
              </span>
            </div>
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              rows={12}
              spellCheck={false}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:border-blue-400 transition-colors resize-y font-mono text-sm"
            />
            <p className="text-xs text-[#64748B] mt-1">
              Phải là JSON hợp lệ. Chỉnh sửa nội dung trong dấu <code className="bg-slate-100 px-1 rounded">""</code> theo bài tập của bạn, giữ nguyên cấu trúc.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || lessonLoading}
              className="bg-[#2563EB] text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 h-12 text-sm"
            >
              {loading ? 'Dang luu...' : 'Tao bai tap'}
            </button>
            <Link
              href="/admin/exercises"
              className="px-6 py-3 border border-[#E2E8F0] rounded-lg text-[#334155] hover:bg-slate-100 transition-colors text-sm text-center h-12 flex items-center justify-center"
            >
              Hủy
            </Link>
          </div>
        </form>
    </div>
  )
}
