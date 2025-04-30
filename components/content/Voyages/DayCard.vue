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
          :src="img(image, { format: 'webp', quality: 70, width: 640 })"
          cover
          :width="xs ? 'w-100' : 298"
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
              class="px-2"
            >
              <span class="text-subtitle-2 font-weight-bold text-white">
                {{ day }}
              </span>
            </v-chip>
            <span class="text-primary text-h5 font-weight-bold ">{{ title }}</span>
          </div>
        </v-card-title>
        <v-card-text
          class="text-primary text-subtitle-1 font-weight-regular pt-2 line-height"
          :style="!isExpanded ? 'max-height: 124px; overflow: hidden;' : ''"
        >
          {{ text }}
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

const props = defineProps({
  image: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  index: Number,
})

const img = useImage()
const { xs } = useDisplay()

const expandedIndex = defineModel()

const isExpanded = computed(() => expandedIndex.value === props.index)

const toggle = () => {
  expandedIndex.value = isExpanded.value ? null : props.index
}
</script>

<style scoped>
.shadow-none{
  box-shadow: none !important;
}
.line-height{
  line-height: 30px !important;
}
</style>
