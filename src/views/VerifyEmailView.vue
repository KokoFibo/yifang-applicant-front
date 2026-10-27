<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import http, { parseError } from '@/api/http'
import AuthLayout from '@/components/AuthLayout.vue'
import AlertBox from '@/components/AlertBox.vue'

const route = useRoute()
const state = ref('loading') // loading | success | error
const message = ref('')

onMounted(async () => {
  const { id, hash, expires, signature } = route.query
  if (!id || !hash || !expires || !signature) {
    state.value = 'error'
    message.value = 'Tautan konfirmasi tidak lengkap. Gunakan tautan langsung dari email Anda.'
    return
  }
  try {
    const { data } = await http.post('/email/verify', { id, hash, expires, signature })
    message.value = data.message
    state.value = 'success'
  } catch (e) {
    message.value = parseError(e).message
    state.value = 'error'
  }
})
</script>

<template>
  <AuthLayout
    :title="state === 'success' ? 'Email terkonfirmasi' : state === 'error' ? 'Konfirmasi gagal' : 'Mengonfirmasi email…'"
  >
    <div v-if="state === 'loading'" class="flex items-center gap-3 text-graphite-600"><span class="spinner" /> Mohon tunggu sebentar.</div>

    <div v-else-if="state === 'success'" class="space-y-5">
      <AlertBox type="success">{{ message }}</AlertBox>
      <RouterLink :to="{ name: 'login' }" class="btn btn-primary btn-lg w-full">Masuk sekarang</RouterLink>
    </div>

    <div v-else class="space-y-5">
      <AlertBox>{{ message }}</AlertBox>
      <RouterLink :to="{ name: 'check-email' }" class="btn btn-primary btn-lg w-full">Minta email konfirmasi baru</RouterLink>
    </div>
  </AuthLayout>
</template>
