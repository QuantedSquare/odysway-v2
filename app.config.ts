export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate',
    },
    icons: {
      search: 'i-lucide-search',
      dark: 'i-lucide-moon',
      light: 'i-lucide-sun',
      external: 'i-lucide-external-link',
      chevron: 'i-lucide-chevron-down',
      hash: 'i-lucide-hash',
    },
  },
  seo: {
    siteName: 'Odysway',
  },
  header: {
    to: '/',
    logo: {
      desktop: '/logos/Logo-Odysway-Bleu.png',
      mobile: '/logos/Logo-Odysway-Bleu.png',
      alt: 'Odysway Logo',
    },
    search: false,
    textButton1: 'Notre vision du voyage',
    textButton2: '+33 1 84 80 79 75',
    textButton3: 'Faisons connaissance!',
  },
  footer: {
    logo: {
      image: '/logos/Logo-Odysway-Bleu.png',
      description: 'Découvrez le monde autrement avec Odysway, votre partenaire de voyage éthique et responsable.',
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
        lien: '/calendly',
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
          // to: '/about',
        }, {
          label: 'Blog',
          to: '/blog',
        }, {
          label: 'Contact',
          // to: '/contact',
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
          label: 'Amérique',
          to: '/destinations/amerique',
        }],
      },
      colonne3: {
        title: 'Colonne 3',
        links: [{
          label: 'Europe',
          to: '/destinations/europe',
        }, {
          label: 'Asie',
          to: '/destinations/asie',
        }, {
          label: 'Amérique',
          to: '/destinations/amerique',
        }],
      },
      colonne4: {
        title: 'Où nous trouver',
        name: 'Odysway',
        address: '40 Rue du Louvre',
        city: 'Paris, 75000 France',
      },
    },
  },
})
