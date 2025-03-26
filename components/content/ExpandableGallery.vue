<template>
  <v-container
    class="d-flex align-center position-relative"
  >
    <v-row
      ref="scrollContainer"
      class="flex-nowrap overflow-auto hidden-scroll"
    >
      <v-col cols="12">
        <div
          v-if="status === 'pending'"
          class="image-gallery"
        >
          <v-skeleton-loader type="card" />
        </div>
        <div
          v-else-if="status === 'success'"
          class="image-gallery"
        >
          <NuxtLink
            v-for="(category, index) in categories"
            :key="category?.id"
            v-click-outside="{
              handler: () => clickOutside(index),
            }"
            class="image-wrapper"
            :class="{
              'default-expanded': isMobile && expandedIndex === 0,
              'expanded': isMobile && expandedIndex === index,
              'isMobile': isMobile,
            }"
            @click.stop="handleClick(index, category?.id)"
          >

            <v-img
              v-if="category?.image"
              :src="imgComp(category.image, { format: 'webp', quality: 70, width: 1024 })"
              width="100%"
              :alt="category?.title"
              cover
            />

            <div class="blur-overlay" />
            <div class="image-overlay" />
            <div class="content-overlay">
              <div class="w-100">
                <h3 class="category-title text-shadow text-to-wrap">{{ category?.title }}</h3>
                <p class="category-description text-shadow d-flex align-center justify-space-between ga-2 ">
                  <span class="w-75">
                    Cliquez pour en apprendre plus à propos des {{ category?.title }}
                  </span>
                  <client-only>
                    <v-btn
                      v-if="isMobile"
                      class="explore-btn"
                      :to="`/thematiques/${category?.slug}`"
                      @click.stop
                    >
                      Explorez
                    </v-btn>
                  </client-only>
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

const imgComp = useImage()

const router = useRouter()
const { smAndDown } = useDisplay()
const expandedIndex = ref(0)
const isMobile = ref(false)

const props = defineProps({
  categoriesSlug: {
    type: Array,
    required: true,
  },
})

const { data: categories, status } = await useAsyncData(
  `categories-${props.categoriesSlug.join('-')}`,
  async () => {
    const categoriesData = await Promise.all(
      props.categoriesSlug.map(slug =>
        queryCollection('categories').where('slug', '=', slug).first(),
      ),
    )
    return categoriesData
  },
  {
    server: true,
    immediate: true,
  },
)

const handleClick = (index, id) => {
  if (isMobile.value) {
    expandedIndex.value = expandedIndex.value === index ? -1 : index
  }
  else {
    const slug = categories.value.find(category => category.id === id).slug
    router.push(`/thematiques/${slug}`)
  }
}

const clickOutside = (index) => {
  if (isMobile.value && expandedIndex.value === index) {
    expandedIndex.value = 0
  }
}

watch(smAndDown, (newValue) => {
  isMobile.value = newValue
  expandedIndex.value = 0
}, {
  immediate: true,
})

onMounted(() => {
  isMobile.value = smAndDown.value
})
</script>

<style scoped>
.text-to-wrap{
  white-space: nowrap;
}

.image-gallery {
  display: flex;
  height: 24rem;
  width: 100%;
  gap: 0.5rem;
}

.image-wrapper {
  position: relative;
  display: flex;
  height: 100%;
  flex: 1;
  cursor: pointer;
  overflow: hidden;
  border-radius: 1rem;
  transition: all 0.5s ease-in-out;
}

.image-wrapper img {
  position: relative;
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: filter 0.5s ease-in-out;
}

.blur-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  mask: linear-gradient(transparent, rgb(0, 0, 0), black);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.image-wrapper.default-expanded .blur-overlay,
.image-wrapper.expanded .blur-overlay {
  opacity: 1;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.752));
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.image-wrapper.default-expanded .image-overlay,
.image-wrapper.expanded .image-overlay {
  opacity: 1;
}

.content-overlay {
  display:flex;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1rem;
  color: white;
  transform: translateY(calc(100% - 5rem));
  transition: transform 0.5s ease-in-out;
  z-index: 1;
}

.image-wrapper:hover .content-overlay,
.image-wrapper.expanded .content-overlay {
  transform: translateY(0);
}

.category-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  transition: transform 0.3s ease-in-out;
}

.image-wrapper:hover .category-title,
.image-wrapper.expanded .category-title {
  transform: translateY(0);
}

.category-description {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  opacity: 0;
  transform: translateY(1rem);
  transition: all 0.3s ease-in-out;
}

.image-wrapper:hover .category-description,
.image-wrapper.expanded .category-description {
  opacity: 1;
  transform: translateY(0);
}

.explore-btn {
  background: rgba(255, 255, 255, 0.2)!important;
  border: 1px solid white !important;
  color: white!important;
  font-weight: bold;
}

.explore-btn:hover {
  background: white;
  color: black;
}
@media screen and (max-width: 1280px) {
  .text-to-wrap{
    white-space: normal;
    padding-bottom: 10px;
  }
  .category-title{
    margin:-30px 0 0px 0!important;
  }
}
@media screen and (max-width: 600px) {
  .image-gallery {
    flex-direction: column;
  }
  .category-title{
    margin:  0!important;
  }
}

@media screen and (max-width: 960px) {
.image-wrapper:hover,
.image-wrapper.expanded {
  flex: 4;
}
}

@media screen and (min-width: 960px) {
.image-wrapper:hover,
.image-wrapper.expanded {
  flex: 3;
}
}
</style>
