<template>
  <v-app-bar
    elevation="0"
    class="px-4"
  >
    <NuxtLink
      to="/"
    >
      <v-img
        min-width="150px"
        :src="img('/logos/logo_couleur.png', { format: 'webp', quality: 100, width: 150 })"
      />
    </NuxtLink>

    <v-spacer />

    <v-btn
      icon
      class="d-inline d-lg-none"
    >
      <v-icon color="grey">
        {{ mdiMagnify }}
      </v-icon>
    </v-btn>
    <v-btn
      icon
      class="mx-md-4"
    >
      <v-icon>{{ mdiAccountCircle }}</v-icon>
    </v-btn>
    <v-btn
      class="d-inline d-lg-none"
      icon
      @click.stop="$emit('show-drawer')"
    >
      <v-icon>{{ mdiDotsVertical }}</v-icon>
    </v-btn>
    <!-- <v-row
      justify="end"
      class="d-none d-md-flex"
    >
      <v-col
        class="d-flex align-center justify-end"
      >
        <v-text-field-home
          v-model="searchText"
          v-click-outside="() => searchOpen = false"
          type="text"
          placeholder="Rechercher"
          class="expanding-search"
          :class="searchOpen ? 'expanded': 'closed'"
          @click.stop="searchOpen = !searchOpen"
        >
          <template #prepend-inner>
            <v-btn
              icon
              size="xs"
            >
              <v-icon
                color="grey"
              >
                {{ mdiMagnify }}
              </v-icon>
            </v-btn>
          </template>
        </v-text-field-home>
        <v-btn-primary
          v-for="item, index in items"
          :key="`link header ${index}`"
          :to="item.link"
          class="text-button text-uppercase font-weight-bold mx-4"
        >
          {{ item.title }}
        </v-btn-primary>
        <v-btn-secondary
          density="compact"
          size="x-large"
          href="/calendly"
          class="px-12"
        >
          <div class="text-caption text-uppercase d-flex flex-column align-center">
            <b>+33 1 84 80 79 75</b>
            prendre rdv
          </div>
        </v-btn-secondary>
      </v-col>
    </v-row> -->
  </v-app-bar>
</template>

<script setup>
import { mdiMagnify, mdiDotsVertical, mdiAccountCircle } from '@mdi/js'
import { useImage } from '#imports'

const searchText = ref('')
const img = useImage()

const items = ref([
  { title: 'destinations',
    link: '/destinations',
  },
  { title: 'prochains départs',
    // link: '/prochains-departs',
  },
  { title: 'à propos',
    link: '/concept',
  },
])

const searchOpen = ref(false)
</script>

<style scoped>
.expanding-search {
  border-radius: 25px;
}

.expanding-search.closed {
  max-width: 60px;
  border: 1px solid #9e9e9e;
  transition: 0.5s;
}

.expanding-search.expanded {
  max-width: 300px;
  border: 2px solid #2e8b57;
  transition: 0.5s;
}
.v-text-field--rounded>.v-input__control>.v-input__slot {
    padding: 0 24px !important;
}
</style>
