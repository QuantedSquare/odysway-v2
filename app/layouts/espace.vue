<template>
  <v-app>
    <TopBar />

    <v-main class="espace-main">
      <!-- Boutons en casse normale dans tout l'espace, sans toucher au thème global. -->
      <v-defaults-provider :defaults="{ VBtn: { class: 'text-none' } }">
        <v-container class="espace-container py-6 py-md-8">
          <v-row>
            <v-col
              cols="12"
              md="4"
              lg="3"
            >
              <EspaceRail />
            </v-col>
            <v-col
              cols="12"
              md="8"
              lg="9"
            >
              <slot />
            </v-col>
          </v-row>
        </v-container>
      </v-defaults-provider>
    </v-main>
    <LazyFooterOdysway />
  </v-app>
</template>

<style scoped>
.espace-main {
  --v-layout-top: 90px !important;
  background: rgb(var(--v-theme-surface-panel), 0.45);
}
@media (max-width: 960px) {
  .espace-main {
    --v-layout-top: 60px !important;
  }
}
:deep(.v-main) {
  padding-top: var(--v-layout-top) !important;
}
.espace-container {
  max-width: 1180px;
}
</style>
