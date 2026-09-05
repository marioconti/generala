/**
 * The line the winner card closes with.
 *
 * Two rules held the whole time this file was written:
 *
 *  1. **It has to be true.** Every line is built out of things the app actually
 *     knows — the margin, how many rows the winner scratched, how many people
 *     played, the names. Nothing claims how the game went ("nunca estuvo en
 *     duda", "corrió de atrás") because no game here records that, and a card
 *     that invents a story about the game you just played reads as fake.
 *  2. **Never "arriba".** Chinchón is won by the LOWEST score, so the wording
 *     stays on "de diferencia" / "de ventaja". "Le sacó 30 arriba" would be
 *     backwards in one of the four games.
 *
 * The pick is seeded off the finished game, not Math.random(): the card is
 * re-rendered on every visit, and a verdict that reshuffles under you stops
 * being the verdict of that game.
 */

import type { HistoryFacts } from './verdict-facts'

export type Band = 'tied' | 'blowout' | 'comfortable' | 'close' | 'photo'

export interface VerdictContext extends HistoryFacts {
  /** Always positive: the gap between first and second, whatever the game. */
  margin: number
  /**
   * The two totals as they appear on the sheet. Only compare them in a line
   * gated to generala: chinchón and rummy are won by the LOWEST, so "no llegó
   * ni a la mitad" is backwards there.
   */
  winnerScore: number
  loserScore: number
  /**
   * Rows the WINNER filled with each of these, or null in a game that has no
   * such row. Null and 0 differ the same way `scratched` does.
   */
  generalas: number | null
  doble: boolean
  served: number | null
  /** The runner-up's, for the lines that are about what they did, not lost. */
  loserGeneralas: number | null
  loserScratched: number | null
  winner: string
  /** The runner-up. Empty when everyone tied, so tied lines never use it. */
  loser: string
  /** How many people share first place. 1 unless it was a tie. */
  winnersCount: number
  players: number
  /**
   * Rows the winner deliberately zeroed, or null in a game with no scratching.
   * Null and 0 are NOT the same: "no tachó ni una vez" is a compliment in
   * generala and a meaningless thing to say about a game of rummy.
   */
  scratched: number | null
  /** Anything stable and unique to this game. Keeps the line from reshuffling. */
  seed: string
}

interface Line {
  verdict: string
  note: (c: VerdictContext) => string
  /** Lines that only fit some games. Omitted means always eligible. */
  when?: (c: VerdictContext) => boolean
}

/**
 * A line that had to qualify — a clean sheet, four scratches, a full table — is
 * the one worth landing on, so when it is eligible it gets this many times the
 * chance of a line that fits any game at all.
 */
const CONDITIONAL_WEIGHT = 3

const scratchedAtLeast = (n: number) => (c: VerdictContext) =>
  c.scratched !== null && c.scratched >= n
const cleanSheet = (c: VerdictContext) => c.scratched === 0
const crowd = (c: VerdictContext) => c.players >= 4

/* ---------------------------------------------------- what the sheet did */

const generala = (c: VerdictContext) => (c.generalas ?? 0) > 0
const twoGeneralas = (c: VerdictContext) => (c.generalas ?? 0) >= 2
const doble = (c: VerdictContext) => c.doble
const loserGenerala = (c: VerdictContext) => (c.loserGeneralas ?? 0) > 0
const servedTwo = (c: VerdictContext) => (c.served ?? 0) >= 2
const loserScratchedAtLeast = (n: number) => (c: VerdictContext) =>
  c.loserScratched !== null && c.loserScratched >= n
/** Generala only — see the note on `winnerScore`. */
const doubled = (c: VerdictContext) =>
  c.generalas !== null && c.loserScore > 0 && c.loserScore * 2 <= c.winnerScore

/* ------------------------------------------------ what the history knows */

const dryFor = (n: number) => (c: VerdictContext) =>
  !c.winnerFirstWin && (c.winnerDrought ?? 0) >= n
