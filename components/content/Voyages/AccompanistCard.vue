<template>
  <v-card
    variant="text"
    class="mb-4 py-md-6"
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
        <v-col class="d-flex flex-column justify-center align-center align-sm-start ga-md-2">
          <v-list-item-title class="text-h5 font-weight-bold text-center text-sm-start no-white-space ">
            {{ name }}
          </v-list-item-title>
          <v-list-item-subtitle class="no-white-space text-h6">
            {{ role }}
          </v-list-item-subtitle>
          <ExpandableText
            v-if="description"
            :clamp-lines="3"
            :line-height="30"
            wrapper-class="mt-4 my-md-2 text-grey text-body-2 text-md-h5 font-weight-regular"
            button-class="text-h5 text-decoration-underline"
          >
            {{ description }}
          </ExpandableText>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
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
</script>

<style scoped>
.no-white-space {
  white-space: normal;
}
</style>
