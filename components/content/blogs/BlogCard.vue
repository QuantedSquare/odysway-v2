<template>
  <v-card
    elevation="0"
    :href="`${blogSlug}`"
    height="456px"
    class="text-decoration-none"
  >
    <v-img
      :src="img(blogImage, { format: 'webp', quality: 90, height: 228, width: 640 })"
      :alt="`image de ${blogTitle}`"
      height="261px"
      class="hover-scale"
      cover
    >
      <div class="badge-position">
        <v-chip
          size="x-large"
          class="text-body-2 text-white font-weight-bold px-5"
          :class="`bg-${blogBadgeColor}`"
        >
          {{ blogType }}
        </v-chip>
      </div>
    </v-img>

    <!--  BOTTOM TEXT -->
    <v-card-text class="pb-0">
      <v-container class="pb-0">
        <v-row>
          <v-col cols="12">
            <div class="text-primary text-h3 font-weight-bold py-1 px-0 no-white-space ">
              <div
                class="line-clamp-2"
              >
                {{ blogTitle }}
              </div>
              <v-tooltip
                v-if="blogTitle.length > 60"
                activator="parent"
              >
                <span>
                  {{ blogTitle }}
                </span>
              </v-tooltip>
            </div>
          </v-col>
          <v-spacer />
          <v-divider />
          <v-col
            cols="12"
            class="d-flex justify-space-between align-center text-secondary-light-2 text-h5 mt-4"
          >
            <div class="d-flex align-center ga-2">
              <v-icon size="small">
                {{ mdiClockTimeThreeOutline }}
              </v-icon>

              <div>
                3 min
              </div>
            </div>
            <div class="text-grey">
              {{ formatDate(blogDate) }}
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script setup>
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import 'dayjs/locale/fr'
import { mdiClockTimeThreeOutline } from '@mdi/js'
import { useImage } from '#imports'

defineProps({
  blogSlug: {
    type: String,
    required: true,
  },
  blogTitle: {
    type: String,
    required: true,
  },
  blogImage: {
    type: String,
    required: true,
  },
  // ADD TO EACH MAIN BLOG IMAGE
  // blogImageAlt: {
  //   type: String,
  //   required: true,
  // },
  blogPublished: {
    type: Boolean,
    required: true,
  },
  blogDate: {
    type: String,
    required: true,
  },
  blogType: {
    type: String,
    default: 'Actu',
  },
  blogBadgeColor: {
    type: String,
    default: 'secondary',
  },
})

dayjs.extend(customParseFormat)
const img = useImage()

const formatDate = (date) => {
  return dayjs(date).locale('fr').format('DD MMMM, YYYY')
}
</script>

<style scoped>
 .hover-scale:hover .blur-overlay {
  height: 100%;
}
 .hover-scale:hover{
  transform: scale(1.01);
  transition: transform 0.2s ease-in-out;
}
.hover-scale{
  transform: scale(1);
  transition: transform 0.2s ease-in-out;
}
.badge-position{
  position: absolute;
  top: 25px;
  right: 28px;
}
.line-clamp-2{
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
