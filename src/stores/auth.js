import { defineStore } from 'pinia'
import http from '@/api/http'

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null, ready: false }),
  getters: {
    isLoggedIn: (s) => !!s.user,
  },
  actions: {
    /** Cek sesi yang sedang berjalan (sekali saat aplikasi dibuka). */
    async init() {
      if (this.ready) return
      try {
        const { data } = await http.get('/profile', { skipAuthRedirect: true })
        this.user = data.user
      } catch {
        this.user = null
      }
      this.ready = true
    },
    async login(email, password) {
      const { data } = await http.post('/login', { email, password })
      this.user = data.user
    },
    async logout() {
      try { await http.post('/logout', null, { skipAuthRedirect: true }) } catch { /* sesi sudah berakhir */ }
      this.user = null
    },
    setUser(user) {
      this.user = user
    },
  },
})
