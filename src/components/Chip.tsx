import { CHIPS } from '../game/rules'

interface Props {
  /** Index into CHIPS. Wraps, so a player index is always safe to pass. */
  chip: number
  /** First letter shown in the middle. Omit for a blank chip. */
  initial?: string
  size?: number
  dim?: boolean
}

/**
 * A poker chip: coloured disc, notched rim, inner ring. Chips rather than card
 * suits because there are only four suits and the sheet holds up to six players.
 */
export function Chip({ chip, initial, size = 30, dim = false }: Props) {
  const { fill } = CHIPS[chip % CHIPS.length]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      aria-hidden="true"
      style={{ flexShrink: 0, opacity: dim ? 0.75 : 1 }}
    >
      <circle cx="17" cy="17" r="16" fill={fill} />
      <circle
        cx="17"
        cy="17"
        r="14"
        fill="none"
        stroke="#f2e8d5"
        strokeWidth="4.5"
        strokeDasharray="5.5 7.2"
      />
      <circle cx="17" cy="17" r="10.5" fill="none" stroke="rgba(242,232,213,.75)" strokeWidth="1.2" />
      {initial && (
        <text
          x="17"
          y="21.5"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="#f7efdd"
          fontFamily="'IBM Plex Mono', monospace"
        >
          {initial.toUpperCase()}
        </text>
      )}
    </svg>
  )
}