const firstEver = (c: VerdictContext) => c.winnerFirstWin
const streakOf = (n: number) => (c: VerdictContext) => c.winnerStreak >= n
const loserDryFor = (n: number) => (c: VerdictContext) =>
  !c.loserNeverWon && (c.loserDrought ?? 0) >= n
const loserNeverWon = (c: VerdictContext) => c.loserNeverWon
/** The winner owns this head-to-head and it is not close. */
const owns = (c: VerdictContext) => !!c.h2h && c.h2h.wins >= 4 && c.h2h.wins > c.h2h.losses * 2
/** Beaten by this person every time until now. */
const finallyBeatThem = (c: VerdictContext) =>
  !!c.h2h && c.h2h.wins === 0 && c.h2h.losses >= 3
const deadEven = (c: VerdictContext) =>
  !!c.h2h && c.h2h.wins >= 3 && c.h2h.wins === c.h2h.losses
const rivalry = (n: number) => (c: VerdictContext) =>
  !!c.h2h && c.h2h.wins + c.h2h.losses >= n

/** Games, in the plural the note needs. */
const games = (n: number) => (n === 1 ? '1 partida' : `${n} partidas`)

const BLOWOUT: Line[] = [
  {
    verdict: 'LE ROMPIÓ EL ORTO',
    note: (c) => `${c.margin} de diferencia. Que ${c.loser} se levante despacio.`,
  },
  {
    verdict: 'BUENA COGIDITA',
    note: (c) => `${c.loser} vino a jugar y se vuelve con una anécdota.`,
  },
  {
    verdict: 'PASÓ LA TOPADORA',
    note: (c) => `Le pasó ${c.margin} por encima. ${c.loser} sigue juntando las fichas.`,
  },
  {
    verdict: 'NO FUE PARTIDO',
    note: (c) => `Fue una demostración. ${c.margin} de diferencia.`,
  },
  {
    verdict: 'MASACRE',
    note: (c) => `Que alguien le acerque una silla a ${c.loser}.`,
  },
  {
    verdict: 'SIN ANESTESIA',
    note: (c) => `${c.margin} de ventaja y ni levantó la vista.`,
  },
  {
    verdict: 'FUE UN TRÁMITE',
    note: (c) => `${c.winner} ganó en modo avión.`,
  },
  {
    verdict: 'HUMILLACIÓN PÚBLICA',
    note: (c) => `${c.margin} de diferencia, y encima delante de todos.`,
  },
  {
    verdict: 'QUE ALGUIEN LO PARE',
    note: (c) => `${c.margin} de ventaja. Esto ya es ensañamiento.`,
  },
  {
    verdict: 'SE LO COMIÓ CRUDO',
    note: (c) => `${c.loser} pidió revancha con la voz temblando.`,
  },
  {
    verdict: 'PLANILLA PERFECTA',
    note: (c) => `${c.margin} de diferencia y sin tachar una sola vez. Da bronca.`,
    when: cleanSheet,
  },
  {
    verdict: 'GANÓ JUGANDO MAL',
    note: (c) =>
      `Tachó ${c.scratched} veces y aun así ${c.margin} de diferencia. Pensá en eso, ${c.loser}.`,
    when: scratchedAtLeast(3),
  },
  {
    verdict: 'LOS BARRIÓ A TODOS',
    note: (c) => `${c.players} jugadores y ninguno se le acercó.`,
    when: crowd,
  },
  {
    verdict: 'PIDAN LA HORA',
    note: (c) => `${c.margin} de diferencia. Esto ya no es un juego, es una tarea.`,
  },
  {
    verdict: 'LE PASÓ EL TREN',
    note: (c) => `${c.loser} sigue parado en el andén con ${c.margin} de atraso.`,
  },
  {
    verdict: 'AVISALE A LA FAMILIA',
    note: (c) => `Que vayan preparando algo rico para ${c.loser}.`,
  },
  {
    verdict: 'CLASE MAGISTRAL',
    note: (c) => `${c.margin} de diferencia. Se cobra aparte.`,
  },
  {
    verdict: 'NI EN PEDO',
    note: (c) => `${c.loser} necesitaba ${c.margin} más y otra vida.`,
  },
  {
    verdict: 'SE FUE AL MAZO SOLO',
    note: (c) => `${c.margin} de ventaja. Nadie lo obligó a seguir.`,
  },
  {
    verdict: 'ESTO ES BULLYING',
    note: (c) => `${c.winner} tiene que aprender a contenerse.`,
  },
  {
    verdict: 'LA MESA PIDE PIEDAD',
    note: (c) => `${c.players} personas mirando ${c.margin} de diferencia.`,
    when: crowd,
  },
  {
    verdict: 'PERFECTO Y ENCIMA CRUEL',
    note: (c) => `Sin una tachada y ${c.margin} de ventaja. Elegí ser así.`,
    when: cleanSheet,
  },
]

