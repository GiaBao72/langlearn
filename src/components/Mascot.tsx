'use client'

import { useEffect, useRef, useState } from 'react'

type Mood = 'walk' | 'idle' | 'sleep' | 'wave'

// ── Cute dog SVG ───────────────────────────────────────────────
function DogSVG({ mood, flip }: { mood: Mood; flip: boolean }) {
  const isSleep = mood === 'sleep'
  const isWave  = mood === 'wave'
  const isWalk  = mood === 'walk'

  return (
    <svg
      width="64" height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: flip ? 'scaleX(-1)' : 'scaleX(1)', overflow: 'visible' }}
    >
      {/* === TAIL === */}
      <path
        d="M48 40 Q56 34 54 26 Q52 20 48 25"
        stroke="#C8935A" strokeWidth="3.5" strokeLinecap="round" fill="none"
        style={isWalk ? { transformOrigin: '48px 40px', animation: 'dog-tail 0.4s ease-in-out infinite' } : { transformOrigin: '48px 40px', animation: 'dog-tail 1.2s ease-in-out infinite' }}
      />

      {/* === BODY === */}
      <ellipse cx="34" cy="44" rx="16" ry="10" fill="#E8B47A"/>
      {/* Belly */}
      <ellipse cx="33" cy="46" rx="9" ry="6" fill="#F5D5A8"/>

      {/* === LEGS === */}
      {/* Back legs */}
      <rect x="43" y="51" width="7" height="5" rx="3" fill="#C8935A"/>
      {/* Front legs */}
      <rect x="18" y="51" width="7" height="5" rx="3" fill="#C8935A"/>

      {/* === HEAD === */}
      <circle cx="22" cy="30" r="13" fill="#E8B47A"/>

      {/* === EARS === */}
      {/* Left ear — floppy down */}
      <path d="M12 22 Q6 16 9 28 Q11 33 15 30 Q12 24 12 22Z" fill="#C8935A"/>
      {/* Right ear */}
      <path d="M30 21 Q36 15 33 27 Q31 32 27 29 Q30 23 30 21Z" fill="#C8935A"/>

      {/* === SNOUT === */}
      <ellipse cx="20" cy="34" rx="6" ry="4.5" fill="#F5D5A8"/>
      {/* Nose */}
      <ellipse cx="19" cy="32.5" rx="2.5" ry="1.8" fill="#6B3F1F"/>
      {/* Nose shine */}
      <ellipse cx="18.2" cy="32" rx="0.8" ry="0.6" fill="white" opacity="0.6"/>

      {/* === MOUTH === */}
      <path d="M16 36 Q19 39 22 36" stroke="#8B5E3C" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

      {/* === EYES === */}
      {isSleep ? (
        <>
          <path d="M17 27 Q19 29.5 21 27" stroke="#5C3D1E" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <path d="M23 26.5 Q25 29 27 26.5" stroke="#5C3D1E" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <text x="32" y="22" fontSize="8" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="36" y="16" fontSize="6" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
        </>
      ) : (
        <>
          <circle cx="19" cy="27" r="3" fill="#3D2B1A"/>
          <circle cx="26" cy="27" r="3" fill="#3D2B1A"/>
          <circle cx="20" cy="26" r="1" fill="white"/>
          <circle cx="27" cy="26" r="1" fill="white"/>
          {isWave && (
            <>
              <path d="M17 26 Q19 24 21 26" stroke="#3D2B1A" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
              <path d="M24 26 Q26 24 28 26" stroke="#3D2B1A" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
            </>
          )}
        </>
      )}

      {/* === BLUSH === */}
      <ellipse cx="14" cy="33" rx="3" ry="2" fill="#F4A261" opacity="0.35"/>
      <ellipse cx="26" cy="33" rx="3" ry="2" fill="#F4A261" opacity="0.35"/>

      {/* === WAVE PAW === */}
      {isWave && (
        <g style={{ transformOrigin: '20px 50px', animation: 'dog-wave-paw 0.5s ease-in-out infinite' }}>
          <rect x="16" y="48" width="8" height="5" rx="3" fill="#E8B47A"/>
          <ellipse cx="20" cy="48" rx="4" ry="2.5" fill="#F5D5A8"/>
        </g>
      )}

      {/* === WALK LEG ANIMATION === */}
      {isWalk && (
        <>
          <rect x="43" y="51" width="7" height="5" rx="3" fill="#C8935A"
            style={{ transformOrigin: '46px 51px', animation: 'dog-leg-back 0.4s ease-in-out infinite' }}/>
          <rect x="18" y="51" width="7" height="5" rx="3" fill="#C8935A"
            style={{ transformOrigin: '21px 51px', animation: 'dog-leg-front 0.4s ease-in-out infinite' }}/>
        </>
      )}
    </svg>
  )
}

