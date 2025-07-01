<template>
  <v-btn
    v-if="showButton"
    variant="text"
    :class="buttonClass"
    class="pl-0"
    @click="onToggle"
  >
    {{ isExpanded ? expandedText : collapsedText }}
    <v-icon
      :icon="mdiArrowRight"
      color="primary"
      :class="isExpanded ? 'rotate-180' : ''"
    />
  </v-btn>
</template>

<script setup>
import { mdiArrowRight } from '@mdi/js'

defineProps({
  isExpanded: {
    type: Boolean,
    required: true,
  },
  showButton: {
    type: Boolean,
    default: true,
  },
  expandedText: {
    type: String,
    default: 'Lire moins',
  },
  collapsedText: {
    type: String,
    default: 'Lire plus',
  },
  buttonClass: {
    type: String,
    default: 'text-h5 pa-0 mt-2',
  },
})

const emit = defineEmits(['toggle'])

const onToggle = () => {
  emit('toggle')
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
