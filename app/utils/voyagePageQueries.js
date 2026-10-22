// GROQ queries shared by the public voyage page (/voyages/[slug]) and the
// unlisted sur-mesure sales page (/sur-mesure/[slug]).

export const VOYAGE_PAGE_QUERY = `
  *[_type == "page_voyage"][0]{
    ...,
    contactSection{
      ...,
      teamMembers[]->{
        _id,
        name,
        image
      }
    },
    stickyBlock{
      ...,
      ctaCall{
        ...,
        avatars[]->{
          _id,
          name,
          image
        }
      }
    },
    indivSection{
      ...
    },
    rdvVariant{
      ...,
      rdvSection{
        ...,
        specialist->{
          _id,
          name,
          image,
          position
        }
      }
    }
  }
`
export const VOYAGE_QUERY = `
  *[_type == "voyage" && slug.current == $slug][0]{
    ...,
    image{
      asset->{
       ...
      },
      alt,
      hotspot,
      crop
    },
    seo{
      metaTitle,
      metaDescription,
      canonicalUrl,
      focusKeyword,
      keywords,
      robotsIndex,
      robotsFollow,
      ogTitle,
      ogDescription,
      ogImage{
        asset->{
          _ref,
          _id,
          url
        },
        alt
      }
    },
    badges[]{
      badge->{
        _id,
        title,
        text,
        picto
      },
      variable1Value,
      variable2Value,
      overrideText
    },
    levelBadgeOrder,
    destinations[]->{
      _id,
      title,
      iso,
      chapka
    },
    experienceType->{
      _id,
      title,
      badgeTitle
    },
    categories[]->{
      _id,
      title
    },
    authorNote{
      ...,
      author->{
      ...
      }
    },
    rdvBlock{
      ...,
      specialist->{
        _id,
        name,
        image,
        position
      }
    },
    difficultyLevel ->{
      description,
      level,
      title,
    }
  }
`

// Niveaux de difficulté, pour le choix du porteur dans l'Espace porteur.
export const NIVEAUX_DIFFICULTE_QUERY = `
  *[_type == "difficultyLevel" && !(_id in path("drafts.**"))] | order(level asc){
    _id,
    title,
    level,
    description
  }
`

// Badges, pour le choix du porteur dans l'Espace porteur (les plus utilisés d'abord).
export const BADGES_QUERY = `
  *[_type == "badge" && !(_id in path("drafts.**")) && defined(text)]{
    _id,
    title,
    text,
    variable1Label,
    variable2Label,
    picto,
    "usages": count(*[_type == "voyage" && references(^._id)])
  } | order(usages desc, title asc)
`

export const VOYAGE_PROPOSITIONS_QUERY = `
  *[_type == "voyage" && (
        !('custom' in availabilityTypes) ||
        (count(availabilityTypes) > 1)
      ) && slug.current != $slug && experienceType._ref == $experienceTypeId][0...5]{
    _id,
    title,
    "slug": slug.current,
    image,
    imageCard,
    rating,
    comments,
    availabilityTypes,
    duration,
    pricing{
      startingPrice
    },
    destinations[]->{
      _id,
      title
    },
    experienceType->{
      _id,
      title
    },
    categories[]->{
      _id,
      title
    },
    monthlyAvailability
  }
`
