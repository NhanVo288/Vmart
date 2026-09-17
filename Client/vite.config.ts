import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: '../API/RestoreAPI.Presentation/wwwroot/',
    chunkSizeWarningLimit: 1024,
    emptyOutDir: true,
  },
  server:{
    port: 3000,
    proxy: {
      // Proxy API calls to backend to avoid CORS issues
      '/admin': {
        target: 'http://localhost:7255',
        changeOrigin: true,
        secure: false,
      },
      '/hangfire': {
        target: 'http://localhost:7255',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@mui/styled-engine': '@mui/styled-engine-sc',
    },
  },
  plugins: [
    react( ),
    mkcert(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})
