<template>
  <v-container>
    <v-card variant="text">
      <v-row>
        <v-col class="d-sm-block d-none">
          <v-card-text class="text-body-1 text-grey-darken-3 pt-0 px-0">
            <slot
              name="text"
              mdc-unwrap="p"
            />
          </v-card-text>
        </v-col>
        <v-col>
          <slot name="carousel" />
          <v-card-actions
            class="d-sm-none d-flex justify-center"
          >
            <BouncingBtn v-model="isExpanded" />
          </v-card-actions>
          <v-expand-transition>
            <div
              v-show="isExpanded && $vuetify.display.smAndDown"
            >
              <v-card-text class="text-body-1 text-grey-darken-3 px-0">
                <slot
                  name="text"
                  mdc-unwrap="p"
                />
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
const isExpanded = ref(false)
</script>
