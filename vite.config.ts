import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/book-scanner/',
  plugins: [react()],

  server: {
    allowedHosts: ['97b70403687b.ngrok-free.app'],
  },
});
