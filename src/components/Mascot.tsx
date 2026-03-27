'use client'

import { useEffect, useRef, useState } from 'react'

type Mood = 'walk' | 'idle' | 'sleep' | 'wave'

/**
 * Dog SVG — viewBox 100x70
 * Mặc định nhìn sang PHẢI
 * Bố cục:
 *   - Thân: ellipse giữa (cx=45, cy=52)
 *   - Đầu: circle bên phải (cx=72, cy=36) — nối với thân
 *   - Đuôi: bên trái thân
 *   - Chân trước: dưới đầu (x~65)
 *   - Chân sau: dưới đuôi (x~22)
 */
function DogSVG({ mood }: { mood: Mood }) {
  const isSleep = mood === 'sleep'
  const isWave  = mood === 'wave'
  const isWalk  = mood === 'walk'

  return (
    <svg width="100" height="70" viewBox="0 0 100 70" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', overflow: 'visible' }}>

      {/* ĐUÔI — gốc tại (18,48), cong lên trái */}
      <path d="M18 48 Q6 38 10 24 Q12 16 18 24"
        stroke="#C8935A" strokeWidth="4" strokeLinecap="round" fill="none"
        style={{
          transformOrigin: '18px 48px',
          animation: isWalk
            ? 'dog-tail 0.38s ease-in-out infinite'
            : 'dog-tail 1.5s ease-in-out infinite',
        }}
      />

      {/* THÂN — ellipse nằm ngang */}
      <ellipse cx="46" cy="50" rx="24" ry="13" fill="#E8B47A"/>
      {/* Bụng sáng */}
      <ellipse cx="46" cy="53" rx="15" ry="8" fill="#F5D5A8"/>

      {/* CHÂN SAU — dưới đuôi */}
      <rect x="20" y="59" width="11" height="8" rx="4" fill="#C8935A"
        style={isWalk ? {
          transformOrigin: '25px 59px',
          animation: 'dog-leg-back 0.38s ease-in-out infinite',
        } : {}}
      />
      {/* CHÂN TRƯỚC — dưới đầu */}
      <rect x="62" y="59" width="11" height="8" rx="4" fill="#C8935A"
        style={isWalk ? {
          transformOrigin: '67px 59px',
          animation: 'dog-leg-front 0.38s ease-in-out infinite',
        } : {}}
      />

      {/* ĐẦU — cx=72 nối liền thân */}
      <circle cx="72" cy="34" r="18" fill="#E8B47A"/>

      {/* TAI TRÁI (trên đỉnh đầu) — hình giọt nước */}
      <ellipse cx="64" cy="18" rx="6" ry="10"
        transform="rotate(-15 64 18)" fill="#C8935A"/>
      {/* TAI PHẢI (floppy, cạnh phải đầu) */}
      <ellipse cx="86" cy="26" rx="5" ry="9"
        transform="rotate(20 86 26)" fill="#C8935A"/>

      {/* MÕM — ellipse nhô ra phải */}
      <ellipse cx="86" cy="40" rx="8" ry="6" fill="#F5D5A8"/>
      {/* Mũi */}
      <ellipse cx="88" cy="37.5" rx="3.5" ry="2.5" fill="#4A2810"/>
      {/* Shine mũi */}
      <circle cx="87" cy="36.8" r="1" fill="white" opacity="0.6"/>
      {/* Miệng */}
      <path d="M82 43 Q86 47 90 43"
        stroke="#8B5E3C" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* MẮT */}
      {isSleep ? (
        <>
          <path d="M64 31 Q67 34 70 31"
            stroke="#4A2810" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M74 30 Q77 33 80 30"
            stroke="#4A2810" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          {/* Zzz */}
          <text x="50" y="22" fontSize="10" fill="#94A3B8"
            fontWeight="bold" fontFamily="sans-serif">z</text>
          <text x="45" y="14" fontSize="7" fill="#94A3B8"
            fontWeight="bold" fontFamily="sans-serif">z</text>
        </>
      ) : (
        <>
          <circle cx="66" cy="30" r="4" fill="#2D1A0E"/>
          <circle cx="78" cy="30" r="4" fill="#2D1A0E"/>
          {/* Shine */}
          <circle cx="67.5" cy="28.5" r="1.4" fill="white"/>
          <circle cx="79.5" cy="28.5" r="1.4" fill="white"/>
          {/* Nheo mắt vui khi wave */}
          {isWave && (
            <>
              <path d="M63 29 Q66 26 69 29"
                stroke="#2D1A0E" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6"/>
              <path d="M75 29 Q78 26 81 29"
                stroke="#2D1A0E" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6"/>
            </>
          )}
        </>
      )}

      {/* MÁ HỒNG */}
      <ellipse cx="63" cy="39" rx="4" ry="2.5" fill="#F4A261" opacity="0.38"/>
      <ellipse cx="81" cy="39" rx="4" ry="2.5" fill="#F4A261" opacity="0.38"/>

      {/* CHÂN VẪY khi wave */}
      {isWave && (
        <g style={{
          transformOrigin: '67px 59px',
          animation: 'dog-wave-paw 0.5s ease-in-out infinite',
        }}>
          <rect x="62" y="54" width="11" height="8" rx="4" fill="#E8B47A"/>
          <ellipse cx="67" cy="54" rx="6" ry="3.5" fill="#F5D5A8"/>
        </g>
      )}
    </svg>
  )
}

