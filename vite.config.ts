// TanStack Start Vite configuration for AVP Gold Enterprise ERP
// Plugins configured: tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (cloudflare-module).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