const COMFORTABLE: Line[] = [
  {
    verdict: 'GANÓ CÓMODO',
    note: (c) => `${c.margin} de diferencia sin despeinarse.`,
  },
  {
    verdict: 'NI CERCA',
    note: (c) => `A ${c.loser} le faltaron ${c.margin}. Y algo más.`,
  },
  {
    verdict: 'LE SOBRÓ',
    note: (c) => `${c.margin} de ventaja y todavía le quedaba resto.`,
  },
  {
    verdict: 'FUE UN PASEO',
    note: (c) => `Le sobraron ${c.margin} y el mate caliente.`,
  },
  {
    verdict: 'TRANQUILO NOMÁS',
    note: () => 'Ni se enteró de que había partido.',
  },
  {
    verdict: 'GANÓ EL QUE SABÍA',
    note: (c) => `${c.loser} aprendió algo hoy. Caro, pero aprendió.`,
  },
  {
    verdict: 'OTRA CATEGORÍA',
    note: (c) => `${c.margin} entre ${c.winner} y ${c.loser}.`,
  },
  {
    verdict: 'NO HUBO COLOR',
    note: (c) => `${c.margin} de diferencia. Y nadie lo discutió.`,
  },
  {
    verdict: 'Y ENCIMA TACHANDO',
    note: (c) => `${c.scratched} tachadas y ${c.margin} de ventaja. ${c.loser}, hablemos.`,
    when: scratchedAtLeast(2),
  },
  {
    verdict: 'NI SE MANCHÓ',
    note: (c) => `${c.margin} de diferencia y la planilla impecable.`,
    when: cleanSheet,
  },
  {
    verdict: 'SIN APURARSE',
    note: (c) => `${c.margin} de ventaja jugando en cámara lenta.`,
  },
  {
    verdict: 'LO TUVO SIEMPRE',
    note: (c) => `Terminó ${c.margin} adelante y ni se despeinó.`,
  },
  {
    verdict: 'GANÓ CHARLANDO',
    note: (c) => `${c.margin} de diferencia mientras contaba una anécdota.`,
  },
  {
    verdict: 'EL DE SIEMPRE',
    note: (c) => `${c.winner} otra vez. ${c.loser} otra vez.`,
  },
  {
    verdict: 'DIFERENCIA DE OFICIO',
    note: (c) => `${c.margin}. No es suerte, es costumbre.`,
  },
  {
    verdict: 'NO ESTUVO MAL, PERO',
    note: (c) => `${c.loser} jugó bien. Perdió por ${c.margin} igual.`,
  },
  {
    verdict: 'ADMINISTRÓ',
    note: (c) => `Sacó ${c.margin} y se dedicó a mirar el reloj.`,
  },
  {
    verdict: 'ENTRE TODOS NO PUDIERON',
    note: (c) => `${c.players} contra uno y ganó ${c.winner} por ${c.margin}.`,
    when: crowd,
  },
]

