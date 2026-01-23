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
            item-value="_id"
            :item-title="item => item.title.charAt(0).toUpperCase() + item.title.slice(1)"
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
          v-for="n in 9"
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
      <v-row v-else-if="parsedBlogs.length === 0">
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
          v-for="blog in parsedBlogs"
          :key="blog.slug"
          cols="12"
          sm="6"
          lg="4"
        >
          <BlogCard
            v-bind="blog"
          />
        </v-col>
        <v-col cols="12">
          <v-pagination
            :model-value="currentPage"
            :length="nbPages"
            :total-visible="3"
            variant="flat"
            density="comfortable"
            rounded="circle"
            active-color="primary"
            elevation="3"
            class="my-4"
            @update:model-value="goToPage"
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
import { useRoute, useRouter } from 'vue-router'
import { mdiMagnify, mdiFilterOutline, mdiMagnifyClose } from '@mdi/js'
import { useImage } from '#imports'
import { getImageUrl } from '~/utils/getImageUrl'

const img = useImage()
const route = useRoute()
const router = useRouter()
const { trackSearchBar } = useGtmTracking()

const searchId = useId()
const categoryId = useId()
const sortId = useId()

// Get query parameters from URL
const currentPage = computed(() => parseInt(route.query.page) || 1)
const searchQuery = computed(() => route.query.search || '')
const categoryQuery = computed(() => route.query.category || null)
const sortQuery = computed(() => route.query.sort || 'desc')

const ITEMS_PER_PAGE = 9
const WPM = 180 // Words per minute
const MEAN_WORD_CHAR_COUNT = 5 // Mean word character count

