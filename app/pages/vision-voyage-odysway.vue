<template>
  <div class="vision-page">
    <VisionHero
      :image="hero.image"
      :title="hero.title"
      :subtitle="hero.subtitle"
    />

    <VisionStory
      v-for="(story, i) in stories"
      :key="i"
      :eyebrow="story.eyebrow"
      :title="story.title"
      :paragraphs="story.paragraphs"
      :image="story.image"
      :reverse="story.reverse"
      :signature="story.showSignature ? signature : null"
    />

    <VisionDirection
      :eyebrow="direction.eyebrow"
      :title="direction.title"
      :paragraphs="direction.paragraphs"
    />

    <VisionValues
      :eyebrow="values.eyebrow"
      :title="values.title"
      :items="values.items"
    />

    <VisionGallery
      :eyebrow="gallery.eyebrow"
      :title="gallery.title"
      :items="gallery.items"
    />

    <VisionTeam
      :eyebrow="team.eyebrow"
      :title="team.title"
      :paragraphs="team.paragraphs"
      :image="team.image"
      :cta-button="team.ctaButton"
    />

    <TrustBand
      class="vision-page__trust"
      :items="visionPage?.trustBand?.items"
      :bordered="false"
    />

    <VisionCta
      :title="cta.title"
      :description="cta.description"
      :primary-cta="cta.primaryCta"
      :secondary-cta="cta.secondaryCta"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'simple-pages',
})

const visionPageQuery = groq`*[_type == "visionVoyageOdysway"][0]{
  heroSection,
  founderSection,
  storySections[]{
    eyebrow,
    title,
    paragraphs[]{ text, quote },
    image,
    reverse,
    showSignature
  },
  directionSection,
  valuesSection,
  gallerySection{
    eyebrow,
    title,
    items[]{
      _key,
      image,
      caption,
      size,
      voyage->{ title, "slug": slug.current, image, imageCard },
      destination->{ title, "slug": slug.current, image }
    }
  },
  teamSection{
    eyebrow,
    title,
    paragraphs,
    image,
    ctaButton
  },
  trustBand,
  ctaSection,
  seo
}`

const { data: visionPage } = await useSanityQuery(visionPageQuery)

// Photo de groupe déjà présente dans le CMS (footer.team.image) : sert de
// visuel par défaut pour la section équipe tant qu'aucune image dédiée n'est
// choisie sur la page.
const teamPhotoQuery = groq`*[_type == "footer"][0].team.image`
const { data: footerTeamPhoto } = await useSanityQuery(teamPhotoQuery, undefined, { dedupe: 'defer' })

// Fallback copy: the page renders its full editorial content even before the
// new CMS sections are filled in. Anything set in Sanity always wins.
const defaultStories = [
  {
    eyebrow: 'La prise de conscience',
    title: 'Tout a commencé un matin humide dans la jungle bolivienne',
    paragraphs: [
      { text: 'La vision d\'Odysway n\'est pas née autour d\'un tableau blanc, ni d\'un business plan. En 2015, je traverse l\'Amérique du Sud, sac au dos. Lors d\'un trek dans le nord de la Bolivie, le guide ouvre la marche en silence. Il écoute la forêt. Puis, entre deux arbres, une silhouette apparaît. Un jaguar. Pas de rugissement, pas de geste brusque. Un regard, direct, calme. Puis l\'animal disparaît.' },
      { text: 'Ici, je ne suis pas chez moi. Je suis un invité provisoire dans un monde qui continue très bien sans moi.', quote: true },
      { text: 'Sur le chemin du retour, j\'observe le guide. Il connaît chaque arbre, chaque cri d\'oiseau, chaque trace dans la boue. Pourtant, il n\'a jamais voyagé au-delà de quelques kilomètres. Deux hommes marchent côte à côte sur le même sentier, et leurs réalités n\'ont presque rien en commun.' },
    ],
    reverse: false,
    showSignature: true,
  },
  {
    eyebrow: '',
    title: 'Et si le voyage pouvait être autre chose ?',
    paragraphs: [
      { text: 'Ce soir-là, une gêne tranquille s\'installe : celle de réaliser que mon rapport au voyage ressemble davantage à une consommation qu\'à une rencontre. On arrive, on regarde, on repart. On rapporte des photos. Mais qu\'est-ce qu\'on laisse, et à qui ?' },
      { text: 'Odysway est né de cette question. Pas comme une réponse parfaite, mais comme une direction assumée : construire des voyages où celui qui part prend le temps de vraiment rencontrer celui qui accueille. Où les guides, les hôtes, les bergers, les artisans ne sont pas les décors du voyage, mais sa raison d\'être.' },
      { text: 'Un voyage ne transforme pas parce que l\'on a beaucoup vu. Il transforme parce que l\'on a vraiment rencontré.', quote: true },
    ],
    reverse: true,
    showSignature: false,
  },
]