const CLOSE: Line[] = [
  {
    verdict: 'HUBO PARTIDO',
    note: (c) => `Se definió por ${c.margin}. De eso se trata.`,
  },
  {
    verdict: 'PARTIDAZO',
    note: (c) => `${c.margin} separaron a ${c.winner} de ${c.loser}.`,
  },
  {
    verdict: 'GANÓ SUFRIENDO',
    note: (c) => `Sacó ${c.margin} y le costó cada uno.`,
  },
  {
    verdict: 'LO HICIERON JUGAR',
    note: (c) => `${c.loser} lo obligó a ganarlo.`,
  },
  {
    verdict: 'NADA REGALADO',
    note: (c) => `Diferencia de ${c.margin}. Revancha obligatoria.`,
  },
  {
    verdict: 'SE JUGÓ EN SERIO',
    note: (c) => `${c.margin} entre los dos primeros. Ni uno más.`,
  },
  {
    verdict: 'MERECÍAN LOS DOS',
    note: (c) => `Los separaron ${c.margin}. Injusto para alguien, seguro.`,
  },
  {
    verdict: 'AJUSTADO PERO CLARO',
    note: (c) => `${c.margin} de ventaja. Suficiente.`,
  },
  {
    verdict: 'UN PAPELÓN GANADOR',
    note: (c) => `Tachó ${c.scratched} veces y zafó por ${c.margin}.`,
    when: scratchedAtLeast(3),
  },
  {
    verdict: 'NI UNA TACHADA',
    note: (c) => `Ganó por ${c.margin} sin tachar una sola vez.`,
    when: cleanSheet,
  },
  {
    verdict: 'DE ESO SE TRATA',
    note: (c) => `${c.margin} y todos con algo para reclamar.`,
  },
  {
    verdict: 'GANÓ EN EL DESCUENTO',
    note: (c) => `${c.margin} de diferencia. Un rato más y cambiaba todo.`,
  },
  {
    verdict: 'LA PELEÓ',
    note: (c) => `${c.winner} sacó ${c.margin} y los va a contar de nuevo.`,
  },
  {
    verdict: 'MESA CALIENTE',
    note: (c) => `${c.margin} entre el primero y el segundo. Nadie se ríe.`,
  },
  {
    verdict: 'HUBO QUE GANARLO',
    note: (c) => `${c.loser} no regaló nada. Perdió por ${c.margin} igual.`,
  },
  {
    verdict: 'REVANCHA CANTADA',
    note: (c) => `${c.margin} no alcanzan para irse a dormir tranquilo.`,
  },
  {
    verdict: 'PARTIDO DE VERDAD',
    note: (c) => `${c.players} jugando en serio y ${c.margin} decidiendo.`,
    when: crowd,
  },
]

const PHOTO: Line[] = [
  {
    verdict: 'CASI, PERO NO',
    note: (c) => `Por ${c.margin}. ${c.loser} lo tuvo ahí.`,
  },
  {
    verdict: 'POR UN PELO',
    note: (c) => `Por ${c.margin}. Una tirada más y hablábamos de otra cosa.`,
  },
  {
    verdict: 'INFARTO',
    note: (c) => `Se definió por ${c.margin}. Que alguien tome la presión.`,
  },
  {
    verdict: 'SE LE ESCAPÓ',
    note: (c) => `${c.loser} perdió por ${c.margin}. Va a pensar en esto de noche.`,
  },
  {
    verdict: 'NO LE ALCANZÓ',
    note: (c) => `Perdió por ${c.margin}. Tan cerca que duele más.`,
  },
  {
    verdict: 'ROBO A MANO ARMADA',
    note: (c) => `Apenas ${c.margin}. ${c.loser} tiene derecho a quejarse.`,
  },
  {
    verdict: 'FOTO FINISH',
    note: (c) => `Diferencia de ${c.margin}. Hubo que mirar dos veces.`,
  },
  {
    verdict: 'ASÍ NO PUEDE QUEDAR',
    note: (c) => `Se perdió por ${c.margin}. Otra, ya.`,
  },
  {
    verdict: 'GANÓ DE CASUALIDAD',
    note: (c) => `${c.scratched} tachadas y ${c.margin} de ventaja. No presuma.`,
    when: scratchedAtLeast(1),
  },
  {
    verdict: 'SE SALVÓ',
    note: (c) => `${c.players} en la mesa y ${c.margin} de diferencia.`,
    when: crowd,
  },
  {
    verdict: 'MANOTAZO DE AHOGADO',
    note: (c) => `${c.margin}. ${c.winner} la sacó del fondo del mazo.`,
  },
  {
    verdict: 'NO SE LO MERECÍA',
    note: (c) => `Ninguno de los dos. Se definió por ${c.margin}.`,
  },
  {
    verdict: 'QUE LO REPITAN',
    note: (c) => `${c.margin} de diferencia. Alguien filme la próxima.`,
  },
  {
    verdict: 'ANOTALO BIEN',
    note: (c) => `Por ${c.margin}. Dentro de un mes nadie va a creerlo.`,
  },
  {
    verdict: 'TERMINÓ DE PIE',
    note: (c) => `${c.loser} perdió por ${c.margin} y se lo va a acordar.`,
  },
  {
    verdict: 'MEDIO PUNTO DE NADA',
    note: (c) => `${c.margin}. Eso separó ganar de perder.`,
  },
  {
    verdict: 'ESO FUE SUERTE',
    note: (c) => `${c.margin} de ventaja y ${c.scratched} tachadas. Que no se ilusione.`,
    when: scratchedAtLeast(2),
  },
]

