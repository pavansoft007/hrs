import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-is', 'recharts'],
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
});
