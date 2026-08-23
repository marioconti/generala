import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Felt } from '../components/Felt'
import { ScoreEntry } from '../components/ScoreEntry'
import { ScoreGrid } from '../components/ScoreGrid'
import type { CategoryId, Score } from '../game/types'
import { useGame } from '../game/useGame'

export function Scoreboard() {
  const { game, setScore, undo } = useGame()
  const [picking, setPicking] = useState<{ playerId: string; categoryId: CategoryId } | null>(null)
  const navigate = useNavigate()

  // The sheet fills up, the card comes out. Done in an effect so the last score
  // is committed and painted before we leave.
  useEffect(() => {
    if (game?.finishedAt) navigate('/resultado', { replace: true })
  }, [game?.finishedAt, navigate])

  if (!game) return <Navigate to="/" replace />

  const confirm = (score: Score) => {
    if (!picking) return
    setScore(picking.playerId, picking.categoryId, score)
    setPicking(null)
  }

  return (
    <Felt>
      <div className="topbar">
        <div className="topbar__title">Generala</div>
        <button
          type="button"
          className="ghost-btn"
          onClick={undo}
          disabled={game.history.length === 0}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          DESHACER
        </button>
      </div>

      <ScoreGrid game={game} onPick={(playerId, categoryId) => setPicking({ playerId, categoryId })} />

      {picking && (
        <ScoreEntry
          game={game}
          playerId={picking.playerId}
          categoryId={picking.categoryId}
          onConfirm={confirm}
          onClose={() => setPicking(null)}
        />
      )}
    </Felt>
  )
}
