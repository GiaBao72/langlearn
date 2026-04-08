'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'

const EXERCISE_TYPES = [
  { value: 'FLASHCARD',               label: 'Flashcard',                desc: 'Học từ vựng mặt trước/sau',       color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' },
  { value: 'FILL_BLANK',              label: 'Điền từ',                  desc: 'Điền vào chỗ trống',              color: 'bg-green-500/10 border-green-500/30 text-green-400' },
  { value: 'MULTIPLE_CHOICE',         label: 'Trắc nghiệm (1 đáp án)',   desc: 'Chọn 1 đáp án đúng',              color: 'bg-purple-500/10 border-purple-500/30 text-purple-400' },
  { value: 'MULTIPLE_CHOICE_PARTIAL', label: 'Nhiều đáp án (tỉ lệ)',     desc: 'Điểm theo tỉ lệ đáp án đúng',    color: 'bg-violet-500/10 border-violet-500/30 text-violet-400' },
  { value: 'MULTIPLE_CHOICE_ALL',     label: 'Nhiều đáp án (toàn bộ)',   desc: 'Toàn điểm hoặc 0',               color: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' },
  { value: 'SORT_WORDS',              label: 'Sắp xếp từ',               desc: 'Sắp xếp thành câu đúng',         color: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
  { value: 'DICTATION',              label: 'Nghe chép',                 desc: 'Nghe và viết lại',               color: 'bg-pink-500/10 border-pink-500/30 text-pink-400' },
]

interface Course { id: string; title: string; level: string; demoLessonLimit: number }
interface Lesson  { id: string; title: string; _count: { exercises: number } }

export default function DemoGeneratePage() {
  const [courses, setCourses]         = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [lessons, setLessons]         = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState('')
  const [topic, setTopic]             = useState('')
  const [typeCounts, setTypeCounts]   = useState<Record<string, number>>({
    FLASHCARD: 5, FILL_BLANK: 5, MULTIPLE_CHOICE: 5, SORT_WORDS: 3, DICTATION: 3,
  })
  const [replaceExisting, setReplaceExisting] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  // Load demo courses
  useEffect(() => {
    fetch('/api/admin/courses')
      .then(r => r.json())
      .then((all: Course[]) => setCourses(all.filter((c: Course & { isDemo?: boolean }) => (c as Course & { isDemo?: boolean }).isDemo)))
      .catch(() => {})
  }, [])

  // Load lessons when course changes
  useEffect(() => {
    if (!selectedCourse) { setLessons([]); setSelectedLesson(''); return }
    fetch(`/api/admin/courses/${selectedCourse}`)
      .then(r => r.json())
      .then((data: { lessons: Lesson[] }) => {
        const course = courses.find(c => c.id === selectedCourse)
        const limit = course?.demoLessonLimit ?? 99
        const demoLessons = data.lessons.slice(0, limit)
        setLessons(demoLessons)
        setSelectedLesson(demoLessons[0]?.id ?? '')
      })
      .catch(() => {})
  }, [selectedCourse, courses])

  const totalCount = Object.values(typeCounts).reduce((a, b) => a + b, 0)

  function toggleType(val: string) {
    setTypeCounts(prev => {
      if (val in prev) { const n = { ...prev }; delete n[val]; return n }
      return { ...prev, [val]: 5 }
    })
  }

  function setCount(type: string, val: number) {
    setTypeCounts(prev => ({ ...prev, [type]: Math.max(1, Math.min(30, val || 1)) }))
  }

  async function handleGenerate() {
    if (!selectedLesson) { setError('Vui lòng chọn bài học'); return }
    if (!topic.trim())    { setError('Vui lòng nhập chủ đề'); return }
    if (!Object.keys(typeCounts).length) { setError('Vui lòng chọn ít nhất 1 loại bài'); return }

    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await fetch('/api/admin/demo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: selectedLesson, topic: topic.trim(), level: courses.find(c => c.id === selectedCourse)?.level ?? 'A1', typeCounts, replaceExisting }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Lỗi (${res.status})`)
      setSuccess(`✅ Đã tạo ${data.created} bài tập và lưu vào bài học!`)
      // Refresh lesson list để cập nhật exercise count
      setSelectedCourse(c => { setTimeout(() => setSelectedCourse(c), 50); return '' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Sparkles className="text-amber-500" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold">AI Tạo Đề — Khóa Học Thử</h1>
          <p className="text-sm text-muted-foreground">Sinh bài tập trực tiếp vào bài học Demo — không cần Excel</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-5">

        {/* Course picker */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Khóa học Demo <span className="text-red-400">*</span></label>
          {courses.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              ⚠ Chưa có khóa học Demo nào. Vào <strong>Admin → Khóa học</strong>, bật toggle <strong>🎓 Khóa học thử</strong> cho một khóa.
            </div>
          ) : (
            <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">-- Chọn khóa học --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title} ({c.level}) — {c.demoLessonLimit} bài thử</option>
              ))}
            </select>
          )}
        </div>

        {/* Lesson picker */}
        {selectedCourse && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Bài học <span className="text-red-400">*</span></label>
            {lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">Khóa học này chưa có bài học nào.</p>
            ) : (
              <div className="space-y-1.5">
                {lessons.map(l => (
                  <label key={l.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${selectedLesson === l.id ? 'border-amber-400 bg-amber-50' : 'border-border hover:border-amber-300'}`}>
                    <input type="radio" name="lesson" value={l.id} checked={selectedLesson === l.id}
                      onChange={() => setSelectedLesson(l.id)} className="accent-amber-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{l._count.exercises} bài tập hiện có</p>
                    </div>
                    {l._count.exercises > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">Có bài</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Topic */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Chủ đề <span className="text-red-400">*</span></label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="VD: chào hỏi, số đếm, gia đình, màu sắc, động từ cơ bản..."
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        {/* Exercise types */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Loại bài tập <span className="text-red-400">*</span></label>
            {Object.keys(typeCounts).length > 0 && (
              <span className="text-xs text-muted-foreground">
                Tổng: <span className="font-semibold text-foreground">{totalCount}</span> câu
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {EXERCISE_TYPES.map(t => {
              const isSelected = t.value in typeCounts
              return (
                <div key={t.value} className={`rounded-lg border transition-all ${isSelected ? t.color : 'border-border bg-background'}`}>
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <button onClick={() => toggleType(t.value)}
                      className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-current bg-current' : 'border-muted-foreground'}`}>
                      {isSelected && <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                    </button>
                    <div className="flex-1 min-w-0 cursor-pointer select-none" onClick={() => toggleType(t.value)}>
                      <div className={`text-sm font-medium leading-tight ${isSelected ? '' : 'text-foreground'}`}>{t.label}</div>
                      <div className={`text-xs mt-0.5 ${isSelected ? 'opacity-60' : 'text-muted-foreground'}`}>{t.desc}</div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setCount(t.value, (typeCounts[t.value] ?? 5) - 1)}
                          className="w-6 h-6 rounded-md border border-current/30 flex items-center justify-center text-base font-bold opacity-60 hover:opacity-100 hover:bg-current/10 transition-all">−</button>
                        <input type="number" min={1} max={30} value={typeCounts[t.value] ?? 5}
                          onChange={e => setCount(t.value, parseInt(e.target.value))}
                          className="w-11 rounded-md border border-current/30 bg-transparent text-center text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-current/40 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <button onClick={() => setCount(t.value, (typeCounts[t.value] ?? 5) + 1)}
                          className="w-6 h-6 rounded-md border border-current/30 flex items-center justify-center text-base font-bold opacity-60 hover:opacity-100 hover:bg-current/10 transition-all">+</button>
                        <span className="text-xs opacity-50 pl-0.5">câu</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Replace existing */}
        <label className="flex items-center gap-3 cursor-pointer border border-dashed border-border rounded-lg px-4 py-3 hover:border-amber-400 transition-colors">
          <input type="checkbox" checked={replaceExisting} onChange={e => setReplaceExisting(e.target.checked)}
            className="w-4 h-4 accent-amber-500" />
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              <Trash2 size={14} className="text-red-400" /> Xóa bài tập cũ trước khi tạo mới
            </p>
            <p className="text-xs text-muted-foreground">Nếu bài học đã có bài tập, chọn để thay hoàn toàn.</p>
          </div>
        </label>

        {/* Error / Success */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2.5 text-sm text-green-400">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> {success}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleGenerate} disabled={loading || !selectedLesson || !topic.trim() || !Object.keys(typeCounts).length}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 text-sm transition-colors">
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Đang sinh đề... (10–30 giây)</>
          ) : (
            <><Sparkles size={16} /> Tạo đề trực tiếp vào bài học {Object.keys(typeCounts).length > 0 && <span className="opacity-70 font-normal">({totalCount} câu)</span>}</>
          )}
        </button>
      </div>
    </div>
  )
}
