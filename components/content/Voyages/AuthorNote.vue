<template>
  <div class="text-primary d-flex flex-column ga-4">
    <h4 class="text-h4 font-weight-bold">
      {{ page.authorNote.title }}
    </h4>
    <div
      v-if="isHydrated && authorNote.text"
      class="text-body-2 line-height-2 text-wrapper"
    >
      <div
        ref="content"
        class="text-content"
        :class="{ truncated: !isExpanded }"
        :style="contentStyle"
      >
        <MDC
          tag="article"
          :value="authorNote.text"
        />
      </div>
      <v-btn
        variant="text"
        class="text-h5 pa-0 mt-2"
        @click="() => isExpanded = !isExpanded"
      >
        {{ isExpanded ? 'Lire moins' : 'Lire plus' }}
        <v-icon
          :icon="mdiArrowRight"
          color="primary"
          :class="isExpanded ? 'rotate-180' : ''"
        />
      </v-btn>
    </div>

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
import { mdiArrowRight } from '@mdi/js'

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
const isExpanded = ref(false)
const content = ref(null)

const lineHeight = 30
const clampLines = 5

const contentStyle = ref({
  maxHeight: `${lineHeight * clampLines}px`,
  overflow: 'hidden',
  transition: 'max-height 0.5s ease',
})

const author = await queryCollection('team').where('name', '=', props.authorNote.author).first()

watch(isExpanded, async (newVal) => {
  await nextTick()
  if (newVal) {
    // Expanding: animate to full height
    contentStyle.value.maxHeight = content.value.scrollHeight + 'px'
  }
  else {
    // Collapsing: animate to 5 lines
    contentStyle.value.maxHeight = `${lineHeight * clampLines}px`
  }
})

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

.text-wrapper {
  position: relative;
  width: 100%;
}

.text-content {
  overflow: hidden;
  transition: max-height 0.5s ease;
  position: relative;
}

.text-content.truncated::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2em;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1));
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
