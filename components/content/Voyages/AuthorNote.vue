<template>
  <div class="text-primary d-flex flex-column ga-4">
    <h4 class="text-h4 font-weight-bold">
      {{ page.authorNote.title }}
    </h4>
    <p class="text-subtitle-1 text-md-h5 font-weight-regular">
      {{ authorNote.text }}
    </p>

    <div
      v-if="author"
      class="d-flex ga-3"
    >
      <v-avatar
        :image="author.image"
        size="40"
        :alt="author.description"
      />
      <div class="text-subtitle-2 d-flex flex-column justify-center">
        <span class="font-weight-bold">
          {{ authorNote.author }}
        </span>
        <span class="font-weight-regular">
          {{ author.position }} &nbsp;{{ authorNote.affixeAuthor }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
const { authorNote } = inject('voyage')
const page = inject('page')
const author = await queryCollection('team').where('name', '==', authorNote.author).first()
console.log('author', author)
</script>
