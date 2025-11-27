import { defineConfig } from 'vite'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['./test/setup.js'],
    globals: true,
    include: ['**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', '.git', '.cache'],
  },
})