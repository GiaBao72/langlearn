'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BlogUploadClient() {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFile(file: File) {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      setError('Chỉ hỗ trợ file .txt hoặc .md')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/admin/blog/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Upload thất bại')
      return
    }

    setSuccess(`✅ Đã tạo bài "${data.post.title}" (nháp)`)
    router.refresh()
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${dragging ? 'border-[#2563EB] bg-blue-50' : 'border-border hover:border-[#2563EB] hover:bg-blue-50/40'}
          ${loading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md"
          className="hidden"
          onChange={onInputChange}
        />
        <div className="text-3xl mb-3">{loading ? '⏳' : '📄'}</div>
        <p className="font-semibold text-foreground text-sm">
          {loading ? 'Đang xử lý...' : 'Kéo thả file hoặc click để chọn'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Hỗ trợ .txt và .md — dòng đầu là tiêu đề, phần còn lại là nội dung</p>
      </div>

      {/* Format hint */}
      <div className="bg-muted/40 border border-border rounded-lg p-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">📋 Format file:</p>
        <pre className="font-mono text-xs leading-relaxed">{`Tiêu đề bài viết ở đây\n\nNội dung bài viết...\n## Heading 2\nParagraph text\n**bold** *italic*`}</pre>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          ❌ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          {success} — <span className="font-medium">vào danh sách bài bên dưới để Publish</span>
        </div>
      )}
    </div>
  )
}
