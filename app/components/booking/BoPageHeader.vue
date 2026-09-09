<template>
  <header class="bo-cmd">
    <div class="min-width-0">
      <nav
        v-if="crumbs.length"
        class="bo-cmd__crumbs"
        aria-label="Fil d'ariane"
      >
        <template
          v-for="(crumb, i) in crumbs"
          :key="crumb.title"
        >
          <span
            v-if="i > 0"
            aria-hidden="true"
          >/</span>
          <NuxtLink
            v-if="crumb.to"
            :to="crumb.to"
          >
            {{ crumb.title }}
          </NuxtLink>
          <span v-else>{{ crumb.title }}</span>
        </template>
      </nav>

      <h1 class="bo-cmd__title">
        <slot name="title">
          {{ title }}
        </slot>
      </h1>

      <div
        v-if="subtitle || $slots.meta"
        class="bo-cmd__sub"
      >
        <span v-if="subtitle">{{ subtitle }}</span>
        <slot name="meta" />
      </div>
    </div>

    <div
      v-if="$slots.actions"
      class="bo-cmd__actions"
    >
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  // [{ title, to }] — `to` absent = segment courant, non cliquable.
  crumbs: { type: Array, default: () => [] },
})
</script>

<style scoped>
.min-width-0 {
  min-width: 0;
}
</style>
