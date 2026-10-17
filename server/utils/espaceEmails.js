// Emails de l'Espace Voyageur envoyés par Brevo (les codes de connexion, eux,
// partent de Supabase Auth avec ses propres modèles).
//
// PUR : construit le sujet et le HTML, n'envoie rien. Toute valeur saisie par
// un client passe par `echapper` — un prénom peut contenir du HTML.

const echapper = s => String(s ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const cadre = contenu => `<!doctype html><html lang="fr"><body style="margin:0;background:#F1F4F4;font-family:Arial,sans-serif;color:#2B4C52">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:18px;padding:32px">
<tr><td style="font-size:22px;font-weight:700;padding-bottom:20px">odysway<span style="color:#DB6644">.</span></td></tr>
<tr><td style="font-size:15px;line-height:1.6">${contenu}</td></tr>
</table>
<p style="font-size:12px;color:#8A9BA0;margin-top:16px">Odysway · +33 1 84 80 79 75</p>
</td></tr></table></body></html>`

/** Code pour rattacher une autre adresse au compte. */
const codeRattachement = ({ code }) => ({
  subject: `${code} — votre code Odysway`,
  html: cadre(`<p>Bonjour,</p>
<p>Pour rattacher cette adresse à votre Espace Voyageur Odysway, saisissez ce code :</p>
<p style="font-size:30px;font-weight:700;letter-spacing:6px;margin:24px 0">${echapper(code)}</p>
<p>Il est valable 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message : rien ne sera rattaché.</p>`),
})

/** Invitation d'un voyageur par le titulaire du dossier. */
const invitationVoyageur = ({ prenomInvite, prenomTitulaire, voyage, lien }) => ({
  subject: `${prenomTitulaire ? `${prenomTitulaire} vous invite` : 'Vous êtes invité'} sur l'Espace Voyageur Odysway`,
  html: cadre(`<p>Bonjour${prenomInvite ? ` ${echapper(prenomInvite)}` : ''},</p>
<p>${prenomTitulaire ? echapper(prenomTitulaire) : 'Le titulaire du dossier'} vous a ajouté${voyage ? ` au voyage <b>${echapper(voyage)}</b>` : ' à son voyage'}.</p>
<p>Dans votre Espace Voyageur, vous retrouverez le programme, les documents et la liste du groupe. Connectez-vous avec cette adresse email : aucun mot de passe, un code vous sera envoyé.</p>
<p style="margin:28px 0"><a href="${echapper(lien)}" style="background:#DB6644;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600">Ouvrir mon espace</a></p>`),
})

/**
 * Un document de voyage vient d'être publié. Le lien ouvre l'espace (avec
 * connexion par code) : ni jeton ni adresse dans l'URL, un email transféré
 * n'ouvre rien.
 */
const nouveauDocument = ({ prenom, titreDocument, titreVoyage, lien }) => ({
  subject: `${titreDocument}${titreVoyage ? ` — ${titreVoyage}` : ''} : disponible dans votre espace`,
  html: cadre(`<p>Bonjour${prenom ? ` ${echapper(prenom)}` : ''},</p>
<p>Un nouveau document vous attend dans votre Espace Voyageur${titreVoyage ? `, pour votre voyage <b>${echapper(titreVoyage)}</b>` : ''} :</p>
<p style="font-size:17px;font-weight:700;margin:20px 0">${echapper(titreDocument)}</p>
<p>Connectez-vous avec l'adresse email de votre réservation : aucun mot de passe n'est nécessaire, un code vous sera envoyé.</p>
<p style="margin:28px 0"><a href="${echapper(lien)}" style="background:#DB6644;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600">Voir mes documents</a></p>
<p style="font-size:13px;color:#5C7378">Tous vos documents de voyage sont réunis dans votre espace : nous ne les envoyons plus en pièce jointe.</p>`),
})

export default { echapper, codeRattachement, invitationVoyageur, nouveauDocument }
