<script setup>
import { ref } from 'vue'
defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, required: true },
  autocomplete: { type: String, default: 'current-password' },
  invalid: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
const visible = ref(false)
</script>

<template>
  <div class="relative">
    <input
      :id="id"
      :type="visible ? 'text' : 'password'"
      :value="modelValue"
      :autocomplete="autocomplete"
      class="input pr-20"
      :class="{ 'input-error': invalid }"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-2 my-1.5 rounded-md px-2.5 text-sm font-medium text-graphite-600 hover:bg-graphite-100"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      {{ visible ? 'Sembunyikan' : 'Lihat' }}
    </button>
  </div>
</template>