const TIED: Line[] = [
  { verdict: 'EMPATE', note: () => 'Definan a los gritos.' },
  { verdict: 'NADIE GANÓ', note: () => 'Y nadie va a admitir que perdió.' },
  { verdict: 'IGUALITOS', note: () => 'Mismo puntaje. Alguien hizo trampa.' },
  { verdict: 'DESEMPATEN', note: () => 'Piedra, papel o tijera. Ahora.' },
  {
    verdict: 'EMPATE PERFECTO',
    note: () => 'Estadísticamente raro. Emocionalmente insoportable.',
  },
  {
    verdict: 'NO HAY GANADOR',
    note: (c) => `Hay ${c.winnersCount} perdedores con el mismo puntaje.`,
  },
  { verdict: 'SE PARTE EL HELADO', note: () => 'Mitad y mitad. Sin discusión.' },
  {
    verdict: 'ASÍ NO VALE',
    note: (c) => `${c.winnersCount} en la punta. Jueguen otra y no molesten.`,
  },
  { verdict: 'NADIE SE VA A CASA', note: () => 'Otra mano y lo arreglan.' },
  {
    verdict: 'HASTA PARA ESO EMPATARON',
    note: (c) => `${c.winnersCount} con el mismo número. Insoportables.`,
  },
  { verdict: 'CULPA DE LA PLANILLA', note: () => 'Revisen las cuentas antes de acusarse.' },
  { verdict: 'SE LAVARON LAS MANOS', note: () => 'Ninguno queda como el mejor. Ni como el peor.' },
  {
    verdict: 'MESA DIVIDIDA',
    note: (c) => `${c.players} jugaron y ${c.winnersCount} terminaron iguales.`,
    when: crowd,
  },
]

/* ======================================================================== *
 * THE HISTORY-AWARE SET.
 *
 * Kept apart from the pools above rather than merged into them, because these
 * are the lines that can go quiet: a line about a four-game drought is not
 * eligible on a table's first night, and one about a head-to-head needs the
 * pair to have played before. Grouping them makes it obvious which half of the
 * card only wakes up once the phone has some games on it.
 *
 * Every number in here is counted in verdict-facts.ts, never estimated, and a
 * draw is never called a win.
 * ======================================================================== */

