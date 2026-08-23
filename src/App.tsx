import { useState } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Certificate } from './routes/Certificate'
import { GeneralaBoard } from './routes/generala/Board'
import { GeneralaResult } from './routes/generala/Result'
import { GeneralaSetup } from './routes/generala/Setup'
import { History } from './routes/History'
import { Home } from './routes/Home'
import { Splash } from './routes/Splash'
import { TallyBoard } from './routes/tally/Board'
import { TallyResult } from './routes/tally/Result'
import { TallySetup } from './routes/tally/Setup'
import { TrucoBoard } from './routes/truco/Board'
import { TrucoResult } from './routes/truco/Result'

const SPLASH_KEY = 'anotador.splash.seen'

function seenSplash(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_KEY) === '1'
  } catch {
    return true
  }
}

/**
 * HashRouter, not BrowserRouter.
 *
 * GitHub Pages serves static files with no server-side rewrites, so reloading
 * on /truco would 404. With #/truco the path never reaches the server. It also
 * leaves the door open for the NFC tag to point straight at one game.
 */
export function App() {
  const [splashDone, setSplashDone] = useState(seenSplash)

  if (!splashDone) {
    return (
      <Splash
        onDone={() => {
          try {
            sessionStorage.setItem(SPLASH_KEY, '1')
          } catch {
            // Nothing to do — the splash just shows again next time.
          }
          setSplashDone(true)
        }}
      />
    )
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/generala" element={<GeneralaSetup />} />
        <Route path="/generala/partida" element={<GeneralaBoard />} />
        <Route path="/generala/resultado" element={<GeneralaResult />} />

        <Route path="/rummy" element={<TallySetup variant="rummy" />} />
        <Route path="/rummy/partida" element={<TallyBoard variant="rummy" />} />
        <Route path="/rummy/resultado" element={<TallyResult variant="rummy" />} />

        <Route path="/chinchon" element={<TallySetup variant="chinchon" />} />
        <Route path="/chinchon/partida" element={<TallyBoard variant="chinchon" />} />
        <Route path="/chinchon/resultado" element={<TallyResult variant="chinchon" />} />

        <Route path="/truco" element={<TrucoBoard />} />
        <Route path="/truco/resultado" element={<TrucoResult />} />

        <Route path="/historial" element={<History />} />
        <Route path="/certificado" element={<Certificate />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
