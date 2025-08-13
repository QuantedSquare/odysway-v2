<template>
  <div>
    <!-- This template will not be rendered as we're redirecting -->
  </div>
</template>

<script setup>
const route = useRoute()

// Perform 301 redirect from /blog/[blogSlug] to /[blogSlug]
await navigateTo(`/${route.params.blogSlug}`, {
  redirectCode: 301,
  replace: true,
})
</script>
