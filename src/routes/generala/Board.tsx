import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { GameMenu } from '../../components/GameMenu'
import { Icon } from '../../components/Icon'
import { Surface } from '../../components/Surface'
import { TopBar } from '../../components/TopBar'
import { ScoreEntry } from '../../games/generala/ScoreEntry'
import { ScoreGrid } from '../../games/generala/ScoreGrid'
import type { CategoryId, Score } from '../../games/generala/types'
import { useGenerala } from '../../games/generala/useGenerala'

export function GeneralaBoard() {
  const { game, setScore, clearScore, undo, renamePlayer, rematch, reset } = useGenerala()
  const [picking, setPicking] = useState<{ playerId: string; categoryId: CategoryId } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (game?.finishedAt) navigate('/generala/resultado', { replace: true })
  }, [game?.finishedAt, navigate])

  if (!game) return <Navigate to="/generala" replace />

  const confirm = (score: Score) => {
    if (!picking) return
    setScore(picking.playerId, picking.categoryId, score)
    setPicking(null)
  }

  return (
    <Surface game="generala">
      <TopBar
        title="Generala"
        back="/generala"
        actions={
          <>
            <button
              type="button"
              className="round-btn"
              onClick={undo}
              disabled={game.history.length === 0}
              aria-label="Deshacer"
            >
              <Icon name="undo" size={19} />
            </button>
            <button type="button" className="round-btn" onClick={() => setMenuOpen(true)} aria-label="Opciones">
              <Icon name="menu" size={20} />
            </button>
          </>
        }
      />

      <ScoreGrid game={game} onPick={(playerId, categoryId) => setPicking({ playerId, categoryId })} />

      {picking && (
        <ScoreEntry
          game={game}
          playerId={picking.playerId}
          categoryId={picking.categoryId}
          onConfirm={confirm}
          onClear={() => {
            clearScore(picking.playerId, picking.categoryId)
            setPicking(null)
          }}
          onClose={() => setPicking(null)}
        />
      )}

      {menuOpen && (
        <GameMenu
          players={game.players}
          onRename={renamePlayer}
          onRestart={rematch}
          onExit={reset}
          onClose={() => setMenuOpen(false)}
          restartLabel="Borrar la planilla y empezar de nuevo"
        />
      )}
    </Surface>
  )
}
