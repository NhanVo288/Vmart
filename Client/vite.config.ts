import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1024,
    emptyOutDir: true,
  },
  server:{
    port: 3000,
  },
  resolve: {
    alias: {
      '@mui/styled-engine': '@mui/styled-engine-sc',
    },
  },
  plugins: [
    react( ),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
