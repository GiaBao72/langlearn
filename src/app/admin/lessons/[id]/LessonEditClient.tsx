'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Trash2, ChevronDown, ChevronUp, Upload, Download } from 'lucide-react'

type ExerciseType = 'MULTIPLE_CHOICE' | 'FILL_BLANK' | 'FLASHCARD' | 'DICTATION' | 'SORT_WORDS'

interface Exercise {
  id: string
  type: ExerciseType
  question: string
  data: unknown
  points: number
  order: number
}

interface Lesson {
  id: string
  title: string
  order: number
  published: boolean
  content: string | null
  course: { id: string; title: string }
  exercises: Exercise[]
}

const TYPE_LABELS: Record<ExerciseType, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  FILL_BLANK: 'Điền từ',
  FLASHCARD: 'Flashcard',
  DICTATION: 'Nghe chép',
  SORT_WORDS: 'Sắp xếp từ',
}

function ExerciseForm({ lessonId, onCreated }: { lessonId: string; onCreated: () => void }) {
  const [type, setType] = useState<ExerciseType>('MULTIPLE_CHOICE')
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [words, setWords] = useState(['', '', '', '', ''])
  const [answer, setAnswer] = useState('')
  const [hint, setHint] = useState('')
  const [sentence, setSentence] = useState('')
  const [audioText, setAudioText] = useState('')
  const [pronunciation, setPronunciation] = useState('')
  const [points, setPoints] = useState(10)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Reset all fields when type changes
  function handleTypeChange(t: ExerciseType) {
    setType(t)
    setQuestion(''); setAnswer(''); setHint(''); setSentence('')
    setAudioText(''); setPronunciation('')
    setOptions(['', '', '', '']); setWords(['', '', '', '', ''])
    setError(''); setSuccess(false)
  }

  function buildData() {
    if (type === 'MULTIPLE_CHOICE') {
      const filtered = options.filter(o => o.trim())
      return { options: filtered, answer, explanation: hint }
    }
    if (type === 'FILL_BLANK') return { sentence: sentence || question, answer, hint }
    if (type === 'FLASHCARD') return { front: question, back: answer, pronunciation }
    if (type === 'DICTATION') return { audioText, answer, hint }
    if (type === 'SORT_WORDS') return { words: words.filter(w => w.trim()), answer }
    return { answer }
  }

  function validate(): string | null {
    if (!question.trim() && type !== 'DICTATION') return 'Vui lòng điền câu hỏi / nội dung'
    if (type === 'DICTATION' && !audioText.trim()) return 'Vui lòng điền nội dung nghe'
    if (!answer.trim()) return 'Vui lòng điền đáp án đúng'
    if (type === 'MULTIPLE_CHOICE') {
      const filled = options.filter(o => o.trim())
      if (filled.length < 2) return 'Cần ít nhất 2 lựa chọn'
      if (!filled.includes(answer.trim())) return 'Đáp án đúng phải khớp chính xác với 1 trong các lựa chọn'
    }
    if (type === 'SORT_WORDS') {
      const filled = words.filter(w => w.trim())
      if (filled.length < 2) return 'Cần ít nhất 2 từ để sắp xếp'
    }
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setSaving(true); setError(''); setSuccess(false)
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, question: type === 'DICTATION' ? audioText : question, data: buildData(), points }),
      })
      if (!res.ok) throw new Error(await res.text())
      // Reset
      setQuestion(''); setAnswer(''); setHint(''); setSentence('')
      setAudioText(''); setPronunciation('')
      setOptions(['', '', '', '']); setWords(['', '', '', '', ''])
      setPoints(10); setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onCreated()
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]'

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E2E8F0] rounded-xl p-6">
      <h3 className="font-semibold text-[#334155] mb-4">➕ Thêm bài tập mới</h3>
      {error && <p className="text-red-500 text-sm mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">✓ Đã thêm bài tập thành công!</p>}
      <div className="grid gap-4">
        {/* Loại bài tập */}
        <div>
          <label className="block text-sm font-medium text-[#334155] mb-1">Loại bài tập</label>
          <select value={type} onChange={e => handleTypeChange(e.target.value as ExerciseType)} className={inputCls}>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* FLASHCARD */}
        {type === 'FLASHCARD' && <>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Mặt trước (từ / cụm từ)</label>
            <input value={question} onChange={e => setQuestion(e.target.value)} className={inputCls} placeholder='VD: Guten Morgen' />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Mặt sau (nghĩa / giải thích)</label>
            <input value={answer} onChange={e => setAnswer(e.target.value)} className={inputCls} placeholder='VD: Chào buổi sáng / Good morning' />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Phiên âm <span className="text-muted-foreground font-normal">(tuỳ chọn)</span></label>
            <input value={pronunciation} onChange={e => setPronunciation(e.target.value)} className={inputCls} placeholder='VD: GOO-ten MOR-gen' />
          </div>
        </>}

        {/* MULTIPLE_CHOICE */}
        {type === 'MULTIPLE_CHOICE' && <>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Câu hỏi</label>
            <input value={question} onChange={e => setQuestion(e.target.value)} className={inputCls} placeholder='VD: "Guten Morgen" có nghĩa là gì?' />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Các lựa chọn</label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={opt} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n) }}
                  className={inputCls} placeholder={`Lựa chọn ${i + 1}`} />
                {options.length > 2 && (
                  <button type="button" onClick={() => setOptions(options.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 text-lg leading-none px-1">×</button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <button type="button" onClick={() => setOptions([...options, ''])}
                className="text-xs text-[#2563EB] hover:underline">+ Thêm lựa chọn</button>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Đáp án đúng <span className="text-xs text-muted-foreground">(phải khớp chính xác với 1 lựa chọn ở trên)</span></label>
            <select value={answer} onChange={e => setAnswer(e.target.value)} className={inputCls}>
              <option value="">-- Chọn đáp án đúng --</option>
              {options.filter(o => o.trim()).map((o, i) => <option key={i} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Giải thích <span className="text-muted-foreground font-normal">(tuỳ chọn)</span></label>
            <input value={hint} onChange={e => setHint(e.target.value)} className={inputCls} placeholder='VD: Morgen = buổi sáng' />
          </div>
        </>}

        {/* FILL_BLANK */}
        {type === 'FILL_BLANK' && <>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Câu có dấu ___ (chỗ trống)</label>
            <input value={question} onChange={e => { setQuestion(e.target.value); setSentence(e.target.value) }}
              className={inputCls} placeholder='VD: Ich ___ gestern ins Kino gegangen. (sein)' />
            <p className="text-xs text-muted-foreground mt-1">Dùng ___ để đánh dấu chỗ trống</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">Đáp án đúng</label>
              <input value={answer} onChange={e => setAnswer(e.target.value)} className={inputCls} placeholder='VD: bin' />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">Gợi ý <span className="text-muted-foreground font-normal">(tuỳ chọn)</span></label>
              <input value={hint} onChange={e => setHint(e.target.value)} className={inputCls} placeholder='VD: sein → ich bin' />
            </div>
          </div>
        </>}

        {/* SORT_WORDS */}
        {type === 'SORT_WORDS' && <>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Câu hỏi / Hướng dẫn</label>
            <input value={question} onChange={e => setQuestion(e.target.value)} className={inputCls} placeholder='VD: Sắp xếp thành câu đúng' />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Các từ cần sắp xếp <span className="text-xs text-muted-foreground">(mỗi từ 1 ô)</span></label>
            {words.map((w, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={w} onChange={e => { const n = [...words]; n[i] = e.target.value; setWords(n) }}
                  className={inputCls} placeholder={`Từ ${i + 1}`} />
                {words.length > 2 && (
                  <button type="button" onClick={() => setWords(words.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 text-lg leading-none px-1">×</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setWords([...words, ''])}
              className="text-xs text-[#2563EB] hover:underline">+ Thêm từ</button>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Câu đúng hoàn chỉnh</label>
            <input value={answer} onChange={e => setAnswer(e.target.value)} className={inputCls} placeholder='VD: Das Haus wird gerade gebaut' />
            <p className="text-xs text-muted-foreground mt-1">Câu hoàn chỉnh khi sắp xếp đúng thứ tự</p>
          </div>
        </>}

        {/* DICTATION */}
        {type === 'DICTATION' && <>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Nội dung nghe (sẽ được đọc thành tiếng)</label>
            <input value={audioText} onChange={e => setAudioText(e.target.value)} className={inputCls} placeholder='VD: Guten Morgen, wie geht es Ihnen?' />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1">Câu hỏi / Hướng dẫn</label>
            <input value={question} onChange={e => setQuestion(e.target.value)} className={inputCls} placeholder='VD: Nghe và viết lại câu vừa nghe' />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">Đáp án đúng</label>
              <input value={answer} onChange={e => setAnswer(e.target.value)} className={inputCls} placeholder='VD: Guten Morgen, wie geht es Ihnen?' />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#334155] mb-1">Gợi ý <span className="text-muted-foreground font-normal">(tuỳ chọn)</span></label>
              <input value={hint} onChange={e => setHint(e.target.value)} className={inputCls} placeholder='VD: Câu chào hỏi buổi sáng' />
            </div>
          </div>
        </>}

        {/* Điểm + Submit */}
        <div className="flex items-end gap-3 pt-1">
          <div className="w-24">
            <label className="block text-sm font-medium text-[#334155] mb-1">Điểm</label>
            <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} min={1} max={100}
              className={inputCls} />
          </div>
          <div className="flex-1">
            <button type="submit" disabled={saving}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50">
              {saving ? 'Đang lưu...' : '+ Thêm bài tập'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

function ImportExcelForm({ lessonId, onImported }: { lessonId: string; onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleImport() {
    if (!file) return
    setUploading(true); setError(''); setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('lessonId', lessonId)
      const res = await fetch('/api/admin/exercises/import', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Import thất bại'); return }
      setResult(data)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
      onImported()
    } catch (e) {
      setError(String(e))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#334155] flex items-center gap-2">
          <Upload className="w-4 h-4" /> Import từ Excel
        </h3>
        <a href="/api/admin/exercises/template" download
          className="flex items-center gap-1 text-xs text-[#2563EB] hover:underline">
          <Download className="w-3.5 h-3.5" /> Tải file mẫu
        </a>
      </div>

      <p className="text-xs text-[#64748B] mb-4">
        File Excel có các sheet: <code className="bg-slate-100 px-1 rounded">FILL_BLANK</code>, <code className="bg-slate-100 px-1 rounded">MULTIPLE_CHOICE</code>, <code className="bg-slate-100 px-1 rounded">FLASHCARD</code>, <code className="bg-slate-100 px-1 rounded">SORT_WORDS</code>, <code className="bg-slate-100 px-1 rounded">DICTATION</code>. Mỗi sheet một loại bài tập. Options/words ngăn cách bằng <code className="bg-slate-100 px-1 rounded">|</code>.
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={e => { setFile(e.target.files?.[0] || null); setResult(null); setError('') }}
          className="text-sm text-[#64748B] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#2563EB] hover:file:bg-blue-100 cursor-pointer"
        />
        <button
          onClick={handleImport}
          disabled={!file || uploading}
          className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {uploading ? 'Đang import...' : 'Import'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

      {result && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm font-semibold">✓ Đã import {result.imported} bài tập</p>
          {result.errors.length > 0 && (
            <ul className="mt-2 text-xs text-amber-600 space-y-0.5">
              {result.errors.map((e, i) => <li key={i}>⚠ {e}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function EditExerciseForm({ exercise, onSaved, onCancel }: {
  exercise: Exercise
  onSaved: () => void
  onCancel: () => void
}) {
  const data = exercise.data as Record<string, unknown>
  const [question, setQuestion] = useState(exercise.question)
  const [points, setPoints] = useState(exercise.points)
  const [answer, setAnswer] = useState(String(data.answer ?? data.back ?? ''))
  const [sentence, setSentence] = useState(String(data.sentence ?? ''))
  const [hint, setHint] = useState(String(data.hint ?? ''))
  const [front, setFront] = useState(String(data.front ?? ''))
  const [pronunciation, setPronunciation] = useState(String(data.pronunciation ?? ''))
  const [options, setOptions] = useState<string[]>(
    Array.isArray(data.options) ? data.options as string[] :
    Array.isArray(data.words) ? data.words as string[] : ['', '', '', '']
  )
  const [audioText, setAudioText] = useState(String(data.audio_text ?? ''))
  const [saving, setSaving] = useState(false)

  function buildData() {
    const t = exercise.type
    if (t === 'FILL_BLANK') return { sentence, answer, hint }
    if (t === 'MULTIPLE_CHOICE') return { options: options.filter(o => o.trim()), answer, explanation: hint }
    if (t === 'FLASHCARD') return { front, back: answer, pronunciation }
    if (t === 'SORT_WORDS') return { words: options.filter(o => o.trim()), answer }
    if (t === 'DICTATION') return { audio_text: audioText, answer, hint }
    return {}
  }

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/admin/exercises/${exercise.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, points, data: buildData() }),
    })
    setSaving(false)
    onSaved()
  }

  return (
    <div className="mt-3 border-t border-[#E2E8F0] pt-3 space-y-3">
      <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider">Chỉnh sửa</p>
      <div>
        <label className="text-xs text-[#64748B] mb-1 block">Câu hỏi</label>
        <input value={question} onChange={e => setQuestion(e.target.value)}
          className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
      </div>
      {exercise.type === 'FILL_BLANK' && <>
        <div>
          <label className="text-xs text-[#64748B] mb-1 block">Câu có dấu ___</label>
          <input value={sentence} onChange={e => setSentence(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Đáp án</label>
            <input value={answer} onChange={e => setAnswer(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Gợi ý</label>
            <input value={hint} onChange={e => setHint(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
        </div>
      </>}
      {exercise.type === 'MULTIPLE_CHOICE' && <>
        <div>
          <label className="text-xs text-[#64748B] mb-1 block">Các lựa chọn</label>
          {options.map((o, i) => <input key={i} value={o} onChange={e => { const n=[...options]; n[i]=e.target.value; setOptions(n) }}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm mb-1.5 focus:outline-none focus:border-[#2563EB]"
            placeholder={`Lựa chọn ${i+1}`} />)}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Đáp án đúng</label>
            <input value={answer} onChange={e => setAnswer(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Giải thích</label>
            <input value={hint} onChange={e => setHint(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
        </div>
      </>}
      {exercise.type === 'FLASHCARD' && <>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Mặt trước</label>
            <input value={front} onChange={e => setFront(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Mặt sau (nghĩa)</label>
            <input value={answer} onChange={e => setAnswer(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
        </div>
        <div>
          <label className="text-xs text-[#64748B] mb-1 block">Phiên âm</label>
          <input value={pronunciation} onChange={e => setPronunciation(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
      </>}
      {exercise.type === 'SORT_WORDS' && <>
        <div>
          <label className="text-xs text-[#64748B] mb-1 block">Các từ (mỗi từ 1 ô)</label>
          {options.map((o, i) => <input key={i} value={o} onChange={e => { const n=[...options]; n[i]=e.target.value; setOptions(n) }}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm mb-1.5 focus:outline-none focus:border-[#2563EB]"
            placeholder={`Từ ${i+1}`} />)}
          <button type="button" onClick={() => setOptions([...options, ''])}
            className="text-xs text-[#2563EB] hover:underline mt-1">+ Thêm từ</button>
        </div>
        <div>
          <label className="text-xs text-[#64748B] mb-1 block">Câu đúng</label>
          <input value={answer} onChange={e => setAnswer(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
      </>}
      {exercise.type === 'DICTATION' && <>
        <div>
          <label className="text-xs text-[#64748B] mb-1 block">Nội dung nghe</label>
          <input value={audioText} onChange={e => setAudioText(e.target.value)}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Đáp án</label>
            <input value={answer} onChange={e => setAnswer(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
          <div>
            <label className="text-xs text-[#64748B] mb-1 block">Gợi ý</label>
            <input value={hint} onChange={e => setHint(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
        </div>
      </>}
      <div className="flex items-center gap-2">
        <div className="w-20">
          <label className="text-xs text-[#64748B] mb-1 block">Điểm</label>
          <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} min={1} max={100}
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} disabled={saving}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? 'Đang lưu...' : '💾 Lưu'}
          </button>
          <button onClick={onCancel}
            className="border border-[#E2E8F0] text-[#64748B] px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">
            Hủy
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LessonEditClient({ lesson: initial }: { lesson: Lesson }) {
  const [lesson, setLesson] = useState(initial)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [deletingLesson, setDeletingLesson] = useState(false)
  const [confirmDeleteLesson, setConfirmDeleteLesson] = useState(false)
  const [pendingDeleteEx, setPendingDeleteEx] = useState<string | null>(null)
  const [showContentEditor, setShowContentEditor] = useState(false)
  const [content, setContent] = useState(initial.content ?? '')
  const [savingContent, setSavingContent] = useState(false)

  async function handleDeleteLesson() {
    setDeletingLesson(true)
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, { method: 'DELETE' })
    if (res.ok) {
      window.location.href = `/admin/courses/${lesson.course.id}`
    } else {
      setDeletingLesson(false)
      setConfirmDeleteLesson(false)
    }
  }

  async function reload() {
    const res = await fetch(`/api/admin/lessons/${lesson.id}`)
    if (res.ok) {
      const data = await res.json()
      setLesson(data.lesson ?? data)
    }
  }

  async function togglePublish() {
    setPublishing(true)
    await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !lesson.published }),
    })
    await reload()
    setPublishing(false)
  }

  async function saveContent() {
    setSavingContent(true)
    await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    setSavingContent(false)
    setShowContentEditor(false)
    await reload()
  }

  async function deleteExercise(exId: string) {
    setDeleting(exId)
    await fetch(`/api/admin/exercises/${exId}`, { method: 'DELETE' })
    await reload()
    setDeleting(null)
    setPendingDeleteEx(null)
  }

  return (
    <>
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb + publish toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 flex-wrap">
            <Link href={`/admin/courses/${lesson.course.id}`} className="hover:text-[#2563EB] truncate max-w-[120px] sm:max-w-none">
              {lesson.course.title}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[100px] sm:max-w-none">{lesson.title}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{lesson.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lesson.exercises.length} bài tập
            {lesson.exercises.length > 0 && (() => {
              const counts: Record<string, number> = {}
              lesson.exercises.forEach(e => { counts[e.type] = (counts[e.type] ?? 0) + 1 })
              const labels: Record<string, string> = { MULTIPLE_CHOICE:'Trắc nghiệm', FILL_BLANK:'Điền từ', FLASHCARD:'Flashcard', DICTATION:'Nghe chép', SORT_WORDS:'Sắp xếp' }
              return (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({Object.entries(counts).map(([k,v]) => `${labels[k]??k}: ${v}`).join(' · ')})
                </span>
              )
            })()}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={togglePublish} disabled={publishing}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
              lesson.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}>
            {lesson.published ? '✓ Đã đăng' : 'Chưa đăng'}
          </button>
          <button onClick={() => setConfirmDeleteLesson(true)} disabled={deletingLesson}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold border border-red-300 text-red-500 hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50">
            Xóa bài học
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Content editor */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-[#334155] text-sm">📝 Nội dung bài học (Markdown)</h3>
            <button onClick={() => setShowContentEditor(!showContentEditor)}
              className="text-xs text-[#2563EB] hover:underline">
              {showContentEditor ? 'Thu gọn' : 'Chỉnh sửa'}
            </button>
          </div>
          {showContentEditor ? (
            <div className="space-y-2">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={8}
                placeholder="Viết nội dung lý thuyết bài học ở đây (Markdown)..."
                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2563EB] resize-y"
              />
              <div className="flex gap-2">
                <button onClick={saveContent} disabled={savingContent}
                  className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {savingContent ? 'Đang lưu...' : '💾 Lưu nội dung'}
                </button>
                <button onClick={() => { setShowContentEditor(false); setContent(lesson.content ?? '') }}
                  className="border border-[#E2E8F0] text-[#64748B] px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8]">
              {lesson.content ? `${lesson.content.slice(0, 100)}${lesson.content.length > 100 ? '...' : ''}` : 'Chưa có nội dung — bấm "Chỉnh sửa" để thêm.'}
            </p>
          )}
        </div>

        {lesson.exercises.length > 0 && (
          <div className="space-y-2">
            {lesson.exercises.map((ex, i) => (
              <div key={ex.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => { setExpanded(expanded === ex.id ? null : ex.id); setEditing(null) }}>
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-[#2563EB] mr-2">{TYPE_LABELS[ex.type]}</span>
                    <span className="text-sm text-foreground truncate">{ex.question}</span>
                  </div>
                  <span className="text-xs text-muted-foreground mr-1 sm:mr-2 shrink-0">{ex.points}đ</span>
                  {expanded === ex.id ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </div>
                {expanded === ex.id && (
                  <div className="px-4 sm:px-5 pb-4 border-t border-border">
                    {editing === ex.id ? (
                      <EditExerciseForm
                        exercise={ex}
                        onSaved={async () => { setEditing(null); await reload() }}
                        onCancel={() => setEditing(null)}
                      />
                    ) : (
                      <>
                        <div className="mt-3 bg-muted rounded-lg p-3 space-y-1.5">
                          {(() => {
                            const d = ex.data as Record<string, unknown>
                            const rows: { label: string; value: string }[] = []
                            if (ex.type === 'FLASHCARD') {
                              rows.push({ label: 'Mặt trước', value: String(d.front ?? '') })
                              rows.push({ label: 'Mặt sau', value: String(d.back ?? '') })
                              if (d.pronunciation) rows.push({ label: 'Phiên âm', value: String(d.pronunciation) })
                            } else if (ex.type === 'MULTIPLE_CHOICE') {
                              if (Array.isArray(d.options)) (d.options as string[]).forEach((o, i) => rows.push({ label: `Lựa chọn ${i+1}`, value: o }))
                              rows.push({ label: '✓ Đáp án', value: String(d.answer ?? '') })
                              if (d.explanation) rows.push({ label: 'Giải thích', value: String(d.explanation) })
                            } else if (ex.type === 'FILL_BLANK') {
                              rows.push({ label: 'Câu', value: String(d.sentence ?? ex.question) })
                              rows.push({ label: '✓ Đáp án', value: String(d.answer ?? '') })
                              if (d.hint) rows.push({ label: 'Gợi ý', value: String(d.hint) })
                            } else if (ex.type === 'SORT_WORDS') {
                              if (Array.isArray(d.words)) rows.push({ label: 'Các từ', value: (d.words as string[]).join(' | ') })
                              rows.push({ label: '✓ Câu đúng', value: String(d.answer ?? '') })
                            } else if (ex.type === 'DICTATION') {
                              rows.push({ label: 'Nội dung nghe', value: String(d.audioText ?? d.audio_text ?? '') })
                              rows.push({ label: '✓ Đáp án', value: String(d.answer ?? '') })
                              if (d.hint) rows.push({ label: 'Gợi ý', value: String(d.hint) })
                            } else {
                              rows.push({ label: 'Data', value: JSON.stringify(d, null, 2) })
                            }
                            return rows.map((r, i) => (
                              <div key={i} className="flex gap-2 text-xs">
                                <span className="text-muted-foreground w-24 shrink-0">{r.label}</span>
                                <span className="text-foreground font-medium break-all">{r.value}</span>
                              </div>
                            ))
                          })()}
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <button onClick={() => setEditing(ex.id)}
                            className="flex items-center gap-1 text-xs text-[#2563EB] hover:text-blue-700 transition-colors font-medium">
                            ✏️ Sửa bài tập
                          </button>
                          <button onClick={() => setPendingDeleteEx(ex.id)} disabled={deleting === ex.id}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                            {deleting === ex.id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <ExerciseForm lessonId={lesson.id} onCreated={reload} />
        <ImportExcelForm lessonId={lesson.id} onImported={reload} />
      </div>
    </div>

      {/* Delete lesson modal */}
      {confirmDeleteLesson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="font-bold text-[#1E293B] text-lg mb-2">⚠️ Xóa bài học?</h3>
            <p className="text-sm font-medium text-foreground mb-1">{lesson.title}</p>
            <p className="text-sm text-muted-foreground mb-3">Khóa học: {lesson.course.title}</p>
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2.5 text-sm mb-4">
              Toàn bộ <strong>{lesson.exercises.length} bài tập</strong> và tiến độ học của người dùng sẽ bị xóa vĩnh viễn.
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDeleteLesson(false)} disabled={deletingLesson}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-slate-50 text-sm">
                Hủy
              </button>
              <button onClick={handleDeleteLesson} disabled={deletingLesson}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50">
                {deletingLesson ? 'Đang xóa...' : 'Xóa bài học'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete exercise modal */}
      {pendingDeleteEx && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-[#1E293B] text-lg mb-2">Xóa bài tập?</h3>
            {(() => {
              const ex = lesson.exercises.find(e => e.id === pendingDeleteEx)
              return ex ? (
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-medium text-foreground">{ex.question}</span>
                  <br /><span className="text-xs">{({MULTIPLE_CHOICE:'Trắc nghiệm',FILL_BLANK:'Điền từ',FLASHCARD:'Flashcard',DICTATION:'Nghe chép',SORT_WORDS:'Sắp xếp từ'} as Record<string,string>)[ex.type] ?? ex.type}</span>
                </p>
              ) : null
            })()}
            <p className="text-sm text-red-600 mb-4">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setPendingDeleteEx(null)}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-slate-50 text-sm">
                Hủy
              </button>
              <button onClick={() => deleteExercise(pendingDeleteEx)} disabled={deleting === pendingDeleteEx}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50">
                {deleting === pendingDeleteEx ? 'Đang xóa...' : 'Xóa bài tập'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}