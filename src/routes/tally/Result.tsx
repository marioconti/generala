import { Navigate, useNavigate } from 'react-router-dom'
import { playedOn, ResultCard, type Placing } from '../../components/ResultCard'
import { Surface } from '../../components/Surface'
import { ranking, type TallyVariant } from '../../games/tally/rules'
import { useTally } from '../../games/tally/useTally'
import { GAME_NAMES } from '../../lib/history'

/** Reads the margin, so the line says something true about the game just played. */
function verdictFor(margin: number, tied: boolean, hands: number): { verdict: string; note: string } {
  if (tied) return { verdict: 'EMPATE', note: 'Definan a los gritos.' }
  if (margin >= 60) return { verdict: 'PALIZA', note: `Le sacó ${margin} en ${hands} manos.` }
  if (margin >= 25) return { verdict: 'GANÓ CÓMODO', note: `Diferencia de ${margin}.` }
  if (margin >= 8) return { verdict: 'PARTIDO PAREJO', note: `Apenas ${margin} de diferencia.` }
  return { verdict: 'POR UN PELO', note: `${margin} de diferencia. Revancha ya.` }
}

export function TallyResult({ variant }: { variant: TallyVariant }) {
  const { game, rematch, reset } = useTally(variant)
  const navigate = useNavigate()

  if (!game) return <Navigate to={`/${variant}`} replace />
  if (!game.finishedAt) return <Navigate to={`/${variant}/partida`} replace />

  const table = ranking(game)
  const best = table[0].total
  const winners = table.filter((r) => r.total === best)
  const rest = table.filter((r) => r.total !== best)
  const margin = rest.length > 0 ? Math.abs(rest[0].total - best) : 0
  const { verdict, note } = verdictFor(margin, winners.length > 1, game.rounds.length)

  const toPlacing = (r: (typeof table)[number]): Placing => ({
    name: r.player.name,
    chip: r.player.chip,
    score: r.total,
  })

  return (
    <Surface game={variant}>
      <div className="stack">
        <div className="rule-line">{GAME_NAMES[variant].toUpperCase()} · FIN DE LA PARTIDA</div>

        <ResultCard
          winners={winners.map(toPlacing)}
          rest={rest.map(toPlacing)}
          verdict={verdict}
          note={note}
          date={playedOn(game.finishedAt)}
        />

        <div className="row-actions">
          <button
            type="button"
            className="big-btn"
            onClick={() => {
              rematch()
              navigate(`/${variant}/partida`)
            }}
          >
            REVANCHA
          </button>
          <button
            type="button"
            className="ghost-btn ghost-btn--tall"
            onClick={() => {
              reset()
              navigate('/')
            }}
          >
            SALIR
          </button>
        </div>
      </div>
    </Surface>
  )
}
