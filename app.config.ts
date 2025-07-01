export default defineAppConfig({
  seo: {
    siteName: 'Odysway | Agence spécialiste du voyage en immersion',
  },
  header: {
    to: '/',
    logo: {
      desktop: '/logos/Logo-Odysway-Bleu.png',
      mobile: '/logos/Logo-Odysway-Bleu.png',
      alt: 'Odysway Logo',
    },
    search: true,
    textButton1: 'Notre vision du voyage',
    textButton2: '+33 1 84 80 79 75',
    textButton3: 'Faisons connaissance 👋',
  },
  footer: {
    logo: {
      image: '/logos/Logo-Odysway-Bleu.png',
      description: 'Odysway est le premier tour-opérateur français dédié au voyage en immersion, en France et à l’étranger. Notre mission : proposer un tourisme plus sobre, plus respectueux, et profondément tourné vers la rencontre.',
    },
    team: {
      image: '/images/team-photo.webp',
    },
    contact: {
      ctaText: 'N\'hésitez pas à nous contacter',
      phone: '+33 1 84 80 79 75',
      email: 'contact@odysway.com',
      buttonContact: {
        text: 'contact',
        lien: '/contact',
      },
    },
    social: {
      facebook: 'https://facebook.com/odysway',
      instagram: 'https://instagram.com/odysway',
      tiktok: 'https://tiktok.com/@odysway',
    },
    linksList: {
      colonne1: {
        title: 'Liens utiles',
        links: [{
          label: 'À propos',
          to: '/a-propos',
        }, {
          label: 'Blog',
          to: '/blog',
        }, {
          label: 'Contact',
          to: '/contact',
        }],
      },
      colonne2: {
        title: 'Destinations',
        links: [{
          label: 'Europe',
          to: '/destinations/europe',
        }, {
          label: 'Asie',
          to: '/destinations/asie',
        }, {
          label: 'Amérique du Sud',
          to: '/destinations/amerique-du-sud',
        }],
      },
      colonne3: {
        title: 'Types de voyages',
        links: [{
          label: 'Europe',
          to: '/destinations/europe',
        }, {
          label: 'Asie',
          to: '/destinations/asie',
        }, {
          label: 'Amérique du Sud',
          to: '/destinations/amerique-du-sud',
        }],
      },
      colonne4: {
        title: 'Où nous rencontrer',
        name: 'Odysway',
        address: '40 Rue du Louvre',
        city: 'Paris, 75001 France',
      },
    },
  },
})
