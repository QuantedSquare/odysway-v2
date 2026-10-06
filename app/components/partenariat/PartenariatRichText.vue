<template>
  <PortableText
    v-if="value?.length"
    :value="value"
    :components="components"
  />
</template>

<script setup>
import { PortableText } from '@portabletext/vue'

// Paragraphes simples (gras, italique, lien) : chaque bloc devient un <p> qui
// porte la classe passée, pour hériter des styles de la section.
const props = defineProps({
  value: { type: Array, default: () => [] },
  paragraphClass: { type: String, default: '' },
})

const components = {
  block: {
    normal: (_, { slots }) => h('p', { class: props.paragraphClass }, slots.default?.()),
  },
  marks: {
    link: ({ value }, { slots }) => {
      const href = value?.href || '#'
      const external = /^https?:\/\//.test(href) && !href.includes('odysway.com')
      return h('a', external ? { href, target: '_blank', rel: 'noopener' } : { href }, slots.default?.())
    },
  },
}
</script>
