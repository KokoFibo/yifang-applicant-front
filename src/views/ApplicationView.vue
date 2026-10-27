<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import http, { parseError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import { useMetaStore } from '@/stores/meta'
import { ALL_FIELDS, SECTIONS } from '@/config/fields'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import SectionForm from '@/components/SectionForm.vue'
import DocumentCard from '@/components/DocumentCard.vue'
import FormField from '@/components/FormField.vue'
import AlertBox from '@/components/AlertBox.vue'

const auth = useAuthStore()
const meta = useMetaStore()

const STEPS = [
  ...SECTIONS.map((s) => ({ key: s.key, title: s.title })),
  { key: 'dokumen', title: 'Dokumen' },
  { key: 'kirim', title: 'Tinjau dan kirim' },
]
const DOC_STEP = STEPS.findIndex((s) => s.key === 'dokumen')
const REVIEW_STEP = STEPS.length - 1

const loading = ref(true)
const loadError = ref('')
const files = ref([])
const step = ref(0)
const form = reactive({})
const errors = ref({})
const saving = ref(false)
const notice = ref('')
const submitting = ref(false)
const submitError = ref('')
const submitted = ref(false)

const user = computed(() => auth.user || {})
const current = computed(() => STEPS[step.value])
const currentSection = computed(() => SECTIONS.find((s) => s.key === current.value.key))
const isSubmitted = computed(() => user.value.status === 1)

// ---------- Data ----------
function fillForm(fields = ALL_FIELDS) {
  for (const f of fields) form[f.name] = user.value[f.name] ?? ''
}

const stored = (name) => String(user.value[name] ?? '').trim()
const sectionComplete = (sec) => sec.fields.filter((f) => !f.optional).every((f) => stored(f.name) !== '')
const filesFor = (key) => files.value.filter((f) => f.type === key)
const docsComplete = computed(() => meta.documents.filter((d) => d.required).every((d) => filesFor(d.key).length > 0))
const missingDocs = computed(() => meta.documents.filter((d) => d.required && filesFor(d.key).length === 0))

function stepDone(i) {
  const key = STEPS[i].key
  if (key === 'dokumen') return docsComplete.value
  if (key === 'kirim') return isSubmitted.value
  return sectionComplete(SECTIONS.find((s) => s.key === key))
}

function isDirty(sec) {
  return sec.fields.some((f) => String(form[f.name] ?? '').trim() !== stored(f.name))
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    await meta.load()
    const { data } = await http.get('/documents')
    files.value = data.files
    fillForm()
    const firstOpen = STEPS.findIndex((_, i) => i < REVIEW_STEP && !stepDone(i))
    step.value = isSubmitted.value ? REVIEW_STEP : firstOpen === -1 ? REVIEW_STEP : firstOpen
  } catch (e) {
    loadError.value = parseError(e).message
  } finally {
    loading.value = false
  }
}
onMounted(load)

// ---------- Navigasi ----------
function goTo(i) {
  if (i === step.value) return
  if (currentSection.value && isDirty(currentSection.value) && !window.confirm('Perubahan di langkah ini belum disimpan. Lanjutkan tanpa menyimpan?')) return
  if (currentSection.value) fillForm(currentSection.value.fields) // buang perubahan yang tidak disimpan
  errors.value = {}
  notice.value = ''
  submitError.value = ''
  step.value = i
  window.scrollTo(0, 0)
}

async function saveSection(andNext = true) {
  const sec = currentSection.value
  errors.value = {}
  notice.value = ''
  saving.value = true
  try {
    const payload = Object.fromEntries(sec.fields.map((f) => [f.name, form[f.name]]))
    const { data } = await http.put(`/profile/${sec.key}`, payload)
    auth.setUser(data.user)
    fillForm(sec.fields) // tampilkan versi yang sudah dirapikan server
    if (andNext) {
      step.value += 1
      window.scrollTo(0, 0)
    } else {
      notice.value = 'Perubahan tersimpan.'
    }
  } catch (e) {
    const p = parseError(e)
    errors.value = p.errors
    if (!Object.keys(p.errors).length) notice.value = ''
    submitError.value = Object.keys(p.errors).length ? '' : p.message
    window.scrollTo(0, 0)
  } finally {
    saving.value = false
  }
}

// ---------- Dokumen ----------
const onAdded = (file) => files.value.push(file)
const onReplaced = (file) => { files.value = files.value.map((f) => (f.id === file.id ? file : f)) }
const onRemoved = (id) => { files.value = files.value.filter((f) => f.id !== id) }

// ---------- Kirim ----------
async function submit() {
  submitError.value = ''
  submitting.value = true
  try {
    const { data } = await http.post('/profile/submit')
    auth.setUser(data.user)
    submitted.value = true
    window.scrollTo(0, 0)
  } catch (e) {
    const p = parseError(e)
    submitError.value = p.errors.submit || p.message
  } finally {
    submitting.value = false
  }
}

