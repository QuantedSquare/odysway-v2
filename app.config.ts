export default defineAppConfig({
  seo: {
    siteName: 'Odysway | Agence spécialiste du voyage en immersion',
  },
  header: 'Faisons connaissance 👋',
  footer: {
    logo: {
      image: '/logos/Logo-Odysway-Bleu.png',
      description: 'Odysway est la première agence dédiée au voyage en immersion, en France et à l\'étranger. Notre mission : proposer un tourisme plus sobre, plus respectueux, et profondément tourné vers la rencontre.',
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
        links: {
          link1: {
            text: 'À propos',
            link: '/a-propos',
          },
          link2: {
            text: 'Blog',
            link: '/blog',
          },
          link3: {
            text: 'Contact',
            link: '/contact',
          },
        },
      },
      colonne2: {
        title: 'Destinations',
        links: {
          link1: {
            text: 'Europe',
            link: '/destinations/europe',
          },
          link2: {
            text: 'Asie',
            link: '/destinations/asie',
          },
          link3: {
            text: 'Amérique du Sud',
            link: '/destinations/amerique-du-sud',
          },
        },
      },
      colonne3: {
        title: 'Types de voyages',
        links: {
          link1: {
            text: 'Europe',
            link: '/destinations/europe',
          },
          link2: {
            text: 'Asie',
            link: '/destinations/asie',
          },
          link3: {
            text: 'Amérique du Sud',
            link: '/destinations/amerique-du-sud',
          },
        },
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