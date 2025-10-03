# Migration Scripts Guide

## Overview

This directory contains scripts to migrate content from Nuxt Content to Sanity CMS.

## Migration Flow

1. **Upload Images** → `upload-images.mjs`
2. **Migrate Content** → `migrateContinents.js`, `migrateDestinations.js`, etc.
3. **Review Reports** → Check `migration-reports/` for detailed logs

## Scripts

### `upload-images.mjs`

Uploads all images from `/public/images` to Sanity, storing the original path in asset metadata.

```bash
cd cms
node scripts/upload-images.mjs
```

**Features:**
- Recursively scans all subdirectories
- Skips already uploaded images (checks `source.id`)
- Supports: jpg, jpeg, png, webp, gif, svg

### `imageAssetHelper.js`

Helper functions for mapping image paths to Sanity asset IDs.

**Key functions:**
- `buildImageAssetMapping(client)` - Fetches all assets and builds Map
- `convertImageReference(path, mapping, alt, reporter, docId)` - Converts path to Sanity reference
- `convertImageArray(paths, mapping, reporter, docId)` - Converts array of paths

### `migrationReporter.js`

Tracks migration progress and issues, generates JSON reports.

**Usage:**
```javascript
import {MigrationReporter} from './migrationReporter.js'

const reporter = new MigrationReporter('destinations')

reporter.incrementTotal()
reporter.recordSuccess()
reporter.recordFailure(docId, error)
reporter.recordMissingImage(imagePath, docId)
reporter.recordWarning(docId, warning)

reporter.finish() // Saves report and prints summary
```

### Migration Scripts

- `migrateContinents.js` - Migrates regions/continents
- `migrateTops.js` - Migrates top destinations
- `seed.mjs` - Main migration orchestrator

## Creating a New Migration Script

```javascript
import {createClient} from '@sanity/client'
import {buildImageAssetMapping, convertImageReference} from './imageAssetHelper.js'
import {MigrationReporter} from './migrationReporter.js'

export default async function migrateYourContent(client) {
  const reporter = new MigrationReporter('your-content-type')
  const assetMapping = await buildImageAssetMapping(client)

  try {
    const files = // ... load your JSON files
    const tx = client.transaction()

    for (const file of files) {
      reporter.incrementTotal()

      try {
        const data = // ... parse file
        const docId = // ... generate ID

        // Convert images
        const imageRef = convertImageReference(
          data.image.src,
          assetMapping,
          data.image.alt,
          reporter,
          docId
        )

        const doc = {
          _id: docId,
          _type: 'yourType',
          // ... other fields
          image: imageRef
        }

        tx.createOrReplace(doc)
        reporter.recordSuccess()
      } catch (err) {
        reporter.recordFailure(file, err.message)
      }
    }

    await tx.commit()
    reporter.finish()
  } catch (err) {
    reporter.recordFailure('migration', err.message)
    reporter.finish()
    throw err
  }
}
```

## Migration Reports

Reports are saved to `migration-reports/` with format:
```
{contentType}-{timestamp}.json
```

**Example:** `regions-2025-10-03T14-30-00.json`

### Report Contents

```json
{
  "migrationType": "regions",
  "timestamp": "2025-10-03T14:30:00Z",
  "duration": "12.34s",
  "summary": {
    "totalDocuments": 45,
    "successful": 42,
    "failed": 3,
    "imagesReferenced": 58,
    "imagesMissing": 4,
    "warnings": 2
  },
  "missingImages": [
    {
      "path": "/images/destinations/old-photo.jpg",
      "referencedIn": ["region-europe", "region-asia"],
      "count": 2
    }
  ],
  "failedDocuments": [
    {
      "id": "region-xyz",
      "error": "Missing required field: slug",
      "timestamp": "2025-10-03T14:30:15Z"
    }
  ],
  "warnings": [
    {
      "document": "region-abc",
      "warning": "No image provided",
      "timestamp": "2025-10-03T14:30:10Z"
    }
  ],
  "heavilyUsedImages": [
    {
      "path": "/images/common/logo.png",
      "count": 15
    }
  ]
}
```

## Environment Variables

Required in `.env`:

```
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_WRITE_TOKEN=your-write-token
```

## Tips

1. **Always run `upload-images.mjs` first** before content migration
2. **Review migration reports** to catch missing images or errors
3. **Use transactions** for atomic operations
4. **Test with a subset** of data first
5. **Keep reports** for debugging and audit trail

## Troubleshooting

### Missing Images
Check the report's `missingImages` array. Common causes:
- Image not uploaded yet (run `upload-images.mjs`)
- Path mismatch (check for leading slashes, case sensitivity)
- Typo in JSON file

### Failed Documents
Check `failedDocuments` in the report for error details.

### Performance
- Image asset mapping is cached in memory (fast lookups)
- Use transactions for batch operations
- Add delays between API calls if hitting rate limits
