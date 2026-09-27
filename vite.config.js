import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [cloudflare()],
  build: {
    rollupOptions: {
      // Every page is a real entry, so each gets the hashed CSS/JS injected.
      // Anything dropped in public/ is copied to dist/ untouched.
      input: {
        index: "index.html",
        notFound: "404.html",
        dotComVsAi: "projects/dot-com-vs-ai.html",
      },
    },
  },
});
