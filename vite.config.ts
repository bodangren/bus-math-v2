import "dotenv/config";
import vinext from "vinext";
import { defineConfig } from "vite";

async function loadPlugins() {
  const plugins = [vinext()];
  try {
    const { cloudflare } = await import("@cloudflare/vite-plugin");
    plugins.push(cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }));
  } catch {
    // @cloudflare/vite-plugin not installed — skip for local builds
  }
  return plugins;
}

export default defineConfig(async () => ({
  plugins: await loadPlugins(),
  ssr: {
    noExternal: ["react-spreadsheet", "fast-formula-parser"],
  },
}));
