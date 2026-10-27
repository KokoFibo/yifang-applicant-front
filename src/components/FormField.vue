<script setup>
defineProps({
  label: { type: String, required: true },
  id: { type: String, required: true },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false },
})
</script>

<template>
  <div>
    <label :for="id" class="label">
      {{ label }}<span v-if="required" class="ml-0.5 text-seal-600" aria-hidden="true">*</span>
    </label>
    <slot />
    <p v-if="error" :id="id + '-error'" class="field-error">{{ error }}</p>
    <p v-else-if="hint" class="field-hint">{{ hint }}</p>
  </div>
</template>
