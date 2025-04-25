<template>
  <v-card
    elevation="0"
    :href="`${blogSlug}`"
    height="456px"
    class="text-decoration-none"
  >
    <v-img
      :src="img(blogImage, { format: 'webp', quality: 90, height: 228, width: 640 })"
      :alt="blogTitle"
      height="261px"
      class="hover-scale"
      cover
    >
      <div class="badge-position">
        <v-chip
          size="x-large"
          class="text-body-2 font-weight-bold px-5 bg-secondary"
        >
          <!-- :class="`bg-${badgeColor}`" -->
          <slot name="badge" />
        </v-chip>
      </div>
    </v-img>

    <!--  BOTTOM TEXT -->
    <div>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <div class="text-primary text-h4 font-weight-bold py-1 px-0 no-white-space ">
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
              class="d-flex justify-space-between text-secondary"
            >
              <div class="d-flex align-center ga-2">
                <v-icon size="24px">
                  {{ mdiClockTimeThreeOutline }}
                </v-icon>
                <div>3 min</div>
              </div>
              <div class="text-grey">
                {{ formatDate(blogDate) }}
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </div>
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
  // blogBadgeContent: {
  //   type: String,
  //   default: 'Actu',
  // },
  // blogBadgeColor: {
  //   type: String,
  //   default: 'secondary',
  // },
})

dayjs.extend(customParseFormat)
const img = useImage()

const formatDate = (date) => {
  return dayjs(date).locale('fr').format('DD MMMM YYYY')
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
