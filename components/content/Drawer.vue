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
          @click="model = false"
        >
          <v-btn-secondary
            href="tel: +33184807975"
            color="primary"
            block
            class="text-caption text-sm-subtitle-2"
            @click="() => { router.push('/a-propos'); captureOutboundLink(header.textButton1) }"
          >
            {{ header.textButton1 }}
          </v-btn-secondary>
        </v-list-item>
        <v-list-item>
          <v-btn-secondary
            color="primary"
            variant="tonal"
            block
            class="text-caption text-sm-subtitle-2"
            @click="() => { trackPixel('trackCustom', 'ClickAppel'); captureOutboundLink(header.textButton2) }"
          >
            {{ header.textButton2 }}
          </v-btn-secondary>
        </v-list-item>
        <v-list-item>
          <v-btn-secondary
            block
            class="text-caption text-sm-subtitle-2"
            color="white"
            @click="() => { router.push('/calendly'); trackPixel('trackCustom', 'ClickRDV'); captureOutboundLink(header.textButton3) }"
          >
            {{ header.textButton3 }}
          </v-btn-secondary>
        </v-list-item>
      </v-list>
      <!-- <v-list
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
      </v-list> -->
    </div>
  </v-navigation-drawer>
</template>

<script setup>
const model = defineModel()
const { header } = useAppConfig()
const router = useRouter()
const { gtag } = useGtag()

function captureOutboundLink(btn) {
  gtag('event', 'Header Button', { eventAction: 'Click', eventLabel: `Header button "${btn}"` })
}
</script>

<style scoped>
.custom-padding{
  margin-top: -4px;
  padding-top: 10px;
}
.drawer-shadow{
  box-shadow: 10px 10px 20px 0px rgba(0, 0, 0, 0.259)!important;
}
</style>
