<template>
  <v-container
    v-if="dealStatus === 'success'"
    id="dates-container"
  >
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
          icon
          :disabled="activeTab === 1"
          @click="switchTab(1)"
        >
          <v-icon>{{ mdiChevronLeft }}</v-icon>
        </v-btn>
      </v-col>
      <v-col
        :cols="deal.privatisation ? 8 : 12"
        sm=""
        :class="deal.privatisation ? 'px-2' : ''"
      >
        <v-tabs
          v-model="activeTab"
          hide-slider
          grow
          centered
          center-active
          height="80px"
          class="tabs-custom-container rounded-t-lg"
        >
          <v-tab
            :value="1"
            active-class="bg-tab-selected"
            class="tab-custom"
          >
            <div class="text-subtitle-1 text-md-h6 font-weight-bold tab-custom">
              <h6 class="text-body-2 text-sm-body-1 text-md-h6 font-weight-bold">
                <slot
                  name="phrase-left-title"
                />
              </h6>
              <span class="text-caption text-sm-body-2 text-md-subtitle-2 text-wrap">
                <slot
                  name="phrase-left-subtitle"
                />
              </span>
            </div>
          </v-tab>
          <v-tab
            v-if="deal.privatisation"
            :value="2"
            active-class="bg-tab-selected"
            class="tab-custom"
          >
            <div class="text-subtitle-1 text-md-h6 font-weight-bold tab-custom">
              <h6 class="text-body-2 text-sm-body-1 text-md-h6 font-weight-bold">
                <slot
                  name="phrase-right-title"
                />
              </h6>
              <span class="text-caption text-sm-body-2 text-md-subtitle-2 text-wrap">
                <slot
                  name="phrase-right-subtitle"
                />
              </span>
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
          icon
          :disabled="activeTab === 2"
          @click="switchTab(2)"
        >
          <v-icon>
            {{ mdiChevronRight }}
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-tabs-window
      v-model="activeTab"
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
  <v-container v-else>
    <v-skeleton-loader
      type="card"
    />
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

const activeTab = ref(1)
const switchTab = (tab) => {
  activeTab.value = tab
}

const { data: deal, status: dealStatus } = useAsyncData(props.slug, () => {
  return queryCollection('deals').where('slug', '=', props.slug).first()
})
</script>

<style scoped>
.tabs-custom-container:deep(.v-slide-group__prev) ,
.tabs-custom-container:deep(.v-slide-group__next) {
  display: none !important;
}
.tab-custom.v-tab {
  width: 50%;
  background-color: #2e8b562d;
  color: rgba(  0, 0, 0, 0.6) !important;
  border-radius: 8px 8px 0 0 !important;
}
.tabs-custom-container:deep(.v-tab--selected) {
  background-color:rgb(var(--v-theme-primary));
  color: #ffffff !important;
}
</style>