// Build GROQ query with filters, sorting, and pagination
const buildBlogsQuery = (search, category, sort, page) => {
  const offset = (page - 1) * ITEMS_PER_PAGE

  // Build filter conditions
  const filterParts = ['_type == "blog"']

  // Category filter - use _id reference
  if (category) {
    const categoryEscaped = category.replace(/"/g, '\\"')
    filterParts.push(`"${categoryEscaped}" in categories[]._ref`)
  }

  // Search filter (title or SEO keywords)
  if (search) {
    const searchEscaped = search.replace(/"/g, '\\"').replace(/\*/g, '\\*').replace(/\$/g, '\\$')
    filterParts.push(`(
      title match "*${searchEscaped}*" ||
      defined(seo.focusKeyword) && seo.focusKeyword match "*${searchEscaped}*" ||
      defined(seo.keywords) && count(seo.keywords[@ match "*${searchEscaped}*"]) > 0
    )`)
  }

  const filterString = filterParts.join(' && ')

  // Build sort order
  let orderBy = 'publishedAt desc'
  if (sort === 'asc') {
    orderBy = 'publishedAt asc'
  }
  else if (sort === 'readingTimeAsc') {
    orderBy = 'estimatedReadingTime asc'
  }
  else if (sort === 'readingTimeDesc') {
    orderBy = 'estimatedReadingTime desc'
  }

  // Build the query as a string (can't use groq template literal with dynamic interpolation)
  const query = `
    {
      "wpm": ${WPM},
      "meanWordCharacterCount": ${MEAN_WORD_CHAR_COUNT}
    }
    {
      "total": count(*[${filterString}]),
      "blogs": *[${filterString}]|order(${orderBy})[${offset}...${offset + ITEMS_PER_PAGE}]{
        _id,
        title,
        "slug": slug.current,
        description,
        displayedImg,
        publishedAt,
        body,
        seo{
          keywords,
          focusKeyword
        },
        categories[]->{
          _id,
          title
        },
        "numberOfCharacters": length(pt::text(body)),
        "estimatedWordCount": round(length(pt::text(body)) / ^.meanWordCharacterCount),
        "estimatedReadingTime": round(length(pt::text(body)) / ^.meanWordCharacterCount / ^.wpm)
      }
    }
  `

  return query
}

const sanity = useSanity()

// Fetch blogs with pagination
const { data: blogsData, status, refresh } = await useAsyncData(
  `blog-${JSON.stringify(route.query)}`,
  () => sanity.fetch(
    buildBlogsQuery(searchQuery.value, categoryQuery.value, sortQuery.value, currentPage.value),
  ),
  {
    watch: [() => route.query],
  },
)
console.log('blogsData', blogsData.value)

// Fetch all categories for the filter dropdown
const categoriesQuery = groq`
  *[_type == "blogCategory"]|order(title asc){
    _id,
    title
  }
`
const { data: allCategories } = await useAsyncData('blogCategories', () =>
  sanity.fetch(categoriesQuery),
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

// Reactive refs for form inputs (synced with URL)
const search = ref(searchQuery.value)
const selectedCategory = ref(categoryQuery.value)
const sortOrder = ref(sortQuery.value)

// Sync form inputs with URL query params
watch(() => route.query.search, (val) => {
  search.value = val || ''
})
watch(() => route.query.category, (val) => {
  selectedCategory.value = val || null
})
watch(() => route.query.sort, (val) => {
  sortOrder.value = val || 'desc'
})

const sortOptions = computed(() => [
  { title: pageBlogSanity.value?.sortOptions?.newest || 'Plus récent', value: 'desc' },
  { title: pageBlogSanity.value?.sortOptions?.oldest || 'Plus ancien', value: 'asc' },
  { title: pageBlogSanity.value?.sortOptions?.shortest || 'Plus court', value: 'readingTimeAsc' },
  { title: pageBlogSanity.value?.sortOptions?.longest || 'Plus long', value: 'readingTimeDesc' },
])

// Update URL query parameters
function updateQueryParams(params) {
  const query = { ...route.query, ...params }

  // Remove null/undefined/empty values
  Object.keys(query).forEach((key) => {
    if (query[key] === null || query[key] === undefined || query[key] === '') {
      delete query[key]
    }
  })

  // Reset to page 1 when filters change (except when page is explicitly set)
  if (!params.page && (params.search !== undefined || params.category !== undefined || params.sort !== undefined)) {
    query.page = 1
  }

  router.push({ query })
}

// Handle search input
watch(search, (val) => {
  updateQueryParams({ search: val || undefined })
})

// Handle category selection
watch(selectedCategory, (val) => {
  updateQueryParams({ category: val || undefined })
})

// Handle sort selection
watch(sortOrder, (val) => {
  updateQueryParams({ sort: val || 'desc' })
})

// Parse blogs data
const parsedBlogs = computed(() => {
  if (!blogsData.value?.blogs) return []

  return blogsData.value.blogs.map((blog) => {
    // Get categories as array of titles
    const categories = blog.categories?.map(cat => cat?.title).filter(Boolean) || []

    // Get first category for blogType
    const blogType = categories[0] || null

    // Get SEO keywords
    const keywords = blog.seo?.keywords || []
    const focusKeyword = blog.seo?.focusKeyword || ''
    const allKeywords = [focusKeyword, ...keywords].filter(Boolean)

    // Use calculated reading time (round to at least 1 minute)
    const readingTime = Math.max(1, blog.estimatedReadingTime || 0)

    // Convert Sanity image to URL
    const imageUrl = blog.displayedImg?.asset?._ref
      ? getImageUrl(blog.displayedImg.asset._ref, `${blog.slug}.jpg`)
      : ''

    return {
      title: blog.title,
      slug: blog.slug,
      description: blog.description,
      displayedImg: imageUrl,
      publishedAt: blog.publishedAt,
      path: `/blog/${blog.slug}`,
      published: true,
      type: blogType || 'Actu',
      blogType,
      badgeColor: blogType ? 'secondary' : null, // Use default color when category exists
      categories,
      keywords: allKeywords,
      readingTime: readingTime.toString(),
    }
  })
})

// Extract all unique categories for filter dropdown
const categoriesList = computed(() => {
  if (!allCategories.value) return []
  return allCategories.value.sort((a, b) => a.title.localeCompare(b.title))
})

// Pagination info
const totalBlogs = computed(() => blogsData.value?.total || 0)
const nbPages = computed(() => Math.ceil(totalBlogs.value / ITEMS_PER_PAGE))

// Handle page change
function goToPage(page) {
  updateQueryParams({ page })
  // Scroll to top
  goTo(scrollTarget.value, { offset: -100, duration: 1000, easing: 'easeInOutCubic' })
}

const goTo = useGoTo()
const scrollTarget = useTemplateRef('scroll-target')

// GTM: Track search_bar when blog filters are applied
watch([search, selectedCategory, sortOrder], () => {
  if (search.value || selectedCategory.value || sortOrder.value !== 'desc') {
    const searchFilters = {
      search_term: search.value || null,
      category: selectedCategory.value ? allCategories.value?.find(c => c._id === selectedCategory.value)?.title : null,
      sort_order: sortOrder.value,
    }
    trackSearchBar(searchFilters)
  }
}, { deep: true })
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
