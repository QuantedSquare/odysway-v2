<template>
  <v-container
    class="pa-0 mt-8"
  >
    <v-card class="pa-10">
      <v-row no-gutters>
        <v-col
          cols="12"
          sm="auto"
          class="d-flex justify-center justify-sm-start"
        >
          <AvatarImg
            :avatar-img="page.authorPhoto"
            :avatar-size="avatarSize"
          />
        </v-col>
        <v-col class="d-flex flex-column justify-center align-center align-sm-start">
          <v-card-title class="text-primary text-h4 font-weight-bold text-center text-sm-start no-white-space">
            <slot name="author-name" />
          </v-card-title>
          <v-card-subtitle class="text-secondary text-h4 no-white-space ">
            <slot name="author-role" />
          </v-card-subtitle>
          <v-card-text class="text-h4 text-grey">
            <slot name="text" />
          </v-card-text>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
defineProps({
  avatarAuthor: {
    type: String,
    default: '/images/team/romain.webp',
  },
  avatarSize: {
    type: String,
    default: '60',
  },
})

const page = inject('page')
</script>
