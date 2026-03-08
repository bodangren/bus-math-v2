import "dotenv/config";
import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vinext()],
  ssr: {
    noExternal: ['react-spreadsheet', 'fast-formula-parser'],
  },
});
