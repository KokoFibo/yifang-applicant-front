import { defineStore } from 'pinia'
import http, { parseError } from '@/api/http'
import { applyTheme, setFavicon } from '@/utils/theme'

/** Perusahaan untuk domain yang sedang dibuka (nama, logo, warna). Semua dari database. */
export const useTenantStore = defineStore('tenant', {
  state: () => ({ company: null, loaded: false, error: '', detail: '' }), // error: '' | 'unregistered' | 'network'
  getters: {
    name: (s) => s.company?.name || 'Portal Calon Karyawan',
    logoUrl: (s) => s.company?.logo_url || '/logo.png',
  },
  actions: {
    async load(force = false) {
      if (this.loaded && !force) return
      this.error = ''
      this.detail = ''
      try {
        const { data } = await http.get('/tenant', { skipAuthRedirect: true })
        this.company = data.company
        applyTheme(data.company.primary_color)
        setFavicon(this.logoUrl)
        document.title = `Portal Calon Karyawan | ${data.company.name}`
      } catch (e) {
        const p = parseError(e)
        // "Belum terdaftar" hanya jika Laravel sendiri yang menjawab demikian. 404 lain = API tidak ditemukan.
        this.error = e.response?.data?.code === 'company_not_found' ? 'unregistered' : 'network'
        this.detail = p.status ? `Kode respons server: ${p.status}.` : ''
      }
      this.loaded = true
    },
  },
})
