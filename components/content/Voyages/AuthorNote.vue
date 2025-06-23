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
        :class="{ 'truncated': !isExpanded, 'text-content': authorNote.text.length > 900 }"
        :style="authorNote.text.length > 900 ? contentStyle : {}"
      >
        <MDC
          tag="article"
          :value="authorNote.text"
        />
      </div>
    </div>

    <v-btn
      v-if="authorNote.text.length > 900"
      variant="text"
      class="text-h5"
      @click="() => isExpanded = !isExpanded"
    >
      {{ isExpanded ? 'Lire moins' : 'Lire plus' }}
      <v-icon
        :icon="mdiArrowDown"
        color="primary"
        class="mt-1"
        :class="isExpanded ? 'rotate-180' : ''"
      />
    </v-btn>
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
import { mdiArrowDown } from '@mdi/js'

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

const isExpanded = ref(false)
const content = ref(null)
const lineHeight = 30 // px, match your CSS
const clampLines = 4

const contentStyle = ref({
  maxHeight: `${lineHeight * clampLines}px`,
  overflow: 'hidden',
  transition: 'max-height 0.5s ease',
})

watch(isExpanded, async (newVal) => {
  await nextTick()
  if (newVal) {
    // Expanding: animate to full height
    contentStyle.value.maxHeight = content.value.scrollHeight + 'px'
  }
  else {
    // Collapsing: animate to 3 lines
    contentStyle.value.maxHeight = `${lineHeight * clampLines}px`
  }
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
