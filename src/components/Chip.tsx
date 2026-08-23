import { useId } from 'react'
import { CHIPS } from '../lib/chips'

interface Props {
  /** Index into CHIPS. Wraps, so a player index is always safe to pass. */
  chip: number
  /** First letter shown in the middle. Omit for a blank token. */
  initial?: string
  size?: number
  dim?: boolean
}

/**
 * A painted wooden counter.
 *
 * A soft highlight across the top gives it the roundness of a real piece; the
 * inner ring is the groove such counters usually carry.
 */
export function Chip({ chip, initial, size = 30, dim = false }: Props) {
  const { fill, edge } = CHIPS[chip % CHIPS.length]
  const id = useId().replace(/:/g, '')

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      aria-hidden="true"
      style={{ flexShrink: 0, opacity: dim ? 0.72 : 1 }}
    >
      <defs>
        <radialGradient id={id} cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor="rgba(255,255,255,.42)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <circle cx="17" cy="17" r="15.6" fill={fill} stroke={edge} strokeWidth="1.6" />
      <circle cx="17" cy="17" r="11.4" fill="none" stroke={edge} strokeWidth="1" opacity=".45" />
      <circle cx="17" cy="17" r="15.6" fill={`url(#${id})`} />
      {initial && (
        <text
          x="17"
          y="21.4"
          textAnchor="middle"
          fontSize="12.5"
          fontWeight="700"
          fill="#fdf8ee"
          fontFamily="Fredoka, system-ui, sans-serif"
        >
          {initial.toUpperCase()}
        </text>
      )}
    </svg>
  )
}
