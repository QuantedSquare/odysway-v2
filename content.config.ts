import fs from 'fs'
import path from 'path'
import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'

// -----------------------------TYPING-------------------------------
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
  .map(file => file.replace('.json', ''))
  .filter(Boolean) as [string, ...string[]]
console.log('voyageChoices', voyageChoices)

const paysChoices = (JSON.parse(fs.readFileSync(path.resolve(__dirname, 'content/pays/countriesList.json'), 'utf-8')) as Array<{ slug: string }>)
  .map(country => country.slug) as [string, ...string[]]
console.log('paysChoices', paysChoices)

const destinationChoices = (JSON.parse(fs.readFileSync(path.resolve(__dirname, 'content/destinations/destinations.json'), 'utf-8')) as Array<{ nom: string }>)
  .map(destination => destination.nom) as [string, ...string[]]
console.log('destinationChoices', destinationChoices)

// TODO
const experienceChoices = ['Dans la peau de...', 'En immersion chez...', 'Dans l\'objectif de...'] as const

const categoriesChoices = (JSON.parse(fs.readFileSync(path.resolve(__dirname, 'content/categories/categories.json'), 'utf-8')) as Array<{ slug: string }>)
  .map(category => category.slug) as [string, ...string[]]
console.log('categoriesChoices', categoriesChoices)

const regionChoices = (JSON.parse(fs.readFileSync(path.resolve(__dirname, 'content/destinations/regions.json'), 'utf-8')) as Array<{ nom: string }>)
  .map(region => region.nom) as [string, ...string[]]
console.log('regionChoices', regionChoices)

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

