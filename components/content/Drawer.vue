<template>
  <v-navigation-drawer
    v-model="model"
    location="right"
    disable-resize-watcher
    mobile
    class="custom-padding"
  >
    <div>
      <!-- <v-btn
        icon
        class="mx-md-4 hidden-sm-and-up"
        color="white"
      >
        <v-icon color="primary">
          {{ mdiAccountCircle }}
        </v-icon>
      </v-btn> -->
      <v-list nav>
        <v-list-item
          density="compact"
          @click="model = false"
        >
          <v-btn-secondary
            block
            href="tel: +33184807975"
            class="text-white text-decoration-none"
            @click="trackPixel('trackCustom', 'AppelPixel')"
          >
            +33 1 84 80 79 75
          </v-btn-secondary>
        </v-list-item>
      </v-list>
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
const model = defineModel()

const drawerItems = ref([
  {
    title: 'Nos Destinations',
    value: 'Nos Destinations',
    link: '/destinations',
  },
  {
    title: 'Nos Experiences',
    value: 'Nos Experiences',
    link: '/experiences',
  },
  {
    title: 'Prochains départs',
    value: 'Prochains départs',
    link: '/prochains-departs',
  },
  {
    title: 'Prendre RDV avec un conseiller',
    value: 'Prendre RDV avec un conseiller',
    link: '/calendly',
  },
  {
    title: 'À propos',
    value: 'À propos',
    link: '/a-propos',
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
.custom-padding{
  margin-top: -10px;
  padding-top: 10px;
  padding-bottom: 100px;
  height: 100vh!important;
}
@media (max-width: 600px) {
  .custom-padding{
    margin-top: -46px;
    padding-top: 60px;
  }
}
.drawer-shadow{
  box-shadow: 10px 10px 20px 0px rgba(0, 0, 0, 0.259)!important;
}
</style>
