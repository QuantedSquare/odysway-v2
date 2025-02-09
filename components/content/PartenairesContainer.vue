<template>
  <v-container
    class="partners-container bg-sectionBg"
    fluid
  >
    <div class="wrapper">
      <div class="content">
        <div class="mask-animation group relative">
          <div
            v-for="index in Array(partenaires.length).fill(null)"
            :key="index"
            class="animate-logo-cloud"
          >
            <v-img
              v-for="(partenaire, key) in partenaires"
              :key="key"
              :src="img(partenaire?.imgSrc, { format: 'webp', quality: 70, height: 110 })"
              :alt="`logo du partenaire ${partenaire.description}`"
              class="logo-img"
            />
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup>
const img = useImage()

const { data: partenaires } = await useAsyncData('partenaires', () => {
  return queryCollection('partenaires').all()
})
</script>

<style scoped>
.partners-container {
  margin-top: 24px;
  padding-top: 36px;
  padding-bottom: 36px;
}

.wrapper {
  width: 100%;
  padding-top: 48px;
  padding-bottom: 48px;
}

.content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: 16px;
  padding-right: 16px;
}

.mask-animation {
  position: relative;
  display: flex;
  gap: 24px;
  overflow: hidden;
  padding: 8px;
  mask-image: linear-gradient(to left, transparent 0%, black 20%, black 80%, transparent 95%);
}

.animate-logo-cloud {
  display: flex;
  flex-shrink: 0;
  flex-direction: row;
  justify-content: space-around;
  gap: 24px;
  animation: logo-cloud 30s linear infinite;
}

.logo-img {
  height: 60px;
  width: 110px;
  padding-left: 8px;
  padding-right: 8px;
  object-fit: contain;
}

@media (min-width: 768px) {
  .content {
    padding-left: 32px;
    padding-right: 32px;
  }
}

@keyframes logo-cloud {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(calc(-100% - 4rem));
  }
}
</style>
