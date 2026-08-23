# Generala

A scoresheet for [Generala](https://en.wikipedia.org/wiki/Generala), the Argentine dice game.
Built to be tapped open from an NFC tag stuck to the table, and to be faster than
scoring on paper.

**Live:** https://marioconti.github.io/generala/

## Why it exists

It is the first experiment in a project about learning NFC. An NTAG215 sticker on the
games table holds this URL; tapping a phone against it opens the sheet. The tag is a
signpost, not a database — 504 bytes hold the address, the app does the rest.

## Design

Two layers: a casino felt as the table, and a cream paper sheet resting on it. Scores are
written in blue ink, totals in red, and a crossed-out row is drawn with the same diagonal
stroke you would use on paper. Players are identified by poker chips rather than card
suits, because there are only four suits and the sheet takes six players.

The whole sheet — eleven categories plus the total — fits an iPhone 13 without scrolling
in either direction. Column widths and type sizes shrink with the player count to keep
that true up to six players; at that width the die pip pattern carries the row label on
its own.

Number rows are never typed: you tap how many dice showed that face and the app
multiplies. Combination rows offer made / served / scratched.

## Scoring

| Row | Made | Served |
|---|---|---|
| 1 – 6 | count × face | — |
| Escalera | 20 | 25 |
| Full | 30 | 35 |
| Póker | 40 | 45 |
| Generala | 50 | 50 |
| Doble Generala | 100 | 100 |

Sources: [Reglamento Ruibal](https://ruibalgames.com/wp-content/uploads/2015/11/Reglamento-Generala.pdf),
[dinamicasgrupales](https://juegos.dinamicasgrupales.com.ar/como-jugar-a-la-generala/).

Two house rules depart from those: a served Generala scores 50 and play continues rather
than winning outright, and Doble Generala is played for 100. Both live in
`src/game/rules.ts`.

## Running it

```bash
npm install
npm run dev            # http://localhost:5173/generala/
npm run dev -- --host  # also serves on the LAN, for testing on a phone
npm run build
```

The design targets a phone. Test it on one.

## Notes for anyone reading the code

- **`HashRouter`, not `BrowserRouter`.** GitHub Pages has no server-side rewrites, so
  reloading on `/partida` would 404. `#/partida` never reaches the server.
- **`base: '/generala/'`** in `vite.config.ts` must match the Pages sub-path, or the built
  assets are requested from the domain root and the page renders blank.
- **No `crypto.randomUUID()`.** It only exists in a secure context, and phone testing over
  the LAN is plain http.
- The game in progress is kept in `localStorage`, so closing the browser mid-game does not
  lose the sheet. The tag always opens `/`, which is why that screen offers to resume.

## Stack

React 19 · TypeScript · Vite · React Router 7 · plain CSS. No UI library — the design is
specific enough that one would get in the way.
