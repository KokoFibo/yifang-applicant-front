import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 120000,
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
})

// ---- CSRF (cookie XSRF-TOKEN dari Laravel) ----
const hasCsrfCookie = () => document.cookie.split('; ').some((c) => c.startsWith('XSRF-TOKEN='))
let pending = null

export async function ensureCsrf(force = false) {
  if (!force && hasCsrfCookie()) return
  pending ||= axios.get('/api/csrf', { withCredentials: true }).finally(() => { pending = null })
  await pending
}

http.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase()
  if (!['get', 'head', 'options'].includes(method)) await ensureCsrf()
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error
    // Token CSRF kedaluwarsa: ambil yang baru, ulangi sekali.
    if (response?.status === 419 && config && !config._retried) {
      config._retried = true
      await ensureCsrf(true)
      return http(config)
    }
    if (response?.status === 401 && !config?.skipAuthRedirect) {
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }
    return Promise.reject(error)
  }
)

/** Ubah error axios menjadi { message, errors: {field: pesan}, status, code } yang ramah pengguna. */
export function parseError(err) {
  const res = err?.response
  if (!res) {
    return { message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', errors: {}, status: 0 }
  }
  const data = res.data || {}
  const errors = {}
  for (const [key, value] of Object.entries(data.errors || {})) {
    errors[key] = Array.isArray(value) ? value[0] : value
  }
  let message = Object.values(errors)[0] || data.message
  if (res.status === 413) message = 'Ukuran file terlalu besar untuk diunggah.'
  if (res.status === 429 && !data.message) message = 'Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.'
  if (res.status >= 500) message = 'Terjadi gangguan di server. Coba lagi beberapa saat lagi.'
  return { message: message || 'Terjadi kesalahan. Coba lagi.', errors, status: res.status, code: data.code }
}

export default http
