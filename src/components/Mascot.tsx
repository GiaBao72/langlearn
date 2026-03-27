'use client'

import { useEffect, useRef, useState } from 'react'

// ── Cute dog SVG ───────────────────────────────────────────────
function DogSVG({ mood }: { mood: Mood }) {
  const isSleep = mood === 'sleep'
  const isWave  = mood === 'wave'
  const isJump  = mood === 'jump'

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tail */}
      <path d="M36 34 Q44 28 42 22 Q40 18 37 22" stroke="#C8935A" strokeWidth="3" strokeLinecap="round" fill="none"
        style={mood==='walk'||mood==='idle' ? {transformOrigin:'36px 34px', animation:'dog-tail 0.5s ease-in-out infinite'} : {}}
      />
      {/* Body */}
      <ellipse cx="24" cy="33" rx="13" ry="9" fill="#E8B47A"/>
      {/* Belly patch */}
      <ellipse cx="23" cy="35" rx="7" ry="5" fill="#F5D5A8"/>
      {/* Back leg */}
      <ellipse cx="34" cy="41" rx="4" ry="3" fill="#C8935A"/>
      {/* Front leg */}
      <ellipse cx="15" cy="41" rx="4" ry="3" fill="#C8935A"/>
      {/* Head */}
      <circle cx="18" cy="22" r="11" fill="#E8B47A"/>
      {/* Snout */}
      <ellipse cx="14" cy="25" rx="5" ry="4" fill="#F5D5A8"/>
      {/* Nose */}
      <ellipse cx="13" cy="24" rx="2" ry="1.5" fill="#8B5E3C"/>
      {/* Left ear (floppy) */}
      <path d="M10 14 Q5 10 7 20 Q9 24 12 22 Q10 16 10 14Z" fill="#C8935A"/>
      {/* Right ear */}
      <path d="M24 13 Q29 8 27 18 Q25 22 22 21 Q24 15 24 13Z" fill="#C8935A"/>

      {/* Eyes */}
      {isSleep ? (
        <>
          {/* Closed eyes — sleep lines */}
          <path d="M15 20 Q17 22 19 20" stroke="#5C3D1E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M21 19 Q22 21 23 19" stroke="#5C3D1E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          {/* Zzz */}
          <text x="26" y="14" fontSize="7" fill="#94A3B8" fontWeight="bold">z</text>
          <text x="29" y="10" fontSize="5" fill="#94A3B8" fontWeight="bold">z</text>
        </>
      ) : (
        <>
          <circle cx="16" cy="20" r="2.5" fill="#5C3D1E"/>
          <circle cx="22" cy="20" r="2.5" fill="#5C3D1E"/>
          {/* Shine */}
          <circle cx="17" cy="19" r="0.8" fill="white"/>
          <circle cx="23" cy="19" r="0.8" fill="white"/>
          {/* Happy squint on wave/jump */}
          {(isWave || isJump) && (
            <>
              <path d="M14 19 Q16 17 18 19" stroke="#5C3D1E" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>
              <path d="M20 19 Q22 17 24 19" stroke="#5C3D1E" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>
            </>
          )}
        </>
      )}

      {/* Mouth */}
      {isWave || isJump
        ? <path d="M12 27 Q14 30 16 27" stroke="#8B5E3C" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        : <path d="M12 27 Q14 29 16 27" stroke="#8B5E3C" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      }
      {/* Tongue on jump */}
      {isJump && <ellipse cx="14" cy="29" rx="2" ry="1.5" fill="#F87171"/>}

      {/* Blush cheeks */}
      <ellipse cx="11" cy="26" rx="2.5" ry="1.5" fill="#F4A261" opacity="0.4"/>
      <ellipse cx="21" cy="26" rx="2.5" ry="1.5" fill="#F4A261" opacity="0.4"/>

      {/* Wave paw */}
      {isWave && (
        <g style={{transformOrigin:'15px 38px', animation:'dog-wave-paw 0.5s ease-in-out infinite'}}>
          <ellipse cx="15" cy="38" rx="4" ry="3" fill="#E8B47A"/>
          <ellipse cx="15" cy="37" rx="3" ry="2" fill="#F5D5A8"/>
        </g>
      )}
    </svg>
  )
}

// ── Sprite config ──────────────────────────────────────────────
const SPRITE_SIZE = 48   // px, display size
const SPEED       = 2.8  // px per frame
const IDLE_AFTER  = 2500 // ms without movement → idle

type Mood = 'idle' | 'walk' | 'jump' | 'wave' | 'sleep'

// Emoji per mood (fallback nếu không có sprite ảnh)
const MOOD_EMOJI: Record<Mood, string> = {
  idle:  '🐶',
  walk:  '🐕',
  jump:  '🐶',
  wave:  '🐾',
  sleep: '🐩',
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
    'Woof! Học Tiếng Đức chưa? 📚', 'Guten Tag! 🐾',
    'Hallo! Wie geht\'s? 🐶', 'Streak hôm nay chưa? 🔥',
    'Ich bin ein guter Hund! 🇩🇪', 'Cún muốn học cùng bạn! 🎓',
    'A1 → C1, cún đồng hành! 🚀', '*ngáp* ...zzz 💤', 'Wunderbar! ✨',
    'Bạn giỏi lắm! 🏆', 'Woof woof! 🐕',
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
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          transform: flip ? 'scaleX(-1)' : 'scaleX(1)',
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      >
        <DogSVG mood={mood} />
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
