<template>
  <ClientOnly>
    <v-row
      justify="center"
      class="avatar-row-wrapper"
    >
      <div class="avatar-scroll-container">
        <v-lazy
          v-if="avatars && avatars.length > 0"
          class="avatar-min-height-lazy"
          :options="{ threshold: 0.5 }"
          transition="fade-transition"
        >
          <div
            class="avatar-stack d-flex justify-center"
            :style="stackWidthStyle"
          >
            <v-avatar
              v-for="(avatar, index) in avatars"
              :key="index"

              :class="`avatar-${index + 1} avatar-size-responsive`"
              :style="{
                zIndex: hoveredIndex === index ? 1000 : avatars.length - index,
              }"
              @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = null"
            >
              <v-img
                v-if="avatar.image?.asset?._ref"
                :src="getImageUrl(avatar.image.asset._ref)"
                :lazy-src="img(getImageUrl(avatar.image.asset._ref), { format: 'webp', quality: 10, width: 320 })"
                :srcset="`${img(getImageUrl(avatar.image.asset._ref), { format: 'webp', quality: 70, width: 320 })} 70w, ${img(getImageUrl(avatar.image.asset._ref), { format: 'webp', quality: 70, width: 320 })} 100w`"
                sizes="(max-width: 600px) 70px, 100px"
                rounded="circle"
                loading="lazy"
                :alt="avatar.name || 'Avatar de l\'équipe'"
              />
            </v-avatar>
          </div>
        </v-lazy>
      </div>
    </v-row>
    <div
      v-if="avatars && avatars.length > 0"
      class="avatar-info-wrapper"
    >
      <div
        ref="infoAnim"
        class="avatar-info-anim"
        :style="infoAnimStyle"
      >
        <transition
          name="avatar-info-fade"
        >
          <div
            v-if="showText && hoveredIndex !== null"
            key="info"
            class="avatar-info text-center"
          >
            <div class="avatar-name">
              {{ avatars[hoveredIndex]?.name }}
            </div>
            <div
              v-if="avatars[hoveredIndex]?.description"
              class="avatar-description mt-1"
            >
              {{ avatars[hoveredIndex]?.description }}
            </div>
          </div>
          <div
            v-else
            key="empty"
            class="avatar-info-empty"
          />
        </transition>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'
import { getImageUrl } from '~/utils/getImageUrl'

const sanityQuery = `
  *[_type == "teamMember" && name != 'Salomé']|order(orderRank) {
    name,
    description,
    image
  }
`
const sanity = useSanity()
const { data: avatars } = await useAsyncData(
  'team-avatars',
  async () => {
    try {
      const result = await sanity.fetch(sanityQuery)
      return result.filter(avatar => avatar.image?.asset?._ref) || []
    }
    catch (e) {
      console.error('Error fetching avatars:', e)
      return []
    }
  },
  {
    server: true,
  },
)

const img = useImage()
const hoveredIndex = ref(null)
const { width } = useDisplay()

// Calculate stack width based on screen size and avatar count
const stackWidthStyle = computed(() => {
  if (!avatars.value || avatars.value.length === 0) return { width: '100px' }

  const avatarCount = avatars.value.length
  // Desktop: 100px avatars spaced 60px apart (overlap)
  // Mobile: 70px avatars spaced 40px apart (overlap)
  if (width.value <= 600) {
    // Mobile calculation: calculate the full width needed to contain all avatars
    // The leftmost avatar extends to the left by half its width (35px) from the center
    // The rightmost avatar extends by: (avatarCount - 1) * 40px + 35px to the right
    // Total width: left extension + right extension = 35px + (avatarCount - 1) * 40px + 35px
    const mobileWidth = (avatarCount - 1) * 40 + 70
    return { width: `${mobileWidth}px` }
  }
  else {
    // Desktop calculation
    return { width: `${(avatarCount - 1) * 60 + 100}px` }
  }
})

