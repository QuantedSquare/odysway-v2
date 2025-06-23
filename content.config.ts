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

// Helper function to recursively find all JSON files in a directory
function findJsonFiles(dir: string): string[] {
  const files: string[] = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      files.push(...findJsonFiles(fullPath))
    }
    else if (item.endsWith('.json')) {
      // Add JSON files from root directory
      files.push(fullPath)
    }
  }

  return files
}

const voyageDir = path.resolve(__dirname, 'content/voyages')
const voyageJsonFiles = findJsonFiles(voyageDir)
const voyageChoices = voyageJsonFiles
  .map((filePath) => {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')).slug
    }
    catch (error) {
      console.warn(`Error reading voyage file ${filePath}:`, error)
      return null
    }
  })
  .filter(Boolean) as [string, ...string[]]
console.log('voyageChoices', voyageChoices)

const destinationDir = path.resolve(__dirname, 'content/destinations')
const destinationFolders = fs.readdirSync(destinationDir).filter(
  name => fs.statSync(path.join(destinationDir, name)).isDirectory(),
)
const destinationChoices = destinationFolders
  .map((folder) => {
    const jsonPath = path.join(destinationDir, folder, `${folder}.json`)
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')).titre
    }
    return null
  })
  .filter(Boolean) as [string, ...string[]]

const experienceDir = path.resolve(__dirname, 'content/experiences')
const experienceFolders = fs.readdirSync(experienceDir).filter(
  name => fs.statSync(path.join(experienceDir, name)).isDirectory(),
)
const experienceChoices = experienceFolders.flatMap((folder) => {
  const folderPath = path.join(experienceDir, folder)
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'))
  return files.map((file) => {
    const jsonPath = path.join(folderPath, file)
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')).title
    }
    return null
  })
}).filter(Boolean) as [string, ...string[]]

const experienceBadgeChoices = experienceFolders.flatMap((folder) => {
  const folderPath = path.join(experienceDir, folder)
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.json'))
  return files.map((file) => {
    const jsonPath = path.join(folderPath, file)
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf-8')).badgeTitle
    }
    return null
  })
}).filter(Boolean) as [string, ...string[]]

// Modifit
const categoriesDir = path.resolve(__dirname, 'content/categories')
const categoriesFiles = fs.readdirSync(categoriesDir)
const categoriesChoices = categoriesFiles
  .map(file => file.replace('.json', ''))
  .filter(Boolean) as [string, ...string[]]

