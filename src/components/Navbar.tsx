import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const user = await getCurrentUser()

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between relative">
        {/* Logo + desktop nav — NavbarClient handles active states */}
        <NavbarClient user={user ? { name: user.email.split('@')[0], email: user.email, role: user.role } : null} />
      </div>
    </nav>
  )
}
