import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import StatsClient from '@/components/StatsClient'

export const dynamic = 'force-dynamic'

export default async function AdminStatsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  return <StatsClient />
}
