<script setup>
import { ref } from 'vue'
import http, { parseError } from '@/api/http'
import AuthLayout from '@/components/AuthLayout.vue'
import FormField from '@/components/FormField.vue'
import AlertBox from '@/components/AlertBox.vue'

const email = ref('')
const done = ref(false)
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await http.post('/forgot-password', { email: email.value })
    done.value = true
  } catch (e) {
    const p = parseError(e)
    error.value = p.errors.email || p.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout title="Lupa password" subtitle="Masukkan email Anda. Kami akan mengirim tautan untuk membuat password baru.">
    <div v-if="done" class="space-y-5">
      <AlertBox type="success">Jika email terdaftar, tautan untuk mengatur ulang password sudah dikirim. Periksa juga folder spam.</AlertBox>
      <RouterLink :to="{ name: 'login' }" class="btn btn-secondary w-full">Kembali ke halaman masuk</RouterLink>
    </div>

    <form v-else class="space-y-5" novalidate @submit.prevent="submit">
      <AlertBox v-if="error">{{ error }}</AlertBox>
      <FormField id="email" label="Email" required>
        <input id="email" v-model="email" type="email" autocomplete="email" inputmode="email" class="input" />
      </FormField>
      <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading || !email">
        <span v-if="loading" class="spinner" /> Kirim tautan
      </button>
      <p class="text-center text-sm">
        <RouterLink :to="{ name: 'login' }" class="font-semibold text-seal-700 hover:underline">Kembali ke halaman masuk</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>
