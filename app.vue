<template>
  <NuxtLayout>
    <NuxtPage />
    <CookiesSnackbar />
  </NuxtLayout>
</template>

<script setup>
useHead({
  link: [
    {
      rel: 'preload',
      href: '/fonts/Gordita-Font/gordita-regular.woff2',
      as: 'font',
      crossorigin: '',
      type: 'font/woff2',
    },
    {
      rel: 'preload',
      href: '/fonts/Gordita-Font/gordita-medium.woff2',
      as: 'font',
      crossorigin: '',
      type: 'font/woff2',
    },
    {
      rel: 'preload',
      href: '/fonts/Gordita-Font/gordita-bold.woff2',
      as: 'font',
      crossorigin: '',
      type: 'font/woff2',
    },
  ],
})
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
