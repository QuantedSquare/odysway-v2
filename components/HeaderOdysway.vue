<template>
  <v-app-bar
    elevation="0"
    mobile
    class="px-4 d-flex align-center height-app-bar"
    :class="!model ? 'app-bar-shadow' : ''"
    :scroll-behavior="scrollBehavior"
    :scroll-threshold="scrollThreshold"
  >
    <NuxtLink
      :to="header.to"
      class="header-logo-link"
    >
      <NuxtImg
        :preload="{ fetchPriority: 'high' }"
        format="webp"
        quality="100"
        :src="LogoOdyswayBleu"
        width="320"
        alt="Logo principale d'Odysway"
        class="header-logo"
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
        height="45"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { router.push('/concept'); captureOutboundLink(header.textButton1) }"
      >
        {{ header.textButton1 }}
      </v-btn>
      <v-btn
        color="primary"
        variant="tonal"
        height="45"
        class="text-caption text-md-body-1 d-none d-md-inline"
        @click="() => { trackPixel('trackCustom', 'ClickAppel'); captureOutboundLink(header.textButton2) }"
      >
        {{ header.textButton2 }}
      </v-btn>
      <v-btn
        density="compact"
        size="x-large"
        height="45"
        color="white"
        rounded="default"
        class="text-caption text-md-body-1 d-none d-md-inline bg-primary"
        @click="() => { router.push('/calendly'); trackPixel('trackCustom', 'ClickRDV'); captureOutboundLink(header.textButton3) }"
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
import LogoOdyswayBleu from '~/assets/img/Logo-Odysway-Bleu.png'

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
    default: 'elevate',
  },
  scrollThreshold: {
    type: Number,
    default: 5,
  },
})
const { gtag } = useGtag()
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
function captureOutboundLink(btn) {
  gtag('event', 'Header Button', { eventAction: 'Click', eventLabel: `Header button "${btn}"` })
}
</script>

<style scoped>
.app-bar-shadow:deep(){
  box-shadow: none!important;
  z-index: 10000!important;
}
.height-app-bar{
  height: 90px;
}
.header-logo-link {
  display: flex;
  align-items: center;
}
:deep(.v-toolbar__content){
  height: 100%!important;
}
.header-logo {
  width: 150px;
  min-width: 100px;
  max-width: 100%;
  height: auto;
  transition: width 0.2s;
  display: block;
}
@media (max-width: 960px) {
  .app-bar-shadow:deep(){
    box-shadow: 10px 10px 20px 0px rgba(0, 0, 0, 0.259)!important;
  }
  .header-logo {
    width: 100px;
    min-width: 60px;
  }
  .height-app-bar{
  height: 60px;
}

}
</style>
