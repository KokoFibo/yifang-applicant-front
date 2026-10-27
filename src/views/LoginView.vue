<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http, { parseError } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import AuthLayout from '@/components/AuthLayout.vue'
import FormField from '@/components/FormField.vue'
import PasswordInput from '@/components/PasswordInput.vue'
import AlertBox from '@/components/AlertBox.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const errors = ref({})
const message = ref('')
const unverified = ref(false)
const resendInfo = ref('')
const loading = ref(false)

async function submit() {
  errors.value = {}
  message.value = ''
  unverified.value = false
  resendInfo.value = ''
  loading.value = true
  try {
    await auth.login(form.email, form.password)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') && !route.query.redirect.startsWith('//')
      ? route.query.redirect
      : '/formulir'
    router.push(redirect)
  } catch (e) {
    const p = parseError(e)
    if (p.code === 'email_not_verified') {
      unverified.value = true
      message.value = p.message
    } else if (Object.keys(p.errors).length) {
      errors.value = p.errors
    } else {
      message.value = p.message
    }
  } finally {
    loading.value = false
  }
}

async function resend() {
  resendInfo.value = ''
  try {
    await http.post('/email/resend', { email: form.email })
    resendInfo.value = 'Email konfirmasi baru sudah dikirim. Periksa kotak masuk dan folder spam.'
  } catch (e) {
    resendInfo.value = parseError(e).message
  }
}
</script>

<template>
  <AuthLayout title="Masuk" subtitle="Login untuk mengisi atau mengubah data dan dokumen Anda.">
    <form class="space-y-5" novalidate @submit.prevent="submit">
      <AlertBox v-if="route.query.expired" type="info">Sesi Anda berakhir. Silakan login kembali.</AlertBox>
      <AlertBox v-if="message">
        {{ message }}
        <button v-if="unverified" type="button" class="mt-2 block font-semibold underline" @click="resend">Kirim ulang email konfirmasi</button>
      </AlertBox>
      <AlertBox v-if="resendInfo" type="success">{{ resendInfo }}</AlertBox>

      <FormField id="email" label="Email" :error="errors.email" required>
        <input id="email" v-model="form.email" type="email" autocomplete="username" inputmode="email" class="input" :class="{ 'input-error': errors.email }" />
      </FormField>

      <FormField id="password" label="Password" :error="errors.password" required>
        <PasswordInput id="password" v-model="form.password" autocomplete="current-password" :invalid="!!errors.password" />
      </FormField>

      <div class="text-right text-sm">
        <RouterLink :to="{ name: 'forgot-password' }" class="font-medium text-seal-700 hover:underline">Lupa password?</RouterLink>
      </div>

      <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading">
        <span v-if="loading" class="spinner" /> Masuk
      </button>

      <p class="text-center text-sm text-graphite-600">
        Belum punya akun?
        <RouterLink :to="{ name: 'register' }" class="font-semibold text-seal-700 hover:underline">Daftar</RouterLink>
      </p>
      <p class="rounded-lg bg-graphite-100 px-4 py-3 text-sm text-graphite-600">
        Pernah mendaftar di sistem sebelumnya? Password lama tidak berlaku. Pilih "Lupa password" untuk membuat yang baru.
      </p>
    </form>
  </AuthLayout>
</template>