const defaultDirection = {
  eyebrow: 'Notre direction',
  title: 'Une vraie rencontre vaut mieux qu\'un beau programme',
  paragraphs: [
    'Depuis 2018, chaque séjour naît d\'une relation de confiance avec celles et ceux qui vivent sur place. Guides, familles, artisans, éleveurs : ce sont eux qui donnent vie à nos voyages. Pas une mise en scène pour voyageurs de passage, mais un quotidien partagé, dans ce qu\'il a de simple et de vrai.',
    'Partir loin moins souvent, mais y rester vraiment. Prendre l\'avion quand cela a du sens, et accepter que la profondeur demande du temps. Et entre deux grands voyages, regarder autrement ce qui est proche : une vallée d\'hiver, un refuge d\'altitude, une ferme battue par les vents. L\'immersion n\'a pas besoin de changer de continent pour être réelle.',
    'Ce qui compte pour nous, c\'est l\'équilibre : que le voyage ait du sens pour celui qui part comme pour celui qui accueille, et qu\'il laisse derrière lui autre chose que des photos.',
  ],
}

const hero = computed(() => ({
  image: visionPage.value?.heroSection?.image,
  title: visionPage.value?.heroSection?.title || 'Notre vision du voyage',
  subtitle: visionPage.value?.heroSection?.subtitle
    || 'Voyager, ce n\'est pas voir. C\'est rencontrer. Voilà la conviction qui fait Odysway depuis le premier jour.',
}))

// Signature block under the first story — reuses the existing founder section
// ("Romain, fondateur d'Odysway" → name + role).
const signature = computed(() => {
  const founder = visionPage.value?.founderSection
  const caption = founder?.caption || 'Romain, fondateur d\'Odysway'
  const [name, ...rest] = caption.split(',')
  return {
    image: founder?.image,
    name: name?.trim(),
    role: rest.join(',').trim(),
  }
})

const stories = computed(() => {
  const sections = visionPage.value?.storySections
  if (!sections?.length) return defaultStories
  return sections.map(section => ({
    eyebrow: section.eyebrow || '',
    title: section.title || '',
    paragraphs: section.paragraphs || [],
    image: section.image,
    reverse: Boolean(section.reverse),
    showSignature: Boolean(section.showSignature),
  }))
})

const direction = computed(() => {
  const section = visionPage.value?.directionSection
  return {
    eyebrow: section?.eyebrow || defaultDirection.eyebrow,
    title: section?.title || defaultDirection.title,
    paragraphs: section?.paragraphs?.length ? section.paragraphs : defaultDirection.paragraphs,
  }
})

const values = computed(() => ({
  eyebrow: visionPage.value?.valuesSection?.eyebrow || 'Notre boussole, au quotidien',
  title: visionPage.value?.valuesSection?.title || 'Quatre valeurs simples et profondes',
  items: visionPage.value?.valuesSection?.items || [],
}))

const gallery = computed(() => ({
  eyebrow: visionPage.value?.gallerySection?.eyebrow || 'Instants de voyage',
  title: visionPage.value?.gallerySection?.title || 'En vrai, par nos voyageurs',
  items: visionPage.value?.gallerySection?.items || [],
}))

const team = computed(() => {
  const section = visionPage.value?.teamSection
  return {
    eyebrow: section?.eyebrow || 'Une équipe à taille humaine',
    title: section?.title || 'Des passionnés qui ont arpenté chaque voyage',
    paragraphs: section?.paragraphs?.length
      ? section.paragraphs
      : [
          'Odysway, ce n\'est pas une grande agence avec des bureaux partout. C\'est une équipe de personnes curieuses, qui connaissent les voyages qu\'elles proposent pour les avoir vécus elles-mêmes.',
          'Quand vous nous contactez, vous échangez avec quelqu\'un qui prend le temps. Pas pour vous vendre un séjour à tout prix, mais pour comprendre ce que vous cherchez vraiment.',
        ],
    image: section?.image?.asset ? section.image : footerTeamPhoto.value,
    ctaButton: section?.ctaButton?.link
      ? section.ctaButton
      : { text: 'Échanger avec l\'équipe', link: '/rdv-projet-voyage' },
  }
})

const cta = computed(() => {
  const section = visionPage.value?.ctaSection
  return {
    title: section?.title || 'Et si votre prochain voyage commençait par une rencontre ?',
    description: section?.description
      || 'Parcourez nos voyages en immersion, ou échangez avec un spécialiste pour imaginer le séjour qui vous ressemble.',
    primaryCta: section?.primaryCta?.link ? section.primaryCta : { text: 'Voir tous nos voyages', link: '/voyages' },
    secondaryCta: section?.secondaryCta?.link ? section.secondaryCta : { text: 'Prendre RDV 👋', link: '/rdv-projet-voyage' },
  }
})

if (visionPage.value) {
  const defaultContent = {
    title: 'Notre vision du voyage immersif et responsable',
    description: 'Odysway est né d\'une conviction : voyager, c\'est rencontrer. Notre vision du voyage immersif, en petit groupe, fondée sur la rencontre et le respect.',
    image: visionPage.value.heroSection?.image,
  }

  useSeo({
    seoData: visionPage.value?.seo,
    content: defaultContent,
    pageType: 'website',
    slug: 'vision-voyage-odysway',
    baseUrl: '/vision-voyage-odysway',
  })
}
</script>

<style scoped>
.vision-page {
  /* Vertical rhythm shared by every section of the page. */
  --gap-section: 4.5rem;
}

.vision-page__trust {
  margin-top: var(--gap-section);
}

@media (max-width: 960px) {
  .vision-page {
    --gap-section: 3rem;
  }
}
</style>
