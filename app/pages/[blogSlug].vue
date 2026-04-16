<template>
  <div>
    <!-- This template will not be rendered as we're redirecting -->
  </div>
</template>

<script setup>
const route = useRoute()

const sanity = useSanity()

// Fetch all blog slugs from Sanity
const { data: blogSlugs } = await useAsyncData('blog-slugs', () =>
  sanity.fetch(`*[_type == "blog"]{ "slug": slug.current }`),
)

const matchedSlug = blogSlugs.value?.find(
  b => b.slug === route.params.blogSlug,
)?.slug

if (matchedSlug) {
  // 301 redirect to canonical /blog/[slug] URL
  await navigateTo(`/blog/${matchedSlug}`, {
    redirectCode: 301,
    replace: true,
  })
}
else {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
  })
}
</script>
