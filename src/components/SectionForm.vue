<script setup>
import { computed, watchEffect } from 'vue'
import { useMetaStore } from '@/stores/meta'
import FormField from './FormField.vue'

const props = defineProps({
  fields: { type: Array, required: true },
  form: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
})
const meta = useMetaStore()

// Jurusan dan sekolah/kampus hanya tampil untuk pendidikan SMA/SMK ke atas
const visibleFields = computed(() =>
  props.fields.filter((f) => !f.schoolDetail || meta.hasSchoolDetail(props.form.pendidikan))
)

// Field yang dikunci berdasarkan field lain (mis. PTKP untuk pelamar perempuan)
const isLocked = (f) => !!f.lockIf && props.form[f.lockIf.field] === f.lockIf.value
watchEffect(() => {
  for (const f of props.fields) {
    if (isLocked(f)) props.form[f.name] = f.lockIf.set
  }
})
</script>

<template>
  <div class="grid gap-x-5 gap-y-5 sm:grid-cols-2">
    <template v-for="f in visibleFields" :key="f.name">
      <div v-if="f.type === 'radio'" :class="f.span === 2 ? 'sm:col-span-2' : ''">
        <FormField :id="'f-' + f.name" :label="f.label" :error="errors[f.name]" required>
          <div class="flex flex-wrap gap-3" role="radiogroup" :aria-label="f.label">
            <label
              v-for="o in meta.options[f.options] || []"
              :key="o.value"
              class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-sm"
              :class="form[f.name] === o.value ? 'border-seal-600 bg-seal-50 text-seal-800' : 'border-graphite-300 bg-white hover:bg-graphite-50'"
            >
              <input v-model="form[f.name]" type="radio" :name="f.name" :value="o.value" class="accent-seal-600" />
              {{ o.label }}
            </label>
          </div>
        </FormField>
      </div>

      <div v-else :class="f.span === 2 ? 'sm:col-span-2' : ''">
        <FormField
          :id="'f-' + f.name"
          :label="f.label"
          :error="errors[f.name]"
          :hint="isLocked(f) ? f.lockIf.note : f.hint"
          :required="!f.optional"
        >
          <select
            v-if="f.type === 'select'"
            :id="'f-' + f.name"
            v-model="form[f.name]"
            class="input"
            :class="{ 'input-error': errors[f.name] }"
            :disabled="isLocked(f)"
          >
            <option value="" disabled>Pilih {{ f.label.toLowerCase() }}</option>
            <option v-for="o in meta.options[f.options] || []" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>

          <textarea
            v-else-if="f.type === 'textarea'"
            :id="'f-' + f.name"
            v-model="form[f.name]"
            rows="3"
            maxlength="255"
            class="input"
            :class="{ 'input-error': errors[f.name] }"
          />

          <input
            v-else
            :id="'f-' + f.name"
            v-model="form[f.name]"
            :type="f.type"
            :autocomplete="f.autocomplete"
            :placeholder="f.placeholder"
            :inputmode="f.type === 'tel' ? 'tel' : f.inputmode"
            :max="f.type === 'date' ? new Date().toISOString().slice(0, 10) : undefined"
            class="input"
            :class="{ 'input-error': errors[f.name] }"
          />
        </FormField>
      </div>
    </template>
  </div>
</template>
