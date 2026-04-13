'use client'

import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface Props {
  size?: number // px, default 24
}

export default function StreakIcon({ size = 24 }: Props) {
  return (
    <span className="inline-block flex-shrink-0" style={{ width: size, height: size }}>
      <DotLottieReact
        src="https://lottie.host/0f16fc6a-868f-44d1-90fb-4c7198bdd103/0AE46SleI0.lottie"
        loop
        autoplay
        style={{ width: size, height: size }}
      />
    </span>
  )
}
