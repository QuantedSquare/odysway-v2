<template>
  <v-row
    class="text-subtitle-2 text-md-body-1 my-md-2 "
    align="center"
    no-gutters
    role="listitem"
    :aria-label="`${isIncluded ? 'Inclus' : 'Non inclus'}: ${text}`"
  >
    <v-col
      v-if="textParsed"
      cols="12"
      class="d-flex ga-2 font-weight-regular text-color"
    >
      <v-icon :class="isIncluded ? 'text-green' : 'text-secondary'">
        {{ isIncluded ? mdiCheckCircleOutline : mdiCloseCircleOutline }}
      </v-icon>
      <span
        v-if="text.includes('<') && text.includes('>')"
        v-dompurify-html="parseBoldText(textParsed)"
      />
      <span v-else>
        <MDCRenderer
          :body="textParsed.body"
          :data="textParsed.data"
        />
      </span>
    </v-col>
  </v-row>
</template>

<script setup>
import { mdiCheckCircleOutline, mdiCloseCircleOutline } from '@mdi/js'

const { isIncluded, text } = defineProps({
  isIncluded: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: '',
  },
})

const textParsed = ref(null)
if (text && !text.includes('<') && !text.includes('>')) {
  textParsed.value = await parseMarkdown(text)
}
else {
  textParsed.value = text
}
</script>

<style scoped>
.text-color:deep(a){
  color: rgba(var(--v-theme-secondary))!important;
  text-decoration: underline!important;
  text-transform: none!important;
}
</style>
