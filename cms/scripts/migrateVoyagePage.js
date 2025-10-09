import fs from 'node:fs';
import {log, error} from 'node:console'
import process from 'node:process'
import { createId } from './utils/createId.js'
import { buildImageAssetMapping, convertImageReference } from './imageAssetHelper.js'
import { MigrationReporter } from './migrationReporter.js'

const voyageFilePath = '../content/textes/fr/voyage.json'

export default async function migrateVoyagePage(client) {
  // Create reporter
  const reporter = new MigrationReporter('voyage-page')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting voyage page migration...`)

    // Read voyage JSON file
    const data = JSON.parse(fs.readFileSync(voyageFilePath, 'utf8'));
    reporter.incrementTotal()

    // Convert image references
    const ctaCallAvatarRef = convertImageReference(data.stickyBlock.ctaCall.avatar, assetMapping)
    const faqAvatarRef = convertImageReference(data.faqSection.avatar, assetMapping)
    
    // Convert icon references in whySection list
    const whySectionListWithIcons = data.whySection.list.map((item, index) => ({
      _key: `why-section-item-${index}`,
      ...item,
      icon: convertImageReference(item.icon, assetMapping)
    }))

    // Generate a unique ID for the voyage document
    const voyageID = createId('voyage', 'page')
  
    // Prepare the voyage document for Sanity
    const voyageDoc = {
      _id: voyageID,
      _type: 'page_voyage',
      shareButton: {
        text: data.shareButton.text,
        icon: data.shareButton.icon
      },
      photoButton: {
        text: data.photoButton.text,
        icon: data.photoButton.icon
      },
      stickyBlock: {
        pricePrefix: data.stickyBlock.pricePrefix,
        priceSuffix: data.stickyBlock.priceSuffix,
        dateText: data.stickyBlock.dateText,
        dateButtonText: data.stickyBlock.dateButtonText,
        ctaCall: {
          text: data.stickyBlock.ctaCall.text,
          avatar: ctaCallAvatarRef,
          to: data.stickyBlock.ctaCall.to
        },
        ctaBottom: {
          list: data.stickyBlock.ctaBottom.list
        },
        privatisationText: data.stickyBlock.privatisationText
      },
      authorNote: {
        title: data.authorNote.title
      },
      experiencesBlock: {
        title: data.experiencesBlock.title,
        icon: data.experiencesBlock.icon,
        iconColor: data.experiencesBlock.iconColor,
        backgroundColor: data.experiencesBlock.backgroundColor
      },
      programmeBlock: {
        title: data.programmeBlock.title,
        badgeColor: data.programmeBlock.badgeColor
      },
      accompanistsTitle: data.accompanistsTitle,
      housingTitle: data.housingTitle,
      housingTypeTitle: data.housingTypeTitle,
      housingMoodTitle: data.housingMoodTitle,
      dateSections: {
        title: data.dateSections.title,
        pricePrefix: data.dateSections.pricePrefix,
        priceSuffix: data.dateSections.priceSuffix,
        bookingButtonText: data.dateSections.bookingButtonText,
        bookingButtonColor: data.dateSections.bookingButtonColor,
        optionButtonText: data.dateSections.optionButtonText,
        optionButtonColor: data.dateSections.optionButtonColor,
        disabledButtonText: data.dateSections.disabledButtonText,
        disabledButtonColor: data.dateSections.disabledButtonColor,
        ctaList: {
          list: data.dateSections.ctaList.list
        },
        status: {
          partiallyBooked: {
            title: data.dateSections.status.partiallyBooked.title,
            text: data.dateSections.status.partiallyBooked.text,
            color: data.dateSections.status.partiallyBooked.color
          },
          fullyBooked: {
            title: data.dateSections.status.fullyBooked.title,
            text: data.dateSections.status.fullyBooked.text,
            color: data.dateSections.status.fullyBooked.color
          },
          open: {
            title: data.dateSections.status.open.title,
            text: data.dateSections.status.open.text,
            color: data.dateSections.status.open.color
          }
        }
      },
      indivSection: {
        titleOnlyPrivatisationAvailable: data.indivSection.titleOnlyPrivatisationAvailable,
        title: data.indivSection.title,
        backgroundColor: data.indivSection.backgroundColor,
        textButton: data.indivSection.textButton,
        textButtonDevis: data.indivSection.textButtonDevis,
        buttonColor: data.indivSection.buttonColor
      },
      priceDetailsSection: {
        title: data.priceDetailsSection.title,
        priceInclude: data.priceDetailsSection.priceInclude,
        colorInclude: data.priceDetailsSection.colorInclude,
        priceExclude: data.priceDetailsSection.priceExclude,
        colorExclude: data.priceDetailsSection.colorExclude
      },
      reviewsSection: {
        title: data.reviewsSection.title,
        ratingColor: data.reviewsSection.ratingColor
      },
      faqSection: {
        title: data.faqSection.title,
        backgroundColor: data.faqSection.backgroundColor,
        textButton: data.faqSection.textButton,
        buttonColor: data.faqSection.buttonColor,
        to: data.faqSection.to,
        avatar: faqAvatarRef,
        subtitle: data.faqSection.subtitle,
        description: data.faqSection.description
      },
      whySection: {
        title: data.whySection.title,
        backgroundColor: data.whySection.backgroundColor,
        itemBackgroundColor: data.whySection.itemBackgroundColor,
        list: whySectionListWithIcons
      },
      otherIdeas: data.otherIdeas,
      pageNotFound: {
        description: data.pageNotFound.description,
        buttonText: data.pageNotFound.buttonText,
        buttonTo: data.pageNotFound.buttonTo
      }
    }

    // Create the document in Sanity
    await client.createOrReplace(voyageDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated voyage page configuration (ID: ${voyageID})`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during voyage page migration:', err.message);
    reporter.recordFailure('migration', err.message) 
    reporter.finish()
    process.exit(1)
  }
}
