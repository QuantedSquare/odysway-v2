<template>
  <v-col
    cols="6"
    md="4"
    lg="auto"
    class="d-flex align-center"
  >
    <v-tooltip
      location="bottom"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          size="small"
          color="secondary"
          class="mr-2"
        >
          <v-icon
            :icon="icon"
            size="x-large"
          />
        </v-btn>
      </template>
      <span>
        <slot
          name="tooltip"
          mdc-unwrap="p"
        />
      </span>
    </v-tooltip>

    <span class="text-caption">
      <slot
        name="text"
        mdc-unwrap="p"
      />
    </span>
  </v-col>
</template>

<script setup>
const props = defineProps({
  iconName: {
    type: String,
    default: '',
  },
})

const icon = ref('')

// imports all mdi icons ==> move to static import ?
onMounted(async () => {
  if (props.iconName) {
    try {
      const { [props.iconName]: mdiIcon } = await import('@mdi/js')
      icon.value = mdiIcon || ''
    }
    catch (e) {
      console.error(e)
      console.log('Icon not found: ', props.iconName)
      icon.value = ''
    }
  }
})
</script>
