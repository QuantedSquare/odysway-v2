<template>
  <div v-if="pageBlogSanity">
    <v-container>
      <v-row
        justify="center"
        align="center"
        no-gutters
      >
        <v-col
          ref="scroll-target"
          class="font-weight-black text-h2 my-4 "
        >
          {{ pageBlogSanity.pageTitle }}
        </v-col>
      </v-row>
    </v-container>
    <v-container>
      <v-row class="mb-4">
        <v-col
          cols="12"
          get-image-url
          sm="6"
          class="py-0"
        >
          <v-text-field
            :id="searchId"
            v-model="search"
            :label="pageBlogSanity.searchPlaceholder || 'Rechercher par mot clé'"
            :prepend-inner-icon="mdiMagnify"
            clearable
            density="comfortable"
          />
        </v-col>
        <v-col
          cols="12"
          sm="3"
          class="py-0"
        >
          <v-select
            :id="categoryId"
            v-model="selectedCategory"
            :items="categoriesList"
            :label="pageBlogSanity.categoryFilter || 'Filtrer par catégorie'"
            :item-title="item => item.charAt(0).toUpperCase() + item.slice(1)"
            clearable
            density="comfortable"
            :prepend-inner-icon="mdiFilterOutline"
          />
        </v-col>
        <v-col
          cols="12"
          sm="3"
          class="py-0"
        >
          <v-select
            :id="sortId"
            v-model="sortOrder"
            :items="sortOptions"
            :label="pageBlogSanity.sortByDate || 'Trier par date'"
            density="comfortable"
            clearable
          >
            <template #prepend-inner>
              <v-img
                :src="img('/icons/calendar.svg', { format: 'webp', quality: 70, width: 640, height: 640 })"
                alt="Calendar icon"
                width="24"
                height="24"
                class="mr-1"
              />
            </template>
          </v-select>
        </v-col>
      </v-row>
      <v-row v-if="loading">
        <v-col
          v-for="n in 10"
          :key="n"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-skeleton-loader
            type="card"
          />
        </v-col>
      </v-row>
      <v-row v-else-if="paginatedBlogs.length === 0">
        <v-col
          cols="12"
          class="text-center py-10"
        >
          <v-icon
            size="48"
            color="grey"
          >
            {{ mdiMagnifyClose }}
          </v-icon>
          <div class="text-h6 mt-2 mb-4">
            {{ pageBlogSanity.noArticlesFound }}
          </div>
          <v-btn
            v-if="search || selectedCategory"
            color="primary"
            variant="outlined"
            @click="() => { search = ''; selectedCategory = null; }"
          >
            {{ pageBlogSanity.resetFilters }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row
        v-else
      >
        <v-col
          v-for="page in paginatedBlogs"
          :key="page.slug"
          cols="12"
          sm="6"
          lg="4"
        >
          <BlogCard
            v-bind="page"
          />
        </v-col>
        <v-col cols="12">
          <v-pagination
            v-model="pagination.currentPage"
            :length="nbPages"
            :total-visible="3"
            variant="flat"
            density="comfortable"
            rounded="circle"
            active-color="primary"
            elevation="3"
            class="my-4"
            @click="goTo(scrollTarget, { offset: -100, duration: 1000, easing: 'easeInOutCubic' })"
            @next="pagination.currentPage = pagination.currentPage++"
            @prev="pagination.currentPage = pagination.currentPage-- "
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
  <div v-else-if="pageBlogStatus === 'loading'">
    <v-container>
      <v-row>
        <v-col>
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>
    </v-container>
  </div>
  <div v-else>
    <v-container>
      <v-row>
        <v-col>
          ...
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { useGoTo } from 'vuetify'
import _ from 'lodash'
import { mdiMagnify, mdiFilterOutline, mdiMagnifyClose } from '@mdi/js'
import { useImage } from '#imports'
import { getImageUrl } from '~/utils/getImageUrl'

const img = useImage()

const searchId = useId()
const categoryId = useId()
const sortId = useId()

// Fetch all published blogs from Sanity
const blogsQuery = `
  *[_type == "blog"]|order(orderRank){
    _id,
    title,
    "slug": slug.current,
    description,
    displayedImg,
    publishedAt,
    tags,
    blogType,
    badgeColor,
    readingTime,
    legacyCategories
  }
`

const sanity = useSanity()
const { data: pages, status } = await useAsyncData('blog', () =>
  sanity.fetch(blogsQuery),
)

const pageBlogQuery = groq`
  *[_type == "page_blog"][0]{
    ...,
    seo{
      ...
    }
  }
`
const { data: pageBlogSanity, status: pageBlogStatus } = await useAsyncData('pageBlog', () =>
  sanity.fetch(pageBlogQuery),
)

if (pageBlogSanity.value) {
  useSeo({
    seoData: pageBlogSanity.value?.seo,
    content: pageBlogSanity.value,
    pageType: 'website',
    slug: 'blog',
  })
}

const loading = computed(() => {
  return status.value !== 'success'
})

const search = ref('')
const selectedCategory = ref(null)
const sortOrder = ref(null)
const sortOptions = computed(() => [
  // Add fallback values
  { title: pageBlogSanity.value?.sortOptions?.newest || 'Plus récent', value: 'desc' },
  { title: pageBlogSanity.value?.sortOptions?.oldest || 'Plus ancien', value: 'asc' },
  { title: pageBlogSanity.value?.sortOptions?.shortest || 'Plus court', value: 'readingTimeAsc' },
  { title: pageBlogSanity.value?.sortOptions?.longest || 'Plus long', value: 'readingTimeDesc' },
])

function normalize(str) {
  return str
    ? str.normalize('NFD').replace(/\u0300-\u036f/g, '').replace(/-/g, '').toLowerCase()
    : ''
}

const parsedPages = computed(() => {
  if (!pages.value) return []
  return pages.value.map((page) => {
    // Parse tags and categories as arrays
    const tags = Array.isArray(page.tags) ? page.tags : []
    const categories = typeof page.legacyCategories === 'string'
      ? page.legacyCategories.split(',').map(c => c.trim()).filter(Boolean)
      : []

    // Convert Sanity image to URL
    const imageUrl = page.displayedImg?.asset?._ref
      ? getImageUrl(page.displayedImg.asset._ref, `${page.slug}.jpg`)
      : ''

    return {
      title: page.title,
      tags,
      publishedAt: page.publishedAt,
      categories,
      displayedImg: imageUrl,
      path: `/${page.slug}`,
      published: true,
      blogType: page.blogType,
      badgeColor: page.badgeColor,
      readingTime: page.readingTime,
    }
  })
})

// Extract all unique categories
const categoriesList = computed(() => {
  const allCategories = parsedPages.value.flatMap(page => page.categories)
  return [...new Set(allCategories)].filter(Boolean)
})

// Filter and sort blogs
const filteredBlogs = computed(() => {
  let blogs = parsedPages.value
  if (search.value) {
    const keyword = normalize(search.value)
    blogs = blogs.filter(page =>
      normalize(page.title).includes(keyword)
      || page.tags.some(tag => normalize(tag).includes(keyword)),
    )
  }
  if (selectedCategory.value) {
    blogs = blogs.filter(page => page.categories.includes(selectedCategory.value))
  }
  // Sort by publishedAt
  if (sortOrder.value) {
    blogs = blogs.slice().sort((a, b) => {
      if (sortOrder.value === 'readingTimeAsc') {
      // readingTime is a string, convert to number
        return Number(a.readingTime) - Number(b.readingTime)
      }
      else if (sortOrder.value === 'readingTimeDesc') {
        return Number(b.readingTime) - Number(a.readingTime)
      }
      else if (sortOrder.value === 'asc') {
        return dayjs(a.publishedAt) - dayjs(b.publishedAt)
      }
      else {
        return dayjs(b.publishedAt) - dayjs(a.publishedAt)
      }
    })
  }
  return blogs
})

// Paginate filtered blogs
const paginatedBlogs = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.itemsPerPage
  const end = pagination.value.currentPage * pagination.value.itemsPerPage
  return filteredBlogs.value.slice(start, end)
})

const nbPages = computed(() => {
  return Math.ceil(filteredBlogs.value.length / pagination.value.itemsPerPage)
})

const pagination = ref({
  currentPage: 1,
  itemsPerPage: 12,
})

// Reset to page 1 when filters change
watch([filteredBlogs], () => {
  pagination.value.currentPage = 1
})

const goTo = useGoTo()
const scrollTarget = useTemplateRef('scroll-target')
</script>

<style scoped>
.hover-scale:hover {
  height: 100%;
}
.hover-scale:hover{
  transform: scale(1.02);
  transition: transform 0.2s ease-in-out;
}
.hover-scale{
  transform: scale(1);
  transition: transform 0.2s ease-in-out;
}
</style>
