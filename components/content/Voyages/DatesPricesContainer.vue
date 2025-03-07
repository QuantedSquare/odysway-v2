<template>
  <v-container>
    <v-tabs
      v-model="tab"
      grow
      color="white"
      :next-icon="mdiChevronRight"
      align-tabs="center"
      show-arrows
      hide-slider
      selected-class="active"
      height="64"
    >
      <template #prev="{ prev }">
        <v-btn
          :icon="mdiChevronLeft"
          class="bg-white"
          size="small"
          @click="prev"
        >
          <v-icon>{{ mdiChevronLeft }}</v-icon>
        </v-btn>
      </template>
      <template #next="{ next }">
        <v-btn
          :icon="mdiChevronRight"
          class="bg-white"
          size="small"
          @click="next"
        >
          <v-icon>{{ mdiChevronLeft }}</v-icon>
        </v-btn>
      </template>
      <v-tab
        :value="1"
        class="rounded-t-lg"
      >
        <div class="d-flex-column text-subtitle-1 text-md-h6 font-weight-bold ">
          <slot
            name="phrase-left-title"
          />
          <div class="text-caption ">
            <slot
              name="phrase-left-subtitle"
            />
          </div>
        </div>
      </v-tab>
      <v-tab
        v-if="deal.privatisation"
        :value="2"
        class="rounded-t-lg"
      >
        <div class="text-subtitle-1 text-md-h6 font-weight-bold ">
          <slot
            name="phrase-right-title"
          />
          <div
            class="text-caption "
          >
            <slot
              name="phrase-right-subtitle"
            />
          </div>
        </div>
      </v-tab>
    </v-tabs>

    <v-tabs-window
      v-model="tab"
      class="bg-primary"
    >
      <v-tabs-window-item :value="1">
        <DatesDataTable :deal="deal" />
      </v-tabs-window-item>
      <v-tabs-window-item
        v-show="deal.privatisation"
        :value="2"
      >
        <PrivateTabContainer :deal="deal" />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script setup>
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const tab = ref(null)

const { data: deal } = await useAsyncData(props.slug, () => {
  return queryCollection('deals').where('slug', '=', props.slug).first()
})
</script>

<style scoped>
.active {
background-color: #2e8b57;
}
</style>
