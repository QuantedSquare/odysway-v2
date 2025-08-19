<template>
  <NuxtLink
    v-if="isExternal"
    :href="to"
    :external="true"
    target="_blank"
    :class="linkClass"
  >
    <slot />
  </NuxtLink>
  <NuxtLink
    v-else
    :to="to"
    :class="linkClass"
  >
    <slot />
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  linkClass: {
    type: String,
    default: 'text-grey',
  },
})

const isExternal = computed(() => {
  return props.to.includes('https://')
})
</script>
