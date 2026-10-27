<script setup>
import { useTenantStore } from '@/stores/tenant'

defineProps({
  light: { type: Boolean, default: false }, // true = untuk latar gelap
  size: { type: Number, default: 40 },
})
const tenant = useTenantStore()
</script>

<template>
  <span class="inline-flex items-center gap-3">
    <!-- Di latar gelap, logo ditaruh di lingkaran putih agar logo berwarna apa pun tetap terbaca -->
    <span
      class="flex shrink-0 items-center justify-center rounded-full"
      :class="light ? 'bg-white p-1.5' : ''"
      :style="{ width: size + 'px', height: size + 'px' }"
    >
      <img :src="tenant.logoUrl" alt="" class="h-full w-full object-contain" />
    </span>
    <span
      class="font-display text-lg font-semibold leading-tight tracking-tight"
      :class="light ? 'text-white' : 'text-graphite-900'"
    >
      {{ tenant.name }}
    </span>
  </span>
</template>
