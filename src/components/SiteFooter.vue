<script setup>
import { useTenantStore } from '@/stores/tenant'
const tenant = useTenantStore()
</script>

<template>
  <footer class="border-t border-graphite-200 bg-white">
    <div class="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-graphite-500 sm:px-6">
      © {{ new Date().getFullYear() }} {{ tenant.name }}. Data Anda hanya digunakan untuk proses rekrutmen.
    </div>
  </footer>
</template>
