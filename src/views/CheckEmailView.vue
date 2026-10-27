<script setup>
import { onBeforeUnmount, ref } from 'vue'
import { useRoute } from 'vue-router'
import http, { parseError } from '@/api/http'
import AuthLayout from '@/components/AuthLayout.vue'
import FormField from '@/components/FormField.vue'
import AlertBox from '@/components/AlertBox.vue'

const route = useRoute()
const email = ref(String(route.query.email || ''))
const hasEmail = !!email.value
const sent = ref(false)
const error = ref('')
const loading = ref(false)
const cooldown = ref(hasEmail ? 30 : 0)
let timer = null

function startCooldown(seconds = 60) {
  cooldown.value = seconds
  clearInterval(timer)
  timer = setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0) clearInterval(timer)
  }, 1000)
}
if (hasEmail) startCooldown(30)
onBeforeUnmount(() => clearInterval(timer))

async function resend() {
  error.value = ''
  sent.value = false
  loading.value = true
  try {
    await http.post('/email/resend', { email: email.value })
    sent.value = true
    startCooldown(60)
  } catch (e) {
    error.value = parseError(e).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout
    :title="hasEmail ? 'Periksa email Anda' : 'Kirim ulang email konfirmasi'"
    :subtitle="hasEmail ? `Kami mengirim tautan konfirmasi ke ${email}. Klik tautan tersebut, lalu login.` : 'Masukkan email yang Anda gunakan untuk mendaftar.'"
  >
    <div class="space-y-5">
      <FormField v-if="!hasEmail" id="email" label="Email" required>
        <input id="email" v-model="email" type="email" autocomplete="email" class="input" />
      </FormField>

      <AlertBox v-if="sent" type="success">Jika email terdaftar dan belum dikonfirmasi, email baru sudah dikirim.</AlertBox>
      <AlertBox v-if="error">{{ error }}</AlertBox>

      <p v-if="hasEmail" class="text-sm text-graphite-600">
        Email tidak masuk? Periksa folder spam. Tautan berlaku 24 jam.
      </p>

      <button type="button" class="btn btn-secondary w-full" :disabled="loading || cooldown > 0 || !email" @click="resend">
        <span v-if="loading" class="spinner" />
        {{ cooldown > 0 ? `Kirim ulang dalam ${cooldown} detik` : 'Kirim ulang email konfirmasi' }}
      </button>

      <p class="text-center text-sm text-graphite-600">
        Sudah konfirmasi?
        <RouterLink :to="{ name: 'login' }" class="font-semibold text-seal-700 hover:underline">Masuk</RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>
