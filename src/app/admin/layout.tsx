import { AdminSidebar, AdminSidebarProvider } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const user = token ? verifyAccessToken(token) : null

  if (!user || user.role !== 'ADMIN') redirect('/login')

  return (
    <AdminSidebarProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <AdminHeader user={{ email: user.email, role: user.role }} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminSidebarProvider>
  )
}
