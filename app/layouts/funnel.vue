<template>
  <v-app>
    <FunnelLayoutHeader />
    <v-main class="main-content bg-warm">
      <slot />
    </v-main>
    <AppSnackbar />
    <ClientOnly>
      <FunnelErrorTester />
    </ClientOnly>
  </v-app>
</template>

<script setup>
// Funnel-scoped safety net: any error thrown while rendering a funnel child
// component is reported with its Vue origin (`info`). Scoped to this layout so
// it never spams from the rest of the app. Return false to keep propagating.
const { report } = useFunnelReporter()

onErrorCaptured((err, _instance, info) => {
  report({
    code: 'VUE_RENDER_ERROR',
    step: 'unknown',
    severity: 'fatal',
    origin: { field: info },
    message: err?.message || 'Erreur de rendu',
    raw: { name: err?.name, message: err?.message, stack: err?.stack },
  })
  return false
})
</script>

<style scoped>
.main-content {
  --v-layout-bottom: 0px;
}

:deep(.v-main) {
  padding-top: var(--v-layout-top)!important;
  padding-bottom: var(--v-layout-bottom)!important;
}
</style>
