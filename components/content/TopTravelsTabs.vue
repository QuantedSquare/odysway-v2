<template>
  <v-container
    fluid
    class="rounded-lg px-md-12 py-md-8 mt-4 mt-md-8 bg-primary max-container-width "
  >
    <div class="text-h3 font-weight-bold my-4">
      <!-- #TODO: add title from NUXT -->
      Des idées pour vos prochains voyages
    </div>

    <div class="tabs-container position-relative mb-6 mt-md-10 custom-color ">
      <v-tabs
        v-model="currentTab"
        class="text-white-light  "
        color="white-light"
        role="tablist"
        :aria-label="`Navigation des idées de voyages`"
      >
        <v-tab
          v-for="top, index in tops"
          :id="`tab-${index}`"
          :key="index"
          :value="index"
          role="tab"
          class="text-decoration-none pb-md-8 "
          :aria-selected="(currentTab === index).toString()"
          :aria-controls="`tabpanel-${index}`"
          :class="index === 0 ? 'pl-0' : 'pl-4'"
        >
          <span
            class="custom-title-size justify-self-start"
            :class="currentTab === index ? 'text-white font-weight-bold' : 'custom-color font-weight-regular'"
          >
            {{ top.title }}
          </span>
        </v-tab>
      </v-tabs>
      <v-divider
        class="absolute-divider"
        thickness="2"
        role="presentation"
        aria-hidden="true"
      />
    </div>

    <v-tabs-window
      v-model="currentTab"
      class="custom-color"
    >
      <v-tabs-window-item
        :id="`tabpanel-${currentTab}`"
        :value="currentTab"
        role="tabpanel"
        :aria-labelledby="`tab-${currentTab}`"
      >
        <v-row class=" mb-4 mb-md-10  flex-nowrap overflow-auto hidden-scroll">
          <v-col
            v-for="section, index in tops[currentTab].contenuOnglet"
            :key="`${section.title}-${index}`"
            md="2"
          >
            <h5 class="custom-title-size font-weight-bold mb-4 pb-md-16 ">
              {{ section.title }}
            </h5>
            <div class="d-flex flex-column ga-md-2">
              <template
                v-for="link, i in section.linksList"
                :key="`${link.slug}-${i}`"
              >
                <SmartLink
                  :to="link.slug.includes('http') ? link.slug : `/${link.slug}`"
                  link-class="line-clamp-2 text-caption text-md-body-2 font-weight-regular pb-2 pb-md-4"
                >
                  {{ link.title }}
                </SmartLink>
              </template>
            </div>
          </v-col>
        </v-row>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>

<script setup>
const currentTab = ref(0)

const tops = await queryCollection('tops').all()
</script>

<style scoped>
.absolute-divider {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}
.line-clamp-2{
  overflow: hidden;
  font-weight: 500!important;
  line-height: 1.2!important;
}
.custom-color:deep(a), .custom-color:deep(div){
  color: #FFFFFF80!important;
}
@media (min-width: 600px) {
  .custom-title-size {
    font-size: 20px !important;
    text-transform: none;
    max-height: 50px!important;
    line-height: 1.2!important;
  }
}

.hidden-scroll {
  -webkit-overflow-scrolling: touch;
  overflow-x: scroll;
  scrollbar-width: thin;

}
</style>
