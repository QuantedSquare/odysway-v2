<template>
  <v-btn
    icon
    height="56"
    width="56"
    rounded="md"
    :color="arrivedState ? 'white' : color"
    :disabled="arrivedState"
    class="carousel-nav-btn elevation-0 "
    :class="{ 'disabled-shadow': arrivedState }"
    @click="emit('click')"
  >
    <svg
      width="12"
      height="20"
      viewBox="0 0 12 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      :class="{ 'rotate-180': orientation === 'right' }"
    >
      <path
        d="M10.8086 1L1.80859 10L10.8086 19"
        :stroke="svgColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </v-btn>
</template>

<script setup>
import { useTheme } from 'vuetify'

const emit = defineEmits(['click'])

const theme = useTheme()

const props = defineProps({
  arrivedState: {
    type: Boolean,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  orientation: {
    type: String,
    required: true,
    validator: value => ['left', 'right'].includes(value),
  },
})

// Computed property to get the SVG color based on theme and state
const svgColor = computed(() => {
  if (!props.arrivedState) {
    return '#FFFFFF' // White when disabled
  }

  // Get the actual color value from the theme
  const themeColor = theme.current.value.colors[props.color]
  if (themeColor) {
    // Convert rgba to hex if needed, or return as is
    return themeColor
  }

  // Fallback to primary color if the specified color doesn't exist
  return theme.current.value.colors.primary || '#2B4C52'
})
</script>

<style scoped>
.rotate-180{
  transform: rotate(180deg);
}
.carousel-nav-btn:disabled {
  color: white !important;
}
.carousel-nav-btn:disabled:deep(.v-btn__overlay) {
  background-color: transparent!important;
}
.carousel-nav-btn {
  border: 1px solid #ffffff!important;
}
.disabled-shadow{
  box-shadow: 0px 6px 16px 0px #2222231A!important;
}
</style>
