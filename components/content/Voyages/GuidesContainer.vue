<template>
  <v-container>
    <v-row>
      <v-col class="text-grey-darken-3">
        <slot
          name="text"
        />
        <v-card variant="text">
          <v-card-text class="px-0">
            <v-list
              lines="three"
              class="text-body-1 text-grey-darken-3"
            >
              <slot name="guides" />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
