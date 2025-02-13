<template>
  <div>
    <!-- <v-row>
      <v-btn @click="currentWindow--">
        previous
      </v-btn>
      <v-btn @click="currentWindow++">
        next
      </v-btn>
    </v-row> -->

    <v-container
      class="d-flex align-center position-relative"
    >
      <!-- <ClientOnly>
      <Teleport
        v-if="id"
        :to="id"
      >
        <div class="d-flex align-center ga-4 ">
          <v-btn
            variant="outlined"
            color="grey"
            :disabled="arrivedState.left"
            icon
            @click="x -= Number(scrollAmount)"
          >
            <v-icon-chevron
              :icon="mdiChevronLeft"
            />
          </v-btn>
          <v-btn-voyage
            icon
            @click="x += Number(scrollAmount)"
          >
            <v-icon-chevron
              :icon="mdiChevronRight"
            />
          </v-btn-voyage>
        </div>
      </Teleport>
    </ClientOnly> -->
      <!-- <v-btn-voyage
      v-if="!arrivedState.left"
      icon
      class="position-absolute left-0 zIndex"
      @click="x -= Number(scrollAmount)"
    >
      <v-icon-chevron
        :icon="mdiChevronLeft"
      />
    </v-btn-voyage> -->

      <v-row>
        <v-slide-group
          v-model="currentWindow"
          center-active
          class="w-100"
          :show-arrow="false"
        >
          <slot />
        </v-slide-group>
      </v-row>

    <!-- <v-btn-voyage
      v-if="!arrivedState.right"
      icon
      class="position-absolute right-0"
      @click="x += Number(scrollAmount)"
    >
      <v-icon-chevron
        :icon="mdiChevronRight"
      />
    </v-btn-voyage> -->
    </v-container>
  </div>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

const currentWindow = ref(0)
defineProps({
  scrollAmount: {
    type: String,
    required: true,
    default: '400',
  },
})
</script>

<style scoped>
.hidden-scroll {
  -webkit-overflow-scrolling: touch;
}

.hidden-scroll::-webkit-scrollbar {
  display: none;
}
.zIndex {
  z-index: 100;
}
</style>