const regionDir = path.resolve(__dirname, 'content/continents')
const regionFiles = fs.readdirSync(regionDir)
const regionChoices = regionFiles
  .map(file => JSON.parse(fs.readFileSync(path.join(regionDir, file), 'utf-8')).nom)
  .filter(Boolean) as [string, ...string[]]

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
          author: z.string(),
          authorPhoto: z.string(),
          authorRole: z.string(),
          published: z.boolean(),
          publishedAt: z.date(),
          tags: z.string(), // TODO: change to array
          categories: z.string(), // TODO: change to array
          displayedImg: z.string().editor({ input: 'media' }),
          blogType: z.string(),
          badgeColor: z.string(),
          readingTime: z.string(),
        }),
      }),
    ),
    categories: defineCollection({
      type: 'data',
      source: {
        include: 'categories/*/*.json',
      },
      schema: z.object({
        title: z.string().describe('Titre de la catégorie'),
        slug: z.string().describe('Slug de la catégorie'),
        discoveryTitle: z.string().describe('Titre de la catégorie pour la page de découverte'),
        seoTitle: z.string().describe('Titre de la catégorie pour le SEO'),
        image: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }).describe('Image de la catégorie'),
        showOnHome: z.boolean().describe('Indique si la catégorie doit être affichée sur la page d\'accueil'),
      }),
    }),
    categoriesContent: defineCollection(
      asSeoCollection({
        type: 'page',
        source: 'categories/*/*.md',
        schema: z.object({
          author: z.string(),
          authorPhoto: z.string(),
          authorRole: z.string(),
          published: z.boolean(),
          publishedAt: z.date(),
          tags: z.string(), // TODO: change to array
          categories: z.string(), // TODO: change to array
          displayedImg: z.string().editor({ input: 'media' }),
          blogType: z.string(),
          badgeColor: z.string(),
          readingTime: z.string(),
        }),
      }),
    ),
    experiences: defineCollection({
      type: 'data',
      source: {
        include: 'experiences/*/*.json',
      },
      schema: z.object({
        published: z.boolean().describe('Indique si l\'experience est publiée'),
        title: z.string().describe('Titre de l\'experience'),
        badgeTitle: z.string().describe('Titre du badge de l\'experience'),
        slug: z.string().describe('Slug de l\'experience'),
        discoveryTitle: z.string().describe('Titre de l\'experience pour la page de découverte'),
        seoTitle: z.string().describe('Titre de l\'experience pour le SEO'),
        image: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }).describe('Image de l\'experience'),
        showOnHome: z.boolean().describe('Indique si l\'experience doit être affichée sur la page d\'accueil'),
      }),
    }),
    tops: defineCollection({
      type: 'data',
      source: 'tops/*.json',
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
      source: 'team/*.json',
      schema: z.object({
        slug: z.string(),
        name: z.string().optional(),
        image: z.string().editor({ input: 'media' }).optional(),
        description: z.string().optional(),
        linkedin: z.string().optional(),
        position: z.string().optional(),
      }),
    }),
    partenaires: defineCollection({
      type: 'data',
      source: 'partenaires/**.json',
      schema: z.object({
        imgSrc: z.string().editor({ input: 'media' }),
        description: z.string(),
        isOnHome: z.boolean(),
      }),
    }),
    reviews: defineCollection({
      type: 'data',
      source: 'avis/**.json',
      schema: z.object({
        author: z.string().describe('Nom du voyageur').optional(),
        authorAge: z.string().describe('Age du voyageur').optional(),
        date: z.date().describe('Date de la review').optional(),
        photo: z.string().editor({ input: 'media' }).describe('Photo du voyageur').optional(),
        rating: z.number().describe('Note attribuée au voyage ou à Odysway').optional(),
        text: z.string().describe('Texte de la review').optional(),
        voyageSlug: z.enum(voyageChoices).describe('Slug du voyage').optional(),
        voyageTitle: z.string().describe('Titre du voyage').optional(),
        isOnHome: z.boolean().describe('Afficher sur la page d\'accueil').optional(),
      }),
    }),
    regions: defineCollection({
      type: 'data',
      source: 'continents/*.json',
      schema: z.object({
        nom: z.string(),
        meta_description: z.string(),
        slug: z.string(),
        interjection: z.string(),
        image: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }).describe('Image de la région'),
      }),
    }),
    destinations: defineCollection({
      type: 'data',
      source: {
        include: 'destinations/*/*.json',
      },
      schema: z.object({
        titre: z.string().describe('Titre de la destination'),
        slug: z.string().describe('Slug de la destination'),
        chapka: z.string().describe('Chapka de la destination'),
        iso: z.string().describe('ISO de la destination'),
        interjection: z.string().describe('Interjection de la destination'),
        metaDescription: z.string().describe('Meta description de la destination'),
        published: z.boolean().default(true).describe('Indique si la destination est publiée'),
        showOnHome: z.boolean().default(false).describe('Indique si la destination est affichée sur la page d\'accueil'),
        regions: z.array(z.object({
          nom: z.enum(regionChoices),
        })).default([]).describe('Regions de la destination, définie dans le fichier regions'),
        image: z.object({
          src: z.string().editor({ input: 'media' }),
          alt: z.string(),
        }).describe('Image de la destination'),
        isTopDestination: z.boolean().default(false).describe('Indique si la destination est un top destination'),
      }),
    }),
    destinationsContent: defineCollection(
      asSeoCollection({
        type: 'page',
        source: 'destinations/*/*.md',
        schema: z.object({
          author: z.string(),
          authorPhoto: z.string(),
          authorRole: z.string(),
          published: z.boolean(),
          publishedAt: z.date(),
          tags: z.string(), // TODO: change to array
          categories: z.string(), // TODO: change to array
          displayedImg: z.string().editor({ input: 'media' }),
          blogType: z.string(),
          badgeColor: z.string(),
          readingTime: z.string(),
        }),
      }),
    ),
    page_voyage_fr: defineCollection({
      type: 'data',
      source: 'textes/fr/voyage.json',
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
          title: z.string().optional().describe('Titre de la note de auteur').default('En deux mots'),
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
              title: z.string().describe('Titre du status').default('**Bientôt confirmé**'),
              text: z.string().describe('Texte quand le voyage est ouvert a la reservation, ex: "**X inscrits**"').default('**X inscrits**'),
              color: z.enum(colorChoices).describe('Couleur du badge quand le voyage est ouvert a la reservation'),
            }),
          }).describe('Status des dates du voyage'),
        }).describe('Section de dates, defini dans le dossier dates'),
        indivSection: z.object({
          titleOnlyPrivatisationAvailable: z.string().describe('Titre de la section quand uniquement privatisation disponible').default('Ce voyage vous intéresse mais pas de dates proposées ?'),
          title: z.string().describe('Titre de la section quand privatisation et groupe disponible').default('Vous preferez partir seul? C\'est aussi possible.'),
          backgroundColor: z.enum(colorChoices).describe('Couleur de fond de la section'),
          textButton: z.string().describe('Texte du bouton').default('Je privatise ce voyage'),
          textButtonDevis: z.string().describe('Texte du bouton quand uniquement privatisation disponible').default('Demander un devis'),
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
    page_search: defineCollection({
      type: 'data',
      source: 'textes/fr/search.json',
      schema: z.object({
        oneTrip: z.string().describe('Texte pour un seul voyage'),
        multipleTrips: z.string().describe('Texte pour plusieurs voyages'),
        resetButton: z.string().describe('Texte du bouton réinitialiser'),
        searchHero: z.object({
          voyagePrefix: z.string().describe('Préfixe pour les voyages dans le titre hero (ex: "Nos voyages")'),
          defaultTitle: z.string().describe('Titre par défaut du hero de recherche'),
        }).describe('Section hero de la page de recherche'),
        infoContainer: z.object({
          title: z.string().describe('Titre de la section InfoContainer'),
          description: z.string().describe('Description de la section InfoContainer'),
          buttonText: z.string().describe('Texte du bouton InfoContainer'),
        }).describe('Section InfoContainer de la page de recherche'),
      }).describe('Textes pour la page de recherche'),
    }),
    page_blog: defineCollection({
      type: 'data',
      source: 'textes/fr/blog.json',
      schema: z.object({
        pageTitle: z.string().describe('Titre de la page blog'),
        searchPlaceholder: z.string().describe('Placeholder du champ de recherche'),
        categoryFilter: z.string().describe('Label du filtre par catégorie'),
        sortByDate: z.string().describe('Label du tri par date'),
        noArticlesFound: z.string().describe('Message quand aucun article trouvé'),
        resetFilters: z.string().describe('Texte du bouton réinitialiser les filtres'),
        sortOptions: z.object({
          newest: z.string().describe('Option tri plus récent'),
          oldest: z.string().describe('Option tri plus ancien'),
          shortest: z.string().describe('Option tri plus court'),
          longest: z.string().describe('Option tri plus long'),
        }).describe('Options de tri'),
      }).describe('Textes pour la page blog'),
    }),
    page_contact: defineCollection({
      type: 'data',
      source: 'textes/fr/contact.json',
      schema: z.object({
        formTitle: z.string().describe('Titre du formulaire de contact'),
        heroSection: z.object({
          title: z.string().describe('Titre de la section hero'),
          teamImageAlt: z.string().describe('Texte alternatif de l\'image équipe'),
        }).describe('Section hero'),
        contactForm: z.object({
          fields: z.object({
            civility: z.object({
              label: z.string().describe('Label du champ civilité'),
              placeholder: z.string().describe('Placeholder du champ civilité'),
              options: z.object({
                mr: z.string().describe('Option Monsieur'),
                mrs: z.string().describe('Option Madame'),
                other: z.string().describe('Option Autre'),
              }).describe('Options de civilité'),
            }).describe('Champ civilité'),
            lastName: z.object({
              label: z.string().describe('Label du champ nom'),
              placeholder: z.string().describe('Placeholder du champ nom'),
            }).describe('Champ nom'),
            firstName: z.object({
              label: z.string().describe('Label du champ prénom'),
              placeholder: z.string().describe('Placeholder du champ prénom'),
            }).describe('Champ prénom'),
            phone: z.object({
              label: z.string().describe('Label du champ téléphone'),
            }).describe('Champ téléphone'),
            email: z.object({
              label: z.string().describe('Label du champ email'),
              placeholder: z.string().describe('Placeholder du champ email'),
            }).describe('Champ email'),
            subject: z.object({
              label: z.string().describe('Label du champ objet'),
              placeholder: z.string().describe('Placeholder du champ objet'),
            }).describe('Champ objet'),
            message: z.object({
              label: z.string().describe('Label du champ message'),
              placeholder: z.string().describe('Placeholder du champ message'),
            }).describe('Champ message'),
          }).describe('Champs du formulaire'),
          submitButton: z.string().describe('Texte du bouton soumettre'),
          formTitle: z.string().describe('Titre du formulaire'),
          successMessage: z.string().describe('Message de succès après envoi'),
          successDescription: z.string().describe('Description du message de succès'),
          gdprSection: z.object({
            agreementText: z.string().describe('Texte avant le lien'),
            privacyLinkText: z.string().describe('Texte du lien politique de confidentialité'),
            privacyLinkUrl: z.string().describe('URL de la politique de confidentialité'),
            agreementSuffix: z.string().describe('Texte après le lien'),
          }).describe('Section RGPD'),
          validationMessages: z.object({
            civilityRequired: z.string().describe('Message validation civilité requise'),
            fieldRequired: z.string().describe('Message validation champ requis'),
            invalidEmail: z.string().describe('Message validation email invalide'),
            minOneCharacter: z.string().describe('Message validation un caractère minimum'),
            minMessageCharacters: z.string().describe('Message validation vingt caractères minimum'),
            gdprRequired: z.string().describe('Message validation RGPD requis'),
          }).describe('Messages de validation'),
        }).describe('Formulaire de contact'),
      }).describe('Textes pour la page contact'),
    }),
    ctas: defineCollection({
      type: 'data',
      source: {
        include: 'textes/fr/ctas.json',
      },
      schema: z.object({
        faqSection: z.object({
          ctaCard: z.object({
            avatar: z.string().editor({ input: 'media' }).describe('avatar en haut de la card'),
            title: z.string().describe('Titre de la card'),
            subtitle: z.string().describe('Sous-titre de la card'),
            button: z.object({
              text: z.string().describe('Texte du bouton'),
              to: z.string().describe('Lien du bouton'),
            }).describe('Bouton de la card'),
          }),
          faqHomeSubText: z.object({
            question: z.string().describe('Texte de la section'),
            text: z.string().describe('Texte de la section'),
            linkOnText: z.string().describe('Lien du bouton'),
            subtitle: z.string().describe('Sous-titre de la section'),
            text2: z.string().describe('Texte de la section'),
            linkOnText2: z.string().describe('Lien du bouton'),
          }).describe('Card FAQ, defini dans le dossier voyagesv2'),
        }),
        partenairesSection: z.object({
          title: z.string().describe('Titre de la section'),
          subtitle: z.string().describe('Sous-titre de la section'),
        }).describe('Section partenaires, defini dans le dossier voyagesv2'),
        layoutInfoContainer: z.object({
          title: z.string().describe('Titre de la section InfoContainer dans les layouts'),
          subtitle: z.string().describe('Sous-titre de la section InfoContainer dans les layouts'),
        }).describe('Section InfoContainer utilisée dans les layouts default et no-faq'),
      }),
    }),
    checkout: defineCollection({
      type: 'data',
      source: 'textes/fr/checkout.json',
      schema: z.object({
        fil_dariane_devis: z.object({
          step_1: z.string(),
          step_2: z.string(),
          step_3: z.string(),
          step_final_rdv: z.string(),
        }),
        first_step: z.object({
          title: z.string(),
          option_1: z.string(),
          option_2: z.string(),
          option_3: z.string(),
        }).describe('Options de la première étape'),
        calendly: z.string().describe('Texte pour Calendly'),
        room_indiv_accroche: z.string().describe('Accroche chambre individuelle'),
        room_indiv_text: z.string().describe('Texte chambre individuelle'),
        forced_indiv_room_text: z.string().describe('Texte chambre individuelle forcée'),
        cancel_text: z.string().describe('Texte conditions d\'annulation'),
        details: z.object({
          select_travelers_title: z.string().describe('Titre pour sélectionner le nombre de voyageurs'),
          nb_travelers_title: z.string().describe('Titre pour le nombre de voyageurs'),
          nb_adults_label: z.string().describe('Label pour le nombre d\'adultes'),
          nb_children_label: z.string().describe('Label pour le nombre d\'enfants'),
          contact_title: z.string().describe('Titre pour la section coordonnées'),
          firstname_label: z.string().describe('Label prénom'),
          lastname_label: z.string().describe('Label nom'),
          email_label: z.string().describe('Label email'),
          firstname_placeholder: z.string().describe('Placeholder prénom'),
          lastname_placeholder: z.string().describe('Placeholder nom'),
          email_placeholder: z.string().describe('Placeholder email'),
          newsletter_text: z.string().describe('Texte newsletter'),
          newsletter_label: z.string().describe('Label newsletter'),
        }),
        travelers_infos: z.object({
          title: z.string().describe('Titre informations voyageurs'),
          alert: z.string().describe('Alerte informations identiques aux documents'),
          all_fields_required: z.string().describe('Message tous champs requis'),
          age_validation: z.string().describe('Message validation âge'),
          preference_couple: z.string().describe('Texte pour le choix "voyage en couple"'),
        }),
        options: z.object({
          room_indiv_title: z.string().describe('Titre pour chambre individuelle'),
          indiv_room_label: z.string().describe('Label chambre individuelle'),
          food_details_title: z.string().describe('Titre pour détails alimentaires'),
          food_prefs_label: z.string().describe('Label préférences alimentaires'),
          vege_label: z.string().describe('Label végétarien'),
          vege_sub_label: z.string().describe('Sous-label végétarien'),
          other_food_label: z.string().describe('Label autres demandes'),
          special_request_label: z.string().describe('Label précisez...'),
        }),
        insurances: z.object({
          title: z.string().describe('Titre assurances'),
          no_insurance_label: z.string().describe('Label pas d\'assurance'),
          alert: z.string().describe('Alerte assurance applicable'),
          unavailable: z.string().describe('Message assurance indisponible'),
          conseille_badge: z.string().describe('Texte pour le badge "Conseillé"'),
          assurance_img: z.string().describe('Image d\'assurance'),
          preference_assurance_multirisque: z.string().describe('Label assurance multirisque'),
          accroche_assurance_perou_nepal: z.string().describe('Accroche assurance Pérou/Népal'),
          details_assurance_medicale_perou_nepal: z.string().describe('Détails assurance médicale Pérou/Népal'),
          details_assurance_medicale: z.string().describe('Détails assurance médicale'),
          preference_assurance_annulation: z.string().describe('Label assurance annulation'),
          accroche_assurance_annulation: z.string().describe('Accroche assurance annulation'),
          accroche_assurance_medicale: z.string().describe('Accroche assurance médicale'),
          details_assurance_annulation: z.string().describe('Détails assurance annulation'),
          insurances_unavailable: z.string().describe('Message assurances indisponibles'),
        }),
        summary: z.object({
          dates_confirmed: z.string().describe('Dates confirmées'),
          base_price: z.string().describe('Prix de base'),
          extension_price: z.string().describe('Prix extension'),
          travelers_details: z.string().describe('Détails voyageurs'),
          total_discount: z.string().describe('Réduction totale'),
          already_paid: z.string().describe('Montant déjà réglé'),
          total_price: z.string().describe('Prix total'),
          deposit_due: z.string().describe('Accompte à régler'),
          balance_due: z.string().describe('Solde à régler'),
          amount_due: z.string().describe('Montant à régler'),
          already_paid_full: z.string().describe('Voyage déjà réglé'),
          full_payment_required: z.string().describe('Message paiement intégral'),
          cancel_text: z.string().describe('Texte sur les conditions d\'annulation'),
          forced_indiv_room_text: z.string().describe('Texte pour la chambre individuelle forcée'),
          options_title: z.string().describe('Titre pour la section options'),
          early_bird_badge: z.string().describe('Texte pour le badge EarlyBird'),
          last_minute_badge: z.string().describe('Texte pour le badge LastMinute'),
        }),
        dialogs: z.object({
          learn_more_btn: z.string().describe('Bouton en savoir plus'),
          learn_more_title: z.string().describe('Titre en savoir plus'),
        }),
        payment: z.object({
          phrase_dacceptation: z.string().describe('Texte d\'acceptation des conditions'),
          ask_for_option_text: z.string().describe('Texte pour demander si l\'utilisateur veut une option'),
          accept_country_conditions_text: z.string().describe('Texte pour accepter les conditions d\'entrée du pays'),
          option_already_placed_error: z.string().describe('Message d\'erreur si une option a déjà été posée'),
          place_option_button: z.string().describe('Texte du bouton pour poser une option'),
          pay_button: z.string().describe('Texte du bouton pour payer'),
        }).describe('Textes pour la section de paiement'),
        navigation: z.object({
          next_button: z.string().describe('Texte du bouton suivant'),
          prev_button: z.string().describe('Texte du bouton précédent'),
        }).describe('Textes pour la navigation'),
      }).describe('Section checkout, defini dans le dossier voyagesv2'),
    }),
    devis: defineCollection({
      type: 'data',
      source: 'textes/fr/devis.json',
      schema: z.object({
        fil_dariane_devis: z.object({
          step_1: z.string(),
          step_2: z.string(),
          step_3: z.string(),
          step_4: z.string(),
          step_final_rdv: z.string(),
        }),
        first_step: z.object({
          title: z.string(),
          option_1: z.string(),
          option_2: z.string(),
          option_3: z.string(),
        }).describe('Options de la première étape'),
        second_step: z.object({
          title: z.string(),
          sub_1: z.string(),
          sub_2: z.string(),
          sub_3: z.string(),
          option_1: z.string(),
          option_2: z.string(),
          comment_title: z.string(),
        }).describe('Détails de la deuxième étape'),
        third_step: z.object({
          title: z.string(),
          sub_1: z.string(),
          sub_2: z.string(),
        }).describe('Informations utilisateur'),
        calendly: z.object({
          title: z.string(),
          text: z.string(),
        }).describe('Informations Calendly'),
        buttons: z.object({
          send_devis_request: z.string().describe('Texte bouton envoyer demande de devis'),
          take_appointment: z.string().describe('Texte bouton prendre rendez-vous'),
          next: z.string().describe('Texte bouton suivant'),
          previous: z.string().describe('Texte bouton précédent'),
        }).describe('Textes des boutons'),
        form_labels: z.object({
          nb_adults: z.string().describe('Label nombre d\'adultes'),
          nb_children: z.string().describe('Label nombre d\'enfants'),
          select_period: z.string().describe('Label sélectionner période'),
          date_placeholder: z.string().describe('Placeholder format de date'),
          departure_airport_question: z.string().describe('Question aéroport de départ'),
          departure_airport_label: z.string().describe('Label aéroport de départ'),
          firstname: z.string().describe('Label prénom'),
          lastname: z.string().describe('Label nom'),
          email: z.string().describe('Label email'),
        }).describe('Labels des champs de formulaire'),
        options: z.object({
          yes: z.string().describe('Option Oui'),
          no: z.string().describe('Option Non'),
        }).describe('Options génériques'),
      }).describe('Section devis, defini dans le dossier voyagesv2'),
    }),
    search_field: defineCollection({
      type: 'data',
      source: 'textes/fr/search-field.json',
      schema: z.object({
        destination: z.string().describe('Label pour le champ destination'),
        travelType: z.string().describe('Label pour le champ type de voyage'),
        period: z.string().describe('Label pour le champ période'),
        discoverTrips: z.string().describe('Texte du bouton découvrir les voyages'),
        topDestinations: z.string().describe('Titre pour la section top destinations'),
        allPeriods: z.string().describe('Option pour toutes périodes'),
        travelTypes: z.object({
          individual: z.string(),
          group: z.string(),
        }).describe('Types de voyage'),
      }).describe('Textes pour le composant SearchField'),
    }),
    voyage_card: defineCollection({
      type: 'data',
      source: 'textes/fr/voyage-card.json',
      schema: z.object({
        type: z.string().describe('Label pour le type de voyage'),
        groupType: z.string().describe('Texte pour voyage en groupe'),
        soloType: z.string().describe('Texte pour voyage solo'),
        days: z.string().describe('Label pour la durée en jours'),
        startingFrom: z.string().describe('Texte "À partir de" pour le prix'),
        discoverDates: z.string().describe('Texte du bouton découvrir les dates'),
        requestQuote: z.string().describe('Texte du bouton demander un devis'),
      }).describe('Textes pour le composant VoyageCard'),
    }),
    newsletter: defineCollection({
      type: 'data',
      source: 'textes/fr/newsletter.json',
      schema: z.object({
        emailPlaceholder: z.string().describe('Placeholder du champ email'),
        subscribeButton: z.string().describe('Texte du bouton s\'inscrire'),
        successMessage: z.string().describe('Message de succès inscription'),
        closeButton: z.string().describe('Texte du bouton fermer'),
      }).describe('Textes pour le composant NewsletterContainer'),
    }),
    page_experiences: defineCollection({
      type: 'data',
      source: 'textes/fr/experiences.json',
      schema: z.object({
        index: z.object({
          pageTitle: z.string().describe('Titre de la page expériences'),
          metaDescription: z.string().describe('Meta description de la page expériences'),
        }).describe('Textes pour la page index des expériences'),
        slug: z.object({
          noVoyagesFound: z.string().describe('Message quand aucun voyage trouvé pour une expérience'),
          modifySearchCriteria: z.string().describe('Message pour modifier les critères de recherche'),
        }).describe('Textes pour les pages slug des expériences'),
        common: z.object({
          expandButton: z.object({
            showMore: z.string().describe('Texte du bouton voir plus'),
            showLess: z.string().describe('Texte du bouton voir moins'),
          }).describe('Bouton d\'expansion'),
        }).describe('Textes communs aux pages d\'expériences'),
      }).describe('Textes pour les pages d\'expériences'),
    }),
    page_thematiques: defineCollection({
      type: 'data',
      source: 'textes/fr/thematiques.json',
      schema: z.object({
        index: z.object({
          pageTitle: z.string().describe('Titre de la page thématiques'),
          metaDescription: z.string().describe('Meta description de la page thématiques'),
        }).describe('Textes pour la page index des thématiques'),
        slug: z.object({
          noVoyagesFound: z.string().describe('Message quand aucun voyage trouvé pour une thématique'),
          modifySearchCriteria: z.string().describe('Message pour modifier les critères de recherche'),
        }).describe('Textes pour les pages slug des thématiques'),
        common: z.object({
          expandButton: z.object({
            showMore: z.string().describe('Texte du bouton voir plus'),
            showLess: z.string().describe('Texte du bouton voir moins'),
          }).describe('Bouton d\'expansion'),
        }).describe('Textes communs aux pages de thématiques'),
      }).describe('Textes pour les pages de thématiques'),
    }),
    voyages: defineCollection({
      type: 'data',
      source: 'voyages/**.json',
      schema: z.object({
        published: z.boolean().describe('Indique si le voyage est publié'),
        title: z.string().describe('Titre du voyage'),
        destinations: z.array(z.object({
          name: z.enum(destinationChoices),
        })).describe('Destinations du voyage'),
        groupeAvailable: z.boolean().describe('Indique si le voyage est disponible en groupe'),
        privatisationAvailable: z.boolean().describe('Indique si le voyage est disponible en privatisation'),
        customAvailable: z.boolean().describe('Indique si le voyage est disponible en sur-mesure'),
        experienceType: z.enum(experienceChoices).optional().describe('Type d\'experience'), // Leave empty
        level: z.enum(['1', '2', '3']).describe('Niveau de difficulté'), // Leave empty
        categories: z.array(z.object({
          name: z.enum(categoriesChoices),
        })).describe('Categories du voyage'),
        duration: z.number().describe('Durée du voyage en jours'),
        nights: z.number().describe('Nombre de nuits du voyage'), // If not found, use number of days minus 1
        includeFlight: z.boolean().describe('Indique si le voyage inclut un vol'),
        housingType: z.string().describe('Type de logement'),
        idealPeriods: z.object({
          toutePeriodes: z.boolean().describe('Disponible toute l\'année'),
          janvier: z.boolean().describe('Disponible en janvier'),
          fevrier: z.boolean().describe('Disponible en février'),
          mars: z.boolean().describe('Disponible en mars'),
          avril: z.boolean().describe('Disponible en avril'),
          mai: z.boolean().describe('Disponible en mai'),
          juin: z.boolean().describe('Disponible en juin'),
          juillet: z.boolean().describe('Disponible en juillet'),
          aout: z.boolean().describe('Disponible en août'),
          septembre: z.boolean().describe('Disponible en septembre'),
          octobre: z.boolean().describe('Disponible en octobre'),
          novembre: z.boolean().describe('Disponible en novembre'),
          decembre: z.boolean().describe('Disponible en décembre'),
        }).describe('Périodes idéales pour le voyage'),
        monthlyAvailability: z.object({
          toutePeriodes: z.boolean().describe('Disponible toute l\'année'),
          janvier: z.boolean().describe('Disponible en janvier'),
          fevrier: z.boolean().describe('Disponible en février'),
          mars: z.boolean().describe('Disponible en mars'),
          avril: z.boolean().describe('Disponible en avril'),
          mai: z.boolean().describe('Disponible en mai'),
          juin: z.boolean().describe('Disponible en juin'),
          juillet: z.boolean().describe('Disponible en juillet'),
          aout: z.boolean().describe('Disponible en août'),
          septembre: z.boolean().describe('Disponible en septembre'),
          octobre: z.boolean().describe('Disponible en octobre'),
          novembre: z.boolean().describe('Disponible en novembre'),
          decembre: z.boolean().describe('Disponible en décembre'),
        }).describe('Disponibilité mensuelle du voyage'),
        minAge: z.number().describe('Age minimum pour participer au voyage').default(8),
        // Insurance spécifique, to be done depending on the new insurance choice
        rating: z.number().describe('Note du voyage sur 5'),
        comments: z.number().describe('Nombre de commentaires, (si différent des avis affichés en bas de page)'),
        miniatureDisplay: z.enum(['Note moyenne', 'Nouveau', 'Last minute', 'Early bird']).describe('Type de badge affiché sur miniature, (aucun si vide)'),
        // ==========================================
        authorNote: z.object({
          text: z.string().optional().describe('Texte de la note de auteur'),
          author: z.enum(teamChoices).optional().describe('Auteur de la note defini dans le fichier team.json'), // use nom_auteur_description
          affixeAuthor: z.string().optional().describe('Texte/Rôle apres le poste de auteur, ex: "et amoureux de la vallee d\'Aspe"'),
        }).describe('Note de auteur sous le hero/section photo, defini dans le dossier team'),
        // Ce qui vous attend
        experiencesBlock: z.array(z.string()).describe('Liste des plus du voyage, utiliser des "**" pour afficher du texte en gras (ex: "**7 nuits** sur place")'), // use "plus" key which is an html list you need to convert to an array of strings
        // ==========================================
        // SEO
        slug: z.string().describe('Slug du voyage'),
        description: z.string().describe('Description du voyage'),
        emailDescription: z.string().describe('Description du voyage pour l\'email'),
        metaDescription: z.string().describe('Meta Description du voyage'),
        // ==========================================
        badgeSection: z.object({
          experienceBadge: z.object({
            text: z.enum(experienceBadgeChoices).optional().describe('Texte du badge experience placé en premier'),
            color: z.enum(colorChoices).describe('Couleur du premier badge'),
            visible: z.boolean().describe('Indique si le badge est visible'),
          }),
          groupeBadge: z.object({
            text: z.string().describe('Texte du badge groupe'),
            visible: z.boolean().describe('Indique si le badge est visible'),
          }),
          durationBadge: z.object({
            text: z.string().describe('Texte du badge durée'),
            visible: z.boolean().describe('Indique si le badge est visible'),
          }),
          includeFlightBadge: z.object({
            text: z.string().describe('Texte du badge vol'),
            visible: z.boolean().describe('Indique si le badge est visible'),
          }),
          housingBadge: z.object({
            text: z.string().describe('Texte du badge logement'),
            visible: z.boolean().describe('Indique si le badge est visible'),
          }),
          periodBadge: z.object({
            text: z.string().describe('Texte du badge période'),
            visible: z.boolean().describe('Indique si le badge est visible'),
          }),
        }).describe('Liste de Badges sous la section photo'),

        programmeBlock: z.array(z.object({
          title: z.string().describe('Titre de la journée'),
          badgeText: z.string().describe('Texte du badge, ex: "Jour 1"'),
          description: z.string().describe('Description de la journée'),
          photo: z.string().editor({ input: 'media' }).describe('Photo de la journée'),
          denivellation: z.string().describe('Denivellation de la journée'),
          road: z.string().describe('Description du temps de trajet'),
          night: z.string().describe('Description de la nuitée'),
        })).describe('Programme du voyage, liste des activités par jour ou journées'),
        // ==========================================
        pricingDetailsBlock: z.object({
          include: z.array(z.string()).describe('Liste des prix inclus, utiliser des "**" pour afficher du texte en gras (ex: "**15 jours** pour changer d\'avis")'),
          exclude: z.array(z.string()).describe('Liste des prix non inclus, utiliser des "**" pour afficher du texte en gras (ex: "**15 jours** pour changer d\'avis")'),
        }).describe('Section détails du prix, ce qui est inclus / exclus'),
        pricing: z.object({
          startingPrice: z.number().describe('Prix d\'appel du voyage, à partir de...'),
          lastMinuteAvailable: z.boolean().describe('Indique si le voyage est disponible en dernière minute'),
          lastMinuteReduction: z.number().describe('Valeur de réduction promo last minute'),
          earlyBirdAvailable: z.boolean().describe('Indique si le voyage est disponible en early bird'),
          earlyBirdReduction: z.number().describe('Valeur de réduction promo early bird'),
          maxTravelers: z.number().describe('Nombre de personnes maximum'),
          minTravelersToConfirm: z.number().describe('Nombre de personnes minimum pour confirmer le voyage'),
          indivRoom: z.boolean().describe('Indique si le voyage est disponible en chambre individuelle'),
          forcedIndivRoom: z.boolean().describe('Indique si le voyageur est contraint de prendre une chambre individuelle'),
          indivRoomPrice: z.number().describe('Prix de la chambre individuelle'),
          cseReduction: z.number().describe('Valeur de réduction promo CSE'),
          cseAvailable: z.boolean().describe('Indique si le voyage est disponible en CSE'),
          childrenPromo: z.number().describe('Valeur de réduction promo enfant'),
          childrenAge: z.number().describe('Age maximum pour beneficier de la réduction promo enfant').default(12),
          airportCode: z.array(z.string()).describe('Liste des codes aéroport du voyage'),
        }).describe('Section gestion du prix du voyage, commun à toutes les dates'),

        // ==========================================
        accompanistsDescription: z.string().describe('Description globale des accompagnateurs, affichée au dessus de la liste'),
        accompanistsList: z.array(z.object({
          name: z.string().describe('Nom de accompagnateur'),
          description: z.string().describe('Description de accompagnateur'),
          role: z.string().describe('Role de accompagnateur'),
          image: z.string().editor({ input: 'media' }).describe('Image de accompagnateur'),
        })).describe('Liste des accompagnateurs'),
        // ==========================================
        housingBlock: z.array(z.object({
          title: z.string().describe('Titre de la section'),
          housingType: z.string().describe('Type de logement'),
          housingMood: z.string().describe('Ambiance du logement'),
          image: z.array(z.object({
            src: z.string().editor({ input: 'media' }).describe('Image de la section'),
            alt: z.string().describe('Texte descriptif de la photo'),
          })).describe('Liste de photos de l\'hébergement'),
        })).describe('Section logements'),
        // ==========================================
        image: z.object({
          src: z.string().editor({ input: 'media' }).describe('Image principale du voyage, utilisée en miniature et hero'),
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
        faqBlock: z.object({
          faqList: z.array(z.object({
            question: z.string().describe('Question'),
            answer: z.string().describe('Réponse'),
          })).describe('Liste des questions / réponses'),
        }).describe('Section FAQ'),
        seoSection: z.object({
          metaTitle: z.string().describe('Meta Title for SEO'),
          canonicalUrl: z.string().describe('Canonical URL'),
          ogTitle: z.string().describe('Open Graph Title'),
          ogDescription: z.string().describe('Open Graph Description'),
          ogImage: z.object({
            src: z.string().editor({ input: 'media' }),
            alt: z.string(),
          }).describe('Image de l\'og, utilise la photo principale si vide'),
          twitterTitle: z.string().describe('Twitter Card Title'),
          twitterDescription: z.string().describe('Twitter Card Description'),
          twitterImage: z.object({
            src: z.string().editor({ input: 'media' }),
            alt: z.string(),
          }).describe('Image de l\'og, utilise la photo principale si vide'),
          twitterCard: z.enum(['summary', 'summary_large_image', 'app', 'player']).describe('Twitter Card Type'),
        }).describe('SEO'),
        seo: z.object({
          title: z.string().describe('Titre de la page'),
        }).editor({ hidden: true }),
        navigation: z.object({
          title: z.string().describe('Titre de la section'),
          description: z.string().describe('Description de la section'),
          icon: z.string().describe('Icone de la section'),
        }).describe('Section navigation').editor({ hidden: true }),
        // ==========================================
      }),
    }),
  },
})
