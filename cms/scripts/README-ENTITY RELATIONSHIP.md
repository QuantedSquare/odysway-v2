# Odysway Content Schema - Visual Diagram
https://www.mermaidchart.com/app/projects/5ef106a3-6bee-42f8-ada3-bfb6106a97b3/diagrams/7d853668-03e4-41f7-9c3a-f2af31393240/version/v0.1/edit
## Entity Relationship Diagram

```mermaid
erDiagram
    VOYAGES {
        string slug PK
        string title
        boolean published
        number duration
        number nights
        number rating
        number startingPrice
        number minAge
        string level
        boolean groupeAvailable
        boolean privatisationAvailable
        boolean customAvailable
        string experienceType FK
        string housingType
        boolean includeFlight
        string authorNote_author FK
        string authorNote_text
        string authorNote_affixeAuthor
        array experiencesBlock
        array programmeBlock
        array pricingDetailsBlock_include
        array pricingDetailsBlock_exclude
        object pricing
        array accompanistsList
        array housingBlock
        array photosList
        array videoLinks
        object faqBlock
        object seoSection
    }

    DESTINATIONS {
        string slug PK
        string title
        boolean published
        boolean showOnHome
        boolean isTopDestination
        string iso
        string chapka
        string interjection
        string metaDescription
        array regions FK
        object image
    }

    REGIONS {
        string slug PK
        string nom
        string meta_description
        string interjection
        object image
    }

    CATEGORIES {
        string slug PK
        string title
        string discoveryTitle
        string seoTitle
        boolean showOnHome
        object image
    }

    EXPERIENCES {
        string slug PK
        string title
        string badgeTitle
        string discoveryTitle
        string seoTitle
        boolean published
        boolean showOnHome
        object image
    }

    TEAM {
        string slug PK
        string name
        string position
        string description
        string linkedin
        string image
    }

    REVIEWS {
        string id PK
        string author
        string authorAge
        date date
        string photo
        number rating
        string text
        string voyageSlug FK
        string voyageTitle
        boolean isOnHome
    }

    BLOG {
        string id PK
        string author FK
        string authorPhoto
        string authorRole
        boolean published
        date publishedAt
        string tags
        string categories
        string displayedImg
        string blogType
        string badgeColor
        string readingTime
    }

    PARTENAIRES {
        string id PK
        string imgSrc
        string description
        boolean isOnHome
        boolean whiteFilter
    }

    TOPS {
        string id PK
        string title
        string description
        array contenuOnglet
    }

    CONTENT_PAGES {
        string id PK
        string title
        string description
        string content
    }

    CATEGORIES_CONTENT {
        string id PK
        string author FK
        string authorPhoto
        string authorRole
        boolean published
        date publishedAt
        string tags
        string categories
        string displayedImg
        string blogType
        string badgeColor
        string readingTime
    }

    DESTINATIONS_CONTENT {
        string id PK
        string author FK
        string authorPhoto
        string authorRole
        boolean published
        date publishedAt
        string tags
        string categories
        string displayedImg
        string blogType
        string badgeColor
        string readingTime
    }

    HEADER {
        string id PK
        object logo
        boolean search
        object button1
        object button2
        object button3
        object button4
        object button5
    }

    FOOTER {
        string id PK
        object logo
        object team
        object contact
        object social
        object linksList
    }

    %% Relationships
    VOYAGES ||--o{ REVIEWS : "has many"
    VOYAGES }o--|| EXPERIENCES : "belongs to"
    VOYAGES }o--|| TEAM : "authored by"
    VOYAGES }o--o{ DESTINATIONS : "visits"
    VOYAGES }o--o{ CATEGORIES : "categorized as"
    
    DESTINATIONS }o--o{ REGIONS : "located in"
    
    TEAM ||--o{ BLOG : "writes"
    TEAM ||--o{ CATEGORIES_CONTENT : "writes"
    TEAM ||--o{ DESTINATIONS_CONTENT : "writes"
    
    DESTINATIONS ||--o{ DESTINATIONS_CONTENT : "has content"
    CATEGORIES ||--o{ CATEGORIES_CONTENT : "has content"
```

## Key Relationship Types

### Many-to-Many Relationships
- **VOYAGES ↔ DESTINATIONS**: A voyage can visit multiple destinations, a destination can have multiple voyages
- **VOYAGES ↔ CATEGORIES**: A voyage can belong to multiple categories, a category can contain multiple voyages
- **DESTINATIONS ↔ REGIONS**: A destination can span multiple regions, a region can contain multiple destinations

### One-to-Many Relationships
- **VOYAGES → EXPERIENCES**: Each voyage has one primary experience type
- **VOYAGES → TEAM**: Each voyage has one author from the team
- **TEAM → BLOG**: A team member can write multiple blog posts
- **VOYAGES → REVIEWS**: A voyage can have multiple reviews

### Configuration Relationships
- **HEADER/FOOTER**: Global configuration entities
- **TEXTES**: Localization and UI text configuration
- **CONTENT_PAGES**: Markdown content pages

## Schema Compliance Notes

This diagram represents the exact relationships defined in `content.config.ts`:

1. **Dynamic Enum Generation**: All foreign key relationships use the dynamically generated enums from the config file
2. **Collection Types**: Data collections (JSON) vs Page collections (Markdown) are clearly distinguished
3. **Source Patterns**: File system patterns match the `source` definitions in the config
4. **Schema Validation**: All field types and constraints from Zod schemas are preserved