const BLOWOUT_EXTRA: Line[] = [
  {
    verdict: 'Y ENCIMA GENERALA',
    note: (c) => `${c.margin} de diferencia y encima se dio el gusto. Insoportable.`,
    when: generala,
  },
  {
    verdict: 'DOBLE Y A OTRA COSA',
    note: (c) => `Cien puntos de una sola fila. ${c.loser} ya sabía en ese momento.`,
    when: doble,
  },
  {
    verdict: 'DOS GENERALAS',
    note: () => 'Dos. En la misma planilla. Que alguien revise esos dados.',
    when: twoGeneralas,
  },
  {
    verdict: 'NI LA MITAD',
    note: (c) => `${c.winnerScore} contra ${c.loserScore}. No es una derrota, es otra escala.`,
    when: doubled,
  },
  {
    verdict: 'SIGUE LA RACHA',
    note: (c) => `${c.winnerStreak} al hilo. Alguien tiene que hacer algo.`,
    when: streakOf(3),
  },
  {
    verdict: 'ESTO YA ES UN PROBLEMA',
    note: (c) => `${c.winnerStreak} partidas seguidas. Empiecen a sospechar.`,
    when: streakOf(5),
  },
  {
    verdict: 'VOLVIÓ DE LA MUERTE',
    note: (c) => `Venía de ${games(c.winnerDrought ?? 0)} sin ganar y arrancó con esto.`,
    when: dryFor(4),
  },
  {
    verdict: 'LA PRIMERA ES ASÍ',
    note: (c) => `Primera que gana ${c.winner}, y la ganó de esta manera. Mala señal.`,
    when: firstEver,
  },
  {
    verdict: 'LO TIENE DE HIJO',
    note: (c) => `${c.h2h!.wins} a ${c.h2h!.losses} en el historial. Hoy no fue la excepción.`,
    when: owns,
  },
  {
    verdict: 'SE ROMPIÓ LA MALDICIÓN',
    note: (c) =>
      `${c.h2h!.losses} veces le ganó ${c.loser}. La primera que se da vuelta, se da vuelta así.`,
    when: finallyBeatThem,
  },
  {
    verdict: 'QUE PRUEBE OTRO JUEGO',
    note: (c) => `${c.loser} lleva ${games(c.loserDrought ?? 0)} sin ganar una.`,
    when: loserDryFor(4),
  },
  {
    verdict: 'TODAVÍA NADA',
    note: (c) => `${c.loser} sigue sin ganar ninguna. Hoy tampoco era.`,
    when: loserNeverWon,
  },
  {
    verdict: 'HIZO GENERALA Y PERDIÓ IGUAL',
    note: (c) => `${c.loser} se sacó la generala y quedó ${c.margin} atrás. Eso duele distinto.`,
    when: (c) => loserGenerala(c) && (c.generalas ?? 0) === 0,
  },
  {
    verdict: 'CON LA MANO ABIERTA',
    note: (c) => `${c.served} servidas. Ni siquiera tuvo que insistir.`,
    when: servedTwo,
  },
  {
    verdict: 'TACHÓ Y NI ASÍ',
    note: (c) => `${c.loserScratched} filas tachó ${c.loser}, y no estuvo cerca en ningún momento.`,
    when: loserScratchedAtLeast(3),
  },
]

const COMFORTABLE_EXTRA: Line[] = [
  {
    verdict: 'LA GENERALA DECIDIÓ',
    note: (c) => `Ganó por ${c.margin} y ahí adentro hay 50 de una sola fila.`,
    when: generala,
  },
  {
    verdict: 'EL DOBLE HIZO EL TRABAJO',
    note: () => 'Cien de una fila. El resto de la planilla fue acompañar.',
    when: doble,
  },
  {
    verdict: 'TRES AL HILO',
    note: (c) => `${c.winnerStreak} seguidas. Ya no es suerte, es una costumbre.`,
    when: streakOf(3),
  },
  {
    verdict: 'DEJÓ DE PERDER',
    note: (c) => `${games(c.winnerDrought ?? 0)} sin ganar, y hoy cortó.`,
    when: dryFor(3),
  },
  {
    verdict: 'DEBUTÓ GANANDO',
    note: (c) => `Primera de ${c.winner}. Que la disfrute, que no siempre se repite.`,
    when: firstEver,
  },
  {
    verdict: 'EL CLÁSICO ES SUYO',
    note: (c) => `${c.h2h!.wins} a ${c.h2h!.losses} entre los dos. Se está poniendo aburrido.`,
    when: owns,
  },
  {
    verdict: 'AL FIN',
    note: (c) => `${c.h2h!.losses} a 0 iba ${c.loser}. Ahora hay que empezar a contar de nuevo.`,
    when: finallyBeatThem,
  },
  {
    verdict: 'DESEMPATÓ LA SERIE',
    note: (c) => `Venían ${c.h2h!.wins} a ${c.h2h!.losses}. Ya no.`,
    when: deadEven,
  },
  {
    verdict: 'A ESTE PASO NUNCA',
    note: (c) => `${c.loser} suma ${games(c.loserDrought ?? 0)} sin ganar.`,
    when: loserDryFor(3),
  },
  {
    verdict: 'SIN GENERALA Y LE SOBRÓ',
    note: (c) => `Ni una generala y ganó por ${c.margin}. Peor todavía.`,
    when: (c) => c.generalas === 0,
  },
  {
    verdict: 'CUESTIÓN DE OFICIO',
    note: (c) =>
      `${c.h2h!.wins + c.h2h!.losses} partidas jugaron entre ellos. Alguno tenía que aprender.`,
    when: rivalry(6),
  },
]

