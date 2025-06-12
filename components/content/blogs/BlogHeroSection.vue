<template>
  <GenericHeroSection
    :background-color="backgroundColor"
    :title-color="titleColor"
    :introduction-color="introductionColor"
    :avatar-size="avatarSize"
    :blog-type="page.blogType"
    :badge-color="page.badgeColor"
    :reading-time="page.readingTime"
    :published-at="page.publishedAt"
    :author="page.author"
    :author-photo="page.authorPhoto"
    :author-role="page.authorRole"
    :displayed-img="page.displayedImg"
    :title="page.title"
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
import { inject } from 'vue'
import GenericHeroSection from '../GenericHeroSection.vue'

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
})

const page = inject('page')
</script>

<style scoped>
.font-weight-2{
  font-weight: 500;
}
</style>
