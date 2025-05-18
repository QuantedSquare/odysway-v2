<template>
  <v-card>
    <v-container fluid>
      <v-row>
        <v-col
          cols="12"
          md="5"
          xl="4"
          class="d-flex flex-column align-center justify-center"
        >
          <v-avatar
            size="80"
            color="primary"
          >
            <v-img
              v-if="review.photo"
              :src="review.photo"
              alt="Photo d'une personne ayant effectué le voyage"
            />
            <span v-else> {{ review.author[0].toUpperCase() }}</span>
          </v-avatar>
          <v-card-item>
            <v-card-title class="text-center">
              {{ review.author }}
            </v-card-title>
            <v-card-subtitle class="d-flex flex-column align-center no-white-space">
              <span class="d-flex align-center justify-center">
                <v-icon color="#ffc658">
                  {{ mdiStar }}
                </v-icon>
                {{ review.rating }}/{{ maxNote }} - {{ formatedDate }}
              </span>
              <template v-if="review.voyageTitle">
                <span class="mt-6"> Son voyage : </span>
                <NuxtLink
                  v-if="review.voyageSlug"
                  :to="`voyages/${review.voyageSlug}`"
                  class="text-center text-decoration-none text-primary hover-decoration"
                >
                  <span class="hover-decoration">{{ review.voyageTitle }}</span>
                </NuxtLink>
              </template>
            </v-card-subtitle>
          </v-card-item>
        </v-col>
        <v-col
          cols="12"
          md="7"
          xl="8"
          class="d-flex align-center"
        >
          <v-row
            justify="center"
            no-gutters
          >
            <v-col
              cols="auto"
              class="d-none d-sm-inline"
            >
              <v-img
                src="/images/guillemet-gauche.svg"
                height="27"
                width="27"
              />
            </v-col>
            <v-col
              cols="12"
              sm="10"
            >
              <p
                v-if="review.text.startsWith('<')"
                v-dompurify-html="review.text"
                class="text-center px-4"
              />
              <p
                v-else
                class="text-center px-4"
              >
                {{ review.text }}
              </p>
            </v-col>
            <v-col
              cols="auto"
              class="d-none d-sm-inline"
            >
              <v-img
                src="/images/guillemet-droite.svg"
                height="27"
                width="27"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script setup>
import dayjs from 'dayjs'
import { mdiStar } from '@mdi/js'
// #TODO Check si on delete ce composant
const props = defineProps({
  review: {
    type: Object,
    required: true,
  },
  maxNote: {
    type: Number,
    default: 5,
  },
})
const formatedDate = computed(() => {
  return dayjs(props.review.date).format('DD MMMM YYYY')
})
</script>

<style scoped>
  .no-white-space {
    white-space: normal;
  }
.hover-decoration:hover{
  text-decoration: underline;
}
</style>
