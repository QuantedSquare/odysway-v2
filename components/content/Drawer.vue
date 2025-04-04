<template>
  <v-navigation-drawer
    v-model="model"
    location="right"
    disable-resize-watcher
    mobile
    class="zIndex"
  >
    <div>
      <v-btn
        icon
        class="mx-md-4 hidden-sm-and-up"
        color="white"
      >
        <v-icon color="primary">
          {{ mdiAccountCircle }}
        </v-icon>
      </v-btn>
      <v-list
        v-for="item, index in drawerItems"
        :key="`Drawer item ${index}`"
        nav
      >
        <v-list-item
          density="compact"
          @click="model = false"
        >
          <NuxtLink
            :to="item.link"
            class="text-primary text-decoration-none"
          >
            {{ item.title }}
          </NuxtLink>
        </v-list-item>
      </v-list>
    </div>
  </v-navigation-drawer>
</template>

<script setup>
import { mdiAccountCircle } from '@mdi/js'

const model = defineModel()

const drawerItems = ref([
  {
    title: 'Nos Destinations',
    value: 'Nos Destinations',
    link: '/destinations',
  },
  {
    title: 'Prochains départs',
    value: 'Prochains départs',
    // link: '/prochains-departs',
  },
  {
    title: 'Prendre RDV avec un conseiller',
    value: 'Prendre RDV avec un conseiller',
    link: '/calendly',
  },
  {
    title: 'À propos',
    value: 'À propos',
    link: '/concept',
  },
  {
    title: 'Blog',
    value: 'Blog',
    link: '/blog',
  },
  {
    title: 'Avis',
    value: 'Avis',
    link: '/avis-voyageurs',
  },
  // {
  //   title: 'Carte cadeau',
  //   value: 'Carte cadeau',
  // // link: '/offre-cadeau',
  // },
])
</script>

<style scoped>
.zIndex{
  z-index: 1030 !important;
}
</style>
