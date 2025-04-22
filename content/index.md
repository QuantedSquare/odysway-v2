---
ogImage:
  component: "default"
  props:
    title: "Accueil Odysway"
    description: "La rencontre au cœur du voyage"
    image: "/images/AdobeStock_124472096.jpeg"
sitemap:
  lastmod: 2025-01-01
robots: index, nofollow
schemaOrg:
  - "@type": "TravelAgency"
    headline: "Odysway, agence de voyage"
    author:
      type: "Person"
      name: "Alexandre Ottmann"
    datePublished: "2025-04-10"
    "@context": "http://schema.org"
    address:
      "@type": "PostalAddress"
      addressLocality: "Le Plessis Trévise"
      addressCountry: "France"
      postalCode: "94420"
      streetAddress: "27 avenue Nicolas Boileau"
    description: "Odysway est l'agence spécialiste des voyages en immersion. Nous proposons un tourisme authentique et responsable qui vous fera voyager différemment."
    name: "ODYSWAY"
    legalName: "ODYSWAY SAS"
    priceRange: "€€"
    telephone: "+ 33 (0) 1 84 80 79 75"
    email: "contact@odysway.com"
    image: "https://odysway.com/logos/logo_noir.png"
---


::home-hero-section
---
image-src: /images/homeHero.jpeg
primary-color: '#2B4C52'
secondary-color: '#DB6644'
tertiary-color: '#F0B348'

---
#title
La rencontre

au coeur du voyage

#component-slot-1
  :::search-field
  :::
::

  :::horizontal-carousel
  #title
  Laissez-vous inspirer

  #carousel-item
    ::::thematique-col-card
    ---
    slug: chemins-vers-soi
    image: /images/Maroc-voyage-spirituel.jpg
    title: Plongée dans la culture Indienne
    ---
    ::::
    ::::thematique-col-card
    ---
    slug: echappees-sauvages
    image: /images/montagne.jpg
    title: Échapées sauvages
    ---
    ::::
    ::::thematique-col-card
    ---
    slug: immersions-locales
    image: /images/Pérou-voyage-spirituel.jpg
    title: Immersions locales
    ---
    ::::
    ::::thematique-col-card
    ---
    slug: regard-faune
    image: /images/AdobeStock_175948238.webp
    title: Regard sur la faune
    ---
    ::::
    ::::thematique-col-card
    ---
    slug: sentiers-aventures
    image: /images/Laponie-(1).webp
    title: Sentiers d'aventure
    ---
    ::::
  :::


::horizontal-carousel
#title
Coups de coeur voyageurs (ajouter props color Bg)

#carousel-item
  :::voyage-col-card{voyage-slug="sejour-berger-bearn"}
  :::

  :::voyage-col-card{voyage-slug="sejour-berger-bearn"}
  :::

  :::voyage-col-card{voyage-slug="voyage-immersion-culturelle-japon"}
  :::

  :::voyage-col-card{voyage-slug="kung-fu-temple-shaolin-chine"}
  :::

  :::voyage-col-card{voyage-slug="voyage-hiver-laponie-finlande"}
  :::

  :::voyage-col-card{voyage-slug="sejour-berger-bearn"}
  :::

  :::voyage-col-card{voyage-slug="voyage-immersion-culturelle-japon"}
  :::

  :::voyage-col-card{voyage-slug="kung-fu-temple-shaolin-chine"}
  :::

  :::voyage-col-card{voyage-slug="voyage-hiver-laponie-finlande"}
  :::
::

::horizontal-carousel
#title
Nos séjours en France

#carousel-item
  :::voyage-col-card{voyage-slug="kung-fu-temple-shaolin-chine"}
  :::

  :::voyage-col-card{voyage-slug="sejour-berger-bearn"}
  :::

  :::voyage-col-card{voyage-slug="kung-fu-temple-shaolin-chine"}
  :::
::



