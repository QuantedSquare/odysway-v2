<template>
  <v-app>
    <HeaderOdysway
      :scroll-behavior="$vuetify.display.smAndDown ? 'hide' :'' "
      scroll-threshold="5"
      @show-drawer="toggleDrawer()"
    />
    <ClientOnly>
      <v-navigation-drawer
        v-model="drawer"
        location="right"
        disable-resize-watcher
        mobile
      >
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
            @click="drawer = !drawer"
          >
            <NuxtLink
              :to="item.link"
              class="text-primary text-decoration-none"
            >
              {{ item.title }}
            </NuxtLink>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
    </ClientOnly>
    <v-main style="--v-layout-top: 0px; --v-layout-bottom: 0px;">
      <slot />
    </v-main>
    <FooterOdysway />
  </v-app>
</template>

<script setup>
import { mdiAccountCircle } from '@mdi/js'

const drawer = ref(false)

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
  // link: '/calendly',
  },
  {
    title: 'À propos',
    value: 'À propos',
    link: '/concept',
  },
  {
    title: 'Avis',
    value: 'Avis',
    link: '/avis-voyageurs',
  },
  {
    title: 'Carte cadeau',
    value: 'Carte cadeau',
  // link: '/offre-cadeau',
  },
])

function toggleDrawer() {
  drawer.value = !drawer.value
}
</script>
