<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import TenantUnavailable from '@/components/TenantUnavailable.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const tenant = useTenantStore()

// Sesi berakhir (401 dari server): kembali ke halaman login
function onExpired() {
  if (!auth.user) return
  auth.setUser(null)
  router.push({ name: 'login', query: { redirect: route.fullPath, expired: '1' } })
}

onMounted(() => window.addEventListener('auth:expired', onExpired))
onBeforeUnmount(() => window.removeEventListener('auth:expired', onExpired))
</script>

<template>
  <TenantUnavailable v-if="tenant.error" />
  <RouterView v-else />
</template>
