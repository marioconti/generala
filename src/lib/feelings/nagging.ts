/**
 * What a face says when it is asked twice inside a minute.
 *
 * Split by mood like the others, because "leave me alone" is not one joke: the
 * player who is winning brushes you off, the one who is losing snaps, and the
 * bored one asks you to let them concentrate on a game where nothing is
 * happening.
 *
 * WHAT WAS WRONG WITH THE FIRST SET, and it is worth writing down because
 * every line here was easy to write and easy to get wrong:
 *
 *  1. IT INVENTED RULES THE APP DOES NOT HAVE. "No gastes las preguntas" and
 *     "vas a gastar el botón" describe a quota of questions and a button.
 *     There is no quota — there is a wait — and there is no button, you tap
 *     the face. A joke that misdescribes the mechanic teaches the wrong thing.
 *  2. IT LEANED ON CONTEXT THAT IS NOT ON SCREEN. "Che, el dedo", "tranquilo
 *     con el dedo", "dejá el dedo quieto" — the finger is only in the writer's
 *     head. Three of them, all cryptic.
 *  3. IT SAID THINGS THAT COULD BE FALSE. "Sigue igual que hace veinte
 *     segundos" is wrong at fifty seconds, and the wait is a minute.
 *  4. IT WAS SO TERSE IT READ AS A BROKEN APP. "Basta." and "No me hables."
 *     with no other words around them look like an error state, not a person.
 *
 * Now: no mechanics, no missing context, no numbers, and nothing shorter than
 * a sentence a person would actually say. The mechanic is explained once, in
 * the footnote under the line, where it belongs — the line is the character.
 *
 * A LINE SAYING NOTHING CHANGED IS NOW TRUE. `askFace` answers properly the
 * moment the mood moves to another face, so being brushed off can only happen
 * while the expression is the one you already asked about.
 */
import type { Feeling } from './index'

export const NAGGING: Record<Feeling, string[]> = {
  wrecked: [
    'Dejame en paz un rato.',
    'No estoy para charlas ahora.',
    'Ya me viste la cara, no hace falta que preguntes.',
    'Preguntame cuando termine esto.',
    'Andá a preguntarle al que va ganando.',
    'No tengo nada nuevo para contarte.',
    'Estoy tratando de olvidarlo y vos insistís.',
    'Otra vez no, por favor.',
    'Ya te lo dije y no mejoró.',
    'Dejalo ahí, en serio.',
    'No me hagas repetirlo, que duele.',
    'Con una vez ya fue suficiente.',
  ],
  down: [
    'Recién me preguntaste.',
    'Dejame concentrar un minuto.',
    'Me estás desconcentrando.',
    'Sigo igual que recién.',
    'Estoy pensando, no me apures.',
    'Después te cuento cómo sigue.',
    'No es el mejor momento para charlar.',
    'Dame un respiro y volvé.',
    'Nada cambió desde que preguntaste.',
    'Estoy ocupado remontando esto.',
    'Preguntame cuando pase algo.',
    'Necesito silencio, aunque sea un rato.',
  ],
  level: [
    'Recién me preguntaste y sigo igual.',
    'No pasó nada desde entonces.',
    'Te lo acabo de decir.',
    'Sigo igual. Sorprendente, ya sé.',
    'No hay novedades todavía.',
    'Cuando se mueva algo te aviso.',
    'Vas a escuchar exactamente lo mismo.',
    'Nada nuevo por acá.',
    'Todo sigue igual de tranquilo.',
    'Esperá a que se mueva algo.',
    'La respuesta no cambió.',
    'Dejame concentrar, aunque no lo parezca.',
  ],
  pleased: [
    'Recién te contesté.',
    'Una cosa por vez.',
    'Dejame disfrutarlo tranquilo.',
    'Después vemos, ahora dejame.',
    'Estoy concentrado, gracias.',
    'Todavía no cambió nada.',
    'Preguntame más adelante.',
    'Tranquilo, que falta partida.',
    'Me vas a desconcentrar.',
    'Ya te dije que voy bien.',
    'Hacela de nuevo más tarde.',
    'Estoy en lo mío, dejame.',
  ],
  ecstatic: [
    'Ya te lo dije: estoy espectacular.',
    'No me hagas repetirlo.',
    'Estoy ocupado ganando.',
    'Preguntale a alguno que la esté pasando mal.',
    'Ya sabés la respuesta.',
    'Sigo tan bien como recién.',
    'Dale, seguí jugando.',
    'No cambió nada, quedate tranquilo.',
    'Una por vez, que hay mucho para contar.',
    'Te lo repito igual: bárbaro.',
    'Estoy en el mejor momento, no lo arruines.',
    'Dejame con lo mío un rato.',
  ],
}
