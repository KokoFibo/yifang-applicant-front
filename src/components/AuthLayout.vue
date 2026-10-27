<script setup>
import BrandMark from './BrandMark.vue'
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
    <!-- Panel merek: cincin segel dari logo sebagai satu-satunya ornamen -->
    <aside class="relative hidden overflow-hidden bg-graphite-900 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
      <RouterLink :to="{ name: 'home' }" class="relative z-10 w-fit rounded-md" aria-label="Beranda">
        <BrandMark light :size="44" />
      </RouterLink>

      <svg class="pointer-events-none absolute -bottom-40 -right-40 h-[34rem] w-[34rem] text-seal-600" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="100" cy="100" r="92" stroke="currentColor" stroke-width="14" />
        <circle cx="100" cy="100" r="60" stroke="currentColor" stroke-width="6" opacity=".7" />
      </svg>

      <div class="relative z-10 max-w-sm">
        <h2 class="font-display text-3xl font-semibold leading-tight text-white">Portal calon karyawan</h2>
        <p class="mt-4 text-graphite-300">
          Lengkapi data diri dan unggah dokumen Anda secara online. Data tersimpan aman dan bisa Anda ubah kapan saja.
        </p>
      </div>
    </aside>

    <main class="flex flex-col justify-center bg-white px-5 py-10 sm:px-10">
      <div class="mx-auto w-full max-w-md">
        <RouterLink :to="{ name: 'home' }" class="mb-8 inline-block rounded-md lg:hidden" aria-label="Beranda">
          <BrandMark :size="36" />
        </RouterLink>
        <h1 class="text-2xl font-semibold sm:text-3xl">{{ title }}</h1>
        <p v-if="subtitle" class="mt-2 text-graphite-600">{{ subtitle }}</p>
        <div class="mt-8">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
