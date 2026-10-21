<template>
  <div class="champ-image">
    <div
      v-if="modelValue?.ref"
      class="d-flex flex-column flex-sm-row ga-3 align-start"
    >
      <v-img
        :src="urlImage(modelValue.ref, 400)"
        :width="compact ? 120 : 200"
        :max-width="compact ? 120 : 200"
        :aspect-ratio="16 / 9"
        cover
        rounded="lg"
        class="flex-grow-0 bg-grey-lighten-3"
      />
      <div class="flex-grow-1 align-self-stretch d-flex flex-column ga-2">
        <v-text-field
          v-if="avecAlt"
          :model-value="modelValue.alt"
          label="Description de la photo (pour l'accessibilité)"
          density="compact"
          variant="outlined"
          hide-details
          maxlength="160"
          @update:model-value="alt => emit('update:modelValue', { ...modelValue, alt })"
        />
        <div class="d-flex ga-2">
          <v-btn
            size="small"
            variant="tonal"
            color="primary"
            :loading="envoi"
            @click="choisir"
          >
            Remplacer
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            color="error"
            @click="emit('update:modelValue', null)"
          >
            Retirer
          </v-btn>
        </div>
      </div>
    </div>
    <v-btn
      v-else
      variant="outlined"
      color="primary"
      :loading="envoi"
      :prepend-icon="mdiImagePlus"
      @click="choisir"
    >
      {{ label }}
    </v-btn>
    <p
      v-if="erreur"
      class="text-error text-caption mt-1"
    >
      {{ erreur }}
    </p>
    <input
      ref="input"
      type="file"
      accept="image/*"
      class="d-none"
      @change="envoyer"
    >
  </div>
</template>

<script setup>
import { mdiImagePlus } from '@mdi/js'

const props = defineProps({
  modelValue: { type: Object, default: null },
  label: { type: String, default: 'Ajouter une photo' },
  avecAlt: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const { urlImage, envoyerImage } = useEspacePorteur()
const input = ref(null)
const envoi = ref(false)
const erreur = ref('')

const choisir = () => input.value?.click()

const envoyer = async (e) => {
  const fichier = e.target.files?.[0]
  e.target.value = ''
  if (!fichier) return
  envoi.value = true
  erreur.value = ''
  try {
    const { ref: assetRef } = await envoyerImage(fichier)
    emit('update:modelValue', props.avecAlt ? { ref: assetRef, alt: props.modelValue?.alt || '' } : { ref: assetRef })
  }
  catch (err) {
    erreur.value = err.message
  }
  finally {
    envoi.value = false
  }
}
</script>
