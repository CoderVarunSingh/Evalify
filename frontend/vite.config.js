import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@stream-io") || id.includes("stream-chat")) {
              return "vendor-stream";
            }
            if (id.includes("jspdf") || id.includes("html2canvas")) {
              return "vendor-pdf";
            }
            if (id.includes("@clerk")) {
              return "vendor-clerk";
            }
            if (id.includes("lucide-react")) {
              return "vendor-lucide";
            }
          }
        },
      },
    },
  },
});
