<template>
  <v-container>
    <v-row>
      <SearchHeroSection
        v-if="category"
        :destination="category"
        :is-category="true"
      />
    </v-row>
    <v-row class="relative">
      <TransitionGroup
        name="list"
      >
        <v-col
          v-for="voyage in limitedVoyages"
          :key="voyage.id"
          cols="12"
          sm="6"
          lg="4"
          xl="3"
        >
          <SearchVoyageCard
            :voyage="voyage"
          />
        </v-col>
      </TransitionGroup>
    </v-row>
    <v-row
      v-if="limitedVoyages && limitedVoyages.length > 9"
      justify="center"
      align="center"
      class="flex-column my-10"
    >
      <span class="text-h6 text-secondary">Voir {{ isExpanded ? 'moins' : 'plus' }}</span>
      <BouncingBtn
        v-model="isExpanded"
        class="text-secondary"
      />
    </v-row>
    <v-container class="mt-10">
      <v-row v-if="categorieContentStatus === 'success' && categorieContent">
        <ContentRenderer
          v-if="categorieContent"
          :value="categorieContent"
        />
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
const route = useRoute()
const slug = computed(() => route.params.thematiqueSlug)
const isExpanded = ref(false)

const { data: category } = useAsyncData('category', async () => {
  const category = await queryCollection('categories').where('stem', 'LIKE', `categories/${slug.value}/%`).first()
  console.log('category', category)
  return category
})
const { data: categorieContent, status: categorieContentStatus } = useAsyncData('categorieContent', () => {
  return queryCollection('categoriesContent').where('stem', 'LIKE', `categories/${slug.value}/%`).where('published', '=', true).first()
}, {
  watch: [slug],
})
provide('page', categorieContent)

const { data: voyages } = useAsyncData('voyages', async () => {
  const travelList = await queryCollection('voyages').where('published', '=', true).all()
  console.log('travelList', travelList)
  return travelList.filter(v => v.categories.some(c => c.name.includes(slug.value)))
})

const limitedVoyages = computed(() => {
  if (!voyages.value || !Array.isArray(voyages.value)) return []
  return voyages.value.slice(0, isExpanded.value ? voyages.value.length : 9)
})
</script>

<style scoped>
.relative {
  position: relative;
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to{
  opacity: 0;
  transform: translateY(-30px);
}
/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
