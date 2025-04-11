<template>
  <div class="container">
    <!-- Logo in bottom right -->
    <div class="logo-container">
      <img
        src="/logos/logo_couleur.png"
        alt="Logo"
        width="99"
        height="29"
      >
    </div>

    <!-- Main content -->
    <div class="content-wrapper">
      <div class="content-container">
        <img
          v-if="image"
          :src="image"
          width="432"
          height="243"
          class="content-image"
        >

        <h1 class="title">
          {{ title }}
        </h1>

        <p
          v-if="description"
          class="description"
        >
          {{ description }}
        </p>

        <!-- Author section -->
        <div
          v-if="author"
          class="author-container"
        >
          <div class="avatar-container">
            <img
              :src="author.avatarUrl"
              :alt="author.name"
              class="avatar-image"
            >
          </div>

          <div class="author-info">
            <div class="author-name">
              {{ author.name }}
            </div>
            <div class="author-twitter">
              {{ twitter }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'title',
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '/images/blogs/5-bienfaits-velo-voyage/6plbi2gNQI6cTmtfAKZX.jpg',
  },
  author: {
    type: Object,
    default: null,
  },
  twitter: {
    type: String,
    default: '',
  },
})

console.log('props', props)
</script>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  padding: 64px;
  position: relative;
  background-color: var(--v-primary-base);
}

.logo-container {
  position: absolute;
  bottom: 40px;
  right: 40px;
  padding: 12px;
  border-radius: 4px;
}

.content-wrapper {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 40px;
  background-color: #000000;
}

.content-image {
  border-radius: 8px;
  overflow: hidden;
}

.title {
  margin-top: 20px;
  text-align: center;
  font-size: 65px;
  line-height: 85px;
  margin: 20px 0 0 0;
  padding: 0;
}

.description {
  color: #9e9e9e;
  margin: 20px 40px 0;
  text-align: center;
  font-size: 29px;
  line-height: 45px;
}

.author-container {
  display: flex;
  align-items: center;
  margin-top: 20px;
}

.avatar-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
  color: #9e9e9e;
}

.author-name {
  font-size: 24px;
  white-space: pre;
}

.author-twitter {
  color: #9e9e9e;
}
</style>
