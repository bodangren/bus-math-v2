import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: [
      '__tests__/**/*.test.{ts,tsx}',
      'app/**/*.test.{ts,tsx}',
      'components/**/*.test.{ts,tsx}',
      'hooks/**/*.test.{ts,tsx}',
      'lib/**/*.test.{ts,tsx}',
      'supabase/**/*.test.{ts,tsx}',
      'tests/security/**/*.test.{ts,tsx}',
      'proxy.test.ts',
    ],
    reporters: 'default'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
});
