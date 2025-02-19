<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card variant="text">
          <v-card-text class="text-subtitle-1 text-grey-darken-3 px-0">
            <slot
              name="text"
              mdc-unwrap="p"
            />
            <v-list lines="three">
              <slot name="guides" />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
