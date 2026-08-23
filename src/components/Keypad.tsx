import { Icon } from './Icon'

interface Props {
  value: string
  onChange: (value: string) => void
  /** Rummy and Chinchón both have hands that subtract, so the sign key stays. */
  allowNegative?: boolean
}

/**
 * A numeric pad drawn in the page rather than the phone's own keyboard.
 *
 * The native keyboard slides over the bottom half of the screen, which is
 * exactly where the sheet lives, and it takes a second to appear and dismiss
 * on every single hand. This is always there and never covers anything.
 */
export function Keypad({ value, onChange, allowNegative = true }: Props) {
  const press = (digit: string) => {
    const negative = value.startsWith('-')
    const digits = negative ? value.slice(1) : value
    if (digits.replace('-', '').length >= 4) return
    const next = digits === '0' ? digit : digits + digit
    onChange((negative ? '-' : '') + next)
  }

  const toggleSign = () => {
    if (!value || value === '0') return onChange('-')
    onChange(value.startsWith('-') ? value.slice(1) : '-' + value)
  }

  const backspace = () => {
    const next = value.slice(0, -1)
    onChange(next === '-' ? '' : next)
  }

  return (
    <div className="keypad">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
        <button key={digit} type="button" className="keypad__key" onClick={() => press(digit)}>
          {digit}
        </button>
      ))}
      <button
        type="button"
        className="keypad__key keypad__key--soft"
        onClick={toggleSign}
        disabled={!allowNegative}
        aria-label="Cambiar signo"
      >
        ±
      </button>
      <button type="button" className="keypad__key" onClick={() => press('0')}>
        0
      </button>
      <button
        type="button"
        className="keypad__key keypad__key--soft"
        onClick={backspace}
        aria-label="Borrar"
      >
        <Icon name="back" size={22} />
      </button>
    </div>
  )
}
