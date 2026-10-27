<script setup>
defineProps({
  type: { type: String, default: 'error' }, // error | success | info
})
</script>

<template>
  <div
    role="alert"
    class="rounded-lg border px-4 py-3 text-sm"
    :class="{
      'border-seal-200 bg-seal-50 text-seal-800': type === 'error',
      'border-emerald-200 bg-emerald-50 text-emerald-800': type === 'success',
      'border-graphite-200 bg-graphite-100 text-graphite-700': type === 'info',
    }"
  >
    <slot />
  </div>
</template>
