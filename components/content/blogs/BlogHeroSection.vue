<template>
  <div
    class="rounded-xl"
    :class="`bg-${backgroundColor}`"
  >
    <v-container
      fluid
      :height="smAndDown ? '': '682px'"
      class="pa-0"
    >
      <v-row
        class="ma-0 h-100 flex-column-reverse flex-md-row"
      >
        <v-col
          cols="12"
          md="5"
          class="d-flex flex-column justify-center ga-6 ga-md-8 pl-md-8"
        >
          <div
            v-if="page.blogType && page.badgeColor"
            class="text-body-2 text-lg-body-1 d-flex align-center ga-3"
          >
            <v-chip
              size="x-large"
              class="text-body-2 font-weight-bold px-5"
              :class="`bg-${page.badgeColor}`"
            >
              <div class="mb-1">
                {{ page.blogType }}
              </div>
            </v-chip>
            <div
              v-if="page.readingTime"
              class="d-flex align-center ga-2 font-weight-2"
              :class="`text-${page.badgeColor ?? 'primary'}`"
            >
              <v-icon size="24px">
                {{ mdiClockTimeThreeOutline }}
              </v-icon>
              {{ page.readingTime }} min
            </div>
            <div class="text-grey">
              {{ formatDate(page.publishedAt, 'DD MMMM YYYY') }}
            </div>
          </div>
          <h1
            class="text-h4 text-lg-h1 font-weight-bold"
            :class="`text-${titleColor}`"
          >
            <slot
              name="title"
              mdc-unwrap="p"
            />
          </h1>
          <div
            class="text-h6 text-lg-h5 font-weight-medium max-lines overflow-y-auto"
            :class="`text-${introductionColor}`"
            style="max-height: 320px;"
          >
            <slot name="introduction" />
          </div>
          <div
            v-if="page.author"
            class="d-flex align-center ga-4"
          >
            <AvatarImg
              :avatar-img="page.authorPhoto"
              :avatar-size="avatarSize"
            />
            <div class="text-body-2 text-lg-body-1 d-flex flex-column justify-center align-center align-sm-start ga-4">
              <div class="text-primary font-weight-bold">
                {{ page.author }}
              </div>
              <div class="text-grey">
                {{ page.authorRole }}
              </div>
            </div>
          </div>
        </v-col>
        <v-spacer />
        <v-col
          cols="12"
          md="6"
          class="pa-0 h-100"
        >
          <v-img
            :src="img(page.displayedImg, { format: 'webp', quality: 70, height: 900, width: 1536 })"
            :lazy-src="img(page.displayedImg, { format: 'webp', quality: 10, height: 900, width: 1536 })"
            cover
            height="100%"
            :class="smAndDown ? 'rounded-t-lg' : 'rounded-e-lg'"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { mdiClockTimeThreeOutline } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

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

const { smAndDown } = useDisplay()
const img = useImage()
const page = inject('page')
console.log('page', page)
</script>

<style scoped>
.font-weight-2{
  font-weight: 500;
}
</style>
