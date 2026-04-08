'use client'

import { useState } from 'react'
import { Download, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface LessonFile {
  id: string; displayName: string; mimeType: string; sizeBytes: number; downloadPolicy: string
}

function formatBytes(n: number) {
  if (n < 1024) return n + ' B'
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB'
  return (n / 1048576).toFixed(1) + ' MB'
}

export default function LessonContent({ content, files }: { content: string | null; files: LessonFile[] }) {
  const hasContent = !!(content?.trim())
  const hasFiles = files.length > 0

  if (!hasContent && !hasFiles) return null

  return (
    <div className="space-y-5">
      {hasContent && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-6">
          <div className="prose prose-sm max-w-none text-[#334155]
            prose-headings:text-[#334155] prose-headings:font-bold
            prose-p:text-[#4A5568] prose-p:leading-relaxed
            prose-strong:text-[#334155]
            prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-ul:pl-5 prose-ol:pl-5 prose-li:marker:text-[#64748B]
            prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-blockquote:text-[#4A5568]">
            <ReactMarkdown>{content!}</ReactMarkdown>
          </div>
        </div>
      )}

      {hasFiles && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
          <h3 className="font-semibold text-[#334155] text-sm mb-3 flex items-center gap-2">
            📎 Tài liệu đính kèm
          </h3>
          <div className="space-y-2">
            {files.map(f => (
              <a key={f.id} href={`/api/files/${f.id}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-3 p-3 border border-[#E2E8F0] rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB] shrink-0">
                  {f.downloadPolicy === 'view_only' ? <Eye className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#334155] group-hover:text-[#2563EB] transition-colors truncate">{f.displayName}</p>
                  <p className="text-xs text-[#94A3B8]">{formatBytes(f.sizeBytes)} · {f.downloadPolicy === 'view_only' ? 'Chỉ xem' : 'Tải về'}</p>
                </div>
                <span className="text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors text-sm shrink-0">
                  {f.downloadPolicy === 'view_only' ? '👁' : '↓'}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
