<template>
  <div class="sanity-content">
    <PortableText
      :value="value"
      :components="components"
    />
  </div>
</template>

<script lang="ts" setup>
import type { PortableTextBlock } from '@portabletext/types'
import { PortableText } from '@portabletext/vue'
import { h, resolveComponent } from 'vue'
import ImageContainer from './content/ImageContainer.vue'

interface Props {
  value: PortableTextBlock[]
}

defineProps<Props>()

// Custom components for different block types using render functions
const components = {
  types: {
    image: ({ value }: { value: { asset?: { url?: string }, url?: string, alt?: string, caption?: string, link?: string | null } }) => {
      return h('div', { class: 'my-6' }, [
        h(ImageContainer, {
          imageSrc: value.asset?.url || value.url || '',
          alt: value.alt || 'Image',
          link: value.link || undefined,
        }),
        value.caption && h('figcaption', { class: 'text-center text-caption text-grey-darken-1 mt-2' }, value.caption),
      ])
    },
    callout: ({ value }: { value: { type?: string, title?: string, content: PortableTextBlock[] } }) => {
      const colors: Record<string, string> = {
        info: 'bg-blue-lighten-5 border-blue-lighten-2 text-blue-darken-2',
        warning: 'bg-yellow-lighten-5 border-yellow-lighten-2 text-yellow-darken-3',
        success: 'bg-green-lighten-5 border-green-lighten-2 text-green-darken-2',
      }

      return h('div', {
        class: `my-6 pa-4 rounded-lg border ${colors[value.type as string] || colors.info}`,
      }, [
        value.title && h('h4', { class: 'font-weight-medium mb-2' }, value.title),
        h(PortableText, { value: value.content }),
      ])
    },
    codeBlock: ({ value }: { value: { code: string, language?: string } }) => {
      return h('div', { class: 'my-6' }, [
        h('div', { class: 'bg-grey-darken-4 text-grey-lighten-4 pa-4 rounded-lg overflow-x-auto' }, [
          h('pre', { class: 'text-body-2' }, [
            h('code', {}, value.code),
          ]),
        ]),
        value.language && h('div', { class: 'text-caption text-grey mt-1 text-right' }, value.language),
      ])
    },
  },
  marks: {
    link: (props: { value?: { href?: string, openInNewTab?: boolean }, text?: unknown }) => {
      const target = props.value?.openInNewTab ? '_blank' : undefined
      const rel = props.value?.openInNewTab ? 'noopener noreferrer' : undefined
      console.log(props)
      return h('a', {
        href: props.value?.href,
        target,
        rel,
        class: 'text-primary text-decoration-underline',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, props.text as any)
    },
    internalLink: (props: { value?: { href?: string }, children?: unknown }) => {
      const NuxtLink = resolveComponent('NuxtLink')

      return h(NuxtLink, {
        to: props.value?.href,
        class: 'text-primary text-decoration-underline',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, props.children as any)
    },
  },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any
</script>

<style scoped>
.sanity-content {
  color: rgb(var(--v-theme-on-surface));
}

.sanity-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: rgb(var(--v-theme-on-surface));
}

.sanity-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: rgb(var(--v-theme-on-surface));
}

.sanity-content :deep(h4) {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: rgb(var(--v-theme-on-surface));
}

.sanity-content :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.625;
}

.sanity-content :deep(ul) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.sanity-content :deep(ol) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.sanity-content :deep(li) {
  margin-bottom: 0.5rem;
}

.sanity-content :deep(blockquote) {
  border-left: 4px solid rgb(var(--v-theme-grey-lighten-1));
  padding-left: 1rem;
  font-style: italic;
  color: rgb(var(--v-theme-grey-darken-1));
  margin: 1rem 0;
}

.sanity-content :deep(code) {
  background-color: rgb(var(--v-theme-grey-lighten-4));
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: monospace;
}

.sanity-content :deep(strong) {
  font-weight: 600;
}

.sanity-content :deep(em) {
  font-style: italic;
}
</style>
