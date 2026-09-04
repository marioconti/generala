/** Stroke icons on a 24x24 grid, one consistent weight. No emoji anywhere. */

const PATHS = {
  back: 'M15 5l-7 7 7 7',
  forward: 'M9 5l7 7-7 7',
  home: 'M4 11.5 12 4l8 7.5V20H4z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  undo: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M4.5 12.5l5 5 10-11',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  edit: 'M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  restart: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  trophy: 'M7 4h10v5a5 5 0 0 1-10 0zM7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M10 14h4M9 20h6M12 14v6',
  scroll: 'M6 4h12v14a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2zM9 8h6M9 12h6',
  dice: 'M4 4h16v16H4zM9 9h.01M15 15h.01',
  medal: 'M8.5 3l2.6 5.6M15.5 3l-2.6 5.6M12 8.4a6.3 6.3 0 1 1 0 12.6 6.3 6.3 0 0 1 0-12.6z',
  flame: 'M12 3c3.4 3.2 5 5.7 5 8.6a5 5 0 0 1-10 0c0-1.9.8-3.3 2-4.5.4 1.3 1.1 2 1.9 2.3.1-2.4-.3-4.2 1.1-6.4z',
  bolt: 'M13 3L5.5 13.5H11L10 21l7.5-10.5H12z',
  target: 'M12 3.5v3.2M12 17.3v3.2M3.5 12h3.2M17.3 12h3.2M12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6z',
} as const

export type IconName = keyof typeof PATHS

interface Props {
  name: IconName
  size?: number
  width?: number
}

export function Icon({ name, size = 20, width = 2 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
