'use client'

import { useEffect, useRef, useState } from 'react'

type Mood = 'walk' | 'idle' | 'sleep' | 'wave'

const SPEED    = 1.8
const MARGIN   = 20
const DOG_W    = 72
const PAUSE_MS = { min: 1800, max: 4200 }

const BUBBLES = [
  'Guten Tag! 🐾', 'Woof woof! 🐕',
  'Học Tiếng Đức chưa? 📚', 'Streak hôm nay chưa? 🔥',
  'Ich bin ein guter Hund! 🇩🇪', '*ngáp*... zzz 💤',
  'Wunderbar! ✨', 'A1→C1 mình đồng hành! 🚀',
  'Bạn giỏi lắm! 🏆', 'Hallo hallo! 👋',
]

// Emoji theo mood
const BODY: Record<Mood, string> = {
  walk:  '🐕',
  idle:  '🐶',
  wave:  '🐶',
  sleep: '🐶',
}

export default function Mascot() {
  const [x, setX]           = useState(150)
  const [flip, setFlip]     = useState(false)
  const [mood, setMood]     = useState<Mood>('walk')
  const [bubble, setBubble] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)

  const xRef   = useRef(x)
  const dirRef = useRef(1)
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
    const rand = Math.random()
    if (rand < 0.45)      { setMood('wave');  showBubble() }
    else if (rand < 0.65) { setMood('sleep') }
    else                  { setMood('idle') }

    const ms = PAUSE_MS.min + Math.random() * (PAUSE_MS.max - PAUSE_MS.min)
    if (pauseTimer.current) clearTimeout(pauseTimer.current)
    pauseTimer.current = setTimeout(() => {
      paused.current = false
      setMood('walk')
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
    if (paused.current) {
      paused.current = false
      if (pauseTimer.current) clearTimeout(pauseTimer.current)
      const newDir = dirRef.current * -1
      dirRef.current = newDir
      setFlip(newDir === -1)
      setMood('walk')
    } else {
      const newDir = dirRef.current * -1
      dirRef.current = newDir
      setFlip(newDir === -1)
    }
    showBubble()
  }

  if (!visible) return null

  // animation class
  const animClass =
    mood === 'walk'  ? 'mascot-walk'  :
    mood === 'wave'  ? 'mascot-wave'  :
    mood === 'sleep' ? 'mascot-sleep' : 'mascot-idle'

  return (
    <div
      id="mascot-wrap"
      style={{
        position: 'fixed',
        left: x,
        bottom: 4,
        zIndex: 9999,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {/* Bubble */}
      {bubble && (
        <div style={{
          position: 'absolute',
          bottom: 72,
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

      {/* Mascot body */}
      <div
        className={animClass}
        onClick={handleClick}
        style={{
          fontSize: 52,
          lineHeight: 1,
          display: 'inline-block',
          cursor: 'pointer',
          pointerEvents: 'auto',
          transform: flip ? 'scaleX(-1)' : 'scaleX(1)',
          filter: mood === 'sleep' ? 'grayscale(0.2) brightness(0.9)' : 'none',
          transition: 'filter 0.3s',
          userSelect: 'none',
        }}
      >
        {BODY[mood]}
        {/* Zzz khi ngủ */}
        {mood === 'sleep' && (
          <span style={{
            position: 'absolute',
            top: -8, right: -12,
            fontSize: 16,
            animation: 'mascot-zzz 1.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}>💤</span>
        )}
        {/* Paw khi wave */}
        {mood === 'wave' && (
          <span style={{
            position: 'absolute',
            top: -10, right: -16,
            fontSize: 20,
            animation: 'dog-wave-paw 0.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}>🐾</span>
        )}
      </div>

      {/* Close btn */}
      <button
        onClick={(e) => { e.stopPropagation(); setVisible(false) }}
        className="mascot-close"
        style={{
          position: 'absolute',
          top: 0, right: -8,
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
