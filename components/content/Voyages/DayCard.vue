<template>
  <v-card
    variant="text"
    class="shadow-none"
  >
    <v-row v-if="isHydrated">
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
            <span class="d-flex align-center bg-secondary rounded-lg text-subtitle-2 font-weight-bold text-white px-2 py-1 text-no-wrap">
              {{ badgeText }}
            </span>

            <span class="text-primary text-h5 font-weight-bold ">{{ title }}</span>
          </div>
        </v-card-title>

        <v-card-text
          class="text-primary text-subtitle-1 font-weight-regular pt-2 line-height text-wrapper"
        >
          <div
            ref="content"
            class="text-content"
            :class="{ truncated: !isExpanded }"
            :style="contentStyle"
          >
            <span v-if="description">{{ description }}</span>
            <div class="d-flex flex-column px-8 mt-4">
              <div v-if="denivellation">
                <span class="font-weight-bold">Dénivelé:&nbsp;</span>
                <span>{{ denivellation }}</span>
              </div>
              <div v-if="road">
                <span class="font-weight-bold">Temps de trajet:&nbsp;</span>
                <span>{{ road }}</span>
              </div>
              <div v-if="night">
                <span class="font-weight-bold">Nuit:&nbsp;</span>
                <span>{{ night }}</span>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="text-decoration-underline">
          <v-btn
            variant="text"
            class="text-h5"
            @click="() => isExpanded = !isExpanded"
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
import { ref, watch, nextTick } from 'vue'

defineProps({
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
  denivellation: {
    type: String,
    default: '',
  },
  road: {
    type: String,
    default: '',
  },
  night: {
    type: String,
    default: '',
  },
})

const img = useImage()
const { xs, width } = useDisplay()

const isExpanded = ref(false)
const content = ref(null)
const lineHeight = 30 // px, match your CSS
const clampLines = 3

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
const isHydrated = ref(false)
onMounted(() => {
  isHydrated.value = true
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
