/**
 * The line the champion's card carries.
 *
 * Same discipline as verdicts.ts, for the same reason: every line is built out
 * of what the filed games actually say — which game carried them, how far
 * ahead of second they finished, how many they had to sit through, who paid
 * for it. Nothing claims how the season FELT, because nothing records that,
 * and a card that invents a story about a fortnight of card games is a card
 * nobody believes twice.
 *
 * There is only ever one of these on screen and it stays until somebody else
 * takes the title, so it is the most re-read line in the app. That is the
 * argument for making it specific: "gran campeón" reads once, "todo a base de
 * rummys" is still true the fifth time you open the drawer.
 */

import { getHistory, getStandings, normalize, WIN_VALUE, type GameId, type Standing } from './history'
import { hash } from './verdicts'

export interface ChampionFacts {
  champion: Standing
  /** Points, per game, so a line can say what actually carried them. */
  pointsByGame: Record<GameId, number>
  /** The game that contributed the most points. Ties fall to the first. */
  carriedBy: GameId
  /** That game's share of their total, 0 to 1. */
  carriedShare: number
  /** Second place's name and how far back they are. Null in a solo history. */
  runnerUp: { name: string; behind: number } | null
  /** Who they beat most often — the one buying, by house rule. */
  nemesis: { name: string; count: number } | null
  /** Wins over games played. */
  rate: number
}

const GAMES: GameId[] = ['generala', 'rummy', 'chinchon', 'truco']

/**
 * Who the champion has beaten most, with the count.
 *
 * history.ts already has getNemesis, but it returns only a name and the
 * certificate is happy with that. A line that says "le ganó nueve veces" needs
 * the nine, and inventing it is not an option.
 */
function nemesisOf(name: string): { name: string; count: number } | null {
  const champ = normalize(name)
  const losses = new Map<string, { name: string; count: number }>()

  for (const entry of getHistory()) {
    // A draw beat nobody, so it makes nobody a victim.
    if (entry.winners.length !== 1) continue
    if (normalize(entry.winners[0]) !== champ) continue
    for (const player of entry.players) {
      const key = normalize(player.name)
      if (!key || key === champ) continue
      const current = losses.get(key) ?? { name: player.name, count: 0 }
      current.name = player.name
      current.count += 1
      losses.set(key, current)
    }
  }

  return [...losses.values()].sort((a, b) => b.count - a.count)[0] ?? null
}

export function championFactsOf(champion: Standing): ChampionFacts {
  const pointsByGame = Object.fromEntries(
    GAMES.map((g) => [g, (champion.byGame[g] ?? 0) * (WIN_VALUE[g] ?? 1)]),
  ) as Record<GameId, number>

  const carriedBy = GAMES.reduce((best, g) => (pointsByGame[g] > pointsByGame[best] ? g : best))
  const second = getStandings().find((s) => normalize(s.name) !== normalize(champion.name))

  return {
    champion,
    pointsByGame,
    carriedBy,
    carriedShare: champion.points > 0 ? pointsByGame[carriedBy] / champion.points : 0,
    runnerUp: second ? { name: second.name, behind: champion.points - second.points } : null,
    nemesis: nemesisOf(champion.name),
    rate: champion.played > 0 ? champion.wins / champion.played : 0,
  }
}

interface Line {
  /** Two or three words, the way a plaque is engraved. */
  title: string
  note: (f: ChampionFacts) => string
  /** Lines that only fit some seasons. Omitted means always eligible. */
  when?: (f: ChampionFacts) => boolean
}

/** A line that had to qualify is the one worth landing on. */
const CONDITIONAL_WEIGHT = 4

const carried = (game: GameId, share = 0.55) => (f: ChampionFacts) =>
  f.carriedBy === game && f.carriedShare >= share && (f.champion.byGame[game] ?? 0) >= 2
const spread = (f: ChampionFacts) =>
  (['generala', 'rummy', 'chinchon'] as GameId[]).every((g) => (f.champion.byGame[g] ?? 0) >= 1)
const walkover = (f: ChampionFacts) => !!f.runnerUp && f.runnerUp.behind >= 6
const photo = (f: ChampionFacts) => !!f.runnerUp && f.runnerUp.behind <= 2
const efficient = (f: ChampionFacts) => f.champion.played >= 6 && f.rate >= 0.65
const grinder = (f: ChampionFacts) => f.champion.played >= 18 && f.rate < 0.5
const beatOne = (n: number) => (f: ChampionFacts) => !!f.nemesis && f.nemesis.count >= n
const fewGames = (f: ChampionFacts) => f.champion.played <= 8
const soloRun = (f: ChampionFacts) => f.runnerUp === null