// ------------------------------------------------------------
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
          authorPhoto: z.string(),
          authorRole: z.string(),
          published: z.boolean(),
          publishedAt: z.date(),
          displayedImg: z.object({
            src: z.string().editor({ input: 'media' }),
            alt: z.string(),
          }),
          blogType: z.string(),
          badgeColor: z.string(),
          readingTime: z.string(),
        }),
      }),
    ),
    categories: defineCollection({
      type: 'data',
      source: {
        include: 'categories/**.json',
        exclude: ['categories/categories.json'],
      },
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        titre_seo: z.string(),
        image: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }),
        showOnHome: z.boolean(),
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
    dates: defineCollection({
      type: 'page',
      source: 'dates/*/**.json',
      schema: z.object({
        published: z.boolean().default(false),
        badges: z.array(z.object({
          text: z.string().describe('Texte du badge, utiliser des "*" pour afficher du texte en gras (ex: "**7 nuits** sur place")'),
          icon: z.string().editor({ input: 'icon' }),
        })),
        displayedStatus: z.enum(['Bientôt confirmé', 'Départ garanti', 'Complet']).describe('Status de la date, en affichage uniquement'),
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
        author: z.string().describe('Nom du voyageur').optional(),
        authorAge: z.string().describe('Age du voyageur').optional(),
        date: z.date().describe('Date de la review').optional(),
        photo: z.string().describe('Photo du voyageur').optional(),
        rating: z.number().describe('Note attribuée au voyage ou à Odysway').optional(),
        text: z.string().describe('Texte de la review').optional(),
        voyageSlug: z.enum(voyageChoices).describe('Slug du voyage').optional(),
        voyageTitle: z.string().describe('Titre du voyage').optional(),
        isOnHome: z.boolean().describe('Afficher sur la page d\'accueil').optional(),
      }),
    }),
    destinations: defineCollection({
      type: 'data',
      source: {
        include: 'destinations/*.json',
        exclude: ['destinations/regions.json'],
      },
      schema: z.object({
        titre: z.string(),
        slug: z.string(),
        chapka: z.string(),
        iso: z.string(),
        interjection: z.string(),
        metaDescription: z.string(),
        visible: z.boolean(),
        regions: z.array(z.enum(regionChoices)),
      }),
    }),
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
    voyages: defineCollection({
      type: 'page',
      source: 'voyages/*.json',
      schema: z.object({
        published: z.boolean().describe('Indique si le voyage est publié'),
        title: z.string().describe('Titre du voyage'),
        slug: z.string().describe('Slug du voyage'),
        rating: z.number().describe('Note du voyage sur 5'),
        comments: z.number().describe('Nombre de commentaires'),
        description: z.string().describe('Description du voyage'),
        emailDescription: z.string().describe('Description du voyage pour l\'email'),
        metaDescription: z.string().describe('Meta Description du voyage'),
        interjection: z.string().describe('Mot de liaison avec la destination (ex: "voyage **EN** France")'),
        destinations: z.array(z.enum(destinationChoices)).describe('Destinations du voyage'),
        categories: z.array(z.enum(categoriesChoices)).describe('Categories du voyage'),
        duration: z.number().describe('Durée du voyage en jours'),
        nights: z.number().describe('Nombre de nuits du voyage'), // If not found, use number of days minus 1
        experienceType: z.string().describe('Type d\'experience'), // Leave empty
        level: z.string().describe('Niveau de difficulté'), // Leave empty
        idealPeriods: z.array(z.enum(['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'])).describe('Périodes idéales pour le voyage'), // it's the periode_ideale_search key, which is an array of string numbers. Map the number to month name
        monthlyAvailability: z.array(z.enum(['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'])).describe('Disponibilité mensuelle du voyage'), // Use the same values as idealPeriods for now
        miniatureDisplay: z.enum(['Note moyenne', 'Nouveau', 'Last minute', 'Early bird']).describe('Type de badge affiché sur miniature, (aucun si vide)'),
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
          author: z.enum(teamChoices).describe('Auteur de la note defini dans le fichier team.json'), // use nom_auteur_description
          affixeAuthor: z.string().describe('Texte apres le poste de auteur, ex: "et amoureux de la vallee d\'Aspe"'),
        }).describe('Note de auteur sous le hero/section photo, defini dans le dossier team'),
        // Ce qui vous attend
        experiencesBlock: z.array(z.string()).describe('Liste des points de ce qui vous attend sur le voyage, utiliser des "**" pour afficher du texte en gras (ex: "**7 nuits** sur place")'), // use "plus" key which is an html list you need to convert to an array of strings
        programmeBlock: z.array(z.object({
          title: z.string().describe('Titre de la journée'),
          badgeText: z.string().describe('Texte du badge, ex: "Jour 1"'),
          description: z.string().describe('Description de la journée'),
          photo: z.string().editor({ input: 'media' }).describe('Photo de la journée'),
          denivellation: z.string().describe('Denivellation de la journée'), // Leave empty
        })).describe('Programme du voyage, liste des activités par jour ou journées'),
        // ==========================================
        accompanistsList: z.array(z.object({
          name: z.string().describe('Nom de accompagnateur'),
          description: z.string().describe('Description de accompagnateur'),
          role: z.string().describe('Role de accompagnateur'),
          image: z.string().editor({ input: 'media' }).describe('Image de accompagnateur'),
        })).describe('Liste des accompagnateurs'),
        accompanistsDescription: z.string().describe('Description des accompagnateurs'),
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
          indivRoom: z.boolean().describe('Indique si le voyage est disponible en chambre individuelle'),
          forcedIndivRoom: z.boolean().describe('Indique si le voyageur est contraint de prendre une chambre individuelle'),
          indivRoomPrice: z.number().describe('Prix de la chambre individuelle'),
          privatisationAvailable: z.boolean().describe('Indique si le voyage est disponible en privatisation'),
          groupeAvailable: z.boolean().describe('Indique si le voyage est disponible en groupe'),
          cseReduction: z.number().describe('Valeur de réduction promo CSE'),
          cseAvailable: z.boolean().describe('Indique si le voyage est disponible en CSE'),
          childrenPromo: z.number().describe('Valeur de réduction promo enfant'),
          childrenAge: z.number().describe('Age maximum pour beneficier de la réduction promo enfant').default(12),
          minAge: z.number().describe('Age minimum pour participer au voyage').default(8),
          airportCode: z.array(z.string()).describe('Liste des codes aéroport du voyage'),
        }).describe('Section gestion du prix du voyage, commun à toutes les dates'),
      }),
    }),
  },
})
