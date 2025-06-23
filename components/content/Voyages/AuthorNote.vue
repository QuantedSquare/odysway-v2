<template>
  <div class="text-primary d-flex flex-column ga-4">
    <h4 class="text-h4 font-weight-bold">
      {{ page.authorNote.title }}
    </h4>
    <ExpandableText
      v-if="isHydrated && authorNote.text"
      :clamp-lines="5"
      :line-height="30"
      wrapper-class="text-body-2 line-height-2 text-wrapper"
    >
      <MDC
        tag="article"
        :value="authorNote.text"
      />
    </ExpandableText>

    <div
      v-if="author"
      class="d-flex ga-3"
    >
      <v-avatar
        :image="author.image"
        size="80"
        :alt="author.description"
      />
      <div class="text-subtitle-2 d-flex flex-column justify-center">
        <span class="font-weight-bold">
          {{ authorNote.author }}
        </span>
        <span class="font-weight-regular">
          {{ author.position }} &nbsp;{{ authorNote.affixeAuthor }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  authorNote: {
    type: Object,
    required: true,
  },
  page: {
    type: Object,
    required: true,
  },
})

const isHydrated = ref(false)
const author = await queryCollection('team').where('name', '=', props.authorNote.author).first()

onMounted(() => {
  isHydrated.value = true
})
</script>

<style scoped>
.line-height-2 {
  line-height: 30px !important;
}
@media (max-width: 600px) {
  .line-height-2 {
    line-height: 25px !important;
  }
}
</style>
