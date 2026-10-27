<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMetaStore } from '@/stores/meta'
import { useTenantStore } from '@/stores/tenant'
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const auth = useAuthStore()

const meta = useMetaStore()
const tenant = useTenantStore()
onMounted(() => meta.load().catch(() => {}))

// Daftar dokumen mengikuti pengaturan perusahaan di database
const required = computed(() => meta.documents.filter((d) => d.required).map((d) => d.label))
const optional = computed(() => meta.documents.filter((d) => !d.required).map((d) => d.label))
const steps = [
  { title: 'Buat akun', text: 'Daftar dengan email aktif dan password.' },
  { title: 'Konfirmasi email', text: 'Klik tautan yang kami kirim ke email Anda.' },
  { title: 'Isi data dan unggah dokumen', text: 'Login, lengkapi formulir, lalu kirim. Anda bisa mengubahnya kapan saja.' },
]
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SiteHeader />

    <main class="flex-1">
      <section class="relative overflow-hidden bg-white">
        <svg class="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] text-seal-600 opacity-[0.07]" viewBox="0 0 200 200" fill="none" aria-hidden="true">
          <circle cx="100" cy="100" r="92" stroke="currentColor" stroke-width="14" />
          <circle cx="100" cy="100" r="60" stroke="currentColor" stroke-width="6" />
        </svg>

        <div class="relative mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:py-20">
          <div class="max-w-2xl">
            <h1 class="text-4xl font-semibold leading-[1.1] sm:text-5xl">
              Lengkapi data Anda untuk bergabung dengan {{ tenant.name }}
            </h1>
            <p class="mt-5 max-w-xl text-lg text-graphite-600">
              Isi formulir dan unggah dokumen secara online dari HP atau komputer. Foto dokumen dioptimalkan otomatis, dan data Anda bisa diperbarui kapan saja.
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <template v-if="auth.user">
                <RouterLink :to="{ name: 'application' }" class="btn btn-primary btn-lg">Lanjutkan formulir</RouterLink>
              </template>
              <template v-else>
                <RouterLink :to="{ name: 'register' }" class="btn btn-primary btn-lg">Daftar akun baru</RouterLink>
                <RouterLink :to="{ name: 'login' }" class="btn btn-secondary btn-lg">Saya sudah punya akun</RouterLink>
              </template>
            </div>
            <p v-if="!auth.user" class="mt-4 text-sm text-graphite-500">
              Pernah mendaftar di sistem sebelumnya? Buka "Masuk", lalu pilih "Lupa password" untuk membuat password baru.
            </p>
          </div>

          <aside class="card self-start p-6 shadow-sm" aria-labelledby="docs-title">
            <h2 id="docs-title" class="text-lg font-semibold">Siapkan dokumen berikut</h2>
            <p class="mt-1 text-sm text-graphite-500">Format JPG, PNG, atau WebP. Foto dengan kamera HP juga bisa.</p>

            <h3 v-if="required.length" class="mt-5 text-sm font-semibold text-seal-700">Wajib</h3>
            <ul class="mt-2 space-y-1.5 text-graphite-700">
              <li v-for="d in required" :key="d" class="flex gap-2.5"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-seal-600" />{{ d }}</li>
            </ul>

            <h3 v-if="optional.length" class="mt-5 text-sm font-semibold text-graphite-600">Jika ada</h3>
            <ul class="mt-2 space-y-1.5 text-graphite-700">
              <li v-for="d in optional" :key="d" class="flex gap-2.5"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-graphite-300" />{{ d }}</li>
            </ul>
          </aside>
        </div>
      </section>

      <section class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 class="text-2xl font-semibold">Cara mendaftar</h2>
        <ol class="mt-8 grid gap-6 md:grid-cols-3">
          <li v-for="(s, i) in steps" :key="s.title" class="flex gap-4">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-seal-600 font-display text-base font-semibold text-white">{{ i + 1 }}</span>
            <div>
              <h3 class="text-base font-semibold">{{ s.title }}</h3>
              <p class="mt-1 text-graphite-600">{{ s.text }}</p>
            </div>
          </li>
        </ol>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
