/**
 * The shared table.
 *
 * With these filled in, every phone that opens the app shares its finished
 * games. Empty them and the app goes back to what it always did: each phone
 * keeps its own history, offline, with nothing to configure. There is no
 * half-broken state — it is on or it is off.
 *
 * WHERE THEY COME FROM: supabase.com → project `el-anotador` → Settings →
 * API Keys. The one to use is the **publishable** key — Supabase renamed what
 * used to be called "anon public", and that is the one the page carries.
 *
 * ON KEEPING A KEY IN A PUBLIC REPO: the publishable key is meant to travel
 * inside the page — it ships in the JavaScript every visitor downloads, so it
 * is public by design and treating it as a secret would be a misunderstanding,
 * not caution. What it grants is exactly what the table's row-level policies
 * allow, which here is "anyone may read and write the games". That is the
 * deliberate price of a scoresheet nobody has to log in to: the worst case is
 * somebody finding the key and writing junk games, and the fix is deleting rows.
 *
 * Never put the **secret** key here. That one bypasses every policy.
 */
// Typed as `string`, not inferred as its literal, so emptying them to turn
// sharing off stays a one-character edit that still type-checks.
export const SUPABASE_URL: string = 'https://omnsrtybcunqfmevjgip.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY: string = 'sb_publishable_kJguKfrNO_4b8bC6tZSqDg_KA9Ev6I0'