const CLOSE_EXTRA: Line[] = [
  {
    verdict: 'GANÓ PERO NO SE LA CREA',
    note: (c) => `${c.margin} de diferencia. Con eso no alcanza para hablar hasta la próxima.`,
  },
  {
    verdict: 'LA GENERALA FUE TODO',
    note: (c) => `${c.margin} de diferencia y una generala en el medio. Sin esa fila no ganaba.`,
    when: generala,
  },
  {
    verdict: 'SIGUE INVICTO Y SUFRIENDO',
    note: (c) => `${c.winnerStreak} al hilo, pero esta se la hicieron pelear.`,
    when: streakOf(3),
  },
  {
    verdict: 'SE LE ACABÓ LA SEQUÍA',
    note: (c) => `${games(c.winnerDrought ?? 0)} sin ganar, y la cortó por ${c.margin}.`,
    when: dryFor(3),
  },
  {
    verdict: 'PRIMERA Y DE ARAÑAZO',
    note: (c) => `Primera vez que gana ${c.winner}, y por ${c.margin}. Que no la muestre mucho.`,
    when: firstEver,
  },
  {
    verdict: 'ESTUVO A NADA DE CORTARLA',
    note: (c) => `${c.loser} lleva ${games(c.loserDrought ?? 0)} sin ganar y hoy quedó a ${c.margin}.`,
    when: loserDryFor(3),
  },
  {
    verdict: 'EL HISTORIAL NO MIENTE',
    note: (c) => `${c.h2h!.wins} a ${c.h2h!.losses}. Le costó, pero terminó donde termina siempre.`,
    when: owns,
  },
  {
    verdict: 'SE DIO VUELTA LA HISTORIA',
    note: (c) => `${c.h2h!.losses} veces perdió contra ${c.loser}. Fue por ${c.margin}, pero fue.`,
    when: finallyBeatThem,
  },
  {
    verdict: 'UNA GENERALA CADA UNO',
    note: () => 'Se decidió en las filas de arriba, como corresponde.',
    when: (c) => generala(c) && loserGenerala(c),
  },
  {
    verdict: 'ESTO SE DEFINE OTRO DÍA',
    note: (c) => `${c.h2h!.wins} a ${c.h2h!.losses} van. Nadie se puede ir todavía.`,
    when: deadEven,
  },
]

