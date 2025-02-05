<template>
  <v-app-bar>
    <v-app-bar-title>
      <NuxtLink to="/">
        <v-img
          width="150px"
          max-height="48px"
          :src="img('/logos/logo_couleur.png', { format: 'webp', quality: 70, width: 150 })"
          contain
        />
      </NuxtLink>
    </v-app-bar-title>
    <v-spacer />
    <template
      v-if="mdAndDown"
      #append
    >
      <v-btn icon>
        <v-icon color="grey">
          {{ mdiMagnify }}
        </v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon>{{ mdiAccountCircle }}</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="$emit('show-drawer')"
      >
        <v-icon>{{ mdiDotsVertical }}</v-icon>
      </v-btn>
    </template>
    <VTextFieldHome
      type="text"
      placeholder="Rechercher"
      class="expanding-search"
      :class="searchOpen ? 'expanded': 'closed'"
    >
      <template #prepend-inner>
        <v-icon
          color="grey"
          @click="searchOpen = !searchOpen"
        >
          {{ mdiMagnify }}
        </v-icon>
      </template>
    </VTextFieldHome>
    <VBtnPrimary
      v-for="item, index in items"
      :key="`link header ${index}`"
      :to="item.link"
      class="font-weight-bold mx-2"
    >
      {{ item.title }}
    </VBtnPrimary>
    <VBtnSecondary
      density="compact"
      size="x-large"
      to="/calendly"
      class="px-12"
    >
      <div class="text-caption text-uppercase d-flex flex-column align-center">
        <b>+33 1 84 80 79 75</b>
        prendre un rdv
      </div>
    </VBtnSecondary>
    <v-btn
      icon
      color="black"
    >
      <v-icon>{{ mdiAccountCircle }}</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { mdiMagnify, mdiDotsVertical, mdiAccountCircle } from '@mdi/js'
import { useImage } from '#imports'

const { mdAndDown } = useDisplay()

const emit = defineEmits(['show-drawer'])

const img = useImage()

const items = ref([
  { title: 'destinations', link: '/destinations' },
  { title: 'prochains départs', link: '/prochains-departs' },
  { title: 'à propos', link: '/concept' },
])

const searchOpen = ref(false)
</script>

<style scoped>
.expanding-search {
    border: 2px solid #2e8b57;
    border-radius: 50px;
  }
.v-input.expanding-search {
  transition: max-width 0.5s;
  max-width: 60px;
}

.v-input.expanding-search.closed {
  max-width: 60px;
}

.v-input.expanding-search.expanded {
  max-width: 300px;
}
</style>
