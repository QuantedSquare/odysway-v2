<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card variant="text">
          <v-card-text class="text-subtitle-1 pl-0">
            <slot name="text" />
          </v-card-text>
          <div class="d-flex align-center">
            <v-avatar
              :image="props.avatar"
              size="80"
            />
            <div class="d-flex flex-column">
              <v-card-title>
                <slot name="guide-title" />
              </v-card-title>
              <v-card-subtitle>
                <slot name="guide-subtitle" />
              </v-card-subtitle>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps({
  avatar: {
    type: String,
    default: '',
  },
})
</script>
