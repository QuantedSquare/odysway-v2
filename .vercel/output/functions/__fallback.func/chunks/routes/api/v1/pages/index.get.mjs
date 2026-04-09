import { a as defineEventHandler, c as createError } from '../../../../nitro/nitro.mjs';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'algoliasearch';
import '@sanity/client';
import 'axios';
import 'jsonwebtoken';
import 'dayjs';
import '@supabase/supabase-js';
import 'stripe';
import 'crypto';
import 'zod';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'fast-xml-parser';
import 'node:url';
import 'ipx';

var devis_rdv_text = "<p>Merci de votre confiance ! L'aventure peut commencer ! Si vous le souhaitez, vous avez la possibilité de prendre un rendez-vous téléphonique avec l'un de nos conseillers. Nous répondrons à toutes vos questions sur le voyage.</p>";
var fil_dariane_devis = {
	step_1: "Votre voyage",
	step_2: "Détails",
	step_3: "Voyageurs",
	step_final_rdv: "Rendez-vous"
};
var first_step = {
	title: "Où en êtes vous dans la préparation de ce voyage ?",
	option_1: "Je souhaite poser une option / réserver ce voyage",
	option_2: "Poser une option sur ce voyage",
	option_3: "Je souhaite prendre un rendez-vous avec un conseiller voyage",
	option_4: "Je ne sais pas encore"
};
var calendly = "Merci de votre confiance ! L'aventure peut commencer ! Si vous le souhaitez, vous avez la possibilité de prendre un rendez-vous téléphonique avec l'un de nos conseillers. Nous répondrons à toutes vos questions sur le voyage.";
var room_indiv_title = "Souhaitez-vous une chambre individuelle ?";
var food_details_title = "Avez-vous des demandes particulières ou des besoins spécifiques ?";
var room_indiv_accroche = "Si vous partez seul, vous ne partagerez pas votre chambre avec d'autres voyageurs.";
var room_indiv_text = "Si vous partez seul et que vous ne sélectionnez pas cette option, vous pourrez partager votre chambre avec un autre voyageur du même sexe.";
var assurance_img = "/images/default/chapka.png";
var preference_assurance_multirisque = "Assurance Multirisque";
var accroche_assurance_perou_nepal = "accroche_assurance_perou_nepal";
var details_assurance_medicale_perou_nepal = "details_assurance_medicale_perou_nepal";
var details_assurance_medicale = "details_assurance_medicale";
var preference_assurance_annulation = "Assurance Annulation";
var accroche_assurance_annulation = "<div>\n        <ul>\n          <li style=\"color: #34495e;\"><span style=\"color: #34495e;\">Vous couvre avant, pendant et après votre voyage</span></li>\n          <li style=\"color: #34495e;\"><span style=\"color: #34495e;\">Annulation pour toutes causes justifiées (événement extérieur, soudain, justifié et indépendant de votre volonté)</span></li>\n          <li style=\"color: #34495e;\"><span style=\"color: #34495e;\">Frais médicaux et hospitalisation</span></li>\n          <li style=\"color: #34495e;\"><span style=\"color: #34495e;\">Vol de bagages</span></li>\n          <li style=\"color: #34495e;\"><span style=\"color: #34495e;\">Téléconsultation gratuite</span></li>\n        </ul>\n      </div>";
var accroche_assurance_medicale = "<div>\n        <ul>\n          <li style=\"color: #34495e;\"><span style=\"color: #34495e;\">Vous couvre avant, pendant et après votre voyage</span></li>\n          <li style=\"color: #34495e;\"><span style=\"color: #34495e;\">Annulation pour toutes causes justifiées (événement extérieur, soudain, justifié et indépendant de votre volonté)</span></li>\n          <li style=\"color: #34495e;\"><span style=\"color: #34495e;\">Frais médicaux et hospitalisation</span></li>\n          <li style=\"color: #34495e;\"><span style=\"color: #34495e;\">Vol de bagages</span></li>\n          <li style=\"color: #34495e;\"><span style=\"color: #34495e;\">Téléconsultation gratuite</span></li>\n        </ul>\n      </div>";
var details_assurance_annulation = "details_assurance_annulation";
var insurances_unavailable = "insurances_unavailable";
var phrase_dacceptation = "<p>J'ai lu et j'accepte la <a href=\"/politique-de-confidentialite\" title=\"Politique de confidentialité\" rel=\"follow noopener\" target=\"_blank\">politique d'utilisation des données</a>, les <a href=\"/conditions-generales-de-vente\" rel=\"follow noopener\" target=\"_blank\">conditions générales de ventes</a>, les <a href=\"/pdfs/conditions generales chapka.pdf\" target=\"_blank\">conditions générales d'assurance</a> et la <a href=\"/pdfs/fiche information.pdf\" target=\"_blank\">fiche d'information</a>. </p>";
var forced_indiv_room_text = "Texte chambre individuelle forcée";
var cancel_text = "Vous pouvez annuler gratuitement jusqu'à 30 jours avant le départ. Vous serez remboursé sous 7 jours (sans aucun frais retenu).";
var details = {
	select_travelers_title: "Sélectionnez le nombre de voyageurs à régler",
	nb_travelers_title: "Nombre de voyageurs",
	nb_adults_label: "Nombre d'adultes",
	nb_children_label: "Nombre d'enfants (0-{{maxAge}} ans)",
	contact_title: "Vos coordonnées",
	firstname_label: "Prénom *",
	lastname_label: "Nom *",
	email_label: "Email *",
	firstname_placeholder: "Ex: Indiana",
	lastname_placeholder: "Ex: Jones",
	email_placeholder: "Ex: indiana@jones.com",
	newsletter_text: "Je souhaite recevoir des inspirations et des idées pour voyager autrement...",
	newsletter_label: "S'inscrire à la Newsletter"
};
var travelers_infos = {
	title: "Informations voyageurs",
	alert: "Les informations ci-dessous doivent être identiques à celles qui sont écrites sur les documents d'identité utilisés pour ce voyage.",
	all_fields_required: "Tous les champs doivent être remplis pour chaque voyageur.",
	age_validation: "Les voyageurs âgés de {{maxAge}} ans au moment du départ sont considérés comme des adultes.",
	preference_couple: "Je voyage en couple"
};
var options = {
	indiv_room_label: "Je souhaite bénéficier d'une chambre individuelle",
	food_prefs_label: "Régimes alimentaires spécifiques",
	vege_label: "Régimes alimentaires spécifiques",
	vege_sub_label: "Végétarien, Végan, Allergies...",
	other_food_label: "Autres demandes particulières",
	special_request_label: "Précisez..."
};
var insurances = {
	title: "Garanties avec",
	no_insurance_label: "Je ne souhaite pas d'assurance",
	alert: "Assurance applicable à tous les voyageurs. Le calcul du prix de votre voyage se fera à la prochaine étape.",
	unavailable: "L'assurance n'est pas disponible pour votre voyage.",
	conseille_badge: "Conseillé"
};
var summary = {
	dates_confirmed: "Dates confirmées",
	base_price: "Prix de base par voyageur",
	extension_price: "Prix extension voyage",
	travelers_details: "Détails Voyageurs(s)",
	total_discount: "Réduction totale appliquée",
	already_paid: "Montant déjà réglé",
	total_price: "Prix total",
	deposit_due: "Accompte à régler",
	balance_due: "Solde à régler",
	amount_due: "Montant à régler",
	already_paid_full: "Le voyage est déjà entièrement réglé",
	full_payment_required: "Le départ du voyage a lieu dans moins de 30 jours, nous vous demandons de régler l'intégralité de la somme, sans acompte.",
	cancel_text: "Vous pouvez annuler gratuitement jusqu'à 30 jours avant le départ. Vous serez remboursé sous 7 jours (sans aucun frais retenu).",
	forced_indiv_room_text: "Texte chambre individuelle forcée",
	options_title: "Options",
	early_bird_badge: "EarlyBird: -",
	last_minute_badge: "LastMinute: -",
	traveler_text: {
		adult: {
			single: "Voyageur Adulte",
			multiple: "Voyageurs Adultes"
		},
		child: {
			single: "Voyageur Adolescent",
			multiple: "Voyageurs Adolescents"
		},
		baby: {
			single: "Voyageur Enfant",
			multiple: "Voyageurs Enfants"
		},
		indivRoom: {
			single: "Chambre Individuelle",
			multiple: "Chambres Individuelles"
		},
		insurance: {
			single: "Assurance ",
			multiple: "Assurance "
		}
	}
};
var dialogs = {
	learn_more_btn: "EN SAVOIR PLUS",
	learn_more_title: "En savoir plus"
};
var payment = {
	ask_for_option_text: "Souhaitez-vous poser une option gratuitement ? (Celle-ci est valable 7 jours).",
	accept_country_conditions_text: "Je me suis renseigné sur les conditions d'entrée dans le pays où s'effectue le voyage",
	option_already_placed_error: "Vous avez déjà posé une option pour cette date.",
	place_option_button: "Poser une option gratuitement",
	pay_button: "Payer"
};
const page = {
	devis_rdv_text: devis_rdv_text,
	fil_dariane_devis: fil_dariane_devis,
	first_step: first_step,
	calendly: calendly,
	room_indiv_title: room_indiv_title,
	food_details_title: food_details_title,
	room_indiv_accroche: room_indiv_accroche,
	room_indiv_text: room_indiv_text,
	assurance_img: assurance_img,
	preference_assurance_multirisque: preference_assurance_multirisque,
	accroche_assurance_perou_nepal: accroche_assurance_perou_nepal,
	details_assurance_medicale_perou_nepal: details_assurance_medicale_perou_nepal,
	details_assurance_medicale: details_assurance_medicale,
	preference_assurance_annulation: preference_assurance_annulation,
	accroche_assurance_annulation: accroche_assurance_annulation,
	accroche_assurance_medicale: accroche_assurance_medicale,
	details_assurance_annulation: details_assurance_annulation,
	insurances_unavailable: insurances_unavailable,
	phrase_dacceptation: phrase_dacceptation,
	forced_indiv_room_text: forced_indiv_room_text,
	cancel_text: cancel_text,
	details: details,
	travelers_infos: travelers_infos,
	options: options,
	insurances: insurances,
	summary: summary,
	dialogs: dialogs,
	payment: payment
};

const index_get = defineEventHandler((event) => {
  const slug = event.context.params.slug;
  const foundPage = page.find((i) => i.slug === slug);
  try {
    if (!slug) {
      throw createError({
        statusCode: 404,
        message: "No Page found"
      });
    }
    return {
      ...foundPage.fields
    };
  } catch (err) {
    console.log("Error getting one travel", err, page);
    throw createError({
      statusCode: 400,
      statusMessage: "Error getting one travel",
      err
    });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
