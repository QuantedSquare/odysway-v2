<template>
  <v-card
    variant="text"
    class="shadow-none"
  >
    <v-row>
      <v-col
        cols="12"
        sm="5"
        lg="auto"
      >
        <v-img
          rounded="lg"
          :src="img(photo, { format: 'webp', quality: 70, width: 640 })"
          cover
          :width="xs ? width : 298"
          height="214"
        />
      </v-col>
      <v-col
        cols="12"
        sm="7"
      >
        <v-card-title class="no-white-space">
          <div class="d-flex align-center ga-3">
            <v-chip
              variant="flat"
              color="secondary"
              rounded="lg"
              size="small"
            >
              <span class="text-subtitle-2 font-weight-bold text-white px-1">
                {{ badgeText }}
              </span>
            </v-chip>
            <span class="text-primary text-h5 font-weight-bold ">{{ title }}</span>
          </div>
        </v-card-title>

        <v-card-text
          class="text-primary text-subtitle-1 font-weight-regular pt-2 line-height text-wrapper"
        >
          <div
            ref="content"
            :class="['text-content', { expanded: isExpanded, clamped: !isExpanded }]"
            :style="contentStyle"
          >
            {{ description }}
          </div>
        </v-card-text>

        <v-card-actions class="text-decoration-underline">
          <v-btn
            variant="text"
            class="text-h5"
            @click="toggle"
          >
            {{ isExpanded ? 'Lire moins' : 'Lire plus' }}
            <v-icon
              :icon="mdiArrowRight"
              color="primary"
              :class="isExpanded ? 'rotate-180' : ''"
            />
          </v-btn>
        </v-card-actions>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { mdiArrowRight } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps({
  photo: {
    type: String,
    required: true,
  },
  badgeText: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  index: Number,
})

const img = useImage()
const { xs, width } = useDisplay()

const expandedIndex = defineModel()

const content = ref(null)
const lineHeight = 30 // px, match your CSS
const clampLines = 3

const contentStyle = ref({
  maxHeight: `${lineHeight * clampLines}px`,
  overflow: 'hidden',
  transition: 'max-height 0.5s ease',
})

const isExpanded = computed(() => expandedIndex.value === props.index)

const toggle = () => {
  expandedIndex.value = isExpanded.value ? null : props.index
}

watch(isExpanded, async (newVal) => {
  await nextTick()
  if (newVal) {
    // Remove clamp, animate to full height
    content.value.classList.remove('clamped')
    contentStyle.value.maxHeight = content.value.scrollHeight + 'px'
  }
  else {
    // Add clamp, animate to 3 lines
    contentStyle.value.maxHeight = `${lineHeight * clampLines}px`
    setTimeout(() => {
      content.value.classList.add('clamped')
    }, 100)
  }
})
</script>

<style scoped>
.shadow-none{
  box-shadow: none !important;
}
.line-height{
  line-height: 30px !important;
}
.text-wrapper {
  position: relative;
  width: 100%;
}

.text-content {
  overflow: hidden;
  transition: max-height 0.5s ease;
}

.text-content.clamped {
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Number of lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-content.expanded {
  /* No clamp, let content expand */
  display: block;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
