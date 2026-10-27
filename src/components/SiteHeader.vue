<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BrandMark from './BrandMark.vue'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-graphite-200 bg-white/95 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
      <RouterLink :to="{ name: 'home' }" class="rounded-md" aria-label="Beranda">
        <BrandMark :size="36" />
      </RouterLink>

      <nav class="flex items-center gap-2" aria-label="Menu utama">
        <template v-if="auth.user">
          <span class="hidden max-w-[16rem] truncate text-sm text-graphite-600 sm:inline">{{ auth.user.email }}</span>
          <RouterLink v-if="$route.name !== 'application'" :to="{ name: 'application' }" class="btn btn-primary">Formulir</RouterLink>
          <button type="button" class="btn btn-secondary" @click="logout">Keluar</button>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'login' }" class="btn btn-ghost">Masuk</RouterLink>
          <RouterLink :to="{ name: 'register' }" class="btn btn-primary">Daftar</RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>
