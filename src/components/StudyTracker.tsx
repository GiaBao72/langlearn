'use client'

import { useEffect, useRef } from 'react'

interface Props {
  lessonId?: string
}

// Nhúng vào trang học — tự động track session, ping mỗi 30s
export default function StudyTracker({ lessonId }: Props) {
  const sessionIdRef = useRef<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const endedRef = useRef(false)

  async function startSession() {
    try {
      const res = await fetch('/api/study/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId }),
      })
      const data = await res.json()
      if (data.sessionId) {
        sessionIdRef.current = data.sessionId
      }
    } catch {}
  }

  async function ping() {
    if (!sessionIdRef.current || endedRef.current) return
    try {
      await fetch('/api/study/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionIdRef.current }),
      })
    } catch {}
  }

  async function endSession() {
    if (!sessionIdRef.current || endedRef.current) return
    endedRef.current = true
    try {
      // dùng sendBeacon nếu có (unload), fallback fetch
      const body = JSON.stringify({ sessionId: sessionIdRef.current })
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/study/end', new Blob([body], { type: 'application/json' }))
      } else {
        await fetch('/api/study/end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true })
      }
    } catch {}
  }

  useEffect(() => {
    startSession()

    // Ping mỗi 30s
    intervalRef.current = setInterval(ping, 30_000)

    // End khi rời trang
    window.addEventListener('beforeunload', endSession)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') ping()
    })

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      window.removeEventListener('beforeunload', endSession)
      endSession()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId])

  return null // invisible component
}
