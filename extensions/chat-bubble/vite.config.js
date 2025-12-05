import { defineConfig } from "vite";
import shopify from "vite-plugin-shopify";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    shopify({
      sourceCodeDir: "src",
      entrypointsDir: "src/entrypoints",
    }),
    tailwindcss(),
  ],
  build: {
    emptyOutDir: false,
    outDir: "assets",
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name]-[hash][extname]",
      },
    },
  },
});
