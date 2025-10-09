import fs from 'node:fs';
import {log, error} from 'node:console'
import process from 'node:process'
import { createId } from './utils/createId.js'
import { MigrationReporter } from './migrationReporter.js'

const devisFilePath = '../content/textes/fr/devis.json'

export default async function migrateDevisPage(client) {
  // Create reporter
  const reporter = new MigrationReporter('devis-page')

  try {
    log(`Starting devis page migration...`)

    // Read devis JSON file
    const data = JSON.parse(fs.readFileSync(devisFilePath, 'utf8'));
    reporter.incrementTotal()

    // Generate a unique ID for the devis document
    const devisID = createId('devis', 'page')
  
    // Prepare the devis document for Sanity
    const devisDoc = {
      _id: devisID,
      _type: 'devis',
      fil_dariane_devis: {
        step_1: data.fil_dariane_devis.step_1,
        step_2: data.fil_dariane_devis.step_2,
        step_3: data.fil_dariane_devis.step_3,
        step_4: data.fil_dariane_devis.step_4,
        step_final_rdv: data.fil_dariane_devis.step_final_rdv
      },
      first_step: {
        title: data.first_step.title,
        option_1: data.first_step.option_1,
        option_2: data.first_step.option_2,
        option_3: data.first_step.option_3
      },
      second_step: {
        title: data.second_step.title,
        sub_1: data.second_step.sub_1,
        sub_2: data.second_step.sub_2,
        sub_3: data.second_step.sub_3,
        option_1: data.second_step.option_1,
        option_2: data.second_step.option_2,
        comment_title: data.second_step.comment_title
      },
      third_step: {
        title: data.third_step.title,
        sub_1: data.third_step.sub_1,
        sub_2: data.third_step.sub_2
      },
      calendly: {
        title: data.calendly.title,
        text: data.calendly.text
      },
      buttons: {
        send_devis_request: data.buttons.send_devis_request,
        take_appointment: data.buttons.take_appointment,
        next: data.buttons.next,
        previous: data.buttons.previous
      },
      form_labels: {
        nb_adults: data.form_labels.nb_adults,
        nb_children: data.form_labels.nb_children,
        select_period: data.form_labels.select_period,
        date_placeholder: data.form_labels.date_placeholder,
        departure_airport_question: data.form_labels.departure_airport_question,
        departure_airport_label: data.form_labels.departure_airport_label,
        firstname: data.form_labels.firstname,
        lastname: data.form_labels.lastname,
        email: data.form_labels.email
      },
      options: {
        yes: data.options.yes,
        no: data.options.no
      }
    }

    // Create the document in Sanity
    await client.createOrReplace(devisDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated devis page configuration (ID: ${devisID})`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during devis page migration:', err.message);
    reporter.recordFailure('migration', err.message) 
    reporter.finish()
    process.exit(1)
  }
}
