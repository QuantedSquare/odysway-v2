<template>
  <v-app>
    <HeaderOdysway
      @show-drawer="drawer = !drawer"
    />
    <ClientOnly>
      <v-navigation-drawer
        v-if="$vuetify.display.mdAndDown"
        v-model="drawer"
        location="right"
      >
        <v-list
          v-for="item, index in drawerItems"
          :key="`Drawer item ${index}`"
          nav
        >
          <v-list-item density="compact">
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
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
const drawer = ref(false)

const drawerItems = ref([{
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
  // link: '/avis-voyageurs',
},
{
  title: 'Carte cadeau',
  value: 'Carte cadeau',
  // link: '/offre-cadeau',
},
])
console.log('drawer booking', drawer.value)
</script>
