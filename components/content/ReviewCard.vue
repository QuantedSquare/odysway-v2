<template>
  <v-row
    no-gutters
    justify="center"
  >
    <v-col cols="auto">
      <v-img
        src="/images/guillemet-gauche.svg"
        height="27"
        width="27"
      />
    </v-col>
    <v-col cols="10">
      <p class="text-center mb-4">
        Ce que je recherchais, c’est l’immersion dans la nature, me rapprocher des montagnes pour me déconnecter
        totalement du quotidien. Pendant ce voyage et au retour, j’ai eu la sensation d’avoir vraiment été vivante !
      </p>
    </v-col>
    <v-col cols="auto">
      <v-img
        src="/images/guillemet-droite.svg"
        height="27"
        width="27"
      />
    </v-col>
  </v-row>

  <v-row justify="center">
    <v-col
      cols="12"
      sm="8"
    >
      <v-card
        flat
        href="slug"
        target="_blank"
      >
        <v-row justify="center">
          <v-col cols="4">
            <v-img
              src="/images/AdobeStock_218029671 (1).webp"
              rounded="xl"
              cover
              class="border-xl green-border"
            />
          </v-col>
          <v-col cols="8">
            <v-card-subtitle class="text-textColor text-uppercase text-caption no-white-space">
              Lire le récit de voyage de Florence:
            </v-card-subtitle>
            <v-card-title class="text-textColor text-subtitle-1 font-weight-bold no-white-space">
              <h4>
                Vis ma vie de berger dans les Pyrénées
              </h4>
            </v-card-title>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
.green-border{
  border: 4px solid #2E8B57 !important;
}
.no-white-space {
  white-space: normal;
}
</style>
