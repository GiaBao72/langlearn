'use client'

import { useState, useRef, useCallback } from 'react'

interface Props {
  imageUrl?: string | null
  onImageChange: (url: string | null) => void
  disabled?: boolean
}

export default function ImageUploader({ imageUrl, onImageChange, disabled }: Props) {
  const [tab, setTab] = useState<'url' | 'upload'>('url')
  const [urlInput, setUrlInput] = useState(imageUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const preview = imageUrl || (tab === 'url' ? urlInput : '')

  function handleUrlApply() {
    const v = urlInput.trim()
    onImageChange(v || null)
    setError('')
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Chỉ hỗ trợ file ảnh')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File tối đa 5MB')
      return
    }
    setError('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/upload/image', { method: 'POST', body: form })
      if (!res.ok) {
        const e = await res.json().catch(() => ({}))
        throw new Error(e.error ?? 'Upload thất bại')
      }
      const { url } = await res.json()
      onImageChange(url)
      setUrlInput(url)
    } catch (e) {
      setError(String(e))
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const btnCls = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${active ? 'bg-white text-[#334155] shadow-sm' : 'text-[#64748B] hover:text-[#334155]'}`

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#334155]">Hình ảnh <span className="text-[#94A3B8] font-normal">(tuỳ chọn)</span></label>
        {imageUrl && (
          <button
            type="button"
            onClick={() => { onImageChange(null); setUrlInput('') }}
            disabled={disabled}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            ✕ Xoá ảnh
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button type="button" className={btnCls(tab === 'url')} onClick={() => setTab('url')}>🔗 URL</button>
        <button type="button" className={btnCls(tab === 'upload')} onClick={() => setTab('upload')}>📁 Upload</button>
      </div>

      {/* URL tab */}
      {tab === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onBlur={handleUrlApply}
            placeholder="https://example.com/image.jpg"
            disabled={disabled}
            className="flex-1 border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm text-[#334155] focus:outline-none focus:border-[#2563EB]"
          />
          <button
            type="button"
            onClick={handleUrlApply}
            disabled={disabled}
            className="px-3 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Áp dụng
          </button>
        </div>
      )}

      {/* Upload tab */}
      {tab === 'upload' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploading && fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${dragOver ? 'border-[#2563EB] bg-blue-50' : 'border-[#E2E8F0] hover:border-blue-300'} ${disabled || uploading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          {uploading ? (
            <p className="text-sm text-[#64748B]">⏳ Đang upload...</p>
          ) : (
            <>
              <p className="text-2xl mb-1">🖼️</p>
              <p className="text-sm text-[#64748B]">Kéo thả hoặc <span className="text-[#2563EB] font-medium">chọn file</span></p>
              <p className="text-xs text-[#94A3B8] mt-1">JPG, PNG, WebP — tối đa 5MB</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      )}

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Preview */}
      {preview && (
        <div className="mt-2 rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-50 flex justify-center p-2">
          <img
            src={preview}
            alt="Preview"
            className="max-h-40 max-w-full object-contain rounded-lg"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}
    </div>
  )
}
