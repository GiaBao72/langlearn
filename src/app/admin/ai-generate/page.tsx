'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Download, Loader2, AlertCircle, CheckCircle2, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']
const EXERCISE_TYPES = [
  { value: 'FLASHCARD', label: 'Flashcard', desc: 'Học từ vựng mặt trước/sau', color: 'bg-blue-50 border-blue-200 text-blue-600' },
  { value: 'FILL_BLANK', label: 'Điền từ', desc: 'Điền vào chỗ trống', color: 'bg-green-50 border-green-200 text-green-600' },
  { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm (1 đáp án)', desc: 'Chọn 1 đáp án đúng', color: 'bg-purple-500/10 border-purple-500/30 text-indigo-500' },
  { value: 'MULTIPLE_CHOICE_PARTIAL', label: 'Nhiều đáp án (tỉ lệ)', desc: 'Điểm theo tỉ lệ đáp án đúng', color: 'bg-violet-50 border-violet-200 text-violet-600' },
  { value: 'MULTIPLE_CHOICE_ALL', label: 'Nhiều đáp án (toàn bộ)', desc: 'Toàn điểm hoặc 0', color: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
  { value: 'SORT_WORDS', label: 'Sắp xếp từ', desc: 'Sắp xếp thành câu đúng', color: 'bg-orange-50 border-orange-200 text-orange-600' },
  { value: 'DICTATION', label: 'Nghe chép', desc: 'Nghe và viết lại', color: 'bg-pink-50 border-pink-200 text-pink-600' },
]

const DEFAULT_COUNT = 10
const STORAGE_KEY = 'ai-generate-presets'

interface Preset {
  id: string
  name: string
  topic: string
  description: string
  level: string
  typeCounts: Record<string, number>
  savedAt: number
}

function loadPresets(): Preset[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function savePresets(presets: Preset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets.slice(0, 20)))
}

export default function AIGeneratePage() {
  const [topic, setTopic] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('A1')
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({
    FLASHCARD: DEFAULT_COUNT,
    FILL_BLANK: DEFAULT_COUNT,
    MULTIPLE_CHOICE: DEFAULT_COUNT,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Preset management
  const [presets, setPresets] = useState<Preset[]>([])
  const [showPresets, setShowPresets] = useState(false)
  const [savePresetName, setSavePresetName] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)

  useEffect(() => {
    setPresets(loadPresets())
  }, [])

  const selectedTypes = Object.keys(typeCounts)
  const totalCount = Object.values(typeCounts).reduce((a, b) => a + b, 0)

  function toggleType(val: string) {
    setTypeCounts(prev => {
      if (val in prev) {
        const next = { ...prev }
        delete next[val]
        return next
      }
      return { ...prev, [val]: DEFAULT_COUNT }
    })
  }

  function setTypeCount(type: string, val: number) {
    setTypeCounts(prev => ({ ...prev, [type]: Math.max(1, Math.min(50, val || 1)) }))
  }

  function applyPreset(preset: Preset) {
    setTopic(preset.topic)
    setDescription(preset.description)
    setLevel(preset.level)
    setTypeCounts(preset.typeCounts)
    setShowPresets(false)
    setError('')
    setSuccess('')
  }

  function saveCurrentAsPreset() {
    const name = savePresetName.trim() || `${topic.slice(0, 20) || 'Không tên'} · ${level}`
    const newPreset: Preset = {
      id: Date.now().toString(),
      name,
      topic: topic.trim(),
      description: description.trim(),
      level,
      typeCounts,
      savedAt: Date.now(),
    }
    const updated = [newPreset, ...presets.filter(p => p.name !== name)]
    setPresets(updated)
    savePresets(updated)
    setSavePresetName('')
    setShowSaveInput(false)
    setSuccess('✅ Đã lưu cấu trúc "' + name + '"')
    setTimeout(() => setSuccess(''), 3000)
  }

  function deletePreset(id: string) {
    const updated = presets.filter(p => p.id !== id)
    setPresets(updated)
    savePresets(updated)
  }

  // Auto-save last config after successful generate
  function autoSaveLast() {
    const name = `[Tự động] ${topic.slice(0, 20)} · ${level}`
    const updated = [
      { id: 'auto-last', name, topic: topic.trim(), description: description.trim(), level, typeCounts, savedAt: Date.now() },
      ...presets.filter(p => p.id !== 'auto-last'),
    ]
    setPresets(updated)
    savePresets(updated)
  }

  async function handleGenerate() {
    if (!topic.trim()) { setError('Vui lòng nhập chủ đề'); return }
    if (selectedTypes.length === 0) { setError('Vui lòng chọn ít nhất 1 loại bài'); return }
    if (totalCount > 100) { setError('Tổng số bài không được vượt quá 100'); return }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/admin/exercises/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), description: description.trim(), level, typeCounts }),
      })
      if (!res.ok) {
        const ct = res.headers.get('content-type') ?? ''
        if (ct.includes('application/json')) {
          const data = await res.json()
          throw new Error(data.error || `Lỗi server (${res.status})`)
        } else {
          const txt = await res.text()
          const clean = txt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
          if (res.status === 504 || res.status === 502) {
            throw new Error('Server timeout — AI đang bận, vui lòng thử lại sau ít giây.')
          }
          throw new Error(`Lỗi server (${res.status}): ${clean || 'Không rõ nguyên nhân'}`)
        }
      }

      const blob = await res.blob()
      const exerciseCount = res.headers.get('X-Exercise-Count') || String(totalCount)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-${topic.replace(/\s+/g, '-')}-${level}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      autoSaveLast()
      setSuccess(`✅ Đã tạo ${exerciseCount} bài tập! File Excel đã được tải về.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const typeLabels: Record<string, string> = {
    FLASHCARD: 'FC', FILL_BLANK: 'FB', MULTIPLE_CHOICE: 'MC',
    MULTIPLE_CHOICE_PARTIAL: 'MCP', MULTIPLE_CHOICE_ALL: 'MCA',
    SORT_WORDS: 'SW', DICTATION: 'DT',
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200">
          <Sparkles className="text-indigo-500" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold">AI Tạo Đề Bài</h1>
          <p className="text-sm text-[#64748B]">Sinh file Excel từ AI, sau đó import vào bài học</p>
        </div>
      </div>

      {/* Preset picker */}
      {presets.length > 0 && (
        <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
          <button
            onClick={() => setShowPresets(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Copy size={15} className="text-indigo-500" />
              Dùng lại cấu trúc đã lưu
              <span className="text-xs bg-blue-100 text-[#2563EB] px-1.5 py-0.5 rounded-full font-semibold">
                {presets.length}
              </span>
            </span>
            {showPresets ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showPresets && (
            <div className="border-t divide-y">
              {presets.map(preset => (
                <div key={preset.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 group">
                  <button
                    onClick={() => applyPreset(preset)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{preset.name}</span>
                      <span className="text-xs text-[#64748B] bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {preset.level}
                      </span>
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {Object.entries(preset.typeCounts).map(([type, count]) => (
                        <span key={type} className="text-xs text-[#64748B] bg-slate-100 px-1.5 py-0.5 rounded">
                          {typeLabels[type] ?? type}: {count}
                        </span>
                      ))}
                      {preset.topic && (
                        <span className="text-xs text-[#64748B] italic truncate">— {preset.topic.slice(0, 30)}</span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => applyPreset(preset)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-[#2563EB] hover:bg-blue-50 font-medium transition-colors"
                  >
                    Dùng
                  </button>
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className="shrink-0 p-1.5 text-[#64748B] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Xóa preset này"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-5">

        {/* Topic */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Chủ đề <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="VD: chào hỏi, số đếm, gia đình, màu sắc..."
            className="w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium flex items-center gap-2">
            Mô tả chi tiết
            <span className="text-xs font-normal text-[#64748B] bg-slate-100 px-1.5 py-0.5 rounded">Tùy chọn</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            placeholder="VD: Tập trung vào từ vựng phòng bếp thường dùng hàng ngày, ưu tiên danh từ và động từ cơ bản, tránh từ chuyên ngành kỹ thuật. Mỗi câu nên ngắn gọn, dễ hiểu cho người mới."
            className="w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none leading-relaxed"
          />
          <p className="text-xs text-[#64748B]">
            💡 Mô tả càng chi tiết, AI càng tạo đúng ý — phong cách, trọng tâm, những gì cần tránh.
          </p>
        </div>

        {/* Level */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Trình độ</label>
          <div className="flex gap-2">
            {LEVELS.map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition-all ${
                  level === l
                    ? 'bg-purple-500/10 border-purple-500/40 text-indigo-500'
                    : 'border-[#E2E8F0] bg-slate-50 text-[#64748B] hover:bg-slate-50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise types with per-type count */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Loại bài tập <span className="text-red-400">*</span>
            </label>
            {selectedTypes.length > 0 && (
              <span className="text-xs text-[#64748B]">
                Tổng: <span className="font-semibold text-[#334155]">{totalCount}</span> câu
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {EXERCISE_TYPES.map(t => {
              const isSelected = t.value in typeCounts
              return (
                <div
                  key={t.value}
                  className={`rounded-lg border transition-all ${isSelected ? t.color : 'border-[#E2E8F0] bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <button
                      onClick={() => toggleType(t.value)}
                      className="shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center"
                      aria-label={`Toggle ${t.label}`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-current bg-current' : 'border-muted-foreground'
                      }`}>
                        {isSelected && (
                          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 fill-none">
                            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                    </button>

                    <div className="flex-1 min-w-0 cursor-pointer select-none" onClick={() => toggleType(t.value)}>
                      <div className={`text-sm font-medium leading-tight ${isSelected ? '' : 'text-[#334155]'}`}>{t.label}</div>
                      <div className={`text-xs mt-0.5 ${isSelected ? 'opacity-60' : 'text-[#64748B]'}`}>{t.desc}</div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setTypeCount(t.value, (typeCounts[t.value] ?? DEFAULT_COUNT) - 1)}
                          className="w-6 h-6 rounded-md border border-current/30 flex items-center justify-center text-base font-bold leading-none opacity-60 hover:opacity-100 hover:bg-current/10 transition-all"
                        >−</button>
                        <input
                          type="number" min={1} max={50}
                          value={typeCounts[t.value] ?? DEFAULT_COUNT}
                          onChange={e => setTypeCount(t.value, parseInt(e.target.value))}
                          className="w-11 rounded-md border border-current/30 bg-transparent text-center text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-current/40 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setTypeCount(t.value, (typeCounts[t.value] ?? DEFAULT_COUNT) + 1)}
                          className="w-6 h-6 rounded-md border border-current/30 flex items-center justify-center text-base font-bold leading-none opacity-60 hover:opacity-100 hover:bg-current/10 transition-all"
                        >+</button>
                        <span className="text-xs opacity-50 pl-0.5">câu</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {selectedTypes.length === 0 && (
            <p className="text-xs text-[#64748B] pt-1">Chọn ít nhất 1 loại bài tập để tiếp tục.</p>
          )}
        </div>

        {/* Save preset row */}
        <div className="pt-1 border-t border-dashed border-[#E2E8F0]">
          {showSaveInput ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={savePresetName}
                onChange={e => setSavePresetName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveCurrentAsPreset(); if (e.key === 'Escape') setShowSaveInput(false) }}
                placeholder={`${topic.slice(0, 20) || 'Không tên'} · ${level}`}
                className="flex-1 rounded-lg border bg-slate-50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button onClick={saveCurrentAsPreset}
                className="text-sm px-3 py-1.5 rounded-lg bg-[#2563EB] text-white font-medium hover:bg-blue-700 transition-colors shrink-0">
                Lưu
              </button>
              <button onClick={() => { setShowSaveInput(false); setSavePresetName('') }}
                className="text-sm px-3 py-1.5 rounded-lg border text-[#64748B] hover:bg-slate-50 transition-colors shrink-0">
                Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSaveInput(true)}
              className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#2563EB] transition-colors py-1"
            >
              <Copy size={13} />
              Lưu cấu trúc này để dùng lại sau
            </button>
          )}
        </div>

        {/* Error / Success */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-600">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            {success}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleGenerate}
          disabled={loading || selectedTypes.length === 0}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 text-sm transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang sinh đề... (có thể mất 10–30 giây)
            </>
          ) : (
            <>
              <Download size={16} />
              Tạo đề &amp; Tải Excel
              {selectedTypes.length > 0 && (
                <span className="opacity-70 font-normal">({totalCount} câu)</span>
              )}
            </>
          )}
        </button>
      </div>

      {/* Guide */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-3">
        <h3 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">Hướng dẫn</h3>
        <ol className="space-y-2 text-sm text-[#64748B]">
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">1.</span> Nhập chủ đề — thêm mô tả chi tiết để AI hiểu đúng ý hơn</li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">2.</span> Chọn loại bài và đặt số câu cho từng loại</li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">3.</span> Nhấn <strong>Lưu cấu trúc</strong> nếu muốn dùng lại setup này</li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">4.</span> Nhấn "Tạo đề &amp; Tải Excel" — AI sinh file .xlsx (cấu trúc tự lưu sau khi tạo)</li>
          <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">5.</span> Vào <strong>Bài học → Import Excel</strong> để nhập vào DB</li>
        </ol>
      </div>
    </div>
  )
}
