<template>
  <div class="maintenance-container">
    <div class="maintenance-image-wrapper">
      <img
        src="/images/iStock-1356423948.webp"
        alt="Maintenance"
        class="maintenance-image"
      >
      <div class="maintenance-overlay" />
      <div class="maintenance-content">
        <h1 class="text-h2 text-shadow">
          Site en maintenance
        </h1>
        <p class="text-body-1">
          Nous effectuons actuellement une mise à jour de notre site pour vous offrir une meilleure expérience.<br>
          Merci de votre patience et à très vite !
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.maintenance-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  font-family: 'Gordita', 'Inter', 'Segoe UI', 'Arial', sans-serif;
}
.maintenance-image-wrapper {
  position: relative;
  width: 100vw;
  max-width: 700px;
  height: 60vh;
  min-height: 350px;
  max-height: 500px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0px 3px 20px 0px rgba(34, 34, 35, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
}
.maintenance-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: brightness(0.7) blur(0px);
}
.maintenance-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(34,34,35,0.25) 0%, rgba(34,34,35,0.45) 100%);
  z-index: 1;
}
.maintenance-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  color: #fff;
  text-align: center;
  padding: 0 2rem;
}
.text-h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.1;
}
.text-body-1 {
  font-size: 1.25rem;
  font-weight: 400;
  line-height: 1.5;
}
@media (max-width: 600px) {
  .maintenance-image-wrapper {
    max-width: 95vw;
    height: 60vh;
    min-height: 220px;
    border-radius: 14px;
  }
  .text-h2 {
    font-size: 1.5rem;
  }
  .text-body-1 {
    font-size: 1rem;
  }
  .maintenance-content {
    padding: 0!important;
  }
}
</style>
