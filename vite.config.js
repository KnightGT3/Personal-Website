import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [cloudflare()],
  build: {
    rollupOptions: {
      // Both pages are real entries, so each gets the hashed CSS/JS injected.
      // Anything dropped in public/ is copied to dist/ untouched.
      input: {
        index: "index.html",
        notFound: "404.html",
      },
    },
  },
});