const LINES: Line[] = [
  /* ------------------------------------------------ what carried them */
  {
    title: 'A FUERZA DE RUMMY',
    note: () => 'Noches enteras esperando que el otro se pase de cien.',
    when: carried('rummy'),
  },
  {
    title: 'EL DE LOS RUMMYS',
    note: (f) => `${f.champion.byGame.rummy} partidas largas. Ninguna se le escapó.`,
    when: carried('rummy'),
  },
  {
    title: 'PACIENCIA DE OTRA ÉPOCA',
    note: () => 'Ganó donde hay que sentarse. No es para cualquiera.',
    when: carried('rummy', 0.7),
  },
  {
    title: 'UNA POR UNA',
    note: (f) => `${f.champion.byGame.generala} generalas. Sin atajos y sin apuro.`,
    when: carried('generala'),
  },
  {
    title: 'DUEÑO DE LOS DADOS',
    note: () => 'Se lo llevó tirando. Que alguien revise ese cubilete.',
    when: carried('generala', 0.7),
  },
  {
    title: 'EL DEL CHINCHÓN',
    note: (f) => `${f.champion.byGame.chinchon} chinchones. Sumar poco también es un oficio.`,
    when: carried('chinchon'),
  },
  {
    title: 'GANA EN TODAS',
    note: () => 'Dados, cartas y paciencia. No hay por dónde agarrarlo.',
    when: spread,
  },

  /* --------------------------------------------------- how far ahead */
  {
    title: 'NO HUBO CARRERA',
    note: (f) => `Le sacó ${f.runnerUp!.behind} puntos al segundo. Ni cerca.`,
    when: walkover,
  },
  {
    title: 'SE FUE SOLO',
    note: (f) => `${f.runnerUp!.name} lo miró de atrás todo el campeonato.`,
    when: walkover,
  },
  {
    title: 'POR POCO Y NADA',
    note: (f) => `${f.runnerUp!.behind} punto${f.runnerUp!.behind === 1 ? '' : 's'} arriba. Que no se relaje.`,
    when: photo,
  },
  {
    title: 'LLEGÓ RASPANDO',
    note: (f) => `${f.runnerUp!.name} venía atrás y sigue ahí. Esto no terminó.`,
    when: photo,
  },
  {
    title: 'SIN OPOSICIÓN',
    note: () => 'Nadie más llegó a anotarse en la carrera.',
    when: soloRun,
  },

  /* ---------------------------------------------------- how they did it */
  {
    title: 'SIN DESPERDICIAR',
    note: (f) => `${f.champion.wins} de ${f.champion.played}. Casi no dio chances.`,
    when: efficient,
  },
  {
    title: 'VINO A GANAR',
    note: (f) => `Se sentó ${f.champion.played} veces y se levantó ganando ${f.champion.wins}.`,
    when: efficient,
  },
  {
    title: 'A PURO AGUANTE',
    note: (f) => `${f.champion.played} partidas para llegar. Perdió muchas y volvió todas.`,
    when: grinder,
  },
  {
    title: 'EL QUE NO SE VA',
    note: () => 'Perdió más de la mitad y llegó igual. Eso también es un método.',
    when: grinder,
  },
  {
    title: 'RÁPIDO Y LIMPIO',
    note: (f) => `${f.champion.played} partidas nada más. Un trámite.`,
    when: fewGames,
  },

  /* ------------------------------------------------------ who pays */
  {
    title: 'TIENE UN FAVORITO',
    note: (f) => `A ${f.nemesis!.name} le ganó ${f.nemesis!.count} veces. Alguien avísele.`,
    when: beatOne(4),
  },
  {
    title: 'ESTO YA ES PERSONAL',
    note: (f) => `${f.nemesis!.count} veces contra ${f.nemesis!.name}. Ya no es casualidad.`,
    when: beatOne(7),
  },
  {
    title: 'EL HELADO TIENE DUEÑO',
    note: (f) => `Lo paga ${f.nemesis!.name}, que fue el que más lo sufrió.`,
    when: beatOne(3),
  },

  /* ------------------------------------- always eligible, never generic */
  {
    title: 'CAMPEÓN DE LA MESA',
    note: (f) => `${f.champion.points} puntos en ${f.champion.played} partidas. Está escrito.`,
  },
  {
    title: 'SE LO GANÓ',
    note: (f) => `${f.champion.wins} victorias y un kilo de helado en camino.`,
  },
  {
    title: 'QUEDA EN EL ACTA',
    note: (f) => `${f.champion.points} puntos. El resto que empiece a contar de nuevo.`,
  },
  {
    title: 'HASTA NUEVO AVISO',
    note: () => 'El título es suyo hasta que alguien se lo saque. Suerte con eso.',
  },
  {
    title: 'PIDAN LA HORA',
    note: (f) => `${f.champion.wins} partidas ganadas. Ya está, terminó.`,
  },
]

/**
 * The champion's plaque. Seeded off the title itself — the name, the points
 * and the games behind them — so the card says the same thing every time it is
 * opened, and changes only when the season does.
 */
export function championPlaque(champion: Standing): { title: string; note: string } {
  const facts = championFactsOf(champion)
  const pool = LINES.filter((line) => !line.when || line.when(facts))
  const weightOf = (line: Line) => (line.when ? CONDITIONAL_WEIGHT : 1)
  const total = pool.reduce((sum, line) => sum + weightOf(line), 0)

  let ticket = hash(`${champion.name}|${champion.points}|${champion.played}`) % total
  const line =
    pool.find((candidate) => {
      ticket -= weightOf(candidate)
      return ticket < 0
    }) ?? pool[0]

  return { title: line.title, note: line.note(facts) }
}
