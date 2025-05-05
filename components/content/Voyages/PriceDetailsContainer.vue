<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-list>
          <v-list-subheader class="text-subtitle-1  pt-md-4 ">
            <v-chip
              variant="flat"
              color="green"
              density="compact"
            >
              <span class="font-weight-bold px-1">
                Le prix comprend
              </span>
            </v-chip>
          </v-list-subheader>
          <v-container>
            <PriceDetailsItem
              v-for="item, index in pricingDetailsBlock.include"
              :key="index"
              is-included
              :text="item"
            />
          </v-container>
        </v-list>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-list class="pl-md-4">
          <v-list-subheader class="text-subtitle-1  pt-md-4 ">
            <v-chip
              variant="flat"
              color="secondary"
              density="compact"
            >
              <span class="font-weight-bold px-1">
                Le prix ne comprend pas
              </span>
            </v-chip>
          </v-list-subheader>
          <v-container>
            <PriceDetailsItem
              v-for="item, index in pricingDetailsBlock.exclude"
              :key="index"
              :text="item"
            />
          </v-container>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const { pricingDetailsBlock } = inject('voyage')
</script>
