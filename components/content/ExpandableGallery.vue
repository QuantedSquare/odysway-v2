<template>
  <v-col cols="auto">
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
        v-for="(category) in categories"
        :key="category?.id"
        v-click-outside="{
          handler: clickOutside(category?.id),
        }"
        class="image-wrapper"
        :class="{
          expanded: isMobile.value && expandedIndex.value === id,
          isMobile: isMobile.value,
        }"
        @click.stop="handleClick(category?.id)"
      >
        <NuxtImg
          v-if="category?.image"
          :src="category.image"
          :alt="category?.title"
        />
        <div class="blur-overlay" />
        <div class="image-overlay" />
        <div class="content-overlay">
          <div class="w-100">
            <h3 class="category-title text-to-wrap">{{ category?.title }}</h3>
            <p class="category-description d-flex align-center justify-space-between ga-2 ">
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
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDisplay } from 'vuetify'

const router = useRouter()
const { xs } = useDisplay()
const expandedIndex = ref(null)
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

const handleClick = (id) => {
  if (isMobile.value) {
    expandedIndex.value = expandedIndex.value === id ? null : id
  }
  else {
    const slug = categories.value.find(category => category.id === id).slug
    router.push(`/thematiques/${slug}`)
  }
}
const clickOutside = (id) => {
  if (isMobile.value && expandedIndex.value !== id) {
    expandedIndex.value = null
  }
}

watch(xs, (newValue) => {
  isMobile.value = newValue
}, {
  immediate: true,
})
</script>

<style scoped>
.text-to-wrap{
  white-space: nowrap;
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
.image-gallery {
  display: flex;
  height: 24rem;
  width: 100%;
  gap: 0.5rem;
}
@media screen and (max-width: 600px) {
  .image-gallery {
    flex-direction: column;
  }
  .category-title{
    margin: 0!important;
  }
}

.image-wrapper {
  position: relative;
  display: flex;
  height: 100%;
  flex: 1;
  cursor: pointer;
  overflow: hidden;
  border-radius: 0.75rem;
  transition: all 0.5s ease-in-out;
}

.image-wrapper:hover,
.image-wrapper.expanded {
  flex: 3;
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

.image-wrapper:hover .blur-overlay,
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

.image-wrapper:hover .image-overlay,
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
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.image-wrapper:hover .category-title,
.image-wrapper.expanded .category-title {
  transform: translateY(-1.5rem);
}

.category-description {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  opacity: 0;
  transform: translateY(1rem);
  transition: all 0.3s ease-in-out;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
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
  /* transition: all 0.3s ease-in-out; */
}

.explore-btn:hover {
  background: white;
  color: black;
}
</style>
