import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import { createId } from './utils/createId.js'
import { buildImageAssetMapping, convertImageReference } from './imageAssetHelper.js'
import { MigrationReporter } from './migrationReporter.js'

const footerFilePath = '../content/footer.json'

export default async function migrateFooter(client) {
  // Create reporter
  const reporter = new MigrationReporter('footer')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting footer migration...`)

    // Read footer JSON file
    const data = JSON.parse(fs.readFileSync(footerFilePath, 'utf8'));
    reporter.incrementTotal()

    // Generate a unique ID for the footer document
    const footerID = createId('footer', 'configuration')
  
    // Prepare the footer document for Sanity
    const footerDoc = {
      _id: footerID,
      _type: 'footer',
      logo: {
        image: data.logo.image,
        description: data.logo.description
      },
      team: {
        image: data.team.image
      },
      contact: {
        ctaText: data.contact.ctaText,
        phone: data.contact.phone,
        email: data.contact.email,
        buttonContact: {
          text: data.contact.buttonContact.text,
          lien: data.contact.buttonContact.lien
        }
      },
      social: {
        facebook: data.social.facebook,
        instagram: data.social.instagram,
        tiktok: data.social.tiktok
      },
      linksList: {
        colonne1: {
          title: data.linksList.colonne1.title,
          links: data.linksList.colonne1.links
        },
        colonne2: {
          title: data.linksList.colonne2.title,
          links: data.linksList.colonne2.links
        },
        colonne3: {
          title: data.linksList.colonne3.title,
          links: data.linksList.colonne3.links
        },
        colonne4: {
          title: data.linksList.colonne4.title,
          name: data.linksList.colonne4.name,
          address: data.linksList.colonne4.address,
          city: data.linksList.colonne4.city
        }
      }
    }
    
    // Handle logo image
    if (data?.logo?.image && data.logo.image.trim() !== '') {
      const logoImageRef = convertImageReference(
        data.logo.image,
        assetMapping,
        'Odysway Logo',
        reporter,
        footerID
      )

      if (logoImageRef) {
        footerDoc.logo.image = logoImageRef
        log(`  📷 Logo Image: ${data.logo.image} -> ${logoImageRef.asset._ref}`)
      } else {
        log(`  ⚠️  Logo image not found in assets: ${data.logo.image}`)
      }
    } else {
      reporter.recordWarning(footerID, 'No logo image provided')
    }

    // Handle team image
    if (data?.team?.image && data.team.image.trim() !== '') {
      const teamImageRef = convertImageReference(
        data.team.image,
        assetMapping,
        'Team Photo',
        reporter,
        footerID
      )

      if (teamImageRef) {
        footerDoc.team.image = teamImageRef
        log(`  📷 Team Image: ${data.team.image} -> ${teamImageRef.asset._ref}`)
      } else {
        log(`  ⚠️  Team image not found in assets: ${data.team.image}`)
      }
    } else {
      reporter.recordWarning(footerID, 'No team image provided')
    }

    // Create the document in Sanity
    await client.createOrReplace(footerDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated footer configuration (ID: ${footerID})`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during footer migration:', err.message);
    reporter.recordFailure('migration', err.message) 
    reporter.finish()
    process.exit(1)
  }
}
