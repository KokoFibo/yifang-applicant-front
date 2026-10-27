import { defineStore } from 'pinia'
import http from '@/api/http'

export const useMetaStore = defineStore('meta', {
  state: () => ({ loaded: false, options: {}, documents: [], maxUploadMb: 10, schoolDetailFrom: 'SMA/SMK' }),
  actions: {
    async load() {
      if (this.loaded) return
      const { data } = await http.get('/meta')
      this.options = data.options
      this.documents = data.documents
      this.maxUploadMb = data.max_upload_mb
      this.schoolDetailFrom = data.school_detail_from || this.schoolDetailFrom
      this.loaded = true
    },
    /** Jurusan dan nama sekolah/kampus hanya relevan untuk pendidikan SMA/SMK ke atas. */
    hasSchoolDetail(pendidikan) {
      const list = (this.options.pendidikan || []).map((o) => o.value)
      const from = list.indexOf(this.schoolDetailFrom)
      return from >= 0 && list.indexOf(pendidikan) >= from
    },
    labelOf(optionKey, value) {
      const hit = (this.options[optionKey] || []).find((o) => o.value === value)
      return hit ? hit.label : value
    },
  },
})