// Animated height for info section
const infoAnim = ref(null)
const infoAnimStyle = ref({
  maxHeight: '0px',
  overflow: 'hidden',
  opacity: 0,
  transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s',
})

const showText = ref(false)
let heightTimeout = null

watch(hoveredIndex, async (val) => {
  await nextTick()
  clearTimeout(heightTimeout)
  if (val !== null) {
    if (!showText.value) {
      showText.value = true
      await nextTick()
    }
    if (infoAnim.value) {
      const content = infoAnim.value.querySelector('.avatar-info')
      if (content) {
        infoAnimStyle.value.maxHeight = content.scrollHeight + 'px'
        infoAnimStyle.value.opacity = 1
      }
    }
  }
  else {
    // Animate height, then hide text after transition
    infoAnimStyle.value.maxHeight = '0px'
    infoAnimStyle.value.opacity = 0
    heightTimeout = setTimeout(() => {
      showText.value = false
    }, 500) // match the max-height transition duration
  }
})
</script>

<style scoped lang="scss">
.avatar-row-wrapper {
  width: 100%;
  overflow: hidden;
}

.avatar-scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  /* Limit width on desktop to show ~6 avatars max */
  @media (min-width: 601px) {
    max-width: 600px;
    margin: 0 auto;
  }
}

.avatar-stack {
  position: relative;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 0 auto;

  /* Center on desktop */
  @media (min-width: 601px) {
    justify-content: center;
  }
}

.v-avatar {
  position: absolute;
  transition: all 0.3s ease;
}

/* Generate dynamic positioning for avatars */
.v-avatar {
  &[class*="avatar-"] {
    left: calc(var(--avatar-index) * 60px);
  }
}

.avatar-image {
  opacity: 0.9;
}

/* Hover effects */
.v-avatar:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

@media (max-width: 600px) {
  .avatar-scroll-container {
    /* Add padding on both sides to allow scrolling to see edge avatars */
    /* 35px = half avatar width, 20px = extra scroll space */
    padding: 0 55px;
    -webkit-overflow-scrolling: touch;
  }

  .avatar-stack {
    /* Keep the computed width from stackWidthStyle */
    overflow: visible;
    /* Center the stack */
    margin: 0 auto;
    justify-content: center;
  }

  .v-avatar[class*="avatar-"] {
    /* Position relative to center, then offset by index */
    left: 50%;
    transform: translateX(calc(-50% + (var(--avatar-index) - ((var(--total-avatars) - 1) / 2)) * 40px));
  }

  .v-avatar:hover {
    transform: translateX(calc(-50% + (var(--avatar-index) - ((var(--total-avatars) - 1) / 2)) * 40px)) translateY(-5px);
  }
}

/* Generate avatar positions dynamically */
@for $i from 1 through 10 {
  .avatar-#{$i} {
    --avatar-index: #{$i - 1};
  }
}

/* Set total avatars variable on the stack */
.avatar-stack {
  --total-avatars: v-bind(avatars?.length || 0);
}

.avatar-info-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.avatar-info {
  opacity: 1;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: rgba(43, 76, 82, 1);
  letter-spacing: 0.02em;
  opacity: 0.95;
  transition: color 0.3s;
}

.avatar-description {
  font-size: 1rem;
  color: rgb(118, 118, 118);
  font-weight: 400;
  opacity: 0.85;
  transition: color 0.3s;
}

.avatar-info-fade-enter-active,
.avatar-info-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.avatar-info-fade-enter-from,
.avatar-info-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.avatar-info-fade-enter-to,
.avatar-info-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.avatar-info-anim {
  width: 100%;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
  overflow: hidden;
}

.avatar-min-height-lazy {
  min-height: 100px!important;
}

.avatar-size-responsive {
  width: 100px!important;
  height: 100px!important;
}

@media screen and (max-width: 960px) {
  .avatar-min-height-lazy {
    min-height: 70px!important;
  }
  .avatar-size-responsive {
    width: 70px!important;
    height: 70px!important;
  }
}
</style>
