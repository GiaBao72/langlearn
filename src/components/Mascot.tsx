'use client'

import { useEffect, useRef, useState } from 'react'

type Mood = 'walk' | 'idle' | 'sleep' | 'wave'

// ── Dog SVG — mặc định nhìn sang PHẢI ────────────────────────
// Bố cục: thân giữa, đầu bên phải, đuôi bên trái
// flip=true khi đi sang trái
function DogSVG({ mood }: { mood: Mood }) {
  const isSleep = mood === 'sleep'
  const isWave  = mood === 'wave'
  const isWalk  = mood === 'walk'

  return (
    <svg
      width="80" height="60"
      viewBox="0 0 80 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
    >
      {/* === ĐUÔI (trái) === */}
      <path
        d="M14 36 Q4 28 6 18 Q8 12 13 18"
        stroke="#C8935A" strokeWidth="4" strokeLinecap="round" fill="none"
        style={{
          transformOrigin: '14px 36px',
          animation: isWalk
            ? 'dog-tail 0.35s ease-in-out infinite'
            : 'dog-tail 1.4s ease-in-out infinite',
        }}
      />

      {/* === THÂN === */}
      <ellipse cx="38" cy="42" rx="20" ry="11" fill="#E8B47A"/>
      {/* Bụng */}
      <ellipse cx="38" cy="44" rx="12" ry="7" fill="#F5D5A8"/>

      {/* === CHÂN SAU (trái) === */}
      <rect x="16" y="49" width="9" height="7" rx="4"
        fill="#C8935A"
        style={isWalk ? {
          transformOrigin: '20px 49px',
          animation: 'dog-leg-back 0.35s ease-in-out infinite',
        } : {}}
      />
      {/* === CHÂN TRƯỚC (phải) === */}
      <rect x="50" y="49" width="9" height="7" rx="4"
        fill="#C8935A"
        style={isWalk ? {
          transformOrigin: '54px 49px',
          animation: 'dog-leg-front 0.35s ease-in-out infinite',
        } : {}}
      />

      {/* === ĐẦU (bên phải) === */}
      <circle cx="60" cy="30" r="16" fill="#E8B47A"/>

      {/* === TAI === */}
      {/* Tai trên (gần đỉnh đầu) */}
      <path d="M52 17 Q48 6 56 10 Q62 8 58 19Z" fill="#C8935A"/>
      {/* Tai dưới / floppy (bên phải đầu) */}
      <path d="M72 20 Q80 16 78 28 Q76 34 70 30 Q74 23 72 20Z" fill="#C8935A"/>

      {/* === MÕM === */}
      <ellipse cx="72" cy="34" rx="7" ry="5.5" fill="#F5D5A8"/>
      {/* Mũi */}
      <ellipse cx="74" cy="32" rx="3" ry="2.2" fill="#5C3322"/>
      <ellipse cx="73.2" cy="31.4" rx="1" ry="0.7" fill="white" opacity="0.55"/>
      {/* Miệng */}
      <path d="M69 37 Q72 40.5 75 37" stroke="#8B5E3C" strokeWidth="1.8" strokeLinecap="round" fill="none"/>

      {/* === MẮT === */}
      {isSleep ? (
        <>
          <path d="M55 27 Q58 30 61 27" stroke="#5C3D1E" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
          <path d="M63 26 Q66 29 69 26" stroke="#5C3D1E" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
          <text x="44" y="20" fontSize="9" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="40" y="13" fontSize="7" fill="#94A3B8" fontWeight="bold" fontFamily="sans-serif">z</text>
        </>
      ) : (
        <>
          <circle cx="57" cy="27" r="3.5" fill="#3D2B1A"/>
          <circle cx="67" cy="27" r="3.5" fill="#3D2B1A"/>
          <circle cx="58.2" cy="25.8" r="1.2" fill="white"/>
          <circle cx="68.2" cy="25.8" r="1.2" fill="white"/>
          {isWave && (
            <>
              {/* Nheo mắt vui */}
              <path d="M54 26 Q57 23 60 26" stroke="#3D2B1A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
              <path d="M64 26 Q67 23 70 26" stroke="#3D2B1A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
            </>
          )}
        </>
      )}

      {/* === MÁ HỒNG === */}
      <ellipse cx="54" cy="33" rx="3.5" ry="2.2" fill="#F4A261" opacity="0.35"/>
      <ellipse cx="70" cy="33" rx="3.5" ry="2.2" fill="#F4A261" opacity="0.35"/>

      {/* === CHÂN VẪY KHI WAVE === */}
      {isWave && (
        <g style={{ transformOrigin: '54px 49px', animation: 'dog-wave-paw 0.5s ease-in-out infinite' }}>
          <rect x="50" y="44" width="9" height="7" rx="4" fill="#E8B47A"/>
          <ellipse cx="54" cy="44" rx="5" ry="3" fill="#F5D5A8"/>
        </g>
      )}
    </svg>
  )
}

