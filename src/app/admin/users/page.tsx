import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyAccessToken } from '@/lib/auth'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import UserActionsClient from '@/components/UserActionsClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  const me = token ? verifyAccessToken(token) : null

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý người dùng</h1>
        <p className="text-sm text-muted-foreground mt-1">{users.length} người dùng</p>
      </div>

      {/* Mobile: card list */}
      <div className="sm:hidden space-y-3">
        {users.map((u) => (
          <div key={u.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div>
              <div className="font-medium text-foreground text-sm">{u.email}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{u.name ?? '—'}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {u.role}
              </span>
              <span className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
            <UserActionsClient user={u} currentUserId={me?.userId ?? ''} />
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center text-muted-foreground py-12">Chưa có người dùng nào</div>
        )}
      </div>

      {/* Desktop: table */}
      <Card className="hidden sm:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right w-56">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">{u.name ?? '—'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActionsClient user={u} currentUserId={me?.userId ?? ''} />
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    Chưa có người dùng nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
