import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must match the GitHub Pages sub-path (https://<user>.github.io/generala/).
// Without it, the built assets are requested from the domain root and the page renders blank.
export default defineConfig({
  plugins: [react()],
  base: '/generala/',
})
