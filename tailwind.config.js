/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        // Warna merek = warna utama perusahaan. Nilainya diatur saat runtime (src/utils/theme.js)
        // dari data perusahaan untuk domain yang sedang dibuka.
        seal: Object.fromEntries(
          [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((n) => [n, `rgb(var(--seal-${n}) / <alpha-value>)`])
        ),
        // Abu grafit dingin untuk teks dan panel gelap
        graphite: {
          50: '#f5f6f7', 100: '#e9ebed', 200: '#d3d6da', 300: '#b0b5bc', 400: '#878e98',
          500: '#69707b', 600: '#535963', 700: '#444952', 800: '#2f3238', 900: '#1f2125',
        },
      },
      fontFamily: {
        sans: ['"Public Sans Variable"', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Bricolage Grotesque Variable"', '"Public Sans Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
