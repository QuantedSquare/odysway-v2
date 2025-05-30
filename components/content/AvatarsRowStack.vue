<template>
  <v-row
    v-if="avatars && avatars.length > 0"
    justify="center"
  >
    <v-lazy
      :min-height="mdAndUp ? 100 : 70"
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
          :size="mdAndUp ? 100 : 70"
          :class="`avatar-${index + 1}`"
          :style="{
            zIndex: avatars.length - index,
          }"
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
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

const { mdAndUp } = useDisplay()
const avatars = await queryCollection('team').all()
const img = useImage()
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
</style>
