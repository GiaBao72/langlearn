'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Pencil,
  FileText,
  Home,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Người dùng', icon: Users },
  { href: '/admin/courses', label: 'Khóa học', icon: BookOpen },
  { href: '/admin/exercises', label: 'Bài tập', icon: Pencil },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
]

const bottomItems = [
  { href: '/', label: 'Trang chủ', icon: Home },
]

// Context để AdminHeader có thể toggle sidebar
import { createContext, useContext } from 'react'
export const SidebarContext = createContext<{ open: boolean; toggle: () => void }>({
  open: false,
  toggle: () => {},
})
export function useSidebar() { return useContext(SidebarContext) }

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <SidebarContext.Provider value={{ open, toggle: () => setOpen(o => !o) }}>
      {children}
    </SidebarContext.Provider>
  )
}

function SidebarContent({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Logo + close (mobile) */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-slate-700/50">
        {!collapsed && (
          <span className="text-white font-bold text-lg tracking-tight truncate">LangLearn</span>
        )}
        {collapsed && (
          <span className="text-blue-400 font-bold text-lg mx-auto">L</span>
        )}
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white ml-2">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-2.5 text-sm transition-colors',
                active ? 'text-white' : 'hover:bg-slate-700/50',
                collapsed ? 'justify-center' : ''
              )}
              style={active ? { backgroundColor: '#1e293b', color: 'white' } : { color: '#94a3b8' }}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="shrink-0" size={18} style={active ? { color: '#2563EB' } : undefined} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}

        <div className="my-2 border-t border-slate-700/50" />

        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-md px-2 py-2.5 text-sm transition-colors hover:bg-slate-700/50',
              collapsed ? 'justify-center' : ''
            )}
            style={{ color: '#94a3b8' }}
          >
            <item.icon className="shrink-0" size={18} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>
    </>
  )
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { open, toggle } = useSidebar()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggle}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-200 md:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ backgroundColor: '#0f172a', width: 240 }}
      >
        <SidebarContent collapsed={false} onClose={toggle} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col h-screen flex-shrink-0 transition-all duration-200 overflow-hidden relative"
        style={{ backgroundColor: '#0f172a', width: collapsed ? 60 : 240 }}
      >
        <SidebarContent collapsed={collapsed} />

        {/* Toggle collapse button */}
        <div className="border-t border-slate-700/50 p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full flex items-center rounded-md px-2 py-2 text-sm transition-colors hover:bg-slate-700/50',
              collapsed ? 'justify-center' : 'justify-end'
            )}
            style={{ color: '#94a3b8' }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span className="ml-1 text-xs">Thu gọn</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
