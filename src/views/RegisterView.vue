<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import http, { parseError } from '@/api/http'
import AuthLayout from '@/components/AuthLayout.vue'
import FormField from '@/components/FormField.vue'
import PasswordInput from '@/components/PasswordInput.vue'
import AlertBox from '@/components/AlertBox.vue'

const router = useRouter()
const form = reactive({ email: '', password: '', password_confirmation: '' })
const errors = ref({})
const message = ref('')
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
    await http.post('/register', { ...form })
    router.push({ name: 'check-email', query: { email: form.email.trim().toLowerCase() } })
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
  <AuthLayout title="Buat akun" subtitle="Gunakan email aktif. Kami akan mengirim tautan konfirmasi ke email tersebut.">
    <form class="space-y-5" novalidate @submit.prevent="submit">
      <AlertBox v-if="message">{{ message }}</AlertBox>

      <FormField id="email" label="Email" :error="errors.email" required>
        <input id="email" v-model="form.email" type="email" autocomplete="email" inputmode="email" class="input" :class="{ 'input-error': errors.email }" />
      </FormField>

      <FormField id="password" label="Password" :error="errors.password" hint="Minimal 8 karakter, kombinasi huruf dan angka." required>
        <PasswordInput id="password" v-model="form.password" autocomplete="new-password" :invalid="!!errors.password" />
      </FormField>

      <FormField id="password_confirmation" label="Ulangi password" :error="errors.password_confirmation" required>
        <PasswordInput id="password_confirmation" v-model="form.password_confirmation" autocomplete="new-password" :invalid="!!errors.password_confirmation" />
      </FormField>

      <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading">
        <span v-if="loading" class="spinner" /> Daftar
      </button>

      <p class="text-center text-sm text-graphite-600">
        Sudah punya akun?
        <RouterLink :to="{ name: 'login' }" class="font-semibold text-seal-700 hover:underline">Masuk</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>
