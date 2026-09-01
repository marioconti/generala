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
| **Rummy** | Hand by hand, running total | Someone crosses 100 |
| **Chinchón** | Same engine; closing a hand scores −10 | Someone crosses 100 |

Rummy and Chinchón are one engine. Both run to 100 and the **lowest** total wins —
crossing 100 ends the game and the player who crossed it has lost. The only thing
Chinchón adds is that whoever closes the hand writes **−10**, which the round sheet offers
as a single tap.

Neither is configurable. These are the house rules as played at this table; guessing at
"flexible defaults" only produced settings nobody wanted to touch.

### Scoring, with sources

**Generala** (verified 2026-08-22): Escalera 20/25 · Full 30/35 · Póker 40/45 ·
Generala 50 · Doble Generala 100, where the second number is a hand made on the first
roll. Two house rules depart from the published ones: a served Generala scores 50 and
play continues rather than winning outright, and Doble Generala is played.
[Reglamento Ruibal](https://ruibalgames.com/wp-content/uploads/2015/11/Reglamento-Generala.pdf)

**Truco** (verified 2026-08-23): 30 points, the first 15 "las malas" and the last 15
"las buenas". Marks go in groups of five — four strokes crossed by a diagonal.
[Reglamento](https://trucogame.com/pages/reglamento-de-truco-argentino)

**Rummy and Chinchón**: both to 100, lowest total wins, and in Chinchón closing the hand
scores −10 — house rules, confirmed 2026-08-23. Negative hands are normal, which is why
the keypad carries a sign key. The published Chinchón rules agree:
[Ludoteka](https://www.ludoteka.com/games/chinchon/rules)

## Design

Every screen is a wooden table with a green felt mat laid over it. The mat is inset so the
timber shows around all four edges — that gap is what makes it read as cloth on a table
rather than a coloured background. The grain is an SVG turbulence stretched hard along one
axis (`0.014 x 0.7`), which is what makes noise look like wood instead of static.

All four tables stay green and vary the shade and the wood tone with it — sage over pale
oak for Generala, olive over dark walnut for Truco, eucalyptus over grey oak for Rummy,
moss over cherry for Chinchón. Four corners of the same house, not four products. Each mat
carries a soft motif stitched into the cloth: dots, waves, leaves, rings.

On every table sits the same cream sheet. Scores go in warm brown ink, totals in
terracotta, and a crossed-out row uses the diagonal stroke you would draw yourself.
Players are painted wooden counters — the kind that come in a board-game box — because
there are only four card suits and a sheet takes six players.

Type is Fredoka over Nunito: rounded and warm. Shadows are brown and diffuse rather than
black and hard, and nothing on the table has a sharp corner.

Every board fits an iPhone 13 without scrolling in either direction. In Generala the
column widths and type sizes shrink with the player count to keep that true up to six; at
that width the die pips carry the row label on their own.

Nothing is typed where a tap will do. Generala's number rows ask how many dice showed
that face and multiply. Rummy uses a keypad drawn in the page rather than the phone's own,
which would slide over the sheet on every hand.

**Truco is scored by dragging.** Sweep up over a team's column and marks appear under your
finger, sweep back down and they rub out; a badge tracks the running count and the whole
gesture commits on release, so overshooting costs nothing. A tap scores one. Undo takes
back the entire gesture rather than one mark, which is what you meant by it.

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
- **You pick the score, never the arithmetic.** A number row can only ever hold six
  values (0 to five dice times its face), so those six totals are the buttons. The
  earlier version asked how many dice showed the face and printed the product below,
  which made the anotador do the multiplying in front of you — the wrong job for a
  scoresheet. The dice under each number are a reminder of what the value means, not a
  sum to work out.
- **Nobody fills in a form to start a game.** The setup screen is a table being
  set: each player is a counter on the felt, empty seats are drawn so the minimum
  is visible without a sentence explaining it, and whoever has played before is one
  tap away. There is a single line to write on, and by the third night it is barely
  used. Suggestions deliberately show no colour — a player's counter depends on the
  seat they take, which is not decided until they are added.
- **The closing line is picked, not composed** (`lib/verdicts.ts`). Each band of
  margin has a pool of headlines; a line that had to qualify — a clean sheet, four
  scratches, a full table — is weighted to come up three times as often, because
  landing on one of those is the point. Two constraints hold the pool together: a
  line may only use what the app actually knows (margin, scratches, players,
  names) and never invent how the game went, and it may never say "arriba", since
  chinchón is won by the lowest score. The pick is seeded off the finished game
  rather than `Math.random()`, so revisiting the card shows the same verdict.
- **Truco keeps its own taunts** instead of using that pool: truco is scored by
  team, the default names are Nosotros / Ellos, and every line in the pool agrees
  with a singular subject. "Ellos perdió por 4" is not worth a better joke.
- **Editing a score can reopen a finished game.** That is deliberate — a mistyped score
  should be fixable after the fact. The history entry is amended rather than appended, so
  one game never counts twice toward the championship.

## Stack

React 19 · TypeScript · Vite · React Router 7 · plain CSS. No UI library — the design is
specific enough that one would get in the way.
