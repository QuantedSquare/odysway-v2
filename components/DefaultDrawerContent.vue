<template>
  <div class="h-100 d-flex justify-center align-center ga-4 ">
    <v-btn
      color="primary"
      height="54"
      class="text-caption text-md-body-1 "
    >
      Notre vision du voyage
    </v-btn>
    <v-btn
      color="primary"
      variant="tonal"
      height="54"
      class="text-caption text-md-body-1 "
    >
      01 00 00 00 00
    </v-btn>
    <v-btn
      density="compact"
      size="x-large"
      height="54"
      color="white"
      rounded="default"
      class="text-caption text-md-body-1  bg-primary"
      @click="() => router.push('/calendly')"
    >
      Faisons connaissance!
    </v-btn>
  </div>
</template>
