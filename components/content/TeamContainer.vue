<template>
  <v-container>
    <v-row class="avatar-stack">
      <v-avatar
        v-for="(color, index) in ['#FFF7E1', '#E1F5FF', '#E8FFE1', '#FFE1E1']"
        :key="index"
        size="100"
        :class="`avatar-${index + 1}`"
        :style="{
          backgroundColor: color,
          zIndex: 4 - index,
        }"
      >
        <v-img
          src="/images/Florence Guilemaille.jpg"
          class="avatar-image"
        />
      </v-avatar>
    </v-row>
  </v-container>
</template>

<style scoped>
.avatar-stack {
  position: relative;
  height: 100px;
  display: flex;
  align-items: center;
}

.v-avatar {
  position: absolute;
  border: 2px solid white;
  transition: all 0.3s ease;
}

.avatar-1 {
  left: 0;
}

.avatar-2 {
  left: 60px;
}

.avatar-3 {
  left: 120px;
}

.avatar-4 {
  left: 180px;
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
  .avatar-2 { left: 40px; }
  .avatar-3 { left: 80px; }
  .avatar-4 { left: 120px; }
}
</style>
