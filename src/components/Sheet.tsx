import { useEffect, type ReactNode } from 'react'

interface Props {
  label: string
  onClose: () => void
  children: ReactNode
}

/**
 * A panel that rises from the bottom edge.
 *
 * Everything actionable lives down here on purpose: on a phone held in one
 * hand, the bottom half is the only part the thumb reaches comfortably.
 */
export function Sheet({ label, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="sheet-panel" role="dialog" aria-modal="true" aria-label={label}>
        <button type="button" className="sheet-panel__grip" onClick={onClose} aria-label="Cerrar" />
        {children}
      </div>
    </>
  )
}
