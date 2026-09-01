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
- **Names are written on ruled lines, not into boxes.** One row per player, each a
  rule that draws itself gold from the left as it takes focus. The mechanic is the
  obvious one; it was the field styling that made the screen read as a form in the
  middle of an app that is otherwise paper and counters.
- **A stick figure stands beside every total** (`lib/stickman.ts`,
  `lib/stickman-moves.ts`). Whoever is ahead dances, whoever is last takes it badly,
  and anyone in between just stands there — five figures crying at once is noise
  rather than a story. Before anyone scores nobody moves, because a dance decided by
  seating order would be a lie.
  - It is a **rig, not keyframes**: a move is a handful of joint-angle poses and the
    engine interpolates. That is why forty of them fit in one readable file instead
    of forty blocks of CSS that would all end up looking alike.
  - Angles use one convention everywhere — 0 is down, positive turns a limb
    *outwards* on both sides — so a symmetric pose is the same number on both arms.
  - `sit()` exists because dropping the hip does not sit anybody down: the legs are
    still full length, so the figure sinks through the floor. It returns the exact
    hip drop that folding the legs buys.
  - Every pose is checked by walking the skeleton: feet through the floor, hands
    buried in the head, anything outside the viewBox. Clipping is silent on screen,
    and eyeballing a stick figure at 40px does not catch it.
  - Moves are also **measured**, not judged by eye. Each one is sampled over its
    cycle for how far the hands, feet and head travel, and for how close its shape
    comes to every other move in the pool. That is what caught a guitar solo whose
    feet never left the ground, three dances animated entirely above the waist, and
    four pairs that were one move under two names — `strut` and `running-man` were
    3.9 apart, `nail-bite` and `scratch-head` 1.5.
- **Crossing a row out is the loudest thing on the sheet**, so it behaves like it:
  the line draws itself in, ink flies off the pen, the sheet takes the hit, and that
  player's figure spends two and a half seconds taking it personally before going
  back to whatever it was doing.
  - The line is drawn in **percentages with no viewBox**. The old one used a fixed
    viewBox with `preserveAspectRatio="none"`, which scaled the stroke with the
    column — a different weight at two players than at six — and on a short phone
    pushed the round cap 5px past the bottom of its own cell into the row below.
  - An `<svg>` with no viewBox is a replaced element: without explicit `width` and
    `height` it falls back to 300x150 and percentage coordinates resolve against
    *that*. Missing them once drew the line right across the sheet.
  - The shake is applied by hand rather than through a class in the render, because
    a CSS animation does not restart when a class it already carries is set again,
    and two rows crossed out in half a second is exactly when the second has to
    land. Re-keying the sheet would restart it and tear down every figure with it.
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
