<template>
  <v-img
    :src="img(imageSrc)"
    cover
    class="top-homepage-container "
  >
    <!-- <span class="absolute-position shadow">
      <slot
        name="title"
      />
    </span> -->
  </v-img>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    default: '/images/Laponie-(1).webp',
  },
})

const img = useImage()
</script>

<style scoped>
.top-homepage-container {
  height: 100vh;
}
.absolute-position {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  position: absolute;
  bottom: 10%;
  left: 10%;
  font-size: 5rem;
  color: white;
}

.shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

@media screen and (max-width: 600px) {
  .absolute-position {
    font-size: 3rem;
    top: 30%;
    left: 5%;
  }

  .top-homepage-container {
    height: 50vh;
  }
}

@media screen and (max-width: 400px) {
  .absolute-position {
    font-size: 2rem;
    left: 2%;
  }
}
</style>
