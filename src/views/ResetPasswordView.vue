<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http, { parseError } from '@/api/http'
import AuthLayout from '@/components/AuthLayout.vue'
import FormField from '@/components/FormField.vue'
import PasswordInput from '@/components/PasswordInput.vue'
import AlertBox from '@/components/AlertBox.vue'

const route = useRoute()
const router = useRouter()
const token = String(route.query.token || '')
const email = String(route.query.email || '')

const form = reactive({ password: '', password_confirmation: '' })
const errors = ref({})
const message = ref('')
const done = ref(false)
const loading = ref(false)

async function submit() {
  errors.value = {}
  message.value = ''
  if (form.password !== form.password_confirmation) {
    errors.value = { password_confirmation: 'Konfirmasi password tidak sama.' }
    return
  }
  loading.value = true
  try {
    await http.post('/reset-password', { token, email, ...form })
    done.value = true
    setTimeout(() => router.push({ name: 'login' }), 2500)
  } catch (e) {
    const p = parseError(e)
    errors.value = p.errors
    if (!Object.keys(p.errors).length) message.value = p.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout title="Buat password baru" :subtitle="email ? `Untuk akun ${email}` : ''">
    <AlertBox v-if="!token || !email">Tautan tidak lengkap. Gunakan tautan langsung dari email Anda, atau <RouterLink :to="{ name: 'forgot-password' }" class="font-semibold underline">minta tautan baru</RouterLink>.</AlertBox>

    <div v-else-if="done" class="space-y-5">
      <AlertBox type="success">Password berhasil diubah. Anda akan diarahkan ke halaman masuk.</AlertBox>
      <RouterLink :to="{ name: 'login' }" class="btn btn-primary btn-lg w-full">Masuk sekarang</RouterLink>
    </div>

    <form v-else class="space-y-5" novalidate @submit.prevent="submit">
      <AlertBox v-if="message">{{ message }}</AlertBox>
      <AlertBox v-if="errors.email">{{ errors.email }}
        <RouterLink :to="{ name: 'forgot-password' }" class="mt-1 block font-semibold underline">Minta tautan baru</RouterLink>
      </AlertBox>

      <FormField id="password" label="Password baru" :error="errors.password" hint="Minimal 8 karakter, kombinasi huruf dan angka." required>
        <PasswordInput id="password" v-model="form.password" autocomplete="new-password" :invalid="!!errors.password" />
      </FormField>
      <FormField id="password_confirmation" label="Ulangi password baru" :error="errors.password_confirmation" required>
        <PasswordInput id="password_confirmation" v-model="form.password_confirmation" autocomplete="new-password" :invalid="!!errors.password_confirmation" />
      </FormField>

      <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading">
        <span v-if="loading" class="spinner" /> Simpan password
      </button>
    </form>
  </AuthLayout>
</template>
