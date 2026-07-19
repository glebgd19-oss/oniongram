import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// base: "./" — относительные пути, чтобы сборка работала на GitHub Pages
// в под-каталоге вида https://<user>.github.io/<repo>/ без доп. настройки.
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
  },
})
