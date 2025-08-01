<template>
  <v-row
    v-if="avatars && avatars.length > 0 && avatarsStatus === 'success'"
    justify="center"
  >
    <v-lazy
      class="avatar-min-height-lazy"
      :options="{ threshold: 0.5 }"
      transition="fade-transition"
    >
      <div
        class="avatar-stack d-flex justify-center"
        :style="{
          width: `${(avatars.length - 1) * 60 + 100}px`,
        }"
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
            :src="img(avatar.image, { format: 'webp', quality: 70, width: 320 })"
            :lazy-src="img(avatar.image, { format: 'webp', quality: 10, width: 320 })"
            :srcset="`${img(avatar.image, { format: 'webp', quality: 70, width: 320 })} 70w, ${img(avatar.image, { format: 'webp', quality: 70, width: 320 })} 100w`"
            sizes="(max-width: 600px) 70px, 100px"
            rounded="circle"
            loading="lazy"
            :alt="avatar.name || 'Avatar de l\'équipe'"
          />
        </v-avatar>
      </div>
    </v-lazy>
  </v-row>
  <div class="avatar-info-wrapper">
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
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useImage } from '#imports'

const { data: avatars, status: avatarsStatus } = useAsyncData('avatars-team', () => queryCollection('team').all())
const img = useImage()
const hoveredIndex = ref(null)

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
.avatar-stack {
  position: relative;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
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
  .avatar-stack {
    width: auto !important;
    overflow: visible;
  }

  .v-avatar[class*="avatar-"] {
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
    --total-avatars: v-bind(avatars.length); /* Update this number based on max possible avatars */
  }
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
