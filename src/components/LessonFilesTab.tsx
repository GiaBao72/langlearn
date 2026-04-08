'use client'

import { useState, useRef } from 'react'
import { Trash2, Upload, Eye, Download } from 'lucide-react'

interface LessonFile {
  id: string; displayName: string; storedName: string; mimeType: string
  sizeBytes: number; downloadPolicy: string; order: number
}

function formatBytes(n: number) {
  if (n < 1024) return n + ' B'
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB'
  return (n / 1048576).toFixed(1) + ' MB'
}

const POLICY_LABELS: Record<string, string> = {
  public: '🌐 Ai cũng tải được',
  logged_in: '🔒 Phải đăng nhập',
  view_only: '👁 Chỉ xem, không tải',
}

export default function LessonFilesTab({ lessonId, initialFiles }: { lessonId: string; initialFiles: LessonFile[] }) {
  const [files, setFiles] = useState<LessonFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [policy, setPolicy] = useState('logged_in')
  const [file, setFile] = useState<File | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function reload() {
    const res = await fetch(`/api/admin/lessons/${lessonId}/files`)
    if (res.ok) setFiles(await res.json())
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setUploading(true); setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('displayName', displayName || file.name)
      form.append('downloadPolicy', policy)
      const res = await fetch(`/api/admin/lessons/${lessonId}/files`, { method: 'POST', body: form })
      if (!res.ok) { setError('Upload thất bại'); return }
      setFile(null); setDisplayName(''); setPolicy('logged_in')
      if (inputRef.current) inputRef.current.value = ''
      await reload()
    } finally { setUploading(false) }
  }

  async function deleteFile(id: string) {
    setDeletingId(id)
    await fetch(`/api/admin/files/${id}`, { method: 'DELETE' })
    setDeletingId(null); await reload()
  }

  async function updatePolicy(id: string, newPolicy: string) {
    await fetch(`/api/admin/files/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ downloadPolicy: newPolicy }),
    })
    await reload()
  }

  return (
    <div className="space-y-5">
      {/* Upload form */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
        <h3 className="font-semibold text-[#334155] text-sm mb-3 flex items-center gap-2"><Upload className="w-4 h-4" /> Tải lên tài liệu</h3>
        <form onSubmit={handleUpload} className="space-y-3">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex items-center gap-3 flex-wrap">
            <input ref={inputRef} type="file" onChange={e => { setFile(e.target.files?.[0] || null); setDisplayName(e.target.files?.[0]?.name || '') }}
              className="text-sm text-[#64748B] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#2563EB] hover:file:bg-blue-100 cursor-pointer" />
          </div>
          {file && (
            <>
              <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder="Tên hiển thị..." className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
              <select value={policy} onChange={e => setPolicy(e.target.value)}
                className="w-full border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]">
                {Object.entries(POLICY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button type="submit" disabled={uploading}
                className="w-full bg-[#2563EB] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                {uploading ? 'Đang tải lên...' : 'Tải lên'}
              </button>
            </>
          )}
        </form>
      </div>

      {/* File list */}
      {files.length === 0 ? (
        <div className="text-center py-10 text-[#94A3B8] text-sm">Chưa có tài liệu nào</div>
      ) : (
        <div className="space-y-2">
          {files.map(f => (
            <div key={f.id} className="bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#334155] text-sm truncate">{f.displayName}</p>
                <p className="text-xs text-[#94A3B8]">{f.mimeType} · {formatBytes(f.sizeBytes)}</p>
              </div>
              <select value={f.downloadPolicy} onChange={e => updatePolicy(f.id, e.target.value)}
                className="text-xs border border-[#E2E8F0] rounded-lg px-2 py-1 focus:outline-none focus:border-[#2563EB]">
                {Object.entries(POLICY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <div className="flex items-center gap-2">
                <a href={`/api/files/${f.id}`} target="_blank" rel="noreferrer"
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-[#64748B]" title="Xem/Tải">
                  {f.downloadPolicy === 'view_only' ? <Eye className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                </a>
                <button onClick={() => deleteFile(f.id)} disabled={deletingId === f.id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
