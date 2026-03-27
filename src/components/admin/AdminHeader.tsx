'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, LayoutDashboard, LogOut, Menu } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSidebar } from './AdminSidebar'

interface AdminHeaderProps {
  user: {
    email: string
    role: string
  }
}

const breadcrumbMap: Record<string, string> = {
  admin: 'Dashboard',
  users: 'Nguoi dung',
  courses: 'Khoa hoc',
  exercises: 'Bai tap',
  blog: 'Blog',
  lessons: 'Bai hoc',
  new: 'Them moi',
}

function useBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  const crumbs: { label: string; href: string }[] = []
  let current = ''

  for (const seg of segments) {
    current += '/' + seg
    const label = breadcrumbMap[seg] ?? seg
    crumbs.push({ label, href: current })
  }

  return crumbs
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const crumbs = useBreadcrumbs()
  const initials = user.email.slice(0, 2).toUpperCase()
  const { toggle } = useSidebar()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    window.location.href = '/login'
  }

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="md:hidden p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} className="text-muted-foreground/50" />}
              {i === crumbs.length - 1 ? (
                <span className="text-foreground font-medium">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground transition-colors hidden sm:inline">
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent transition-colors outline-none">
          <Avatar size="sm">
            <AvatarFallback className="text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground hidden sm:block max-w-[180px] truncate">
            {user.email}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            {user.email}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/admin" className="flex items-center gap-2 w-full">
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleLogout}
            className="cursor-pointer"
          >
            <LogOut size={14} />
            Dang xuat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
