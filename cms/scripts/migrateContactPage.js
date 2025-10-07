import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import { createId } from './utils/createId.js'
import { buildImageAssetMapping, convertImageReference } from './imageAssetHelper.js'
import { MigrationReporter } from './migrationReporter.js'

const contactFilePath = '../content/textes/fr/contact.json'

export default async function migrateContactPage(client) {
  // Create reporter
  const reporter = new MigrationReporter('contact-page')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting contact page migration...`)

    // Read contact JSON file
    const data = JSON.parse(fs.readFileSync(contactFilePath, 'utf8'));
    reporter.incrementTotal()

    // Generate a unique ID for the contact document
    const contactID = createId('page_contact', 'page')
  
    // Prepare the contact document for Sanity
    const contactDoc = {
      _id: contactID,
      _type: 'page_contact',
      formTitle: data.formTitle,
      heroSection: {
        title: data.heroSection.title,
        teamImageAlt: data.heroSection.teamImageAlt
      },
      contactForm: {
        fields: {
          civility: {
            label: data.contactForm.fields.civility.label,
            placeholder: data.contactForm.fields.civility.placeholder,
            options: {
              mr: data.contactForm.fields.civility.options.mr,
              mrs: data.contactForm.fields.civility.options.mrs,
              other: data.contactForm.fields.civility.options.other
            }
          },
          lastName: {
            label: data.contactForm.fields.lastName.label,
            placeholder: data.contactForm.fields.lastName.placeholder
          },
          firstName: {
            label: data.contactForm.fields.firstName.label,
            placeholder: data.contactForm.fields.firstName.placeholder
          },
          phone: {
            label: data.contactForm.fields.phone.label
          },
          email: {
            label: data.contactForm.fields.email.label,
            placeholder: data.contactForm.fields.email.placeholder
          },
          subject: {
            label: data.contactForm.fields.subject.label,
            placeholder: data.contactForm.fields.subject.placeholder
          },
          message: {
            label: data.contactForm.fields.message.label,
            placeholder: data.contactForm.fields.message.placeholder
          }
        },
        submitButton: data.contactForm.submitButton,
        formTitle: data.contactForm.formTitle,
        successMessage: data.contactForm.successMessage,
        successDescription: data.contactForm.successDescription
      },
      gdprSection: {
        agreementText: data.contactForm.gdprSection.agreementText,
        privacyLinkText: data.contactForm.gdprSection.privacyLinkText,
        privacyLinkUrl: data.contactForm.gdprSection.privacyLinkUrl,
        agreementSuffix: data.contactForm.gdprSection.agreementSuffix
      },
      validationMessages: {
        civilityRequired: data.contactForm.validationMessages.civilityRequired,
        fieldRequired: data.contactForm.validationMessages.fieldRequired,
        invalidEmail: data.contactForm.validationMessages.invalidEmail,
        minOneCharacter: data.contactForm.validationMessages.minOneCharacter,
        minMessageCharacters: data.contactForm.validationMessages.minMessageCharacters,
        gdprRequired: data.contactForm.validationMessages.gdprRequired
      }
    }

    // Create the document in Sanity
    await client.createOrReplace(contactDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated contact page configuration (ID: ${contactID})`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during contact page migration:', err.message);
    reporter.recordFailure('migration', err.message) 
    reporter.finish()
    process.exit(1)
  }
}
