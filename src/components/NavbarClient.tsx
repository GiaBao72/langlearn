'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu, X, Download, Smartphone } from 'lucide-react'

interface NavbarClientProps {
  user: { name: string; email: string; role: string } | null
}

const navLinks = [
  { href: '/courses', label: 'Khóa học' },
  { href: '/roadmap', label: 'Lộ trình' },
  { href: '/blog', label: 'Blog' },
  { href: '/leaderboard', label: '🏆 Xếp hạng' },
  { href: '/store', label: 'Sách' },
]

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

function detectPlatform() {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

function InstallModal({ onClose }: { onClose: () => void }) {
  const platform = detectPlatform()

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm mx-0 sm:mx-4 p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="LangLearn" className="w-12 h-12 rounded-xl" />
            <div>
              <div className="font-bold text-[var(--color-text-main)]">LangLearn</div>
              <div className="text-xs text-[var(--color-text-muted)]">Thêm vào màn hình chính</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-border)]">
            <X size={18} />
          </button>
        </div>

        <div className="border-t border-[var(--color-border)]" />

        {/* Steps */}
        {platform === 'ios' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--color-text-main)]">Trên Safari (iOS):</p>
            <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <div className="flex items-start gap-2">
                <span className="bg-[#2563eb] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                <span>Nhấn nút <strong className="text-[var(--color-text-main)]">Chia sẻ</strong> <span className="text-base">⎙</span> ở thanh dưới Safari</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-[#2563eb] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                <span>Cuộn xuống, chọn <strong className="text-[var(--color-text-main)]">"Thêm vào màn hình chính"</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-[#2563eb] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                <span>Nhấn <strong className="text-[var(--color-text-main)]">Thêm</strong> là xong 🎉</span>
              </div>
            </div>
          </div>
        )}

        {platform === 'android' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--color-text-main)]">Trên Chrome (Android):</p>
            <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <div className="flex items-start gap-2">
                <span className="bg-[#2563eb] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                <span>Nhấn <strong className="text-[var(--color-text-main)]">⋮</strong> (menu 3 chấm) góc trên phải</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-[#2563eb] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                <span>Chọn <strong className="text-[var(--color-text-main)]">"Thêm vào màn hình chính"</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-[#2563eb] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                <span>Nhấn <strong className="text-[var(--color-text-main)]">Thêm</strong> là xong 🎉</span>
              </div>
            </div>
          </div>
        )}

        {platform === 'desktop' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--color-text-main)]">Trên Chrome / Edge (Desktop):</p>
            <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <div className="flex items-start gap-2">
                <span className="bg-[#2563eb] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                <span>Nhấn biểu tượng <strong className="text-[var(--color-text-main)]">⊕</strong> hoặc <strong className="text-[var(--color-text-main)]">màn hình</strong> ở thanh địa chỉ</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-[#2563eb] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                <span>Chọn <strong className="text-[var(--color-text-main)]">"Cài đặt LangLearn"</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-[#2563eb] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                <span>Nhấn <strong className="text-[var(--color-text-main)]">Cài đặt</strong> là xong 🎉</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Đã hiểu
        </button>
      </div>
    </div>
  )
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showInstall, setShowInstall] = useState(false)
  const { dark, toggle } = useDarkMode()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <>
      {/* Install modal */}
      {showInstall && <InstallModal onClose={() => setShowInstall(false)} />}

      {/* Desktop right side */}
      <div className="hidden md:flex items-center gap-3">
        {/* Install button */}
        <button
          onClick={() => setShowInstall(true)}
          aria-label="Tải ứng dụng"
          title="Thêm vào màn hình chính"
          className="flex items-center gap-1.5 text-sm text-[#2563EB] border border-[#2563EB] px-3 py-1.5 rounded-full hover:bg-[#2563EB] hover:text-white transition-colors font-medium"
        >
          <Download size={14} />
          Tải về
        </button>

        <button onClick={toggle} aria-label="Toggle dark mode"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-main)] transition-colors">
          {dark ? '☀️' : '🌙'}
        </button>
        {user ? (
          <>
            {user.role === 'ADMIN' && (
              <Link href="/admin" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
                Admin
              </Link>
            )}
            <Link href="/dashboard" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
              Dashboard
            </Link>
            <Link href="/profile" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
              Tài khoản
            </Link>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-[#2563EB] text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-[var(--color-text-main)]">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}
              className="text-sm text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
              Đăng xuất
            </Button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors">
              Đăng nhập
            </Link>
            <Link href="/register"
              className="bg-[#2563EB] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#2563EB]/90 transition-colors">
              Đăng ký
            </Link>
          </>
        )}
      </div>

      {/* Mobile: hamburger button */}
      <button
        className="md:hidden p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-border)] transition-colors"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Menu"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] shadow-lg z-50 md:hidden">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-main)] transition-colors">
                {link.label}
              </Link>
            ))}

            <div className="border-t border-[var(--color-border)] my-2" />

            {/* Install - mobile */}
            <button
              onClick={() => { setMenuOpen(false); setShowInstall(true) }}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-[#2563EB] font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2"
            >
              <Smartphone size={16} />
              Tải ứng dụng về máy
            </button>

            {/* Dark mode toggle mobile */}
            <button onClick={toggle}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-main)] transition-colors flex items-center gap-2">
              {dark ? '☀️ Chế độ sáng' : '🌙 Chế độ tối'}
            </button>

            <div className="border-t border-[var(--color-border)] my-2" />

            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#2563EB] text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-[var(--color-text-main)]">{user.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{user.email}</div>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-main)] transition-colors">
                  Dashboard
                </Link>
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-main)] transition-colors">
                  Tài khoản
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text-main)] transition-colors">
                    ⚙️ Quản trị
                  </Link>
                )}
                <button onClick={() => { setMenuOpen(false); handleLogout() }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-colors">
                  Đăng nhập
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}
                  className="block mx-3 my-1 px-4 py-2.5 rounded-full text-sm text-center bg-[#2563EB] text-white hover:bg-blue-700 transition-colors font-medium">
                  Đăng ký miễn phí
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
