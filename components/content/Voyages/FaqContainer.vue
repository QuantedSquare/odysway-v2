<template>
  <div
    id="faq-container"
    class="bg-odysway-1 pb-8"
  >
    <slot name="section-title" />
    <v-container>
      <v-row>
        <v-col>
          <v-expansion-panels
            flat
            multiple
          >
            <slot name="faq" />
          </v-expansion-panels>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
