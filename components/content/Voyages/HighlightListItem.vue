<template>
  <v-list-item
    class="px-0 py-2 custom-alignement"
    min-height="30"
  >
    <template #prepend>
      <v-icon
        :icon="mdiCheckboxMarkedCircle"
        color="primary"
        size="20"
      />
    </template>
    <p
      v-dompurify-html="parseBoldText(highlight)"
      class="text-body-2 text-md-body-1 text-primary"
    />
  </v-list-item>
</template>

<script setup>
import { mdiCheckboxMarkedCircle } from '@mdi/js'

const { highlight } = defineProps({
  highlight: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.custom-alignement:deep(.v-list-item__prepend) {
  align-self: flex-start !important;
  margin-top: 2px !important;
}
</style>
