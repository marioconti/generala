/**
 * The shared table.
 *
 * Fill these two in and every phone that opens the app starts sharing its
 * finished games. Leave them empty and the app behaves exactly as it always
 * did: each phone keeps its own history, offline, with nothing to configure.
 * There is no half-broken state — it is on or it is off.
 *
 * WHERE THEY COME FROM: supabase.com → your project → Settings → API.
 * `SUPABASE_URL` is the Project URL, `SUPABASE_ANON_KEY` is the key labelled
 * "anon public".
 *
 * ON PUTTING A KEY IN A PUBLIC REPO: the anon key is meant to travel inside the
 * page — it ships in the JavaScript every visitor downloads, so it is public by
 * design and treating it as a secret would be a misunderstanding, not caution.
 * What it grants is exactly what the table's policies allow, which here is
 * "anyone may read and write the games". That is the deliberate price of a
 * scoresheet nobody has to log in to. The worst case is somebody finding the
 * key and writing junk games, and the fix is deleting rows.
 *
 * Never put the `service_role` key here. That one bypasses every policy.
 */
export const SUPABASE_URL = ''
export const SUPABASE_ANON_KEY = ''
