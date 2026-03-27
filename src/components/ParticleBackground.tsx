'use client'
import { useEffect, useState } from 'react'
// @ts-ignore
import Particles, { initParticlesEngine } from '@tsparticles/react'
// @ts-ignore
import { loadSlim } from '@tsparticles/slim'

export default function ParticleBackground() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    // @ts-ignore
    initParticlesEngine(async (engine) => {
      // @ts-ignore
      await loadSlim(engine)
    }).then(() => setInit(true))
  }, [])

  if (!init) return null

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0 pointer-events-none"
      options={{
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        particles: {
          number: { value: 30, density: { enable: true } },
          color: { value: ['#2563EB', '#93C5FD', '#BFDBFE'] },
          shape: { type: 'circle' },
          opacity: { value: 0.3 },
          size: { value: { min: 2, max: 5 } },
          move: {
            enable: true,
            speed: 0.8,
            direction: 'none',
            random: true,
            straight: false,
            outModes: { default: 'bounce' },
          },
          links: {
            enable: true,
            distance: 120,
            color: '#2563EB',
            opacity: 0.15,
            width: 1,
          },
        },
        detectRetina: true,
      }}
    />
  )
}
