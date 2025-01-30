<template>
  <v-col
    cols="auto"
  >
    <v-img
      src="/images/guillemet-gauche.svg"
      height="27"
      width="27"
    />
  </v-col>
  <v-col
    cols="10"
    xl="8"
  >
    <p class="text-center mb-4">
      {{ review.text }}
    </p>
  </v-col>
  <v-col cols="auto">
    <v-img
      src="/images/guillemet-droite.svg"
      height="27"
      width="27"
    />
  </v-col>
  <v-col
    cols="12"
    sm="8"
    xl="6"
  >
    <v-card
      variant="text"
      href="slug"
      target="_blank"
    >
      <v-row justify="center">
        <v-col cols="4">
          <v-img
            max-width="400px"
            :src="review.voyagePhoto"
            rounded="xl"
            cover
            class="border-xl green-border"
          />
        </v-col>
        <v-col cols="8">
          <v-card-subtitle class="text-textColor text-uppercase text-caption no-white-space">
            Lire le récit de voyage de {{ review.author }}:
          </v-card-subtitle>
          <v-card-title class="text-textColor text-subtitle-1 font-weight-bold no-white-space">
            <h4>
              {{ review.blogTitle }}
            </h4>
          </v-card-title>
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</template>

<script setup>
defineProps({
  review: Object,
})
</script>

<style scoped>
.green-border{
  border: 4px solid #2E8B57 !important;
}
.no-white-space {
  white-space: normal;
}
</style>
