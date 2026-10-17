<template>
  <img
    v-if="src"
    :src="src"
    :srcset="srcset"
    :sizes="sizes"
    :alt="image?.alt || alt"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : undefined"
    decoding="async"
  >
</template>

<script setup>
import imageUrlBuilder from '@sanity/image-url'

const props = defineProps({
  image: { type: Object, default: null },
  alt: { type: String, default: '' },
  sizes: { type: String, default: '100vw' },
  widths: { type: Array, default: () => [640, 1024, 1536, 2048] },
  // Ratio largeur/hauteur imposé (recadrage sur le hotspot), sinon ratio natif.
  ratio: { type: Number, default: null },
  eager: { type: Boolean, default: false },
})

const config = useRuntimeConfig()
const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})

const url = (w) => {
  let b = builder.image(props.image).width(w).auto('format').quality(72)
  if (props.ratio) b = b.height(Math.round(w / props.ratio)).fit('crop')
  return b.url()
}

const hasAsset = computed(() => !!props.image?.asset)
const src = computed(() => hasAsset.value ? url(props.widths[1] || props.widths[0]) : '')
const srcset = computed(() => hasAsset.value ? props.widths.map(w => `${url(w)} ${w}w`).join(', ') : undefined)
</script>