// ── Config ────────────────────────────────────────────────────
const SPEED    = 1.6
const MARGIN   = 60
const PAUSE_MS = { min: 1800, max: 4500 }

export default function Mascot() {
  const [x, setX]         = useState(120)
  const [flip, setFlip]   = useState(false)   // true = đi trái
  const [mood, setMood]   = useState<Mood>('walk')
  const [bubble, setBubble] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)

  const xRef    = useRef(x)
  const dirRef  = useRef(1)   // 1=phải, -1=trái
  const paused  = useRef(false)
  const rafRef  = useRef<number>(0)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pauseTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  xRef.current = x

  const BUBBLES = [
    'Guten Tag! 🐾', 'Woof! 🐶',
    'Học Tiếng Đức chưa? 📚', 'Streak hôm nay chưa? 🔥',
    'Ich bin ein guter Hund! 🇩🇪', '*ngáp*... zzz 💤',
    'Wunderbar! ✨', 'A1→C1 mình đồng hành! 🚀',
    'Bạn giỏi lắm! 🏆', 'Hallo hallo! 👋',
  ]

  function showBubble() {
    const msg = BUBBLES[Math.floor(Math.random() * BUBBLES.length)]
    setBubble(msg)
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => setBubble(null), 3200)
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
    // dogWidth ~80px
    const dogW = 80

    function loop() {
      if (!paused.current) {
        const maxX = window.innerWidth - dogW - MARGIN
        const cur  = xRef.current
        const dir  = dirRef.current
        const next = cur + SPEED * dir

        if (next >= maxX) {
          // chạm tường phải → quay trái
          setX(maxX)
          dirRef.current = -1
          setFlip(true)    // flip=true = nhìn trái
          doPause()
        } else if (next <= MARGIN) {
          // chạm tường trái → quay phải
          setX(MARGIN)
          dirRef.current = 1
          setFlip(false)   // flip=false = nhìn phải (mặc định)
          doPause()
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
    if (pauseTimer.current) clearTimeout(pauseTimer.current)
    paused.current = true
    setMood('wave')
    showBubble()
    pauseTimer.current = setTimeout(() => {
      paused.current = false
      setMood('walk')
    }, 3400)
  }

  if (!visible) return null

  return (
    <div
      id="mascot-wrap"
      style={{
        position: 'fixed',
        left: x,
        bottom: 0,         // sat đáy màn hình
        zIndex: 9999,
        userSelect: 'none',
        pointerEvents: 'none',
        // flip toàn bộ wrapper
        transform: flip ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      {/* Bubble — luôn không bị flip */}
      {bubble && (
        <div style={{
          position: 'absolute',
          bottom: 64,
          left: '50%',
          transform: flip
            ? 'translateX(-50%) scaleX(-1)'
            : 'translateX(-50%)',
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
          {/* Tam giác dưới */}
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
        <DogSVG mood={mood} />
      </div>

      {/* Nút ẩn — không bị flip */}
      <button
        onClick={(e) => { e.stopPropagation(); setVisible(false) }}
        className="mascot-close"
        style={{
          position: 'absolute',
          top: 4, right: -4,
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
          transform: flip ? 'scaleX(-1)' : 'none',
        }}
      >×</button>
    </div>
  )
}
