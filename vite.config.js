import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

// Backend Laravel saat development (php artisan serve).
// changeOrigin: false penting: header Host asli (mis. sti.localhost:5173) diteruskan ke Laravel
// supaya Laravel tahu perusahaan mana yang sedang dibuka.
const BACKEND = process.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
// const BACKEND =
//   process.env.VITE_BACKEND_URL || "https://api-applicant.yifang.co.id";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    // true = bisa dibuka lewat localhost, payroll.localhost, sti.localhost, dst. (uji banyak perusahaan)
    host: true,
    port: 5173,
    strictPort: true,
    // Browser hanya berbicara dengan satu origin (localhost:5173), sehingga cookie sesi
    // dan CSRF Sanctum berfungsi tanpa konfigurasi CORS. Di produksi Nginx melakukan hal yang sama.
    proxy: {
      "/api": { target: BACKEND, changeOrigin: false },
      "/storage": { target: BACKEND, changeOrigin: false },
    },
  },
});
