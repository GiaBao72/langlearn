'use client'

import { useEffect } from 'react'

/**
 * Tự động refresh access token.
 * - Refresh ngay khi mount (phòng token hết hạn sau khi tab idle)
 * - Sau đó refresh định kỳ mỗi 12 phút (access token TTL = 15 phút)
 */
export default function useAutoRefresh() {
  useEffect(() => {
    async function refresh() {
      try {
        await fetch('/api/auth/refresh', { method: 'POST' })
      } catch {
        // silent fail — middleware redirect khi cần
      }
    }

    // Refresh ngay khi mount để đổi mới token nếu đã gần hết hạn
    refresh()

    const interval = setInterval(refresh, 12 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
}
