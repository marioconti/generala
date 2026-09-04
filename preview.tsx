/**
 * Dev-only preview of the two things that are hard to see in a real game: the
 * player tokens side by side, and every face at once.
 *
 * Playing a whole game is the only other way to reach the ends of the mood
 * scale, and by the time you get there you cannot see the other end any more.
 *
 * NOT part of the build. Vite only bundles the entry it is given, so this page
 * exists on `npm run dev` and never ships. Open /generala/preview.html.
 */
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Chip } from './src/components/Chip'
import { Face } from './src/components/Face'
import { CHIPS } from './src/lib/chips'
import { moodsOf } from './src/lib/mood'

const PAPER = '#f5eddc'
const INK = '#463527'
const SOFT = '#8a765c'

const NAMES = ['Juan', 'Mario', 'Sofia', 'Lucas']
const MOODS = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ font: '600 15px Nunito, system-ui', color: INK, margin: '0 0 2px' }}>{title}</h2>
      {hint && <p style={{ font: '400 12px Nunito, system-ui', color: SOFT, margin: '0 0 14px' }}>{hint}</p>}
      {children}
    </section>
  )
}

function Tokens() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 26 }}>
      {CHIPS.map((c, i) => (
        <div key={c.name} style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            {[52, 34, 26, 22].map((s) => (
              <Chip key={s} chip={i} initial={c.name.charAt(0)} size={s} />
            ))}
            <Chip chip={i} initial={c.name.charAt(0)} size={26} dim />
          </div>
          <div style={{ font: '400 11px Nunito, system-ui', color: SOFT, marginTop: 6 }}>
            {c.name} · {c.fill}
          </div>
        </div>
      ))}
    </div>
  )
}

function FaceRow({ name, size }: { name: string; size: number }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 10 }}>
      <div style={{ font: '600 12px Nunito, system-ui', color: INK, width: 62, paddingBottom: 18 }}>{name}</div>
      {MOODS.map((m) => (
        <div key={m} style={{ textAlign: 'center' }}>
          <Face mood={m} size={size} seed={name} />
          <div style={{ font: '400 10px Nunito, system-ui', color: SOFT }}>{m}</div>
        </div>
      ))}
    </div>
  )
}

/** The part a static grid cannot show: the spring and the fade between poses. */
function Live() {
  const [mood, setMood] = useState(0)
  return (
    <div>
      <div style={{ display: 'flex', gap: 22, alignItems: 'center', marginBottom: 12 }}>
        {NAMES.map((n) => (
          <div key={n} style={{ textAlign: 'center' }}>
            <Face mood={mood} size={92} seed={n} />
            <div style={{ font: '600 11px Nunito, system-ui', color: INK }}>{n}</div>
          </div>
        ))}
      </div>
      <input
        type="range"
        min={-1}
        max={1}
        step={0.01}
        value={mood}
        onChange={(e) => setMood(Number(e.target.value))}
        style={{ width: 420, accentColor: '#cf3719' }}
      />
      <span style={{ font: '600 12px Nunito, system-ui', color: INK, marginLeft: 10 }}>{mood.toFixed(2)}</span>
    </div>
  )
}

/** What the sheet actually produces, so the scale can be judged on real gaps. */
function Sheet() {
  const [row, setRow] = useState(6)
  // A plausible generala in progress: Juan pulling away, Lucas stuck.
  const RUNS: Record<string, number[]> = {
    Juan: [4, 12, 24, 39, 59, 84, 104, 134, 174, 224, 224],
    Sofia: [2, 8, 17, 29, 44, 62, 82, 92, 132, 132, 132],
    Mario: [3, 9, 18, 30, 45, 63, 63, 93, 93, 93, 93],
    Lucas: [1, 5, 11, 19, 30, 42, 62, 62, 62, 62, 62],
  }
  const names = Object.keys(RUNS)
  const totals = names.map((n) => RUNS[n][row])
  const moods = moodsOf(totals, 'generala')
  return (
    <div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 14 }}>
        {names.map((n, i) => (
          <div key={n} style={{ textAlign: 'center' }}>
            <Face mood={moods[i]} size={76} seed={n} />
            <div style={{ font: '700 16px Fredoka, system-ui', color: '#b1442a' }}>{totals[i]}</div>
            <div style={{ font: '600 11px Nunito, system-ui', color: INK }}>{n}</div>
            <div style={{ font: '400 10px Nunito, system-ui', color: SOFT }}>mood {moods[i].toFixed(2)}</div>
          </div>
        ))}
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={row}
        onChange={(e) => setRow(Number(e.target.value))}
        style={{ width: 420, accentColor: '#3569b8' }}
      />
      <span style={{ font: '600 12px Nunito, system-ui', color: INK, marginLeft: 10 }}>
        fila {row + 1} de 11
      </span>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <div style={{ background: PAPER, minHeight: '100vh', margin: 0, padding: '28px 30px', font: '400 13px Nunito, system-ui' }}>
    <h1 style={{ font: '600 22px Fredoka, system-ui', color: INK, margin: '0 0 26px' }}>
      Fichas y caras
    </h1>

    <Section title="Fichas" hint="Cada una a 52 / 34 / 26 / 22 px, y la última apagada como se ve cuando no es tu turno.">
      <Tokens />
    </Section>

    <Section
      title="Arrastrá el mood"
      hint="Lo único que no se ve en una grilla quieta: el resorte y el fundido de 180 ms entre poses. Soltalo de golpe de +1 a -1 para ver la caída escalonada."
    >
      <Live />
    </Section>

    <Section
      title="Una partida de verdad"
      hint="Avanzá fila por fila. Juan se escapa, Lucas se queda: esto es lo que la escala proporcional tiene que resolver — la misma diferencia significa cosas distintas en la fila 2 y en la 11."
    >
      <Sheet />
    </Section>

    <Section title="Las seis caras" hint="La de abajo de todo cambia sola entre llanto y bronca cada 10-15 s. Quedate mirando una fila y la vas a ver dar vuelta.">
      {[76, 52].map((size) => (
        <div key={size} style={{ marginBottom: 18 }}>
          {NAMES.map((n) => (
            <FaceRow key={n} name={n} size={size} />
          ))}
        </div>
      ))}
    </Section>
  </div>,
)
