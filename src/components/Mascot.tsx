'use client'

import { useEffect, useRef, useState } from 'react'

const LOTTIE_URL = 'https://lottie.host/eccea632-a01d-4f0f-a64f-e19fee566301/5xTW7sGdyf.lottie'

// Mount dotlottie-wc một lần duy nhất — không re-render khi parent state thay đổi
function LottieDog() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const lottie = document.createElement('dotlottie-wc')
    lottie.setAttribute('src', LOTTIE_URL)
    lottie.setAttribute('autoplay', '')
    lottie.setAttribute('loop', '')
    lottie.style.cssText = 'width:72px;height:72px;display:block'
    el.appendChild(lottie)
    return () => { el.innerHTML = '' }
  }, [])
  return <div ref={ref} style={{ width: 72, height: 72 }} />
}
const SPEED    = 0.9
const MARGIN   = 20
const DOG_W    = 72
const PAUSE_MS = { min: 800, max: 1800 }

const BUBBLES = [
  'Guten Tag! 🐾', 'Woof woof! 🐕',
  'Học Tiếng Đức chưa? 📚', 'Streak hôm nay chưa? 🔥',
  'Ich bin ein guter Hund! 🇩🇪', '*ngáp*... zzz 💤',
  'Wunderbar! ✨', 'A1→C1 mình đồng hành! 🚀',
  'Bạn giỏi lắm! 🏆', 'Hallo hallo! 👋',
]

export default function Mascot() {
  const [x, setX]           = useState(150)
  const [flip, setFlip]     = useState(true)  // Lottie mặc định nhìn trái → flip=true để nhìn phải
  const [bubble, setBubble] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)

  const xRef   = useRef(x)
  const dirRef = useRef(1)   // bắt đầu đi phải
  const paused = useRef(false)
  const rafRef = useRef<number>(0)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pauseTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  xRef.current = x

  function showBubble() {
    const msg = BUBBLES[Math.floor(Math.random() * BUBBLES.length)]
    setBubble(msg)
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => setBubble(null), 3000)
  }

  function doPause() {
    paused.current = true
    if (Math.random() < 0.5) showBubble()
    const ms = PAUSE_MS.min + Math.random() * (PAUSE_MS.max - PAUSE_MS.min)
    if (pauseTimer.current) clearTimeout(pauseTimer.current)
    pauseTimer.current = setTimeout(() => { paused.current = false }, ms)
  }

  useEffect(() => {
    function loop() {
      if (!paused.current) {
        const maxX = window.innerWidth - DOG_W - MARGIN
        const cur  = xRef.current
        const dir  = dirRef.current
        const next = cur + SPEED * dir
        if (next >= maxX) {
          setX(maxX); dirRef.current = -1; setFlip(false); doPause()  // đi trái → không flip (nhìn trái = mặc định lottie)
        } else if (next <= MARGIN) {
          setX(MARGIN); dirRef.current = 1; setFlip(true); doPause()  // đi phải → flip (nhìn phải)
        } else {
          setX(next)
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
      if (pauseTimer.current)  clearTimeout(pauseTimer.current)
    }
  }, []) // eslint-disable-line

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    const newDir = dirRef.current * -1
    dirRef.current = newDir
    setFlip(newDir === 1)  // đi phải → flip=true, đi trái → flip=false
    if (paused.current) {
      paused.current = false
      if (pauseTimer.current) clearTimeout(pauseTimer.current)
    }
    showBubble()
  }

  if (!visible) return null

  return (
    <div
      id="mascot-wrap"
      style={{
        position: 'fixed',
        left: x,
        bottom: 0,
        zIndex: 9999,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >      {/* Speech bubble — KHÔNG flip */}
      {bubble && (
        <div style={{
          position: 'absolute',
          bottom: 76,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-surface, #fff)',
          color: 'var(--color-text-main, #334155)',
          border: '2px solid var(--color-border, #e2e8f0)',
          borderRadius: 12,
          padding: '6px 14px',
          fontSize: 13,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
          pointerEvents: 'none',
          animation: 'bubble-pop 0.2s ease',
        }}>
          {bubble}
          <div style={{
            position: 'absolute', bottom: -9, left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '9px solid var(--color-border, #e2e8f0)',
          }}/>
          <div style={{
            position: 'absolute', bottom: -6, left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '7px solid var(--color-surface, #fff)',
          }}/>
        </div>
      )}

      {/* Lottie dog — CHỈ flip con chó, không flip bubble */}
      <div
        onClick={handleClick}
        style={{
          cursor: 'pointer',
          pointerEvents: 'auto',
          display: 'inline-block',
          transform: flip ? 'scaleX(-1)' : 'scaleX(1)',
        }}
      >
        <LottieDog />
      </div>

      {/* Close btn */}
      <button
        onClick={(e) => { e.stopPropagation(); setVisible(false) }}
        className="mascot-close"
        style={{
          position: 'absolute',
          top: 4, right: -8,
          width: 20, height: 20,
          borderRadius: '50%',
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          fontSize: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          opacity: 0,
          transition: 'opacity 0.2s',
          transform: flip ? 'scaleX(-1)' : 'none',
        }}
      >×</button>
    </div>
  )
}
