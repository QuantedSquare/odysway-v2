import fs from 'fs'
import path from 'path'
import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'

// #TODO: Move to content.schema.ts
const teamDir = path.resolve(__dirname, 'content/team')
const teamFiles = fs.readdirSync(teamDir)
const teamChoices = teamFiles
  .map(file => JSON.parse(fs.readFileSync(path.join(teamDir, file), 'utf-8')).name)
  .filter(Boolean) as [string, ...string[]]
console.log('teamChoices', teamChoices)

const voyageDir = path.resolve(__dirname, 'content/voyages')
const voyageFiles = fs.readdirSync(voyageDir)
const voyageChoices = voyageFiles
  .map(file => file.replace('.md', ''))
  .filter(Boolean) as [string, ...string[]]
console.log('voyageChoices', voyageChoices)

const paysChoices = (JSON.parse(fs.readFileSync(path.resolve(__dirname, 'content/pays/countriesList.json'), 'utf-8')) as Array<{ slug: string }>)
  .map(country => country.slug) as [string, ...string[]]
console.log('paysChoices', paysChoices)

const experienceChoices = ['Dans la peau de...', 'En immersion chez...', 'Dans l\'objectif de...'] as const

const colorChoices = [
  'primary',
  'primary-light',
  'primary-light-2',
  'primary-light-3',
  'primary-light-4',
  'secondary',
  'secondary-light',
  'secondary-light-2',
  'secondary-light-3',
  'secondary-light-4',
  'yellow',
  'yellow-light',
  'green',
  'green-light',
  'blue',
  'blue-light',
  'soft-blush',
  'cream',
  'yellow-rating',
  'odysway-1',
  'odysway-2',
  'orange-lighten-1',
  'white',
  'grey',
  'grey-light',
  'grey-darken-2',
  'grey-light-2',
  'grey-light-3',
] as const

