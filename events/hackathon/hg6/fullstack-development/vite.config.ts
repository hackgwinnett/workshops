import './webcontainer-als'
import { defineConfig } from 'vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'

const config = defineConfig({
  // CodeSandbox serves the preview from *.csb.app
  server: { allowedHosts: ['.csb.app'] },
  resolve: { tsconfigPaths: true },
  plugins: [tanstackStart(), viteReact()],
})

export default config
