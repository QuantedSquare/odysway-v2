import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import { createId } from './utils/createId.js'
import { buildImageAssetMapping, convertImageReference } from './imageAssetHelper.js'
import { MigrationReporter } from './migrationReporter.js'

const headerFilePath = '../content/header.json'

export default async function migrateHeader(client) {
  // Create reporter
  const reporter = new MigrationReporter('header')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting header migration...`)

    // Read header JSON file
    const data = JSON.parse(fs.readFileSync(headerFilePath, 'utf8'));
    reporter.incrementTotal()

    // Generate a unique ID for the header document
    const headerID = createId('header', 'configuration')
  
    // Prepare the header document for Sanity
    const headerDoc = {
      _id: headerID,
      _type: 'header',
      logo: {
        alt: data.logo.alt,
        to: data.logo.to
      },
      search: data.search,
      button1: {
        text: data.button1.text,
        link: data.button1.link,
        visible: data.button1.visible
      },
      button2: {
        text: data.button2.text,
        link: data.button2.link,
        visible: data.button2.visible
      },
      button3: {
        text: data.button3.text,
        link: data.button3.link,
        visible: data.button3.visible
      },
      button4: {
        text: data.button4.text,
        link: data.button4.link,
        visible: data.button4.visible
      },
      button5: {
        text: data.button5.text,
        link: data.button5.link,
        visible: data.button5.visible
      }
    }
    
    // Handle desktop logo image
    if (data?.logo?.desktop && data.logo.desktop.trim() !== '') {
      const desktopLogoRef = convertImageReference(
        data.logo.desktop,
        assetMapping,
        data.logo.alt || 'Odysway Logo Desktop',
        reporter,
        headerID
      )

      if (desktopLogoRef) {
        headerDoc.logo.desktop = desktopLogoRef
        log(`  📷 Desktop Logo: ${data.logo.desktop} -> ${desktopLogoRef.asset._ref}`)
      } else {
        log(`  ⚠️  Desktop logo not found in assets: ${data.logo.desktop}`)
      }
    } else {
      reporter.recordWarning(headerID, 'No desktop logo provided')
    }

    // Handle mobile logo image
    if (data?.logo?.mobile && data.logo.mobile.trim() !== '') {
      const mobileLogoRef = convertImageReference(
        data.logo.mobile,
        assetMapping,
        data.logo.alt || 'Odysway Logo Mobile',
        reporter,
        headerID
      )

      if (mobileLogoRef) {
        headerDoc.logo.mobile = mobileLogoRef
        log(`  📷 Mobile Logo: ${data.logo.mobile} -> ${mobileLogoRef.asset._ref}`)
      } else {
        log(`  ⚠️  Mobile logo not found in assets: ${data.logo.mobile}`)
      }
    } else {
      reporter.recordWarning(headerID, 'No mobile logo provided')
    }

    // Create the document in Sanity
    await client.createOrReplace(headerDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated header configuration (ID: ${headerID})`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during header migration:', err.message);
    reporter.recordFailure('migration', err.message) 
    reporter.finish()
    process.exit(1)
  }
}
