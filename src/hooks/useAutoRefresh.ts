'use client'

import { useEffect } from 'react'

/**
 * Tự động refresh access token trước khi hết hạn.
 * Access token TTL = 15 phút → refresh mỗi 12 phút.
 */
export default function useAutoRefresh() {
  useEffect(() => {
    async function refresh() {
      try {
        await fetch('/api/auth/refresh', { method: 'POST' })
      } catch {
        // silent fail — middleware sẽ redirect nếu cần
      }
    }

    // Refresh ngay lần đầu (phòng token sắp hết hạn)
    refresh()

    // Refresh định kỳ mỗi 12 phút
    const interval = setInterval(refresh, 12 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
}
