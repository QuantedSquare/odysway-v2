# Demo Content for Sanity Studio

This folder contains sample data files that demonstrate the relationships between different content types in your Sanity Studio.

## Import Order

Import these files in the following order to maintain proper references:

### 1. Foundation Content
- `users.json` - Basic user accounts
- `categories.json` - Content categories (Aventure, Culture, Nature)
- `regions.json` - Geographic regions (Europe, Asie, Amérique du Sud)
- `experiences.json` - Experience types (Trek, Culture, Aventure)
- `team-members.json` - Team members (Alex, Marie, Pierre)

### 2. Referenced Content
- `destinations.json` - Destinations (Islande, Népal, Pérou) - references regions
- `posts.json` - Blog posts - references users and categories

### 3. Complex Content
- `voyages.json` - Travel packages - references destinations, experiences, categories, and team members
- `reviews.json` - Customer reviews - references voyages

## How to Import

### Option 1: Studio Import Feature
1. Open Sanity Studio
2. Go to any document type (e.g., Users)
3. Click the "Import" button (usually in the top right)
4. Select the corresponding JSON file
5. Repeat for each content type

### Option 2: Manual Creation
1. Create new documents manually in Studio
2. Copy-paste the content from JSON files
3. Ensure all reference fields point to existing documents

### Option 3: API Import
Use the Sanity client to import programmatically (requires write token).

## Content Relationships

The demo content demonstrates:
- **Users** → **Posts** (author relationship)
- **Categories** → **Posts** and **Voyages** (categorization)
- **Regions** → **Destinations** (geographic grouping)
- **Destinations** → **Voyages** (travel packages)
- **Experiences** → **Voyages** (activity types)
- **Team Members** → **Voyages** (author notes)
- **Voyages** → **Reviews** (customer feedback)

## Demo Voyages

1. **Islande Aventure** (8 days)
   - Category: Aventure
   - Destination: Islande (Europe)
   - Experience: Trek
   - Guide: Alex

2. **Népal Himalaya** (15 days)
   - Categories: Aventure + Culture
   - Destination: Népal (Asie)
   - Experience: Trek
   - Guide: Pierre

## Testing Relationships

After import, you can test the relationships by:
1. Viewing a voyage and seeing linked destinations, categories, and team members
2. Filtering voyages by category or destination
3. Checking that reviews properly link to voyages
4. Verifying that posts show correct authors and categories

## Customization

Feel free to modify the demo content:
- Change names, descriptions, and details
- Add more destinations or experiences
- Modify pricing and availability
- Add images (upload in Studio and reference)
- Extend with additional content types

## Notes

- All dates are set to recent/reasonable values
- References use predictable IDs (e.g., "user-jane", "category-aventure")
- Some fields like images are left empty - add them in Studio
- The content is in French to match your project context
