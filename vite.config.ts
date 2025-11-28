import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from "vite-tsconfig-paths"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress warnings about dynamic imports and external modules
        if (warning.code === 'UNRESOLVED_IMPORT') {
          return
        }
        warn(warning)
      }
    }
  }
})


