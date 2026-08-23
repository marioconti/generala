import { useEffect } from 'react'

/**
 * The moment between tapping the tag and the menu appearing.
 *
 * Coming in from NFC there is a beat where the browser is still fetching, and
 * landing on a half-painted page reads as broken. This covers it deliberately —
 * short enough to never be in the way, long enough to feel like the app opened
 * rather than stuttered.
 */
export function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1250)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div className="splash" data-game="home">
      <div className="splash__glow" />
      <div className="splash__mark">
        {[0, 1, 2].map((i) => (
          <svg key={i} width="30" height="30" viewBox="0 0 24 24" className="splash__die" style={{ animationDelay: `${i * 110}ms` }}>
            <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="var(--paper)" />
            <circle cx="8" cy="8" r="2" fill="var(--felt-deep)" />
            <circle cx="16" cy="16" r="2" fill="var(--felt-deep)" />
            {i !== 1 && <circle cx="12" cy="12" r="2" fill="var(--felt-deep)" />}
          </svg>
        ))}
      </div>
      <div className="splash__word">El Anotador</div>
      <div className="splash__bar">
        <span />
      </div>
    </div>
  )
}
