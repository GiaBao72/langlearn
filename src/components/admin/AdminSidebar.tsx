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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Nguoi dung', icon: Users },
  { href: '/admin/courses', label: 'Khoa hoc', icon: BookOpen },
  { href: '/admin/exercises', label: 'Bai tap', icon: Pencil },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
]

const bottomItems = [
  { href: '/', label: 'Trang chu', icon: Home },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside
      style={{ backgroundColor: '#0f172a', width: collapsed ? 60 : 240 }}
      className="flex flex-col h-screen flex-shrink-0 transition-all duration-200 overflow-hidden relative"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-slate-700/50">
        {!collapsed && (
          <span className="text-white font-bold text-lg tracking-tight truncate">
            LangLearn
          </span>
        )}
        {collapsed && (
          <span className="text-blue-400 font-bold text-lg mx-auto">L</span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                active
                  ? 'text-white'
                  : 'hover:bg-slate-700/50',
                collapsed ? 'justify-center' : ''
              )}
              style={
                active
                  ? { backgroundColor: '#1e293b', color: 'white' }
                  : { color: '#94a3b8' }
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className="shrink-0"
                size={18}
                style={active ? { color: '#2563EB' } : undefined}
              />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          )
        })}

        {/* Divider */}
        <div className="my-2 border-t border-slate-700/50" />

        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-slate-700/50',
              collapsed ? 'justify-center' : ''
            )}
            style={{ color: '#94a3b8' }}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="shrink-0" size={18} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Toggle button */}
      <div className="border-t border-slate-700/50 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full flex items-center rounded-md px-2 py-2 text-sm transition-colors hover:bg-slate-700/50',
            collapsed ? 'justify-center' : 'justify-end'
          )}
          style={{ color: '#94a3b8' }}
          title={collapsed ? 'Mo rong' : 'Thu gon'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="ml-1 text-xs">Thu gon</span>}
        </button>
      </div>
    </aside>
  )
}
