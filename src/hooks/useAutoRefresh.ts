'use client'

import { useEffect } from 'react'

/**
 * Tự động refresh access token trước khi hết hạn.
 * Access token TTL = 15 phút → refresh định kỳ mỗi 12 phút.
 * KHÔNG refresh ngay khi mount để tránh write DB không cần thiết.
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

    // Chờ 12 phút rồi mới refresh lần đầu
    const interval = setInterval(refresh, 12 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
}
