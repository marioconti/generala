# El Anotador

A scorekeeper for the games played at one table: **Generala**, **Truco**, **Rummy** and
**Chinchón**. Built to be opened by tapping a phone on an NFC tag stuck to the table, and
to be faster than scoring on paper.

**Live:** https://marioconti.github.io/generala/

## Why it exists

It is the first experiment in a project about learning NFC. An NTAG215 sticker on the
games table holds this URL; tapping a phone against it opens the menu. The tag is a
signpost, not a database — 31 of its 504 bytes hold the address, the app does the rest.

The repository is still called `generala` because that is the URL already written to the
tag, and rewriting a sticker to rename a repo is a bad trade.

## The four games

| Game | How it scores | Ends when |
|---|---|---|
| **Generala** | 11 fixed categories, per-player sheet | Every cell is filled |
| **Truco** | Tally marks, two teams, malas and buenas | Someone reaches 30 |
| **Rummy** | Hand by hand, running total | Someone crosses the target |
| **Chinchón** | Same engine as Rummy | Someone reaches 100 |

Rummy and Chinchón are one engine with two knobs — the target and whether the highest or
lowest total wins — because that is genuinely all that separates them, and because house
rules vary more than any website admits. Both are editable at setup.

### Scoring, with sources

**Generala** (verified 2026-08-22): Escalera 20/25 · Full 30/35 · Póker 40/45 ·
Generala 50 · Doble Generala 100, where the second number is a hand made on the first
roll. Two house rules depart from the published ones: a served Generala scores 50 and
play continues rather than winning outright, and Doble Generala is played.
[Reglamento Ruibal](https://ruibalgames.com/wp-content/uploads/2015/11/Reglamento-Generala.pdf)

**Truco** (verified 2026-08-23): 30 points, the first 15 "las malas" and the last 15
"las buenas". Marks go in groups of five — four strokes crossed by a diagonal.
[Reglamento](https://trucogame.com/pages/reglamento-de-truco-argentino)

**Chinchón** (verified 2026-08-23): played to 100, and the **lowest** total wins —
reaching the limit ends the game. Closing with no cards left subtracts 10, so negative
hands are normal and the keypad has a sign key.
[Ludoteka](https://www.ludoteka.com/games/chinchon/rules)

## Design

Each game gets its own table: casino green for Generala, deep teal for Rummy, wine for
Chinchón, olive for Truco. Same recipe underneath — a gradient lit from above, grained
with SVG turbulence, and a quiet motif per game (dice pips, diamonds, rings, ruled lines)
— so the four screens feel like four tables in one club rather than one screen recoloured.

On every table sits the same cream sheet. Scores go in blue ink, totals in red, and a
crossed-out row uses the diagonal stroke you would draw yourself. Players are poker chips
rather than card suits, because there are only four suits and a sheet takes six players.

Every board fits an iPhone 13 without scrolling in either direction. In Generala the
column widths and type sizes shrink with the player count to keep that true up to six; at
that width the die pips carry the row label on their own.

Nothing is typed where a tap will do. Generala's number rows ask how many dice showed
that face and multiply. Rummy uses a keypad drawn in the page rather than the phone's own,
which would slide over the sheet on every hand.

## The championship

Finished games are recorded in `localStorage`. Win **15** and the app issues a certificate
naming you Campeón Supremo del Máximo, entitled to 1 kg of ice cream — billed to whoever
you have beaten most often, which the app works out from the history.

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
  reloading on `/truco` would 404. `#/truco` never reaches the server.
- **`base: '/generala/'`** in `vite.config.ts` must match the Pages sub-path, or the built
  assets are requested from the domain root and the page renders blank.
- **`public/404.html`** redirects unknown paths into the app. A tag written with a
  trailing space resolves to `%20` and would otherwise dead-end on GitHub's 404 page —
  bad for someone who just tapped a phone on a table.
- **No `crypto.randomUUID()`.** It only exists in a secure context, and phone testing over
  the LAN is plain http.
- **One small store per game** (`lib/store.ts`, on `useSyncExternalStore`) rather than four
  React providers: setup and board are separate routes and would otherwise hold separate
  copies of the same game.
- **Editing a score can reopen a finished game.** That is deliberate — a mistyped score
  should be fixable after the fact. The history entry is amended rather than appended, so
  one game never counts twice toward the championship.

## Stack

React 19 · TypeScript · Vite · React Router 7 · plain CSS. No UI library — the design is
specific enough that one would get in the way.
