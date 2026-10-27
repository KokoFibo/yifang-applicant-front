const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))

/** Membuat skala 50..900 dari satu warna utama dan memasangnya sebagai variabel CSS. */
export function applyTheme(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return
  const base = hexToRgb(hex)
  const white = [255, 255, 255]
  const black = [0, 0, 0]
  const scale = {
    50: mix(base, white, 0.94), 100: mix(base, white, 0.88), 200: mix(base, white, 0.76),
    300: mix(base, white, 0.58), 400: mix(base, white, 0.34), 500: mix(base, white, 0.12),
    600: base, 700: mix(base, black, 0.2), 800: mix(base, black, 0.36), 900: mix(base, black, 0.5),
  }
  const root = document.documentElement
  for (const [step, rgb] of Object.entries(scale)) root.style.setProperty(`--seal-${step}`, rgb.join(' '))
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', hex)
}

export function setFavicon(url) {
  if (!url) return
  let link = document.querySelector('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.removeAttribute('type')
  link.href = url
}
