'use client'

import { useEffect, useRef, useState } from 'react'

// ── Sprite config ──────────────────────────────────────────────
const SPRITE_SIZE = 48   // px, display size
const SPEED       = 2.8  // px per frame
const IDLE_AFTER  = 2500 // ms without movement → idle

type Mood = 'idle' | 'walk' | 'jump' | 'wave' | 'sleep'

// Emoji per mood (fallback nếu không có sprite ảnh)
const MOOD_EMOJI: Record<Mood, string> = {
  idle:  '🐱',
  walk:  '🐱',
  jump:  '🐱',
  wave:  '😺',
  sleep: '😴',
}

const MOOD_ANIM: Record<Mood, string> = {
  idle:  'mascot-idle',
  walk:  'mascot-walk',
  jump:  'mascot-jump',
  wave:  'mascot-wave',
  sleep: 'mascot-sleep',
}

interface Vec2 { x: number; y: number }

export default function Mascot() {
  const [pos, setPos]       = useState<Vec2>({ x: 80, y: window?.innerHeight ? window.innerHeight - 120 : 600 })
  const [target, setTarget] = useState<Vec2 | null>(null)
  const [mood, setMood]     = useState<Mood>('idle')
  const [flip, setFlip]     = useState(false)
  const [bubble, setBubble] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)

  const posRef    = useRef(pos)
  const targetRef = useRef(target)
  const moodRef   = useRef(mood)
  const rafRef    = useRef<number>(0)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  posRef.current    = pos
  targetRef.current = target
  moodRef.current   = mood

  // ── Bubble messages ────────────────────────────────────────
  const BUBBLES = [
    'Học Tiếng Đức chưa? 📚', 'Ich liebe LangLearn! 🇩🇪',
    'Hallo! Wie geht\'s? 😄', 'Streak hôm nay chưa? 🔥',
    'Guten Morgen! ☀️', 'Click vào mình đi! 👆',
    'A1 → C1, mình đồng hành! 🚀', '*ngáp* zzz...', 'Wunderbar! ✨',
  ]

  function showBubble(msg?: string) {
    const text = msg ?? BUBBLES[Math.floor(Math.random() * BUBBLES.length)]
    setBubble(text)
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => setBubble(null), 3000)
  }

  // ── Idle mood cycle ────────────────────────────────────────
  function startIdleTimer() {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      const rand = Math.random()
      if (rand < 0.35) { setMood('wave'); showBubble() }
      else if (rand < 0.55) { setMood('sleep') }
      else { setMood('idle') }
    }, IDLE_AFTER + Math.random() * 3000)
  }

  // ── Click on page → mascot walks there ────────────────────
  useEffect(() => {
    function onPageClick(e: MouseEvent) {
      // ignore clicks on mascot itself
      const el = e.target as HTMLElement
      if (el.closest('#mascot-container')) return

      const newTarget = { x: e.clientX - SPRITE_SIZE / 2, y: e.clientY - SPRITE_SIZE }
      setTarget(newTarget)
      setMood('walk')
      setFlip(e.clientX < posRef.current.x)
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
    window.addEventListener('click', onPageClick)
    return () => window.removeEventListener('click', onPageClick)
  }, [])

  // ── Animation loop ─────────────────────────────────────────
  useEffect(() => {
    function loop() {
      const cur = posRef.current
      const tgt = targetRef.current

      if (tgt) {
        const dx = tgt.x - cur.x
        const dy = tgt.y - cur.y
        const dist = Math.hypot(dx, dy)

        if (dist < SPEED + 1) {
          setPos(tgt)
          setTarget(null)
          setMood('idle')
          startIdleTimer()
        } else {
          const nx = cur.x + (dx / dist) * SPEED
          const ny = cur.y + (dy / dist) * SPEED
          setPos({ x: nx, y: ny })
        }
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    startIdleTimer()
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (idleTimer.current) clearTimeout(idleTimer.current)
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    }
  }, []) // eslint-disable-line

  // ── Click mascot → jump + bubble ──────────────────────────
  function handleMascotClick(e: React.MouseEvent) {
    e.stopPropagation()
    setMood('jump')
    showBubble()
    setTimeout(() => { setMood('idle'); startIdleTimer() }, 700)
  }

  if (!visible) return null

  const emoji = MOOD_EMOJI[mood]
  const anim  = MOOD_ANIM[mood]

  return (
    <div
      id="mascot-container"
      style={{
        position: 'fixed',
        left: pos.x,
        top:  pos.y,
        zIndex: 9999,
        userSelect: 'none',
        pointerEvents: 'none',
        transition: target ? 'none' : 'left 0.1s, top 0.1s',
      }}
    >
      {/* Speech bubble */}
      {bubble && (
        <div style={{
          position: 'absolute',
          bottom: SPRITE_SIZE + 8,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--color-surface, #fff)',
          color: 'var(--color-text-main, #334155)',
          border: '2px solid var(--color-border, #e2e8f0)',
          borderRadius: 12,
          padding: '6px 12px',
          fontSize: 13,
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          pointerEvents: 'none',
          animation: 'bubble-pop 0.2s ease',
        }}>
          {bubble}
          {/* Triangle */}
          <div style={{
            position: 'absolute',
            bottom: -8, left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '8px solid var(--color-border, #e2e8f0)',
          }} />
        </div>
      )}

      {/* Mascot sprite */}
      <div
        className={anim}
        onClick={handleMascotClick}
        title="Click mình đi!"
        style={{
          width: SPRITE_SIZE,
          height: SPRITE_SIZE,
          fontSize: SPRITE_SIZE * 0.8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: flip ? 'scaleX(-1)' : 'scaleX(1)',
          cursor: 'pointer',
          pointerEvents: 'auto',
          lineHeight: 1,
          filter: mood === 'sleep' ? 'grayscale(0.3)' : 'none',
        }}
      >
        {emoji}
      </div>

      {/* Hide button */}
      <button
        onClick={(e) => { e.stopPropagation(); setVisible(false) }}
        style={{
          position: 'absolute',
          top: -8, right: -8,
          width: 18, height: 18,
          borderRadius: '50%',
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          fontSize: 10,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          opacity: 0,
          transition: 'opacity 0.2s',
        }}
        className="mascot-close"
      >
        ×
      </button>
    </div>
  )
}
