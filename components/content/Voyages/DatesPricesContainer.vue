<template>
  <v-container id="dates-container">
    <v-row
      no-gutters
      align="center"
      justify="center"
    >
      <v-col
        cols="auto"
        class="d-flex align-center"
      >
        <v-btn
          v-if="deal.privatisation"
          fab
          small
          @click="() => activeTab = 0"
        >
          <v-icon>{{ icons.mdiChevronLeft }}</v-icon>
        </v-btn>
      </v-col>
      <v-col :class="deal.privatisation ? 'px-2' : ''">
        <v-tabs
          v-model="activeTab"
          hide-slider
          grow
          centered
          center-active
          height="80px"
          class="tabs-custom-container"
        >
          <!-- <v-tab
            v-for="item, index in tabsItems"
            :key="index"
            active-class="bg-tab-selected"
            class="d-flex flex-column justify-center tab-custom"
          >
            <h6 class="text-body-2 text-sm-body-1 text-md-h6 font-weight-bold">
              {{ item.title }}
            </h6>
            <span class="text-caption text-sm-body2 text-md-subtitle-2 text-wrap">
              {{ item.subtitle }}
            </span>
          </v-tab> -->
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
      </v-col>
      <v-col
        cols="auto"
        class="d-flex align-center"
      >
        <v-btn
          v-if="deal.privatisation"
          fab
          small
          @click="() => activeTab = 1"
        >
          <v-icon>
            {{ mdiChevronRight }}
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- -----_ TEst __ -->
    <!-- <v-tabs
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
    </v-tabs> -->

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
const activeTab = ref(0)

const { data: deal } = await useAsyncData(props.slug, async () => {
  console.log('props.slug', props.slug)
  const query = await queryCollection('deals').where('slug', '=', props.slug).first()
  console.log('query', query)
  return query
})
console.log('deal', deal.value)
</script>

<style scoped>
.active {
background-color: #2e8b57;
}
/* CHECk */

.tabs-custom-container .v-item-group .v-slide-group__prev ,
.tabs-custom-container .v-item-group .v-slide-group__next {
  display: none !important;
}
.tab-custom.v-tab {
  width: 50%;
  background-color: #2e8b562d;
  color: rgba(0, 0, 0, 0.6) !important;
  border-radius: 8px 8px 0 0 !important;
}
.bg-tab-selected.v-tab--active {
  background-color: var(--v-primary-base);
  color: #ffffff !important;
}
</style>
