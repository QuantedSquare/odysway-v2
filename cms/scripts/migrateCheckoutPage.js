import fs from 'node:fs';
import {log, error} from 'node:console'
import path from 'node:path'
import process from 'node:process'
import { createId } from './utils/createId.js'
import { buildImageAssetMapping, convertImageReference } from './imageAssetHelper.js'
import { MigrationReporter } from './migrationReporter.js'

const checkoutFilePath = '../content/textes/fr/checkout.json'

export default async function migrateCheckoutPage(client) {
  // Create reporter
  const reporter = new MigrationReporter('checkout-page')

  // Build image asset mapping once at the start
  const assetMapping = await buildImageAssetMapping(client)

  try {
    log(`Starting checkout page migration...`)

    // Read checkout JSON file
    const data = JSON.parse(fs.readFileSync(checkoutFilePath, 'utf8'));
    reporter.incrementTotal()

    // Generate a unique ID for the checkout document
    const checkoutID = createId('checkout', 'page')
  
    // Prepare the checkout document for Sanity
    const checkoutDoc = {
      _id: checkoutID,
      _type: 'checkout',
      fil_dariane_devis: {
        step_1: data.fil_dariane_devis.step_1,
        step_2: data.fil_dariane_devis.step_2,
        step_3: data.fil_dariane_devis.step_3,
        step_final_rdv: data.fil_dariane_devis.step_final_rdv
      },
      first_step: {
        title: data.first_step.title,
        option_1: data.first_step.option_1,
        option_2: data.first_step.option_2,
        option_3: data.first_step.option_3
      },
      calendly: data.calendly,
      room_indiv_accroche: data.room_indiv_accroche,
      room_indiv_text: data.room_indiv_text,
      forced_indiv_room_text: data.forced_indiv_room_text || '',
      cancel_text: data.cancel_text,
      details: {
        select_travelers_title: data.details.select_travelers_title,
        nb_travelers_title: data.details.nb_travelers_title,
        nb_adults_label: data.details.nb_adults_label,
        nb_children_label: data.details.nb_children_label,
        contact_title: data.details.contact_title,
        firstname_label: data.details.firstname_label,
        lastname_label: data.details.lastname_label,
        email_label: data.details.email_label,
        firstname_placeholder: data.details.firstname_placeholder,
        lastname_placeholder: data.details.lastname_placeholder,
        email_placeholder: data.details.email_placeholder,
        newsletter_text: data.details.newsletter_text,
        newsletter_label: data.details.newsletter_label
      },
      travelers_infos: {
        title: data.travelers_infos.title,
        alert: data.travelers_infos.alert,
        all_fields_required: data.travelers_infos.all_fields_required,
        age_validation: data.travelers_infos.age_validation,
        preference_couple: data.travelers_infos.preference_couple
      },
      options: {
        room_indiv_title: data.options.room_indiv_title,
        indiv_room_label: data.options.indiv_room_label,
        food_details_title: data.options.food_details_title,
        food_prefs_label: data.options.food_prefs_label,
        vege_label: data.options.vege_label,
        vege_sub_label: data.options.vege_sub_label,
        other_food_label: data.options.other_food_label,
        special_request_label: data.options.special_request_label
      },
      insurances: {
        title: data.insurances.title,
        no_insurance_label: data.insurances.no_insurance_label,
        alert: data.insurances.alert,
        unavailable: data.insurances.unavailable,
        conseille_badge: data.insurances.conseille_badge,
        assurance_img: data.insurances.assurance_img,
        preference_assurance_multirisque: data.insurances.preference_assurance_multirisque,
        accroche_assurance_perou_nepal: data.insurances.accroche_assurance_perou_nepal || '',
        details_assurance_medicale_perou_nepal: data.insurances.details_assurance_medicale_perou_nepal || '',
        details_assurance_medicale: data.insurances.details_assurance_medicale || '',
        preference_assurance_annulation: data.insurances.preference_assurance_annulation,
        accroche_assurance_annulation: data.insurances.accroche_assurance_annulation || '',
        accroche_assurance_medicale: data.insurances.accroche_assurance_medicale || '',
        details_assurance_annulation: data.insurances.details_assurance_annulation || '',
        insurances_unavailable: data.insurances.insurances_unavailable || ''
      },
      summary: {
        dates_confirmed: data.summary.dates_confirmed,
        base_price: data.summary.base_price,
        extension_price: data.summary.extension_price,
        travelers_details: data.summary.travelers_details,
        total_discount: data.summary.total_discount,
        already_paid: data.summary.already_paid,
        total_price: data.summary.total_price,
        deposit_due: data.summary.deposit_due,
        balance_due: data.summary.balance_due,
        amount_due: data.summary.amount_due,
        already_paid_full: data.summary.already_paid_full,
        full_payment_required: data.summary.full_payment_required,
        cancel_text: data.summary.cancel_text,
        forced_indiv_room_text: data.summary.forced_indiv_room_text || '',
        options_title: data.summary.options_title,
        early_bird_badge: data.summary.early_bird_badge,
        last_minute_badge: data.summary.last_minute_badge
      },
      dialogs: {
        learn_more_btn: data.dialogs.learn_more_btn,
        learn_more_title: data.dialogs.learn_more_title
      },
      payment: {
        phrase_dacceptation: data.payment.phrase_dacceptation,
        ask_for_option_text: data.payment.ask_for_option_text,
        accept_country_conditions_text: data.payment.accept_country_conditions_text,
        option_already_placed_error: data.payment.option_already_placed_error,
        place_option_button: data.payment.place_option_button,
        pay_stripe_button: data.payment.pay_stripe_button,
        pay_alma_button: data.payment.pay_alma_button,
        alma_payment_info: data.payment.alma_payment_info
      },
      navigation: {
        next_button: data.navigation.next_button,
        prev_button: data.navigation.prev_button
      }
    }
    
    // Handle assurance image if it exists
    if (data?.insurances?.assurance_img && data.insurances.assurance_img.trim() !== '') {
      const assuranceImageRef = convertImageReference(
        data.insurances.assurance_img,
        assetMapping,
        'Assurance Image',
        reporter,
        checkoutID
      )

      if (assuranceImageRef) {
        checkoutDoc.insurances.assurance_img = assuranceImageRef
        log(`  📷 Assurance Image: ${data.insurances.assurance_img} -> ${assuranceImageRef.asset._ref}`)
      } else {
        log(`  ⚠️  Assurance image not found in assets: ${data.insurances.assurance_img}`)
      }
    } else {
      reporter.recordWarning(checkoutID, 'No assurance image provided')
    }

    // Create the document in Sanity
    await client.createOrReplace(checkoutDoc)
    reporter.recordSuccess()
    log(`✅ Successfully migrated checkout page configuration (ID: ${checkoutID})`)

    // Generate and save report
    reporter.finish()

  } catch (err) {
    error('Error during checkout page migration:', err.message);
    reporter.recordFailure('migration', err.message) 
    reporter.finish()
    process.exit(1)
  }
}
