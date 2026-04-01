'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

interface Course {
  id: string
  title: string
  language: string
  level: string
  description: string | null
  published: boolean
  createdAt: string
  lessonCount: number
  exerciseCount: number
}

const LEVEL_ORDER: Record<string, number> = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 }

function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    A1: 'bg-green-100 text-green-700',
    A2: 'bg-emerald-100 text-emerald-700',
    B1: 'bg-blue-100 text-blue-700',
    B2: 'bg-indigo-100 text-indigo-700',
    C1: 'bg-purple-100 text-purple-700',
    C2: 'bg-rose-100 text-rose-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${colors[level] ?? 'bg-slate-100 text-slate-600'}`}>
      {level}
    </span>
  )
}

function PublishToggle({ course, onToggle }: { course: Course; onToggle: (id: string, val: boolean) => void }) {
  const [loading, setLoading] = useState(false)

  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation()
    setLoading(true)
    await fetch(`/api/admin/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !course.published }),
    })
    setLoading(false)
    onToggle(course.id, !course.published)
  }

  return (
    <button onClick={toggle} disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 focus:outline-none ${
        course.published ? 'bg-green-500' : 'bg-slate-300'
      }`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        course.published ? 'translate-x-4' : 'translate-x-0.5'
      }`} />
    </button>
  )
}

export default function CoursesClient({ courses: initialCourses }: { courses: Course[] }) {
  const router = useRouter()
  const [courses, setCourses] = useState(initialCourses)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'published' | 'draft'>('ALL')

  const filtered = useMemo(() => {
    let list = [...courses]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.language.toLowerCase().includes(q))
    }
    if (levelFilter !== 'ALL') list = list.filter(c => c.level === levelFilter)
    if (statusFilter === 'published') list = list.filter(c => c.published)
    if (statusFilter === 'draft') list = list.filter(c => !c.published)
    list.sort((a, b) => (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99))
    return list
  }, [courses, search, levelFilter, statusFilter])

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(c => c.id)))
    }
  }

  function handleTogglePublish(id: string, val: boolean) {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, published: val } : c))
  }

  async function bulkDelete() {
    setBulkDeleting(true)
    const ids = Array.from(selected)
    await fetch('/api/admin/courses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
    setCourses(prev => prev.filter(c => !ids.includes(c.id)))
    setSelected(new Set())
    setShowBulkDeleteModal(false)
    setBulkDeleting(false)
  }

  const selectedCourses = filtered.filter(c => selected.has(c.id))
  const totalLessonsSelected = selectedCourses.reduce((s, c) => s + c.lessonCount, 0)
  const totalExercisesSelected = selectedCourses.reduce((s, c) => s + c.exerciseCount, 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Khóa học ({courses.length})</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý toàn bộ khóa học</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              🗑 Xóa {selected.size} khóa học
            </button>
          )}
          <Link href="/admin/courses/new"
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors h-10 flex items-center">
            + Thêm khóa học
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm theo tên, ngôn ngữ..."
          className="flex-1 min-w-[200px] border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-[#2563EB]" />
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-[#2563EB]">
          <option value="ALL">Tất cả cấp độ</option>
          {['A1','A2','B1','B2','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-[#2563EB]">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="published">Đã đăng</option>
          <option value="draft">Nháp</option>
        </select>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-16 text-center text-muted-foreground">
          Không tìm thấy khóa học nào.{' '}
          <Link href="/admin/courses/new" className="text-[#2563EB] hover:underline">Tạo ngay</Link>
        </div>
      )}

      {/* Mobile cards */}
      {filtered.length > 0 && (
        <div className="sm:hidden space-y-3">
          {filtered.map(c => (
            <div key={c.id} className={`bg-card border rounded-xl p-4 space-y-3 transition-colors ${selected.has(c.id) ? 'border-blue-400 bg-blue-50/30' : 'border-border'}`}>
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)}
                  className="mt-0.5 accent-blue-600" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <LevelBadge level={c.level} />
                    <span className="font-medium text-foreground text-sm truncate">{c.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{c.language} · {c.lessonCount} bài học · {c.exerciseCount} bài tập</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PublishToggle course={c} onToggle={handleTogglePublish} />
                  <span className="text-xs text-muted-foreground">{c.published ? 'Live' : 'Nháp'}</span>
                </div>
                <Link href={`/admin/courses/${c.id}`} className="text-xs text-[#2563EB] hover:underline font-medium">
                  Chỉnh sửa →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop table */}
      {filtered.length > 0 && (
        <Card className="hidden sm:block overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input type="checkbox"
                      checked={filtered.length > 0 && selected.size === filtered.length}
                      onChange={toggleSelectAll}
                      className="accent-blue-600" />
                  </TableHead>
                  <TableHead>Tên khóa học</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead>Ngôn ngữ</TableHead>
                  <TableHead className="text-center">Bài học</TableHead>
                  <TableHead className="text-center">Bài tập</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} className={selected.has(c.id) ? 'bg-blue-50/50' : ''}>
                    <TableCell>
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)}
                        className="accent-blue-600" />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{c.title}</div>
                      {c.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs">{c.description}</div>
                      )}
                    </TableCell>
                    <TableCell><LevelBadge level={c.level} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.language}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{c.lessonCount}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{c.exerciseCount}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <PublishToggle course={c} onToggle={handleTogglePublish} />
                        <span className="text-xs text-muted-foreground w-10">{c.published ? 'Live' : 'Nháp'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/courses/${c.id}`}
                        className="text-sm text-[#2563EB] hover:underline font-medium">
                        Chỉnh sửa
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Bulk delete modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="font-bold text-[#1E293B] text-lg mb-2">⚠️ Xóa {selected.size} khóa học?</h3>
            <div className="text-sm text-muted-foreground mb-3">Các khóa học sẽ bị xóa:</div>
            <ul className="text-sm mb-4 space-y-1 max-h-40 overflow-y-auto">
              {selectedCourses.map(c => (
                <li key={c.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5">
                  <span className="font-medium">{c.title}</span>
                  <span className="text-xs text-muted-foreground">{c.lessonCount} bài · {c.exerciseCount} bài tập</span>
                </li>
              ))}
            </ul>
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2.5 text-sm mb-4">
              Tổng cộng <strong>{totalLessonsSelected} bài học</strong> và <strong>{totalExercisesSelected} bài tập</strong> sẽ bị xóa vĩnh viễn, bao gồm cả tiến độ học của người dùng.
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowBulkDeleteModal(false)} disabled={bulkDeleting}
                className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-slate-50 text-sm">
                Hủy
              </button>
              <button onClick={bulkDelete} disabled={bulkDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50">
                {bulkDeleting ? 'Đang xóa...' : `Xóa ${selected.size} khóa học`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
