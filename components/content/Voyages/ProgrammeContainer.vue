<template>
  <v-container
    fluid
    class="px-0"
  >
    <v-row v-if="programme">
      <v-col cols="12">
        <h4 class="text-primary text-h4 font-weight-bold pb-0 pb-md-4">
          Au programme
        </h4>
      </v-col>
      <v-col
        v-for="(day, index) of programme"
        :key="index"
        cols="12"
      >
        <DayCard
          v-bind="day"
          v-model="expandedIndex"
          :index="index"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const expandedIndex = ref(null)

const programme = [{
  image: '/images/voyages/sejour-berger-bearn/mvx58lw1RDSN108MJDQh.jpg',
  day: 'Jour 1',
  title: 'Arrivée en vallée d\'Aspe',
  text: 'Cap vers l’intérieur des Pyrénées, rejoignez la sublime vallée d\'Aspe, située au coeur du Béarn. Territoire empreint d\'une forte culture liée au pastoralisme, c\'est aussi une vallée où vit encore l\'ours brun. Entre terroir et nature majestueuse, profitez de ces premiers instants découverte. Rencontre avec vos hôtes du séjour, Claire et Sandrine !',
},
{
  image: '/images/voyages/sejour-berger-bearn/8d1vULa4SSqSQsex8Ow9.jpg',
  day: 'Jour 2',
  title: 'Randonnée dans la vallée',
  text: 'Petit-déjeuner puis rencontre avec votre accompagnateur du séjour, avant un départ pour une randonnée sur les hauteurs de la vallée d\'aspe à la journée. Première rencontre avec les bergers en estive et découverte des paysages sublimes de la vallée.',
},
{
  image: '/images/voyages/sejour-berger-bearn/GU9frFNRDyBhXErJFx1t.jpg',
  day: 'Jour 3',
  title: 'Une nuit en estive',
  text: 'Partez pour 2 jours de randonnée sur le lieu de l\'estive, aux côtés du berger et de son troupeau et passez la nuit en cabane ou en bivouac ! Une occasion rare et unique de plonger dans le quotidien de berger, comme un air du bout du monde... La cabane du berger se trouve dans une zone peu fréquentée. Au programme : marche avec le berger et son troupeau, traite du lait, fabrication du fromage, soin porté aux brebis...',
},
{
  image: '/images/voyages/sejour-berger-bearn/tu5kNEGXQ06ViY6GpBji.jpg',
  day: 'Jour 4',
  title: 'Comme un berger',
  text: 'Réveil mémorable en montagne au rythme du berger, petit-déjeuner puis puis partage de ses activités sur la matinée. Derniers moments en sa compagnie, avant de redescendre en fin de matinée pour rejoindre la vallée dans l\'après-midi. Pique-nique sur la route. Fin d\'après-midi libre, profitez en pour aller vous explorer les villages de la vallée ou grimper jusqu\'au Poey, pour avoir une vue unique sur la vallée d\'Aspe. Nuit en gîte à Accous le soir.',
},
{
  image: '/images/voyages/sejour-berger-bearn/cIv1uTbpTsyKAX5fhKMt.jpg',
  day: 'Jour 5',
  title: 'Dernier jour dans les Pyrénées',
  text: 'Pour ce dernier jour dans le Béarn, la journée est libre. Partez pour une randonnée autour du lac d\'Estaens ou allez explorer le village de Lescun, au cadre enchanteur. Vous pourrez aussi vous détendre sur le plateau de Lhers situé non loin. Sur votre retour dans la vallée, vous pourrez aller acheter du fromage à ramener chez vous, comme un souvenir de cette immersion dans les montagnes.',
}]
</script>
