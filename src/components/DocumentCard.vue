<script setup>
import { computed, reactive, ref } from 'vue'
import http, { parseError } from '@/api/http'
import { compressImage, formatBytes } from '@/utils/image'

const props = defineProps({
  doc: { type: Object, required: true }, // {key,label,required,max_files,hint}
  files: { type: Array, default: () => [] },
  maxMb: { type: Number, default: 10 },
})
const emit = defineEmits(['added', 'replaced', 'removed'])

const uploading = ref([]) // [{id, name, progress}]
const error = ref('')
const confirmId = ref(null)
const busyId = ref(null)

const isTouch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
const slotsLeft = computed(() => Math.max(0, props.doc.max_files - props.files.length - uploading.value.length))
const camera = computed(() => (props.doc.key === 'pasfoto' ? 'user' : 'environment'))

async function prepare(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Hanya file gambar (JPG, PNG, atau WebP) yang bisa diunggah.')
  }
  const ready = await compressImage(file)
  if (ready.size > props.maxMb * 1024 * 1024) {
    throw new Error(`Ukuran file ${formatBytes(ready.size)} melebihi batas ${props.maxMb} MB.`)
  }
  return ready
}

async function onPick(event) {
  const picked = Array.from(event.target.files || []).slice(0, slotsLeft.value)
  event.target.value = '' // izinkan memilih file yang sama lagi
  error.value = ''
  for (const original of picked) {
    const item = reactive({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, name: original.name, progress: 0 })
    uploading.value.push(item)
    try {
      const file = await prepare(original)
      const body = new FormData()
      body.append('type', props.doc.key)
      body.append('file', file)
      const { data } = await http.post('/documents', body, {
        onUploadProgress: (e) => { item.progress = e.total ? Math.round((e.loaded / e.total) * 100) : 0 },
      })
      emit('added', data.file)
    } catch (e) {
      error.value = e.response ? parseError(e).message : e.message
    } finally {
      uploading.value = uploading.value.filter((u) => u.id !== item.id)
    }
  }
}

async function onReplace(event, record) {
  const original = event.target.files?.[0]
  event.target.value = ''
  if (!original) return
  error.value = ''
  busyId.value = record.id
  try {
    const file = await prepare(original)
    const body = new FormData()
    body.append('file', file)
    const { data } = await http.post(`/documents/${record.id}/replace`, body)
    emit('replaced', data.file)
  } catch (e) {
    error.value = e.response ? parseError(e).message : e.message
  } finally {
    busyId.value = null
  }
}

async function remove(record) {
  error.value = ''
  busyId.value = record.id
  try {
    await http.delete(`/documents/${record.id}`)
    emit('removed', record.id)
    confirmId.value = null
  } catch (e) {
    error.value = parseError(e).message
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <section class="card p-5" :aria-labelledby="'doc-' + doc.key">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h3 :id="'doc-' + doc.key" class="text-base font-semibold">{{ doc.label }}</h3>
        <p class="mt-1 text-sm text-graphite-500">{{ doc.hint }}</p>
      </div>
      <div class="flex items-center gap-2 text-xs">
        <span
          class="rounded-full px-2.5 py-1 font-medium"
          :class="doc.required ? 'bg-seal-50 text-seal-700' : 'bg-graphite-100 text-graphite-600'"
        >{{ doc.required ? 'Wajib' : 'Opsional' }}</span>
        <span class="text-graphite-500">{{ files.length }}/{{ doc.max_files }} file</span>
      </div>
    </div>

    <ul v-if="files.length || uploading.length" class="mt-4 grid grid-cols-2 gap-4">
      <li v-for="f in files" :key="f.id" class="overflow-hidden rounded-lg border border-graphite-200">
        <a :href="f.url" target="_blank" rel="noopener noreferrer" class="block bg-graphite-100">
          <img :src="f.url" :alt="`${doc.label}: ${f.original_name}`" loading="lazy" class="aspect-[4/3] w-full object-cover" />
        </a>
        <div class="p-2.5">
          <p class="truncate text-xs text-graphite-600" :title="f.original_name">{{ f.original_name }}</p>

          <div v-if="confirmId === f.id" class="mt-2.5">
            <p class="text-sm font-medium text-graphite-800">Hapus file ini?</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <button type="button" class="btn btn-danger !px-3.5 !py-1.5 !text-xs" :disabled="busyId === f.id" @click="remove(f)">
                <span v-if="busyId === f.id" class="spinner" /> Ya, hapus
              </button>
              <button type="button" class="btn btn-secondary !px-3.5 !py-1.5 !text-xs" :disabled="busyId === f.id" @click="confirmId = null">Batal</button>
            </div>
          </div>
          <div v-else class="mt-2 flex items-center gap-3 text-xs font-medium">
            <span v-if="busyId === f.id" class="inline-flex items-center gap-1.5 text-graphite-600"><span class="spinner" /> Memproses</span>
            <template v-else>
              <label class="cursor-pointer text-graphite-700 hover:text-seal-700 hover:underline">
                Ganti
                <input type="file" accept="image/jpeg,image/png,image/webp,image/*" class="sr-only" @change="onReplace($event, f)" />
              </label>
              <button type="button" class="text-seal-700 hover:underline" @click="confirmId = f.id">Hapus</button>
            </template>
          </div>
        </div>
      </li>

      <li v-for="u in uploading" :key="u.id" class="flex flex-col justify-center rounded-lg border border-dashed border-graphite-300 bg-graphite-50 p-3">
        <p class="truncate text-xs text-graphite-600">{{ u.name }}</p>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-graphite-200" role="progressbar" :aria-valuenow="u.progress" aria-valuemin="0" aria-valuemax="100">
          <div class="h-full bg-seal-600 transition-all" :style="{ width: Math.max(u.progress, 8) + '%' }" />
        </div>
        <p class="mt-1.5 text-xs text-graphite-500">{{ u.progress < 100 ? 'Mengunggah…' : 'Mengoptimalkan…' }}</p>
      </li>
    </ul>

    <div v-if="slotsLeft > 0" class="mt-4 flex flex-wrap gap-2">
      <label class="btn btn-secondary cursor-pointer">
        {{ files.length ? 'Tambah file' : 'Pilih file' }}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/*" :multiple="slotsLeft > 1" class="sr-only" @change="onPick" />
      </label>
      <label v-if="isTouch" class="btn btn-secondary cursor-pointer">
        Ambil foto
        <input type="file" accept="image/*" :capture="camera" class="sr-only" @change="onPick" />
      </label>
    </div>

    <p v-if="error" class="field-error" role="alert">{{ error }}</p>
  </section>
</template>
