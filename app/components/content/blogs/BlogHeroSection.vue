<template>
  <GenericHeroSection
    :background-color="backgroundColor"
    :title-color="titleColor"
    :introduction-color="introductionColor"
    :avatar-size="avatarSize"
    :blog-type="blogType"
    :badge-color="badgeColor"
    :reading-time="readingTime"
    :published-at="publishedAt"
    :author="author"
    :author-photo="authorPhoto"
    :author-role="authorRole"
    :author-description="authorDescription"
    :displayed-img="image"
    :title="title"
  >
    <template #title>
      <slot
        name="title"
        mdc-unwrap="p"
      />
    </template>
    <template #introduction>
      <slot name="introduction" />
    </template>
  </GenericHeroSection>
</template>

<script setup>

defineProps({
  backgroundColor: {
    type: String,
    default: 'primary',
  },
  titleColor: {
    type: String,
    default: 'primary',
  },
  introductionColor: {
    type: String,
    default: 'grey',
  },
  avatarSize: {
    type: String,
    default: '60',
  },
  // Blog info
  blogType: {
    type: String,
    default: null,
  },
  badgeColor: {
    type: String,
    default: null,
  },
  readingTime: {
    type: [String, Number],
    default: null,
  },
  publishedAt: {
    type: String,
    default: null,
  },
  // Author info
  author: {
    type: String,
    default: null,
  },
  authorPhoto: {
    type: Object,
    default: null,
  },
  authorRole: {
    type: String,
    default: null,
  },
  authorDescription: {
    type: String,
    default: null,
  },
  // Image
  image: {
    type: [Object, String],
    default: null,
  },
  // Title (for alt)
  title: {
    type: String,
    default: null,
  },
  // Description (for backward compatibility)
  description: {
    type: String,
    default: null,
  },
})
</script>

<style scoped>
.font-weight-2{
  font-weight: 500;
}
</style>
