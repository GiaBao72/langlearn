import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <DashboardClient />
      </Suspense>
    </>
  )
}
