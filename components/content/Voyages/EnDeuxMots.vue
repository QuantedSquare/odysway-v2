<template>
  <div class="text-primary d-flex flex-column ga-3">
    <h4 class="text-h4 font-weight-bold">
      En deux mots
    </h4>
    <p class="text-subtitle-2 text-md-4 font-weight-regular">
      “Lorem ipsum dolor sit amet consectetur adipiscing elit etiam cras tellus sit tempor amet, nascetur quam ornare proin platea diam amet sed fringilla eget pretium id sagittis in porttitor pharetra dui”.
    </p>

    <div class="d-flex ga-3">
      <v-avatar
        image="/public/images/team/romain.webp"
        :size="mdAndDown ? 60 : 80"
      />
      <div class="text-body-2 text-body-2 d-flex flex-column justify-center ga-2">
        <span class="font-weight-bold">
          Romain
        </span>
        <span>
          Fondateur Odysway
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { mdAndDown } = useDisplay()
</script>