function display(f) {
  const v = user.value[f.name]
  if (v === null || v === undefined || v === '') return '-'
  if (f.options) return meta.labelOf(f.options, v)
  if (f.type === 'date') return new Date(v + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  return v
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />

    <main class="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
      <div v-if="loading" class="flex items-center justify-center gap-3 py-24 text-graphite-600"><span class="spinner" /> Memuat formulir…</div>

      <div v-else-if="loadError" class="mx-auto max-w-md space-y-4 py-16 text-center">
        <AlertBox>{{ loadError }}</AlertBox>
        <button type="button" class="btn btn-primary" @click="load">Coba lagi</button>
      </div>

      <template v-else>
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="text-2xl font-semibold sm:text-3xl">Formulir calon karyawan</h1>
            <p class="mt-1 text-graphite-600">Periksa semua data sebelum dikirim. Anda bisa mengubahnya lagi kapan saja.</p>
          </div>
          <span
            class="rounded-full px-3 py-1 text-sm font-medium"
            :class="isSubmitted ? 'bg-emerald-50 text-emerald-700' : 'bg-graphite-200 text-graphite-700'"
          >{{ isSubmitted ? 'Sudah dikirim' : 'Belum dikirim' }}</span>
        </div>

        <!-- Langkah: grid 3 kolom di HP (2 baris), satu baris memanjang di layar lebar -->
        <nav class="mt-7" aria-label="Langkah formulir">
          <ol class="grid grid-cols-3 gap-2 md:flex">
            <li v-for="(s, i) in STEPS" :key="s.key" class="md:flex-1">
              <button
                type="button"
                class="flex h-full w-full flex-col items-center justify-start gap-1.5 rounded-lg border px-2 py-2.5 text-center text-xs font-medium leading-tight transition-colors md:flex-row md:gap-2.5 md:px-3 md:text-left md:text-sm md:font-normal"
                :class="i === step ? 'border-seal-600 bg-white font-semibold text-graphite-900 md:font-semibold' : 'border-graphite-200 bg-white text-graphite-600 hover:bg-graphite-100'"
                :aria-current="i === step ? 'step' : undefined"
                @click="goTo(i)"
              >
                <span
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold md:h-6 md:w-6"
                  :class="stepDone(i) ? 'bg-emerald-600 text-white' : i === step ? 'bg-seal-600 text-white' : 'bg-graphite-200 text-graphite-700'"
                >
                  <svg v-if="stepDone(i)" viewBox="0 0 20 20" class="h-3.5 w-3.5" fill="currentColor" aria-hidden="true"><path d="M8.3 14.3 4.7 10.7l1.4-1.4 2.2 2.2 5.6-5.6 1.4 1.4-7 7z" /></svg>
                  <template v-else>{{ i + 1 }}</template>
                </span>
                <span>{{ s.title }}</span>
              </button>
            </li>
          </ol>
        </nav>

        <!-- Bagian formulir -->
        <section v-if="currentSection" class="card mt-6 p-5 sm:p-7" :aria-labelledby="'step-title'">
          <h2 id="step-title" class="text-xl font-semibold">{{ currentSection.title }}</h2>
          <p class="mt-1 text-graphite-600">{{ currentSection.description }}</p>

          <AlertBox v-if="submitError" class="mt-5">{{ submitError }}</AlertBox>
          <AlertBox v-if="Object.keys(errors).length" class="mt-5">Ada isian yang perlu diperbaiki. Periksa kolom yang ditandai.</AlertBox>
          <AlertBox v-if="notice" type="success" class="mt-5">{{ notice }}</AlertBox>

          <div class="mt-6 space-y-5">
            <FormField v-if="currentSection.key === 'pribadi'" id="f-email" label="Email" hint="Email tidak dapat diubah.">
              <input id="f-email" type="email" class="input" :value="user.email" disabled />
            </FormField>
            <SectionForm :fields="currentSection.fields" :form="form" :errors="errors" />
          </div>

          <div class="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-graphite-200 pt-5">
            <button type="button" class="btn btn-secondary" :disabled="step === 0 || saving" @click="goTo(step - 1)">Kembali</button>
            <div class="flex flex-wrap gap-2">
              <button v-if="isSubmitted" type="button" class="btn btn-secondary" :disabled="saving" @click="saveSection(false)">Simpan perubahan</button>
              <button type="button" class="btn btn-primary" :disabled="saving" @click="saveSection(true)">
                <span v-if="saving" class="spinner" /> Simpan dan lanjut
              </button>
            </div>
          </div>
        </section>

        <!-- Dokumen -->
        <section v-else-if="current.key === 'dokumen'" class="mt-6" aria-labelledby="step-title">
          <div class="card p-5 sm:p-7">
            <h2 id="step-title" class="text-xl font-semibold">Dokumen</h2>
            <p class="mt-1 text-graphite-600">
              Pilih file dari galeri atau ambil foto langsung. Gambar dikecilkan dan dioptimalkan otomatis (maks. {{ meta.maxUploadMb }} MB per file, format JPG, PNG, atau WebP).
            </p>
          </div>

          <h3 class="mb-3 mt-8 text-lg font-semibold">Dokumen wajib</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <DocumentCard
              v-for="d in meta.documents.filter((x) => x.required)" :key="d.key"
              :doc="d" :files="filesFor(d.key)" :max-mb="meta.maxUploadMb"
              @added="onAdded" @replaced="onReplaced" @removed="onRemoved"
            />
          </div>

          <h3 class="mb-3 mt-8 text-lg font-semibold">Jika ada</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <DocumentCard
              v-for="d in meta.documents.filter((x) => !x.required)" :key="d.key"
              :doc="d" :files="filesFor(d.key)" :max-mb="meta.maxUploadMb"
              @added="onAdded" @replaced="onReplaced" @removed="onRemoved"
            />
          </div>

          <div class="mt-8 flex items-center justify-between gap-3">
            <button type="button" class="btn btn-secondary" @click="goTo(step - 1)">Kembali</button>
            <button type="button" class="btn btn-primary" @click="goTo(step + 1)">Lanjut ke tinjauan</button>
          </div>
        </section>

        <!-- Tinjau dan kirim -->
        <section v-else class="mt-6 space-y-5" aria-labelledby="step-title">
          <div v-if="submitted" class="card border-emerald-200 bg-emerald-50 p-5 sm:p-7">
            <h2 class="text-xl font-semibold text-emerald-800">Data Anda sudah terkirim</h2>
            <p class="mt-1 text-emerald-800">Terima kasih. Anda masih bisa memperbarui data atau mengganti file kapan saja lewat langkah di atas.</p>
          </div>

          <div class="card p-5 sm:p-7">
            <h2 id="step-title" class="text-xl font-semibold">Tinjau dan kirim</h2>
            <p class="mt-1 text-graphite-600">Pastikan semua data benar sebelum mengirim.</p>
            <AlertBox v-if="submitError" class="mt-5">{{ submitError }}</AlertBox>
          </div>

          <div v-for="(sec, i) in SECTIONS" :key="sec.key" class="card p-5 sm:p-7">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-lg font-semibold">{{ sec.title }}</h3>
              <button type="button" class="text-sm font-semibold text-seal-700 hover:underline" @click="goTo(i)">Ubah</button>
            </div>
            <dl class="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <div
                v-for="f in sec.fields.filter((x) => !x.schoolDetail || meta.hasSchoolDetail(user.pendidikan))"
                :key="f.name"
                :class="f.span === 2 ? 'sm:col-span-2' : ''"
              >
                <dt class="text-sm text-graphite-500">{{ f.label }}</dt>
                <dd class="mt-0.5 break-words font-medium text-graphite-900">{{ display(f) }}</dd>
              </div>
            </dl>
          </div>

          <div class="card p-5 sm:p-7">
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-lg font-semibold">Dokumen</h3>
              <button type="button" class="text-sm font-semibold text-seal-700 hover:underline" @click="goTo(DOC_STEP)">Ubah</button>
            </div>
            <ul class="mt-4 grid gap-2 sm:grid-cols-2">
              <li v-for="d in meta.documents" :key="d.key" class="flex items-center justify-between gap-3 rounded-lg bg-graphite-50 px-3.5 py-2.5 text-sm">
                <span>{{ d.label }}</span>
                <span v-if="filesFor(d.key).length" class="font-medium text-emerald-700">{{ filesFor(d.key).length }} file</span>
                <span v-else :class="d.required ? 'font-medium text-seal-700' : 'text-graphite-500'">{{ d.required ? 'Belum diunggah' : 'Tidak ada' }}</span>
              </li>
            </ul>
          </div>

          <AlertBox v-if="missingDocs.length && !isSubmitted" type="info">
            Dokumen wajib yang belum diunggah: {{ missingDocs.map((d) => d.label).join(', ') }}.
          </AlertBox>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <button type="button" class="btn btn-secondary" @click="goTo(step - 1)">Kembali</button>
            <button type="button" class="btn btn-primary btn-lg" :disabled="submitting || isSubmitted && submitted" @click="submit">
              <span v-if="submitting" class="spinner" /> {{ isSubmitted ? 'Kirim ulang pembaruan' : 'Kirim pendaftaran' }}
            </button>
          </div>
        </section>
      </template>
    </main>

    <SiteFooter />
  </div>
</template>
