import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GameProvider } from './game/useGame'
import { Result } from './routes/Result'
import { Scoreboard } from './routes/Scoreboard'
import { Setup } from './routes/Setup'

/**
 * HashRouter, not BrowserRouter.
 *
 * GitHub Pages serves static files with no server-side rewrites, so reloading
 * on /partida would 404. With #/partida the path never reaches the server.
 * It also keeps the door open for the NFC tag to point at a specific state,
 * e.g. .../generala/#/partida — the whole reason this is a router and not
 * three modals.
 */
export function App() {
  return (
    <GameProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Setup />} />
          <Route path="/partida" element={<Scoreboard />} />
          <Route path="/resultado" element={<Result />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </GameProvider>
  )
}
