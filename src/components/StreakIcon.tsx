'use client'

interface Props {
  size?: number
}

export default function StreakIcon({ size = 24 }: Props) {
  const fontSize = Math.round(size * 0.85)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        fontSize: fontSize,
        lineHeight: 1,
        animation: 'flame-pulse 1.2s ease-in-out infinite',
        transformOrigin: 'bottom center',
      }}
    >
      🔥
    </span>
  )
}