/* ── Config ─────────────────────────────────────────── */
const SPEED    = 1.8
const MARGIN   = 20
const DOG_W    = 100
const PAUSE_MS = { min: 1800, max: 4200 }

const BUBBLES = [
  'Guten Tag! 🐾', 'Woof! 🐶',
  'Học Tiếng Đức chưa? 📚', 'Streak hôm nay chưa? 🔥',
  'Ich bin ein guter Hund! 🇩🇪', '*ngáp*... zzz 💤',
  'Wunderbar! ✨', 'A1→C1 mình đồng hành! 🚀',
  'Bạn giỏi lắm! 🏆', 'Hallo hallo! 👋',
]

export default function Mascot() {
  const [x, setX]           = useState(150)
  const [flip, setFlip]     = useState(false)
  const [mood, setMood]     = useState<Mood>('walk')
  const [bubble, setBubble] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)

  const xRef   = useRef(x)
  const dirRef = useRef(1)   // 1=phải, -1=trái
  const paused = useRef(false)
  const rafRef = useRef<number>(0)
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pauseTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  xRef.current = x

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
    function loop() {
      if (!paused.current) {
        const maxX = window.innerWidth - DOG_W - MARGIN
        const cur  = xRef.current
        const dir  = dirRef.current
        const next = cur + SPEED * dir

        if (next >= maxX) {
          setX(maxX)
          dirRef.current = -1
          setFlip(true)
          doPause()
        } else if (next <= MARGIN) {
          setX(MARGIN)
          dirRef.current = 1
          setFlip(false)
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

  /* Click vào chó — toggle hướng và chạy */
  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()

    // Nếu đang pause thì resume, đổi hướng
    if (paused.current) {
      paused.current = false
      if (pauseTimer.current) clearTimeout(pauseTimer.current)
      // đổi chiều
      const newDir = dirRef.current * -1
      dirRef.current = newDir
      setFlip(newDir === -1)
      setMood('walk')
      showBubble()
      return
    }

    // Đang đi thì đổi hướng ngay
    const newDir = dirRef.current * -1
    dirRef.current = newDir
    setFlip(newDir === -1)
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
        // flip toàn bộ wrapper để chó quay đầu
        transform: flip ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      {/* Speech bubble — counter-flip để chữ không ngược */}
      {bubble && (
        <div style={{
          position: 'absolute',
          bottom: 74,
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

      {/* Dog */}
      <div
        onClick={handleClick}
        style={{ cursor: 'pointer', pointerEvents: 'auto', display: 'inline-block' }}
      >
        <DogSVG mood={mood} />
      </div>

      {/* Nút ẩn */}
      <button
        onClick={(e) => { e.stopPropagation(); setVisible(false) }}
        className="mascot-close"
        style={{
          position: 'absolute',
          top: 4, right: -6,
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
