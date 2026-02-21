import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    isolate: true,
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    css: true,
    environmentOptions: {
      happyDOM: {
        url: 'http://localhost'
      }
    },
    setupFiles: [
      './tests/setup/test-setup.ts',
      './tests/setup/jest-axe-setup.ts'
    ],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'tests/',
        'node_modules/',
        'src/main.tsx',
        'src/router.tsx',
        'src/**/*.d.ts',
        'src/vite-env.d.ts',
        'src/types/**',
        'src/mocks/**',
        'src/**/*.{test,spec}.{ts,tsx}'
      ],
      thresholds: {
        global: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
        '**/*.schema.ts': {
          lines: 100,
          functions: 100,
          branches: 100
        },
        'src/services/**/*.ts': {
          lines: 90,
          functions: 90,
          branches: 85
        },
        'src/stores/**/*.ts': {
          lines: 95,
          functions: 95,
          branches: 90
        },
        'src/components/**/*.tsx': {
          lines: 75,
          functions: 75,
          branches: 70
        },
        perFile: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})