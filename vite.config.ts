import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    setupFiles: ['./src/__tests__/setupTests.ts'],
    environment: 'jsdom',
  },
})