// ── Sprite config ──────────────────────────────────────────────
const SPEED    = 1.8   // px per frame — chạy vừa phải
const MARGIN   = 80    // px from edge before turning
const BOTTOM   = 72    // px from bottom of viewport
const PAUSE_MS = { min: 1500, max: 4000 }

export default function Mascot() {
  const [x, setX]           = useState(100)
  const [flip, setFlip]     = useState(false)
  const [mood, setMood]     = useState<Mood>('walk')
  const [bubble, setBubble] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)

  const xRef    = useRef(x)
  const flipRef = useRef(flip)
  const moodRef = useRef(mood)
  const dirRef  = useRef(1)  // 1 = right, -1 = left
  const rafRef  = useRef<number>(0)
  const pauseRef   = useRef(false)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  xRef.current    = x
  flipRef.current = flip
  moodRef.current = mood

  const BUBBLES = [
    'Guten Tag! 🐾', 'Woof woof! 🐶',
    'Học Tiếng Đức chưa? 📚', 'Streak hôm nay chưa? 🔥',
    'Ich bin ein guter Hund! 🇩🇪', '*ngáp*... zzz 💤',
    'Wunderbar! ✨', 'A1→C1 mình đồng hành! 🚀', 'Bạn giỏi lắm! 🏆',
  ]

  function showBubble() {
    const msg = BUBBLES[Math.floor(Math.random() * BUBBLES.length)]
    setBubble(msg)
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => setBubble(null), 3000)
  }

  function doPause() {
    pauseRef.current = true
    // random mood while pausing
    const rand = Math.random()
    if (rand < 0.4) { setMood('wave'); showBubble() }
    else if (rand < 0.6) { setMood('sleep') }
    else { setMood('idle') }

    const ms = PAUSE_MS.min + Math.random() * (PAUSE_MS.max - PAUSE_MS.min)
    setTimeout(() => {
      pauseRef.current = false
      setMood('walk')
    }, ms)
  }

  // ── Main movement loop ─────────────────────────────────────
  useEffect(() => {
    const maxX = () => window.innerWidth - MARGIN

    function loop() {
      if (!pauseRef.current) {
        const cur = xRef.current
        const dir = dirRef.current
        const next = cur + SPEED * dir

        // Hit right wall
        if (next >= maxX()) {
          dirRef.current = -1
          setFlip(true)
          doPause()
        }
        // Hit left wall
        else if (next <= MARGIN) {
          dirRef.current = 1
          setFlip(false)
          doPause()
        }
        else {
          setX(next)
        }
      }
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    }
  }, []) // eslint-disable-line

  // ── Click mascot → random mood + bubble ───────────────────
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    setMood('wave')
    showBubble()
    pauseRef.current = true
    setTimeout(() => {
      pauseRef.current = false
      setMood('walk')
    }, 3200)
  }

  if (!visible) return null

  const bottom = BOTTOM

  return (
    <div
      id="mascot-wrap"
      style={{
        position: 'fixed',
        left: x,
        bottom: bottom,
        zIndex: 9999,
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {/* Speech bubble */}
      {bubble && (
        <div style={{
          position: 'absolute',
          bottom: 68,
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
          <div style={{
            position: 'absolute',
            bottom: -9, left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '9px solid var(--color-border, #e2e8f0)',
          }}/>
          <div style={{
            position: 'absolute',
            bottom: -6, left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '7px solid var(--color-surface, #fff)',
          }}/>
        </div>
      )}

      {/* Dog */}
      <div
        onClick={handleClick}
        style={{ cursor: 'pointer', pointerEvents: 'auto', display: 'inline-block' }}
      >
        <DogSVG mood={mood} flip={flip} />
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); setVisible(false) }}
        className="mascot-close"
        style={{
          position: 'absolute',
          top: -4, right: -4,
          width: 18, height: 18,
          borderRadius: '50%',
          background: '#ef4444',
          color: '#fff',
          border: 'none',
          fontSize: 11,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          opacity: 0,
          transition: 'opacity 0.2s',
          lineHeight: 1,
        }}
      >×</button>
    </div>
  )
}