const PHOTO_EXTRA: Line[] = [
  {
    verdict: 'POR ESO NO SE HABLA',
    note: (c) => `${c.margin} de diferencia. Con eso no se le habla a nadie.`,
  },
  {
    verdict: 'LA GENERALA LO SALVÓ',
    note: (c) => `Ganó por ${c.margin}. Sin esa fila estaba mirando desde abajo.`,
    when: generala,
  },
  {
    verdict: 'LA RACHA AGUANTA DE MILAGRO',
    note: (c) => `${c.winnerStreak} seguidas, la última por ${c.margin}. Se le está por cortar.`,
    when: streakOf(3),
  },
  {
    verdict: 'CORTÓ POR UN PELO',
    note: (c) => `${games(c.winnerDrought ?? 0)} sin ganar, y se lleva esta por ${c.margin}.`,
    when: dryFor(3),
  },
  {
    verdict: 'DEBUT CON SUSTO',
    note: (c) => `Primera de ${c.winner} en la vida, y por ${c.margin}. Casi nada.`,
    when: firstEver,
  },
  {
    verdict: 'OTRA VEZ NO',
    note: (c) =>
      `${c.loser} sigue en ${games(c.loserDrought ?? 0)} sin ganar, y esta se le fue por ${c.margin}.`,
    when: loserDryFor(3),
  },
  {
    verdict: 'CAMBIÁ LA ENERGÍA',
    note: (c) => `${c.loser} todavía no ganó ninguna, y esta la tuvo a ${c.margin}.`,
    when: loserNeverWon,
  },
  {
    verdict: 'HIZO GENERALA Y PERDIÓ',
    note: (c) => `${c.loser} sacó la generala y perdió por ${c.margin}. Que alguien lo abrace.`,
    when: (c) => loserGenerala(c) && (c.generalas ?? 0) === 0,
  },
  {
    verdict: 'EL CLÁSICO SIGUE ABIERTO',
    note: (c) => `${c.h2h!.wins} a ${c.h2h!.losses}, y esta por ${c.margin}. No arregla nada.`,
    when: deadEven,
  },
  {
    verdict: 'HASTA EL HISTORIAL DUDA',
    note: (c) => `${c.h2h!.wins} a ${c.h2h!.losses} van entre ellos. Esto no lo resuelve nadie.`,
    when: rivalry(5),
  },
]

const TIED_EXTRA: Line[] = [
  {
    verdict: 'NI PARA LA RACHA',
    note: (c) => `${c.winner} venía con ${c.winnerStreak - 1} al hilo y se le corta con un empate.`,
    when: (c) => c.winnerStreak >= 3,
  },
  {
    verdict: 'SEGUÍS SIN GANAR',
    note: (c) => `${games(c.winnerDrought ?? 0)} sin ganar, y esta no cuenta.`,
    when: dryFor(3),
  },
  {
    verdict: 'EMPATE Y ENCIMA GENERALA',
    note: () => 'Se sacó la generala y terminó igual que el resto. Para llorar.',
    when: generala,
  },
  {
    verdict: 'EL CLÁSICO QUEDA IGUAL',
    note: (c) =>
      `${c.h2h!.wins} a ${c.h2h!.losses} seguían, y ${c.h2h!.wins} a ${c.h2h!.losses} siguen.`,
    when: rivalry(4),
  },
]

const POOLS: Record<Band, Line[]> = {
  tied: [...TIED, ...TIED_EXTRA],
  blowout: [...BLOWOUT, ...BLOWOUT_EXTRA],
  comfortable: [...COMFORTABLE, ...COMFORTABLE_EXTRA],
  close: [...CLOSE, ...CLOSE_EXTRA],
  photo: [...PHOTO, ...PHOTO_EXTRA],
}

/**
 * djb2, then MurmurHash3's finaliser.
 *
 * djb2 alone was not enough: the seeds are timestamps a few characters apart,
 * its low bits barely move between them, and `% pool.length` reads exactly
 * those bits — five games in a row kept landing on the same two lines. The
 * avalanche step is what makes neighbouring seeds pick unrelated lines.
 */
function hash(text: string): number {
  let h = 5381
  for (let i = 0; i < text.length; i += 1) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}

/**
 * Same game in, same line out — forever. The seed is the finished game, so the
 * card still says the same thing when you come back to it.
 */
export function pickVerdict(band: Band, context: VerdictContext): { verdict: string; note: string } {
  const pool = POOLS[band].filter((line) => !line.when || line.when(context))
  const weightOf = (line: Line) => (line.when ? CONDITIONAL_WEIGHT : 1)
  const total = pool.reduce((sum, line) => sum + weightOf(line), 0)

  let ticket = hash(`${context.seed}|${band}`) % total
  const line =
    pool.find((candidate) => {
      ticket -= weightOf(candidate)
      return ticket < 0
    }) ?? pool[0]

  return { verdict: line.verdict, note: line.note(context) }
}

/** How many lines a band can produce for this game. */
export function bandSize(band: Band, context: VerdictContext): number {
  return POOLS[band].filter((line) => !line.when || line.when(context)).length
}
