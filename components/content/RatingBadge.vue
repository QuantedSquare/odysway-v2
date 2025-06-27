<template>
  <div
    v-if="!noLink"
    style="cursor: pointer;"
    @click="scrollToReviews"
  >
    <v-btn
      v-if="rating"
      color="white"
      rounded="pill"
      :height="smAndUp ? 46 : 30"
      class="btn-shadow bg-white px-2 px-md-4"
    >
      <div class="d-flex align-center ">
        <svg
          :width="smAndUp ? 18: 16"
          :height="smAndUp ? 18 : 16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.60446 5.35824L7.42762 1.68665C7.48069 1.5804 7.56231 1.49102 7.66333 1.42856C7.76436 1.3661 7.88078 1.33301 7.99955 1.33301C8.11832 1.33301 8.23475 1.3661 8.33577 1.42856C8.43679 1.49102 8.51841 1.5804 8.57148 1.68665L10.3946 5.35824L14.4704 5.95052C14.588 5.96682 14.6986 6.01584 14.7896 6.092C14.8807 6.16815 14.9485 6.26837 14.9853 6.3812C15.0221 6.49404 15.0264 6.61495 14.9978 6.73013C14.9692 6.84532 14.9088 6.95014 14.8234 7.03262L11.8746 9.88877L12.5708 13.9239C12.6599 14.4418 12.1125 14.8361 11.6445 14.5919L7.99955 12.686L4.35393 14.5919C3.88656 14.8368 3.33919 14.4418 3.42832 13.9232L4.12446 9.88807L1.17568 7.03192C1.09076 6.94938 1.0307 6.84467 1.00232 6.72969C0.973949 6.61471 0.978399 6.49407 1.01517 6.3815C1.05194 6.26892 1.11955 6.16892 1.21033 6.09286C1.3011 6.01679 1.41139 5.96772 1.52867 5.95122L5.60446 5.35824Z"
            fill="#F6BF4B"
            stroke="#F6BF4B"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="mt-1 mt-sm-0 ml-1 text-body-2 font-weight-bold text-primary">
          {{ `${rating.toString().replace('.', ',')}/5` }}
        </span>
        <span
          v-if="comments > 0"
          class="mt-1 mt-sm-0 text-body-2 font-weight-bold text-primary"
        >
          {{ `(${comments})` }}
        </span>
      </div>
    </v-btn>
    <v-btn
      v-else
      color="primary"
      class="font-weight-bold btn-shadow text-body-2 text-md-body-1"
      rounded="pill"
      :height="smAndUp ? 46 : 36"
    >
      <span>
        Nouveau
      </span>
    </v-btn>
  </div>
  <div v-else>
    <v-btn
      v-if="rating"
      color="white"
      rounded="pill"
      :height="smAndUp ? 46 : 30"
      class="btn-shadow bg-white px-2 px-md-4"
    >
      <div class="d-flex align-center ">
        <svg
          :width="smAndUp ? 18: 16"
          :height="smAndUp ? 18 : 16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.60446 5.35824L7.42762 1.68665C7.48069 1.5804 7.56231 1.49102 7.66333 1.42856C7.76436 1.3661 7.88078 1.33301 7.99955 1.33301C8.11832 1.33301 8.23475 1.3661 8.33577 1.42856C8.43679 1.49102 8.51841 1.5804 8.57148 1.68665L10.3946 5.35824L14.4704 5.95052C14.588 5.96682 14.6986 6.01584 14.7896 6.092C14.8807 6.16815 14.9485 6.26837 14.9853 6.3812C15.0221 6.49404 15.0264 6.61495 14.9978 6.73013C14.9692 6.84532 14.9088 6.95014 14.8234 7.03262L11.8746 9.88877L12.5708 13.9239C12.6599 14.4418 12.1125 14.8361 11.6445 14.5919L7.99955 12.686L4.35393 14.5919C3.88656 14.8368 3.33919 14.4418 3.42832 13.9232L4.12446 9.88807L1.17568 7.03192C1.09076 6.94938 1.0307 6.84467 1.00232 6.72969C0.973949 6.61471 0.978399 6.49407 1.01517 6.3815C1.05194 6.26892 1.11955 6.16892 1.21033 6.09286C1.3011 6.01679 1.41139 5.96772 1.52867 5.95122L5.60446 5.35824Z"
            fill="#F6BF4B"
            stroke="#F6BF4B"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>

        <span class="mt-1 mt-sm-0 ml-1 text-body-2 font-weight-bold text-primary">
          {{ `${rating.toString().replace('.', ',')}/5` }}
        </span>
        <span
          v-if="comments > 0"
          class="mt-1 mt-sm-0 text-body-2  font-weight-bold text-primary"
        >
          {{ `(${comments})` }}
        </span>
      </div>
    </v-btn>
    <v-btn
      v-else
      color="primary"
      class="font-weight-bold btn-shadow text-body-2 text-md-body-1"
      rounded="pill"
      :height="smAndUp ? 46 : 36"
    >
      <span>
        Nouveau
      </span>
    </v-btn>
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { smAndUp } = useDisplay()
console.log('smAndUp', smAndUp.value)
defineProps({
  rating: {
    type: Number,
  },
  elevation: {
    type: String,
    default: '0',
  },
  comments: {
    type: Number,
    default: 0,
  },
  noLink: {
    type: Boolean,
    default: false,
  },
})

const scrollToReviews = () => {
  const reviewsContainer = document.getElementById('reviews-container')
  if (reviewsContainer) {
    // Update the URL hash
    window.location.hash = 'reviews-container'

    // Scroll to the element with smooth behavior
    reviewsContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}
</script>
