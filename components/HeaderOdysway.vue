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
        height="38"
        :src="img('/logos/logo_couleur.png', { format: 'webp', quality: 100, width: 320 })"
      />
    </NuxtLink>
    <v-spacer />
    <div class="d-flex align-center ga-4">
      <v-btn
        icon
        class="d-inline"
      >
        <v-icon>{{ mdiMagnify }}</v-icon>
      </v-btn>
      <v-btn-primary
        v-for="item, index in items"
        :key="`link header ${index}`"
        :href="item.link"
        class="d-none d-md-inline text-decoration-none"
        @mouseover="displayExtension(item)"
        @click="resetExtension()"
      >
        <div class="text-button text-uppercase font-weight-bold">
          {{ item.title }}
        </div>
      </v-btn-primary>
      <v-btn-secondary
        density="compact"
        size="x-large"
        color="primary"
        href="/calendly"
        class="d-none d-md-inline text-decoration-none"
      >
        <div class="d-flex flex-column align-center text-caption text-uppercase">
          <b>+33 1 84 80 79 75</b>
          prendre rdv
        </div>
      </v-btn-secondary>
      <v-btn
        color="primary"
        icon
        class="d-inline d-md-none"
      >
        <v-icon>
          {{ mdiPhone }}
        </v-icon>
      </v-btn>
      <v-btn
        icon
        class="hidden-xs"
      >
        <v-icon>{{ mdiAccountCircle }}</v-icon>
      </v-btn>
      <v-btn
        class="d-inline d-md-none"
        icon
        @click.stop="$emit('show-drawer')"
      >
        <v-icon>{{ mdiDotsVertical }}</v-icon>
      </v-btn>
    </div>
  </v-app-bar>
  <ExtensionDrawer
    v-if="showExtension && extensionName"
    :extension="extensionName"
    class="d-md-and-down-none"
    @mouseleave="resetExtension()"
  />
</template>

<script setup>
import { mdiMagnify, mdiDotsVertical, mdiAccountCircle, mdiPhone } from '@mdi/js'
import { useImage } from '#imports'

defineEmits(['show-drawer'])

const img = useImage()

const showExtension = ref(false)
const extensionName = ref('')

const items = ref([
  { title: 'destinations',
    link: '/destinations',
    extension: 'destinations',
  },
  { title: 'prochains départs',
    // link: '/prochains-departs',
  },
  { title: 'à propos',
    link: '/concept',
    extension: 'propos',
  },
])

function displayExtension(item) {
  if (item.extension) {
    showExtension.value = true
    extensionName.value = item.extension
  }
}

function resetExtension() {
  showExtension.value = false
  extensionName.value = ''
}

// TODO : add google analytics
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
