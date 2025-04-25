<template>
  <div
    class="rounded-xl"
    :class="`bg-${backgroundColor}`"
  >
    <!-- <v-btn-primary
      to="/blog"
      color="primary"
      class="btn-position hidden-sm-and-down pl-md-0"
    >
      <template #prepend>
        <v-icon>
          {{ mdiChevronLeft }}
        </v-icon>
      </template>

      <span> retour aux blogs</span>
    </v-btn-primary>
    <v-btn
      to="/blog"
      variant="outlined"
      density="compact"
      color="primary"
      :icon="mdiChevronLeft"
      class="btn-position hidden-md-and-up"
    /> -->
    <v-container
      fluid
      :height="smAndDown ? '': '687px'"
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
          <div class="text-body-2 text-lg-body-1 d-flex align-center ga-3">
            <v-chip
              size="x-large"
              class="text-body-2 font-weight-bold px-5"
              :class="`bg-${badgeColor}`"
            >
              <slot name="badge" />
            </v-chip>
            <div
              class="d-flex align-center ga-2 font-weight-2"
              :class="`text-${badgeColor}`"
            >
              <v-icon size="24px">
                {{ mdiClockTimeThreeOutline }}
              </v-icon>
              <slot
                name="reading-time"
                mdc-unwrap="p"
              />
            </div>
            <div class="text-grey">
              <slot
                name="publication-date"
                mdc-unwrap="p"
              />
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
            class="text-h6 text-lg-h5 text-grey font-weight-medium"
            :class="`text-${introductionColor}`"
          >
            <slot name="introduction" />
          </div>
          <div class="d-flex align-center ga-4">
            <AvatarImg
              :avatar-img="avatarAuthor"
              :avatar-size="avatarSize"
            />
            <div class="text-body-2 text-lg-body-1 d-flex flex-column justify-center align-center align-sm-start ga-4">
              <div class="text-primary  font-weight-bold">
                <slot name="author-name" />
              </div>
              <div class="text-grey">
                <slot name="author-role" />
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
            :src="img(imageSrc, { format: 'webp', quality: 70, height: 900, width: 1536 })"
            :lazy-src="img(imageSrc, { format: 'webp', quality: 10, height: 900, width: 1536 })"
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
  badgeColor: {
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
  avatarAuthor: {
    type: String,
    default: '/images/team/romain.webp',
  },
  avatarSize: {
    type: String,
    default: '60',
  },
  imageSrc: {
    type: String,
    default: '/images/Laponie-(1).webp',
  },
})

const { smAndDown } = useDisplay()
const img = useImage()
</script>

<style scoped>
.font-weight-2{
  font-weight: 500;
}
</style>
