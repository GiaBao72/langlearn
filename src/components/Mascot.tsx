'use client'

import { useEffect, useRef, useState } from 'react'

const LOTTIE_URL = 'https://lottie.host/eccea632-a01d-4f0f-a64f-e19fee566301/5xTW7sGdyf.lottie'
const SPEED    = 1.8
const MARGIN   = 20
const DOG_W    = 100
const PAUSE_MS = { min: 2000, max: 4500 }

const BUBBLES = [
  'Guten Tag! 🐾', 'Woof woof! 🐕',
  'Học Tiếng Đức chưa? 📚', 'Streak hôm nay chưa? 🔥',
  'Ich bin ein guter Hund! 🇩🇪', '*ngáp*... zzz 💤',
  'Wunderbar! ✨', 'A1→C1 mình đồng hành! 🚀',
  'Bạn giỏi lắm! 🏆', 'Hallo hallo! 👋',
]

// Khai báo cho TypeScript biết dotlottie-wc là custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string; autoplay?: boolean | string; loop?: boolean | string;
        style?: React.CSSProperties;
      }, HTMLElement>
    }
  }
}

export default function Mascot() {
  const [x, setX]           = useState(150)
  const [flip, setFlip]     = useState(false)
  const [bubble, setBubble] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)
  const [ready, setReady]   = useState(false)

  const xRef   = useRef(x)
  const dirRef = useRef(1)
  const paused = useRef(false)
  const rafRef = useRef<number>(0)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pauseTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  xRef.current = x

  // Load dotlottie-wc script từ CDN
  useEffect(() => {
    if (document.querySelector('script[data-lottie-wc]')) {
      setReady(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.3/dist/dotlottie-wc.js'
    script.type = 'module'
    script.dataset.lottieWc = '1'
    script.onload = () => setReady(true)
    document.head.appendChild(script)
  }, [])

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
    pauseTimer.current = setTimeout(() => {
      paused.current = false
    }, ms)
  }

  useEffect(() => {
    function loop() {
      if (!paused.current) {
        const maxX = window.innerWidth - DOG_W - MARGIN
        const cur  = xRef.current
        const dir  = dirRef.current
        const next = cur + SPEED * dir

        if (next >= maxX) {
          setX(maxX); dirRef.current = -1; setFlip(true); doPause()
        } else if (next <= MARGIN) {
          setX(MARGIN); dirRef.current = 1; setFlip(false); doPause()
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
    // Đổi hướng
    const newDir = dirRef.current * -1
    dirRef.current = newDir
    setFlip(newDir === -1)
    // Resume nếu đang pause
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
    >
      {/* Speech bubble */}
      {bubble && (
        <div style={{
          position: 'absolute',
          bottom: 96,
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

      {/* Lottie dog */}
      <div
        onClick={handleClick}
        style={{
          cursor: 'pointer',
          pointerEvents: 'auto',
          display: 'inline-block',
          transform: flip ? 'scaleX(-1)' : 'scaleX(1)',
          width: 100,
          height: 100,
        }}
      >
        {ready ? (
          <div
            ref={(el) => {
              if (el && !el.querySelector('dotlottie-wc')) {
                const lottie = document.createElement('dotlottie-wc')
                lottie.setAttribute('src', LOTTIE_URL)
                lottie.setAttribute('autoplay', '')
                lottie.setAttribute('loop', '')
                lottie.style.width = '100px'
                lottie.style.height = '100px'
                lottie.style.display = 'block'
                el.appendChild(lottie)
              }
            }}
            style={{ width: 100, height: 100 }}
          />
        ) : (
          <span style={{ fontSize: 52, lineHeight: 1, display: 'block' }}>🐕</span>
        )}
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
        }}
      >×</button>
    </div>
  )
}
