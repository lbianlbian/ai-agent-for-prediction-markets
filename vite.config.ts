import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    nodePolyfills({
      globals: {
        Buffer: true,  // Polyfills Buffer for browser
        process: true, // Often needed alongside Buffer for Solana libs
      },
      protocolImports: true, // Supports node: imports if used
    })
  ],
  optimizeDeps: {
    include: ['@solana/spl-token', '@solana/web3.js'], // Ensure Solana deps are pre-bundled
  },
  define: {
    global: 'globalThis', // Maps Node global to browser equivalent
  },
})
