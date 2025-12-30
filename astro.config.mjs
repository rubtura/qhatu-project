import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://rubtura.github.io",
  base: "/qhatu-project",

  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
});
