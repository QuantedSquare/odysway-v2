<template>
  <NuxtLink
    class="portrait-card"
    :to="link"
  >
    <div
      class="portrait-card__media"
      :style="bgStyle"
    />
    <div class="scrim" />
    <span
      v-if="count"
      class="portrait-card__badge"
    >{{ count }} voyageurs partis</span>
    <div class="portrait-card__caption">
      <span
        v-if="prefix"
        class="pre"
      >{{ prefix }}</span>
      <span class="big">{{ title }}</span>
    </div>
  </NuxtLink>
</template>

<script setup>
import { getImageUrl } from '~/utils/getImageUrl'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    default: '',
  },
  image: {
    type: Object,
    default: null,
  },
  slug: {
    type: String,
    default: '',
  },
  count: {
    type: Number,
    default: null,
  },
})

const link = computed(() => (props.slug ? `/destinations/${props.slug}` : '/destinations'))

const bgStyle = computed(() => {
  const ref = props.image?.asset?._ref
  return ref ? { backgroundImage: `url('${getImageUrl(ref, null, null, 600)}')` } : {}
})
</script>

<style scoped>
.portrait-card {
  position: relative;
  display: block;
  flex: 0 0 250px;
  width: 250px;
  height: 360px;
  border-radius: 18px;
  overflow: hidden;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(43, 76, 82, 0.1);
  transition:
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.portrait-card__media {
  position: absolute;
  inset: 0;
  background-color: rgb(var(--v-theme-primary));
  background-size: cover;
  background-position: center;
  transform: scale(1);
  transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(10, 18, 16, 0.72), rgba(10, 18, 16, 0.05) 55%);
}

.portrait-card__badge {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  font-weight: 500;
  color: #3a3a38;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.portrait-card__caption {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 20px;
  color: #fff;
  text-align: center;
}

.portrait-card__caption .pre {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
}

.portrait-card__caption .big {
  display: block;
  font-size: 23px;
  font-weight: 800;
  line-height: 1.05;
  text-transform: uppercase;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
}

@media (hover: hover) {
  .portrait-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 38px rgba(12, 22, 20, 0.28);
  }

  .portrait-card:hover .portrait-card__media {
    transform: scale(1.07);
  }
}

@media (prefers-reduced-motion: reduce) {
  .portrait-card,
  .portrait-card__media {
    transition: none;
  }
}
</style>
