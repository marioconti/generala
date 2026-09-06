/**
 * What a face says when it is asked twice inside a minute.
 *
 * Split by mood like the others, because "leave me alone" is not one joke: the
 * player who is winning brushes you off, the one who is losing snaps, and the
 * bored one asks you to let them concentrate on a game where nothing is
 * happening. A single shared pool would have thrown that away.
 */
import type { Feeling } from './index'

export const NAGGING: Record<Feeling, string[]> = {
  wrecked: [
    'No estoy para charlas ahora.',
    'Dejame en paz un rato.',
    'No es el momento, en serio.',
    'Ya te dije cómo estoy. Peor.',
    'No me hables.',
    'Preguntame en otra vida.',
    'Estoy tratando de superarlo, no ayudás.',
    'No insistas.',
    'Andá a molestar al que va ganando.',
    'Basta.',
  ],
  down: [
    'Dejame concentrar que estoy remontando.',
    'Recién me preguntaste.',
    'Me estás desconcentrando.',
    'No me rompas justo ahora.',
    'Estoy en algo importante.',
    'Después hablamos.',
    'No es buen momento.',
    'Dejame pensar tranquilo.',
    'Estoy ocupado perdiendo, gracias.',
    'Un minuto de silencio, porfa.',
  ],
  level: [
    'Recién me preguntaste, no cambió nada.',
    'Sigue igual que hace veinte segundos.',
    'Dejame concentrar.',
    'No pasó nada nuevo.',
    'Preguntá en un rato.',
    'Sigo igual. Sorpresa.',
    'Vas a gastar el botón.',
    'No hay novedades.',
    'Todo sigue igual de aburrido.',
    'Dale, dejá el dedo quieto.',
  ],
  pleased: [
    'No abuses.',
    'Una por vez.',
    'Ya te contesté.',
    'No me juegues con la paciencia.',
    'Dejame disfrutar tranquilo.',
    'Después te cuento.',
    'Estoy concentrado, gracias.',
    'Tranquilo con el dedo.',
    'No gastes las preguntas.',
    'Vas muy seguido.',
  ],
  ecstatic: [
    'Ya lo dije: estoy espectacular.',
    'No me hagas repetirlo.',
    'Una por vez, hay para todos.',
    'Me vas a gastar la paciencia y hoy la tengo cara.',
    'Estoy ocupado ganando.',
    'Preguntale a alguno que la esté pasando mal.',
    'Ya sabés la respuesta.',
    'No cambió nada, sigo arriba.',
    'Dale, andá a jugar.',
    'Che, el dedo.',
  ],
}
