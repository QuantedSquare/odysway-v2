<template>
  <v-card
    variant="text"
    class="mb-4 py-6"
  >
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          sm="auto"
          class="d-flex justify-center justify-sm-start"
        >
          <AvatarImg
            :avatar-img="image"
            :avatar-size="avatarSize"
          />
        </v-col>
        <v-col class="d-flex flex-column justify-center align-center align-sm-start">
          <v-list-item-title class="text-h5 font-weight-bold text-center text-sm-start no-white-space mb-2 ">
            {{ name }}
          </v-list-item-title>
          <v-list-item-subtitle class="no-white-space text-h5 pb-1">
            {{ role }}
          </v-list-item-subtitle>
          <p
            ref="content"
            class="my-2 my-md-4 text-grey text-h5 font-weight-regular text-content "
            :class="{ truncated: !isExpanded }"
            :style="contentStyle"
          >
            {{ description }}
          </p>
          <div>
            <v-btn
              v-if="description"
              variant="text"
              slim
              class="text-h5 text-decoration-underline text-start"
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
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { mdiArrowRight } from '@mdi/js'

defineProps({
  image: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    default: '',
  },
  avatarSize: {
    type: String,
    default: '100',
  },
})

const isExpanded = ref(false)
const content = ref(null)
const lineHeight = 30 // px, match your CSS
const clampLines = 2

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
.no-white-space {
  white-space: normal;
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
  max-width: 550px;
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
