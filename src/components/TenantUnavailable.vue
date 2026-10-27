<script setup>
import { useTenantStore } from '@/stores/tenant'
const tenant = useTenantStore()
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-graphite-50 px-6">
    <div class="max-w-md text-center">
      <h1 class="text-2xl font-semibold">
        {{ tenant.error === 'unregistered' ? 'Alamat ini belum terdaftar' : 'Tidak dapat memuat data portal' }}
      </h1>
      <p class="mt-3 text-graphite-600">
        {{ tenant.error === 'unregistered'
          ? 'Domain yang Anda buka belum terhubung ke portal calon karyawan mana pun. Periksa kembali alamat yang diberikan kepada Anda.'
          : 'API belum bisa dijangkau. Pastikan server Laravel berjalan dan rute /api/tenant tersedia, lalu coba lagi.' }}
      </p>
      <p v-if="tenant.error === 'network' && tenant.detail" class="mt-2 text-sm text-graphite-500">{{ tenant.detail }}</p>
      <button v-if="tenant.error === 'network'" type="button" class="btn btn-primary mt-6" @click="tenant.load(true)">Coba lagi</button>
    </div>
  </main>
</template>
