import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const RENDER_API = "https://starpolice-api.onrender.com";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    // @ts-expect-error supported at runtime for Cloudflare tunnel previews
    allowedHosts: [".trycloudflare.com"],
    hmr: {
      clientPort: 443,
    },
    proxy: {
      "/api": "http://localhost:5000",
      "/uploads": "http://localhost:5000",
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    // @ts-expect-error supported at runtime for Cloudflare tunnel previews
    allowedHosts: [".trycloudflare.com"],
    proxy: {
      "/api": RENDER_API,
      "/uploads": RENDER_API,
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          bootstrap: ["react-bootstrap"],
          calendar: ["@fullcalendar/react", "@fullcalendar/daygrid", "@fullcalendar/interaction"],
          datepicker: ["react-datepicker"],
        },
      },
    },
  },
});
