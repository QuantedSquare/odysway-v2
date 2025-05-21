<template>
  <v-app-bar
    elevation="0"
    mobile
    height="90"
    class="px-4"
    :class="!model ? 'app-bar-shadow' : ''"

    :scroll-behavior="scrollBehavior"
    :scroll-threshold="scrollThreshold"
  >
    <NuxtLink
      :to="header.to"
    >
      <v-img
        :min-width="mdAndUp ? '150px' : '100px'"
        height="38"
        alt="Logo principale d'Odysway"
        :src="img(header.logo.desktop, { format: 'webp', quality: 100, width: 320 })"
        :srcset="`${img(header.logo.desktop, { format: 'webp', quality: 100, width: 320 })} 320w, ${img(header.logo.desktop, { format: 'webp', quality: 100, width: 640 })} 640w`"
        :sizes="mdAndUp ? '150px' : '100px'"
      />
    </NuxtLink>
    <v-spacer />
    <div class="d-flex align-center ga-4">
      <!-- <template v-if="isConnected && user">
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn
              icon
              class="hidden-xs"
              v-bind="props"
            >
              <v-icon>{{ mdiAccountCircle }}</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-list-item-title>{{ user.email }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleSignOut">
              <v-list-item-title>Sign Out</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-else>
        <div class="d-flex align-center ga-2">
          <v-btn
            variant="text"
            class="hidden-xs text-uppercase"
            @click="router.push('/signin')"
          >
            Sign In
          </v-btn>
          <v-btn
            color="primary"
            class="hidden-xs text-uppercase"
            @click="router.push('/signup')"
          >
            Sign Up
          </v-btn>
        </div>
      </template> -->
      <v-btn
        color="primary"
        height="54"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => router.push('/concept')"
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
        @click.stop="model = !model"
      >
        <v-icon>
          {{ mdiMenu }}
        </v-icon>
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script setup>
import { mdiMenu } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

const { header } = useAppConfig()

// #TODO CHECK Les valeurs à retirer / refacto en fonction des modifications du header par ODysway
const { mdAndUp } = useDisplay()
// const { user, signOut, isConnected } = useUser()
const router = useRouter()
// const testModel = ref(false)
// const searchOpen = ref(false)
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

// const showExtension = ref(false)
// const extensionName = ref('')

// const items = ref([
//   { title: 'destinations',
//     link: '/destinations',
//     extension: 'destinations',
//   },
//   { title: 'prochains départs',
//     link: '/prochains-departs',
//   },
//   { title: 'à propos',
//     link: '/concept',
//     extension: 'propos',
//   },
// ])
// watch([showExtension, extensionName], () => {
//   testModel.value = !!(showExtension.value && extensionName.value)
// })

// function displayExtension(item) {
//   if (item.extension) {
//     showExtension.value = true
//     extensionName.value = item.extension
//   }
// }

// function resetExtension() {
//   showExtension.value = false
//   extensionName.value = ''
// }

// const handleSignOut = async () => {
//   await signOut()
//   router.push('/signin')
// }

// TODO : add google analytics
</script>

<style scoped>
.app-bar-shadow:deep(){
  box-shadow: none!important;
}
@media screen and (max-width: 960px) {
  .app-bar-shadow:deep(){
    box-shadow: 10px 10px 20px 0px rgba(0, 0, 0, 0.259)!important;
  }
}
</style>