export default defineContentConfig({
  collections: {
    content: defineCollection(
      asSeoCollection({
        type: 'page',
        source: '*.md',
      }),
    ),
    blog: defineCollection(
      asSeoCollection({
        type: 'page',
        source: 'blog/*.md',
        schema: z.object({
          tags: z.array(z.string()),
          image: z.object({
            src: z.string().editor({ input: 'media' }),
            alt: z.string(),
          }),
          date: z.date(),
          author: z.string(),
          published: z.boolean(),
          publishedAt: z.date(),
          displayedImg: z.object({
            src: z.string().editor({ input: 'media' }),
            alt: z.string(),
          }),
          // badge: z.object({
          //   content: z.string(),
          //   color: z.string(),
          // }),
          blogType: z.string(),
          badgeColor: z.enum(colorChoices),
        }),
      }),
    ),
    voyages: defineCollection(
      asSeoCollection({
        type: 'page',
        source: 'voyages/*.md',
        schema: z.object({
          slug: z.string(),
          title: z.string(),
          duration: z.string(),
          departureDate: z.date(),
          returnDate: z.date(),
          iso: z.string(),
          startingPrice: z.number(),
          rating: z.number(),
          comments: z.number(),
          imgSrc: z.string(),
          country: z.string(),
          programme: z.string(),
        }),
      }),
    ),

    categories: defineCollection({
      type: 'data',
      source: 'categories/**.json',
      schema: z.object({
        slug: z.string(),
        title: z.string(),
        image: z.string(),
      }),
    }),
    tops: defineCollection({
      type: 'data',
      source: 'tops/**.json',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        contenuOnglet: z.array(z.object({
          title: z.string(),
          linksList: z.array(z.object({
            title: z.string(),
            slug: z.string(),
          })),
        })),
      }),
    }),
    team: defineCollection({
      type: 'data',
      source: 'team/**.json',
      schema: z.object({
        slug: z.string(),
        name: z.string().optional(),
        image: z.string().optional(),
        description: z.string().optional(),
        linkedin: z.string().optional(),
        position: z.string().optional(),
      }),
    }),
    partenaires: defineCollection({
      type: 'data',
      source: 'partenaires/**.json',
      schema: z.object({
        imgSrc: z.string(),
        description: z.string(),
        isOnHome: z.boolean(),
      }),
    }),
    deals: defineCollection({
      type: 'data',
      source: 'deals/**.json',
      schema: z.object({
        draft: z.boolean().default(false),
        slug: z.string(),
        title: z.string(),
        country: z.string(),
        iso: z.string(),
        zoneChapka: z.number(),
        duration: z.string(),
        startingPrice: z.number(),
        rating: z.number(),
        comments: z.number(),
        indivRoom: z.boolean().optional(),
        privatisationAvailable: z.boolean(),
        groupeAvailable: z.boolean(),
        imgSrc1: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }),
        imgSrc2: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }),
        tooltipChild: z.string(),
        tooltipGroup: z.string(),
        interjection: z.string(),
        dates: z.array(z.object({
          departureDate: z.date(),
          returnDate: z.date(),
          startingPrice: z.number(),
          indivRoomPrice: z.number(),
          maxTravellers: z.number(),
          bookedPlaces: z.number(),
          earlyBird: z.boolean(),
          promoEarlyBird: z.number(),
          lastMinute: z.boolean(),
          promoLastMinute: z.number(),
          promo: z.number(),
          privatized: z.boolean(),
          flyTicketPrice: z.number(),
        })),
      }),
    }),
    travelList: defineCollection({
      type: 'data',
      source: 'travel-list/**.json',
      schema: z.object({
        slug: z.string(),
        title: z.string(),
      }),
    }),
    dates: defineCollection({
      type: 'data',
      source: 'dates/*/**.json',
      schema: z.object({
        published: z.boolean().default(false),
        badges: z.array(z.object({
          text: z.string().describe('Texte du badge, utiliser des "*" pour afficher du texte en gras (ex: "**7 nuits** sur place")'),
          icon: z.string().editor({ input: 'icon' }),
        })),
        departureDate: z.date().describe('Date de départ du voyage'),
        returnDate: z.date().describe('Date de retour du voyage'),
        startingPrice: z.number().describe('Prix de départ du voyage'),
        maxTravelers: z.number().describe('Nombre de personnes maximum'),
        minTravelers: z.number().describe('Nombre de personnes minimum').default(2),
        bookedTravelers: z.number().describe('Nombre de personnes réservées'),
        includeFlight: z.boolean().describe('Inclure un vol'),
        flightPrice: z.number().describe('Prix du vol si inclus'),
      }),
    }),
    reviews: defineCollection({
      type: 'data',
      source: 'reviews/**.json',
      schema: z.object({
        slug: z.string().describe('Slug du voyage'),
        author: z.string().describe('Nom du voyageur'),
        authorAge: z.string().describe('Age du voyageur'),
        photo: z.string().describe('Photo du voyageur'),
        voyagePhoto: z.string().describe('Photo du voyage'),
        text: z.string().describe('Texte de la review'),
        voyageSlug: z.string().describe('Slug du voyage'),
        voyageTitle: z.string().describe('Titre du voyage'),
        isOnHome: z.boolean().describe('Afficher sur la page d\'accueil'),
      }),
    }),
    avisVoyageurs: defineCollection({
      type: 'data',
      source: 'avis-voyageurs/**.json',
      schema: z.object({
        author: z.string(),
        photo: z.string(),
        text: z.string(),
        voyageSlug: z.string(),
        voyageTitle: z.string(),
        isDisplayed: z.boolean(),
        note: z.number(),
        date: z.string(),
      }),
    }),
    propos: defineCollection({
      type: 'data',
      source: 'top-bar/propos.json',
      schema: z.object({
        propos: z.array(z.object({
          title: z.string(),
          image: z.string(),
          slug: z.string(),
        })),
      }),
    }),
    destinations: defineCollection({
      type: 'data',
      source: 'destinations/**.json',
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        metaDescription: z.string(),
        visible: z.boolean(),
        countries: z.array(z.object({
          country: z.string(),
          image: z.string(),
          slug: z.string(),
          metaDescription: z.string(),
          visible: z.boolean(),
        })),
      }),
    }),
    // ======================V2======================
    page_voyage_fr: defineCollection({
      type: 'data',
      source: 'textes/fr/voyage.json', // #Todo, modifier par voyages.json
      schema: z.object({
        shareButton: z.object({
          text: z.string(),
          icon: z.string().editor({ input: 'icon' }),
        }).describe('Bouton partager en haut de la page'),
        photoButton: z.object({
          text: z.string().describe('Texte du bouton photo, ajouter x a la place du nombre de photos, ex: "Voir les X photos"').default('Voir les X photos'),
          icon: z.string().editor({ input: 'icon' }),
        }).describe('Bouton photo en bas du hero'),
        stickyBlock: z.object({
          pricePrefix: z.string().describe('Texte avant le prix, ex: "a partir de"').default('a partir de'),
          priceSuffix: z.string().describe('Texte apres le prix, ex: "/pers"').default('/pers'),
          dateText: z.string().describe('Titre de la section de dates').default('Dates disponibles'),
          dateButtonText: z.string().describe('Texte du bouton de dates, ex: "Voir les dates"').default('Voir tous les departs +'),
          ctaCall: z.object({
            text: z.string().describe('Texte du bouton de CTA, ex: "Contactez-nous"').default('Contactez-nous'),
            avatar: z.string().editor({ input: 'media' }).describe('avatar de expert'),
            to: z.string().describe('Lien du bouton de CTA, ex: "/calendly"').default('/calendly'),
          }).describe('CTA en bas du composant'),
          ctaBottom: z.object({
            list: z.array(z.string()).describe('Liste de CTAs en bas, utiliser des "**" pour afficher du texte en gras (ex: "**15 jours** pour changer davis")'),
          }).describe('Liste de points sous le CTA'),
          privatisationText: z.string().describe('Texte du bouton de privatisation sous le composant').default('Demander une privatisation de ce voyage'),
        }).describe('Section sticky a droite ou se trouvent les 3 premieres dates et CTAs'),
        authorNote: z.object({
          title: z.string().describe('Titre de la note de auteur').default('En deux mots'),
        }).describe('Note de auteur sous le hero/section photo, defini dans le dossier team'),
        experiencesBlock: z.object({
          title: z.string().describe('Titre de la section').default('Ce qui vous attend'),
          icon: z.string().editor({ input: 'icon' }),
          iconColor: z.enum(colorChoices).describe('Couleur de icon'),
          backgroundColor: z.enum(colorChoices).describe('Couleur de fond'),
        }).describe('Section experience, liste de ce qui vous attend sur le voyage'),
        programmeBlock: z.object({
          title: z.string().describe('Titre de la section').default('Programme'),
          badgeColor: z.enum(colorChoices).describe('Couleur des badges indiquant le jour du voyage'),
        }).describe('Section programme, liste des activites du voyage'),
        accompanistsTitle: z.string().describe('Titre de la section accompagnants').default('Les accompagnants'),
        housingTitle: z.string().describe('Titre de la section logement').default('Votre hebergement'),
        housingTypeTitle: z.string().describe('Titre de la section type de logement').default('Type de logement'),
        housingMoodTitle: z.string().describe('Titre de la section ambiance du logement').default('Ambiance du logement'),
        dateSections: z.object({
          title: z.string().describe('Titre de la section').default('Quel depart vous interesse ?'),
          pricePrefix: z.string().describe('Texte avant le prix, ex: "a partir de"').default('a partir de'),
          priceSuffix: z.string().describe('Texte apres le prix, ex: "/pers"').default('/pers'),
          bookingButtonText: z.string().describe('Texte du bouton de reservation').default('Reserver'),
          bookingButtonColor: z.enum(colorChoices).describe('Couleur du bouton de reservation'),
          optionButtonText: z.string().describe('Texte du bouton option').default('Poser une option'),
          optionButtonColor: z.enum(colorChoices).describe('Couleur du bouton option'),
          disabledButtonText: z.string().describe('Texte du bouton desactive').default('Complet'),
          disabledButtonColor: z.enum(colorChoices).describe('Couleur du bouton desactive'),
          ctaList: z.object({
            list: z.array(z.string()).describe('Liste de CTAs sous le bouton de reservation, utiliser des "**" pour afficher du texte en gras (ex: "**15 jours** pour changer davis")'),
          }).describe('Liste de points sous le bouton de reservation'),
          status: z.object({
            partiallyBooked: z.object({
              title: z.string().describe('Titre du status').default('Depart garanti'),
              text: z.string().describe('Texte quand le voyage est partiellement reserve, ex: "**X inscrits** - Reste X places"').default('**X inscrits** - Reste X places'),
              color: z.enum(colorChoices).describe('Couleur du badge quand le voyage est partiellement reserve'),
            }),
            fullyBooked: z.object({
              title: z.string().describe('Titre du status').default('Complet'),
              text: z.string().describe('Texte quand le voyage est completement reserve, ex: "**X inscrits** - Toutes les places sont prises"').default('**Complet**'),
              color: z.enum(colorChoices).describe('Couleur du badge quand le voyage est completement reserve'),
            }),
            open: z.object({
              title: z.string().describe('Titre du status').default('**Bientot confirme**'),
              text: z.string().describe('Texte quand le voyage est ouvert a la reservation, ex: "**X inscrits**"').default('**X inscrits**'),
              color: z.enum(colorChoices).describe('Couleur du badge quand le voyage est ouvert a la reservation'),
            }),
          }).describe('Status des dates du voyage'),
        }).describe('Section de dates, defini dans le dossier dates'),
        indivSection: z.object({
          title: z.string().describe('Titre de la section').default('Vous preferez partir seul? C\'est aussi possible.'),
          backgroundColor: z.enum(colorChoices).describe('Couleur de fond de la section'),
          textButton: z.string().describe('Texte du bouton').default('Je privatise ce voyage'),
          buttonColor: z.enum(colorChoices).describe('Couleur du bouton'),
        }).describe('Section individuelle, defini dans le dossier voyagesv2'),
        priceDetailsSection: z.object({
          title: z.string().describe('Titre de la section').default('Detail du prix'),
          priceInclude: z.string().describe('Texte du prix inclus, ex: "Le prix comprend"').default('Le prix comprend'),
          colorInclude: z.enum(colorChoices).describe('Couleur du badge du prix inclus et des icons'),
          priceExclude: z.string().describe('Texte du prix non inclus, ex: "Le prix ne comprend pas"').default('Le prix ne comprend pas'),
          colorExclude: z.enum(colorChoices).describe('Couleur du badge du prix non inclus et des icons'),
        }).describe('Section prix, defini dans le dossier voyagesv2'),
        reviewsSection: z.object({
          title: z.string().describe('Titre de la section').default('Des voyageurs epanouis'),
          ratingColor: z.enum(colorChoices).describe('Couleur des etoiles de la note du voyage'),
        }).describe('Section avis, defini dans le dossier voyagesv2'),
        faqSection: z.object({
          title: z.string().describe('Titre de la section FAQ').default('Questions frequentes'),
          backgroundColor: z.enum(colorChoices).describe('Couleur de fond de la section contact'),
          textButton: z.string().describe('Texte du bouton').default('Contactez-nous'),
          buttonColor: z.enum(colorChoices).describe('Couleur du bouton'),
          to: z.string().describe('Lien du bouton').default('/contact'),
          avatar: z.string().editor({ input: 'media' }).describe('Avatar de expert'),
          subtitle: z.string().describe('Sous-titre de la section FAQ').default('Autres questions? Notre equipe est la pour vous renseigner'),
          description: z.string().describe('Lorem ipsum dolor sit amet dolor consectetur adipiscing elit'),
        }).describe('Section FAQ, defini dans le dossier voyagesv2'),
        whySection: z.object({
          title: z.string().describe('Titre de la section').default('Pourquoi voyager avec Odysway ?'),
          backgroundColor: z.enum(colorChoices).describe('Couleur du fond'),
          itemBackgroundColor: z.enum(colorChoices).describe('Couleur du fond des items'),
          list: z.array(z.object({
            icon: z.string().editor({ input: 'icon' }),
            text: z.string().describe('Titre de la liste'),
          })).describe('Liste des points de la section'),
        }).describe('Section pourquoi, defini dans le dossier voyagesv2'),
        otherIdeas: z.string().describe('Titre de la section carousel propositions de voyages'),
      }),
    }),
    voyagesv2: defineCollection({
      type: 'page',
      source: 'voyagesv2/**.json',
      schema: z.object({
        title: z.string().describe('Titre du voyage'),
        slug: z.string().describe('Slug du voyage'),
        rating: z.number().describe('Note du voyage sur 5'),
        comments: z.number().describe('Nombre de commentaires'),
        description: z.string().describe('Description du voyage'),
        interjection: z.string(),
        country: z.enum(paysChoices).describe('Pays du voyage'),
        continent: z.enum(['Europe', 'Afrique', 'Asie', 'Amérique du Nord', 'Amérique du Sud', 'Océanie']).describe('Continent du voyage'),
        // ==========================================
        image: z.object({
          src: z.string().editor({ input: 'media' }).describe('Image principale du voyage'),
          alt: z.string().describe('Texte descriptif de l\'image principale'),
        }).describe('Image principale du voyage'),
        imageSecondary: z.object({
          src: z.string().editor({ input: 'media' }).describe('Image secondaire du voyage'),
          alt: z.string().describe('Texte descriptif de l\'image secondaire'),
        }).describe('Image secondaire du voyage'),
        photosList: z.array(z.object({
          src: z.string().editor({ input: 'media' }).describe('Image de la photo, conseil: Les ranger dans un dossier images/voyages/slug-voyage'),
          alt: z.string().describe('Texte descriptif de la photo'),
        })).describe('Liste des photos du voyage, présents dans le hero en haut de page'),
        videoLinks: z.array(z.string()).describe('Liste des liens de videos du voyage, ex: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"]'),
        // ==========================================
        badgeSection: z.object({
          experienceBadge: z.object({
            text: z.enum(experienceChoices).describe('Texte du badge experience placé en premier'),
            color: z.enum(colorChoices).describe('Couleur du premier badge'),
          }),
          otherBadges: z.array(z.object({
            text: z.string().describe('Texte du badge, utiliser des "**" pour afficher du texte en gras (ex: "**7 nuits** sur place")'),
            color: z.enum(colorChoices).describe('Couleur du badge'),
            icon: z.string().editor({ input: 'icon' }).describe('Icone du badge'),
          })).describe('Liste des autres badges'),
        }).describe('Liste de Badges sous la section photo'),
        authorNote: z.object({
          text: z.string().describe('Texte de la note de auteur'),
          author: z.enum(teamChoices).describe('Auteur de la note defini dans le fichier team.json'),
          affixeAuthor: z.string().describe('Texte apres le poste de auteur, ex: "et amoureux de la vallee d\'Aspe"'),
        }).describe('Note de auteur sous le hero/section photo, defini dans le dossier team'),
        // Ce qui vous attend
        experiencesBlock: z.array(z.string()).describe('Liste des points de ce qui vous attend sur le voyage, utiliser des "**" pour afficher du texte en gras (ex: "**7 nuits** sur place")'),
        programmeBlock: z.array(z.object({
          title: z.string().describe('Titre de la journée'),
          badgeText: z.string().describe('Texte du badge, ex: "Jour 1"'),
          description: z.string().describe('Description de la journée'),
          photo: z.string().editor({ input: 'media' }).describe('Photo de la journée'),
        })).describe('Programme du voyage, liste des activités par jour ou journées'),
        // ==========================================
        accompanistsList: z.array(z.object({
          name: z.string().describe('Nom de accompagnateur'),
          description: z.string().describe('Description de accompagnateur'),
          role: z.string().describe('Role de accompagnateur'),
          image: z.string().editor({ input: 'media' }).describe('Image de accompagnateur'),
        })).describe('Liste des accompagnateurs'),
        housingBlock: z.array(z.object({
          title: z.string().describe('Titre de la section'),
          housingType: z.string().describe('Type de logement'),
          housingMood: z.string().describe('Ambiance du logement'),
          image: z.array(z.object({
            src: z.string().editor({ input: 'media' }).describe('Image de la section'),
            alt: z.string().describe('Texte descriptif de la photo'),
          })).describe('Liste de photos de l\'hébergement'),
        })).describe('Section logements'),
        pricingDetailsBlock: z.object({
          include: z.array(z.string()).describe('Liste des prix inclus, utiliser des "**" pour afficher du texte en gras (ex: "**15 jours** pour changer d\'avis")'),
          exclude: z.array(z.string()).describe('Liste des prix non inclus, utiliser des "**" pour afficher du texte en gras (ex: "**15 jours** pour changer d\'avis")'),
        }).describe('Section détails du prix, ce qui est inclus / exclus'),
        faqBlock: z.object({
          faqList: z.array(z.object({
            question: z.string().describe('Question'),
            answer: z.string().describe('Réponse'),
          })).describe('Liste des questions / réponses'),
        }).describe('Section FAQ'),
        // ==========================================
        pricing: z.object({
          startingPrice: z.number().describe('Prix d\'appel du voyage'),
          lastMinuteAvailable: z.boolean().describe('Indique si le voyage est disponible en dernière minute'),
          lastMinuteReduction: z.number().describe('Valeur de réduction promo last minute'),
          earlyBirdAvailable: z.boolean().describe('Indique si le voyage est disponible en early bird'),
          earlyBirdReduction: z.number().describe('Valeur de réduction promo early bird'),
          maxTravelers: z.number().describe('Nombre de personnes maximum'),
          minTravelersToConfirm: z.number().describe('Nombre de personnes minimum pour confirmer le voyage'),
          zoneChapka: z.number().describe('Zone du chapka'),
          iso: z.string().describe('ISO du voyage'),
          indivRoom: z.boolean().describe('Indique si le voyage est disponible en chambre individuelle'),
          forcedIndivRoom: z.boolean().describe('Indique si le voyageur est contraint de prendre une chambre individuelle'),
          indivRoomPrice: z.number().describe('Prix de la chambre individuelle'),
          privatisationAvailable: z.boolean().describe('Indique si le voyage est disponible en privatisation'),
          groupeAvailable: z.boolean().describe('Indique si le voyage est disponible en groupe'),
          cseReduction: z.number().describe('Valeur de réduction promo CSE'),
          cseAvailable: z.boolean().describe('Indique si le voyage est disponible en CSE'),
          childrenPromo: z.number().describe('Valeur de réduction promo enfant'),
          childrenAge: z.number().describe('Age maximum pour beneficier de la réduction promo enfant').default(12),
        }).describe('Section gestion du prix du voyage, commun à toutes les dates'),
      }),
    }),
  },
})
