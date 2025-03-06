<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        class="text-subtitle-1 text-md-h6 font-weight-bold"
      >
        Décrivez-nous votre projet, un conseiller Odysway reviendra vers vous avec un devis personnalisé
      </v-col>
      <v-col
        cols="12"
        class="text-subtitle-1 text-md-h6 font-weight-bold"
      >
        Combien de participants ?
      </v-col>
      <v-col cols="6">
        <v-select
          label="Nombres d'adultes"
          :items="[1, 2, 3, 4, 5, 6, 7, 8]"
          variant="outlined"
          bg-color="white"
        />
      </v-col>
      <v-col cols="6">
        <v-select
          label="Nombres d'enfants"
          :items="[1, 2, 3, 4, 5, 6, 7, 8]"
          variant="outlined"
          bg-color="white"
        />
      </v-col>
      <v-col
        cols="12"
        class="d-flex justify-center"
      >
        <v-btn-secondary
          color="white"
        >
          demander un devis
        </v-btn-secondary>
      </v-col>
    </v-row>
  </v-container>
</template>
