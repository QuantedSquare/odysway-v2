<template>
  <v-container
    fluid
    class="rounded-lg px-md-12 py-md-8 mt-4 mt-md-8 bg-primary max-container-width"
  >
    <div class="text-h3 font-weight-bold my-4">
      Des idées pour vos prochains voyages
    </div>

    <v-tabs
      v-model="currentTab"
      class="text-grey position-relative mb-6"
      color="white"
    >
      <v-divider
        class="absolute-divider"
        thickness="2"
      />

      <v-tab
        v-for="top, index in tops"
        :key="index"
        :value="index"
      >
        <span class="font-weight-bold">
          {{ top.title }}
        </span>
      </v-tab>
    </v-tabs>
    <v-tabs-window
      v-model="currentTab"
    >
      <v-tabs-window-item
        v-for="tab, index in tops[currentTab].contenuOnglet"
        :key="`${tab.title}-${index}`"
        :value="index"
      >
        <v-row class="mb-16 pb-16">
          <v-col
            v-for="top, f in tops[currentTab].contenuOnglet"
            :key="`${top.title}-${f}`"
            cols="6"
            md="3"
          >
            <h5 class="text-h4 font-weight-bold mb-10 ">
              {{ top.title }}
            </h5>
            <div class="d-flex flex-column ga-2">
              <NuxtLink
                v-for="link, i in top.linksList"
                :key="`${link.slug}-${i}`"
                :to="`/voyages/${link.slug}`"
                class="text-grey line-clamp-2"
              >
                {{ link.title }}
              </NuxtLink>
            </div>
          </v-col>
        </v-row>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script setup>
const currentTab = ref(0)

const tops = await queryCollection('tops').all()
</script>

<style scoped>
.absolute-divider {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
.line-clamp-2{
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}
</style>
