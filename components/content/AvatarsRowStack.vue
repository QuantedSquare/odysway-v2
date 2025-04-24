<template>
  <v-row
    v-if="avatars && avatars.length > 0"
    justify="center"
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
        size="100"
        :class="`avatar-${index + 1}`"
        :style="{
          zIndex: avatars.length - index,
        }"
      >
        <v-img
          :src="img(avatar.image, { format: 'webp', quality: 70, width: 640 })"
          rounded="circle"
          :alt="avatar.name"
        />
      </v-avatar>
    </div>
  </v-row>
</template>

<script setup>
import { useImage } from '#imports'

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
