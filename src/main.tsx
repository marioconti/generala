import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { startSync } from './lib/sync'
import './styles/tokens.css'
import './styles/app.css'

const root = document.getElementById('root')
if (!root) throw new Error('#root is missing from index.html')

// Keeps the finished games the same on every phone at the table. Does nothing
// at all until the two keys in src/config.ts are filled in.
startSync()

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
