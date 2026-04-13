'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu, X, Download, BookOpen, Map, FileText, Trophy, ShoppingBag, LayoutDashboard, User, Settings, LogOut, LogIn, UserPlus, ClipboardList, ChevronDown } from 'lucide-react'

interface NavbarClientProps {
  user: { name: string; email: string; role: string } | null
}

const navLinks = [
  { href: '/courses', label: 'Khóa học', icon: BookOpen },
  { href: '/exams', label: 'Kiểm tra', icon: ClipboardList },
  { href: '/roadmap', label: 'Lộ trình', icon: Map },
  { href: '/leaderboard', label: '🏆 Xếp hạng', icon: Trophy },
  { href: '/store', label: 'Sách', icon: ShoppingBag },
]

// isActive: trang chủ chỉ active khi pathname === '/', các trang khác check startsWith

function useDarkMode() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])
  function toggle() {
    const next = !dark
    setDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }
  return { dark, toggle }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeferredPrompt = any

function useInstallPrompt() {
  const [prompt, setPrompt] = useState<DeferredPrompt>(null)
  const [installed, setInstalled] = useState(false)
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) { setInstalled(true); return }
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e) }
    const installedHandler = () => { setInstalled(true); setPrompt(null) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])
  async function install() {
    if (!prompt) return false
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') { setInstalled(true); setPrompt(null) }
    return outcome === 'accepted'
  }
  return { canNativeInstall: !!prompt && !installed, install }
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userDropOpen, setUserDropOpen] = useState(false)
  const { dark, toggle } = useDarkMode()
  const { canNativeInstall, install } = useInstallPrompt()
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)
  const userDropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  useEffect(() => {
    if (!userDropOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (userDropRef.current && !userDropRef.current.contains(e.target as Node)) setUserDropOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userDropOpen])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href)
  }

  return (
    <div className="flex items-center justify-between w-full" ref={menuRef}>
      {/* Left: Logo + desktop nav */}
      <div className="flex items-center gap-6">
        <Link href="/" className={`font-bold text-lg transition-colors ${isActive('/') ? 'text-[#2563EB]' : 'text-[#2563EB] hover:text-blue-700'}`}>
          G-Deutsch
        </Link>
        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'text-[#2563EB] bg-blue-50'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-border)]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {canNativeInstall && (
          <button onClick={install} title="Cài đặt ứng dụng"
            className="flex items-center gap-1.5 text-sm text-[#2563EB] border border-[#2563EB] px-3 py-1.5 rounded-full hover:bg-[#2563EB] hover:text-white transition-colors font-medium">
            <Download size={14} /> Tải về
          </button>
        )}
        <button onClick={toggle} aria-label="Toggle dark mode"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-main)] transition-colors">
          {dark ? '☀️' : '🌙'}
        </button>
        {user ? (
          <>
            {/* User dropdown */}
            <div className="relative" ref={userDropRef}>
              <button
                onClick={() => setUserDropOpen(o => !o)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[var(--color-border)] transition-colors"
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-[#2563EB] text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-[var(--color-text-main)] font-medium">{user.name}</span>
                <ChevronDown size={14} className={`text-[var(--color-text-muted)] transition-transform ${userDropOpen ? 'rotate-180' : ''}`} />
              </button>

              {userDropOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                  <div className="px-3 py-2 border-b border-[var(--color-border)]">
                    <p className="text-xs font-semibold text-[var(--color-text-main)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
                  </div>
                  <Link href="/dashboard" onClick={() => setUserDropOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-text-main)] hover:bg-[var(--color-border)] transition-colors">
                    <LayoutDashboard size={14} className="text-[var(--color-text-muted)]" /> Dashboard
                  </Link>
                  <Link href="/profile" onClick={() => setUserDropOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-text-main)] hover:bg-[var(--color-border)] transition-colors">
                    <User size={14} className="text-[var(--color-text-muted)]" /> Tài khoản
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setUserDropOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--color-text-main)] hover:bg-[var(--color-border)] transition-colors">
                      <Settings size={14} className="text-[var(--color-text-muted)]" /> Quản trị
                    </Link>
                  )}
                  <div className="border-t border-[var(--color-border)] mt-1" />
                  <button onClick={() => { setUserDropOpen(false); handleLogout() }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">Đăng nhập</Link>
            <Link href="/register" className="bg-[#2563EB] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#2563EB]/90 transition-colors">Đăng ký</Link>
          </>
        )}
      </div>{/* end right actions */}

      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-border)] transition-colors"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Menu"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-xl z-50 md:hidden">
          <div className="max-w-6xl mx-auto px-3 py-4">

            {/* Nav links - grid 2 cột */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {navLinks.map(link => {
                const active = isActive(link.href)
                const Icon = link.icon
                return (
                  <Link key={link.href} href={link.href}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-[var(--color-border)] text-[var(--color-text-main)] hover:bg-blue-50 hover:text-[#2563EB] dark:hover:bg-blue-900/20'
                    }`}>
                    <Icon size={16} className="shrink-0" />
                    {link.label}
                  </Link>
                )
              })}
            </div>

            <div className="border-t border-[var(--color-border)] mb-4" />

            {/* User section */}
            {user ? (
              <div className="space-y-2">
                {/* User info card */}
                <div className="flex items-center gap-3 px-3 py-3 bg-[var(--color-border)] rounded-xl">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="bg-[#2563EB] text-white text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--color-text-main)] truncate">{user.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link href="/dashboard"
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive('/dashboard') ? 'bg-[#2563EB] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-main)] hover:bg-blue-50 hover:text-[#2563EB] dark:hover:bg-blue-900/20'
                    }`}>
                    <LayoutDashboard size={15} className="shrink-0" /> Dashboard
                  </Link>
                  <Link href="/profile"
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive('/profile') ? 'bg-[#2563EB] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-main)] hover:bg-blue-50 hover:text-[#2563EB] dark:hover:bg-blue-900/20'
                    }`}>
                    <User size={15} className="shrink-0" /> Tài khoản
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin"
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive('/admin') ? 'bg-[#2563EB] text-white' : 'bg-[var(--color-border)] text-[var(--color-text-main)] hover:bg-blue-50 hover:text-[#2563EB] dark:hover:bg-blue-900/20'
                      }`}>
                      <Settings size={15} className="shrink-0" /> Quản trị
                    </Link>
                  )}
                  <button onClick={() => { setMenuOpen(false); handleLogout() }}
                    className="flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-all">
                    <LogOut size={15} className="shrink-0" /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login"
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium bg-[var(--color-border)] text-[var(--color-text-main)] hover:bg-blue-50 hover:text-[#2563EB] transition-all">
                  <LogIn size={15} /> Đăng nhập
                </Link>
                <Link href="/register"
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium bg-[#2563EB] text-white hover:bg-blue-700 transition-all shadow-sm">
                  <UserPlus size={15} /> Đăng ký
                </Link>
              </div>
            )}

            {/* Bottom utils */}
            <div className="border-t border-[var(--color-border)] mt-4 pt-3 flex items-center justify-between">
              {canNativeInstall ? (
                <button onClick={() => { setMenuOpen(false); install() }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#2563EB] font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <Download size={15} /> Tải ứng dụng
                </button>
              ) : <span />}
              <button onClick={toggle}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-colors">
                {dark ? '☀️ Sáng' : '🌙 Tối'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