::title-container
#title
[Ici "Nos bonnes idées" réutiliser la logic d'inscription newsletter dans le composant FooterOdysway]{style="color: #2e8b57;"}
::



::horizontal-carousel
#title
Partir au printemps
#carousel-item
  :::voyage-col-card{voyage-slug="voyage-immersion-culturelle-japon"}
  :::

  :::voyage-col-card{voyage-slug="sejour-berger-bearn"}
  :::

  :::voyage-col-card{voyage-slug="kung-fu-temple-shaolin-chine"}
  :::

  :::voyage-col-card{voyage-slug="voyage-hiver-laponie-finlande"}
  :::
::

::horizontal-carousel
#title
Voyages inoubliables

#carousel-item
  :::voyage-col-card{voyage-slug="sejour-berger-bearn"}
  :::

  :::voyage-col-card{voyage-slug="sejour-berger-bearn"}
  :::

  :::voyage-col-card{voyage-slug="voyage-immersion-culturelle-japon"}
  :::

  :::voyage-col-card{voyage-slug="kung-fu-temple-shaolin-chine"}
  :::

  :::voyage-col-card{voyage-slug="voyage-hiver-laponie-finlande"}
  :::
::

::horizontal-carousel
#title
Voyages inoubliables 
<!-- (ajouter props pour centrer ce text) Remplacer voyageColCard par une Card "avis voyageur" Check comment la donnée est récupérée ici https://github.com/QuantedSquare/odysway-v2/blob/hashing/components/content/TravelReviewCard.vue -->


#carousel-item
  :::voyage-col-card{voyage-slug="sejour-berger-bearn"}
  :::
::


::title-container
#title
Nouveau component "Notre équipe est là pour vous renseigner" + subtext + bouton "Contactez-nous"
::


Redesign faq, une props image à rajouter pour le bg + Subtext tout en bas :
D'autres questions? Consulter notre FAQ
Si vous ne trouvez pas la réponse que vous cherchez, n'hésitez pas à nous contacter.

::faq-container
#section-title
  :::title-container
  #title  
  Questions fréquentes
  :::
#faq
  :::question-panel
  #question
  Odysway est-elle une agence de voyage ?
  
  #answer
Odysway est une agence de voyage certifiée et immatriculée auprès d'Atout France, et dispose d'une garantie financière APST, ainsi qu'une d'une assurance professionelle. Avec Odysway, voyagez les yeux fermés ! Les équipes Odysway sont très réactives et vous accompagnent avant votre voyage, sur place et au retour de votre voyage.
  :::

  :::question-panel
  #question
  En quoi Odysway se différencie des autres agences de voyage ?
  
  #answer
Chez Odysway, nous pensons que la vie est rythmée par les expériences que nous vivons ! Des expériences qui nous marquent, et qui nous laissent des souvenirs gravés à jamais. C'est pourquoi nous avons décidé de créer la première agence qui propose des séjours en immersion, et créés sur place par les équipes d'Odysway, afin de proposer à nos voyageurs une nouvelle façon de voyager : plus authentique, hors des sentiers battus et respectueuse de l'environnement et des populations locales.
  :::

  :::question-panel
  #question
  Quelle est la démarche responsable d'Odysway ?
  
  #answer
Vous pouvez consulter notre page démarche responsable pour plus d'informations.
  :::

  :::question-panel
  #question
  Avec qui vais-je voyager ?
  
  #answer
Chez Odysway, nous proposons deux options pour voyager :
<br>
<br>
    1. Vous choisissez vos propres dates, pour vivre le voyage seul, en couple, en famille, ou encore entre amis. Le séjour est alors privatisé pour vous et votre groupe.
    2. Vous choisissez de partir en groupe (maximum 8 voyageurs) sur des dates prédéfinies par Odysway, pour allier rencontres avec d'autres voyageurs et prix réduits.
  :::

  :::question-panel
  #question
  Quelles sont les disponibilités des voyages ?
  
  #answer
Pour les voyages individuels, vous choisissez vos propres dates. Un de nos conseillers vous répondra en vous indiquant le tarif et la disponibilité sur vos dates. Pour les voyages de groupes, les dates sont prédéfinies (généralement une date par mois), et vous pouvez réserver directement en ligne.
  :::

  :::question-panel
  #question
  Que se passe t-il si il n'y a pas de suffisamment de participants pour un départ groupé ?
  
  #answer
Nous pouvons exceptionnellement être contraints d'annuler un départ si le nombre minimum de participants n'est pas atteint. Cette décision vous sera communiquée au plus tard 30 jours avant le début du voyage pour des voyages dont la durée dépasse 6 jours, ou 15 jours avant pour des voyages de 6 jours maximum. Une solution de remplacement pourra vous être proposée.
  :::

  :::question-panel
  #question
  Les voyages incluent-ils les billets de train ou d'avion pour se rendre sur place ?
  
  #answer
Sauf mention contraire, Odysway n'inclut pas les vols internationaux dans les voyages proposés. Odysway pourra, sur demande des voyageurs, acheter en leur nom des billets de train ou d'avion vers et depuis la destination du voyage. En ce qui concerne les départs groupés, les vols sont inclus dans le prix du voyage, pour les séjours hors France.
  :::

  :::question-panel
  #question
Comment réserver un voyage avec Odysway ?
  
  #answer
Après avoir choisi le voyage qui vous intéresse, cliquez sur le bouton « Demander un devis » ou « s'inscrire pour ce voyage » pour un voyage en groupe. Vous pourrez alors choisir vos dates et procéder au règlement de l'acompte, qui confirmera votre réservation pour le voyage. Un conseiller voyage Odysway prendra alors contact avec vous par téléphone pour vous aider à préparer votre voyage.
  :::

  :::question-panel
  #question
Le paiement en ligne est-il sécurisé ?
  
  #answer
Le paiement en ligne par carte bancaire ou par virement bancaire est entièrement sécurisé. Vous recevrez une confirmation de paiement dans les minutes qui suivent votre réservation.
  :::

  :::question-panel
  #question
Puis-je annuler la réservation de mon voyage ?
  
  #answer
Si vous vous trouvez dans l'obligation d'annuler votre voyage, vous devrez en informer Odysway le plus tôt possible par mail. Les frais d'annulation sont : à plus de 30 jours du départ : remboursement intégral, entre 30 jours et 15 jours avant le départ : 50% du montant du voyage, moins de 15 jours avant le départ : 100% du montant du voyage.
  :::

  :::question-panel
  #question
Comment Odysway m'accompagne sur place ?
  
  #answer
Odysway a référencé et signé des partenariats avec des agences locales. Sélectionnées pour leur savoir-faire, leur expérience et sérieux, elles vous accompagnent sur place. Odysway reste à votre écoute pendant toute la durée de votre voyage par mail et téléphone (via Whatsapp à l'étranger), 24h/24 et 7j/7.
  :::

  :::question-panel
  #question
Que dois-je emporter avec moi ?
  
  #answer
Vous retrouverez l'ensemble des informations pratiques relatives à votre expérience dans la FAQ du voyage, et de façon plus détaillée et complète dans votre Contrat voyageur qui vous sera envoyé dans les 24h suivant votre réservation.
  :::

  :::question-panel
  #question
Suis-je assuré pour mon voyage avec Odysway ?
  
  #answer
Lors de l'achat d'un voyage, il est vivement recommandé d'être assuré. Une assurance annulation permet de couvrir le risque financier avant le voyage, et une assistance rapatriement vous protège pendant le voyage. Il est important d'y réfléchir dès la réservation car vous n'aurez qu'un délai de 48h maximum à partir de votre règlement pour y souscrire.
  :::  
::



::title-container
#title
Nouveau component Une agence fiable et engagée avec titre + subtext + array de partenaires (text/logo) + bg color
::


::title-container
#title
Nouveau component Des idées pour vos prochains voyages // Listes d'idées de voyages
::