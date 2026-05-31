import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = process.env.NITRO_PRESET === "vercel" || !!process.env.VERCEL;

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: isVercel ? undefined : { entry: "server" },
  },
});
