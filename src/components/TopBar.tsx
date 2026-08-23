import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import type { ReactNode } from 'react'

interface Props {
  title: string
  /** Where the back arrow goes. Defaults to the home screen. */
  back?: string
  actions?: ReactNode
}

export function TopBar({ title, back = '/', actions }: Props) {
  const navigate = useNavigate()
  return (
    <div className="topbar">
      <button
        type="button"
        className="round-btn"
        onClick={() => navigate(back)}
        aria-label="Volver"
      >
        <Icon name="back" size={20} />
      </button>
      <div className="topbar__title">{title}</div>
      <div className="topbar__actions">{actions}</div>
    </div>
  )
}
