<template>
  <v-app-bar
    elevation="0"
    class="px-4"
    :class="mdAndUp ? '' : 'app-bar-shadow mt-2'"
    rounded="lg"
    :height="mdAndUp ? '90' : '52'"
    :scroll-behavior="scrollBehavior"
    :scroll-threshold="scrollThreshold"
  >
    <NuxtLink
      :to="header.to"
    >
      <v-img
        :min-width="mdAndUp ? '150px' : '100px'"
        height="38"
        :src="img(header.logo.desktop, { format: 'webp', quality: 100, width: 320 })"
      />
    </NuxtLink>
    <v-spacer />
    <div class="d-flex align-center ga-4">
      <!-- <v-btn
        icon
        class="d-inline"
        @click="searchOpen = !searchOpen"
      >
        <v-icon>{{ mdiMagnify }}</v-icon>
      </v-btn> -->
      <!-- <v-btn-primary
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
      </v-btn-primary> -->
      <v-btn
        color="primary"
        height="54"
        class="text-caption text-md-body-1 d-none d-md-inline"
      >
        {{ header.textButton1 }}
      </v-btn>
      <v-btn
        color="primary"
        variant="tonal"
        height="54"
        class="text-caption text-md-body-1 d-none d-md-inline"
      >
        {{ header.textButton2 }}
      </v-btn>
      <v-btn
        density="compact"
        size="x-large"
        height="54"
        color="white"
        rounded="default"
        class="text-caption text-md-body-1 d-none d-md-inline bg-primary"
        @click="() => router.push('/calendly')"
      >
        {{ header.textButton3 }}
      </v-btn>

      <!-- <v-btn
        icon
        class="hidden-xs"
      >
        <v-icon>{{ mdiAccountCircle }}</v-icon>
      </v-btn> -->
      <v-btn
        class="d-inline d-md-none "
        icon
        height="35"
        variant="text"
        @click.stop="testModel = !testModel"
      >
        <v-icon>
          {{ mdiMenu }}
        </v-icon>
      </v-btn>
    </div>
  </v-app-bar>
  <ExtensionDrawer
    v-model="testModel"
    :extension="extensionName"
    class="d-md-and-down-none"
    @mouseleave="resetExtension()"
  />
</template>

<script setup>
import { mdiMagnify, mdiAccountCircle, mdiPhone, mdiMenu } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

const { header } = useAppConfig()
// #TODO CHECK Les valeurs à retirer / refacto en fonction des modifications du header par ODysway
const { mdAndUp } = useDisplay()
const router = useRouter()
const testModel = ref(false)
const searchOpen = ref(false)
const model = defineModel()
defineProps({
  scrollBehavior: {
    type: String,
    default: '',
  },
  scrollThreshold: {
    type: Number,
    default: 5,
  },
})
const img = useImage()

const showExtension = ref(false)
const extensionName = ref('')

const items = ref([
  { title: 'destinations',
    link: '/destinations',
    extension: 'destinations',
  },
  { title: 'prochains départs',
    link: '/prochains-departs',
  },
  { title: 'à propos',
    link: '/concept',
    extension: 'propos',
  },
])
watch([showExtension, extensionName], () => {
  testModel.value = !!(showExtension.value && extensionName.value)
})

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
.app-bar-shadow:deep(){
  box-shadow: 10px 10px 20px 0px rgba(0, 0, 0, 0.259)!important;
}
</style>
