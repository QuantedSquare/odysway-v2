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
    title: 'Odysway',
    to: '/',
    logo: {
      light: '',
      dark: '',
      alt: 'Odysway Logo',
    },
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-facebook',
      'to': 'https://facebook.com/odysway',
      'target': '_blank',
      'aria-label': 'Facebook',
    }, {
      'icon': 'i-simple-icons-instagram',
      'to': 'https://instagram.com/odysway',
      'target': '_blank',
      'aria-label': 'Instagram',
    }],
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
      phone: '01 23 45 67 89',
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
