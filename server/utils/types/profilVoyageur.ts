import { z } from 'zod'

// Formulaire du profil voyageur de l'Espace Voyageur.
//
// `pieceNumero` absent = numéro inchangé (le navigateur ne le connaît jamais :
// il ne reçoit que les 4 derniers caractères) ; `null` = numéro effacé.

const texte = (max: number) => z.string().trim().max(max).nullable().optional()
  .transform(v => (v ? v : null))

export const profilVoyageurSchema = z.object({
  pieceType: z.enum(['passeport', 'carte_identite']).nullable().optional(),
  pieceNumero: z.string().max(40).nullable().optional(),
  pieceExpiration: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional()
    .or(z.literal('').transform(() => null)),
  piecePays: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/).nullable().optional()
    .or(z.literal('').transform(() => null)),
  regimes: z.array(z.string().max(30)).max(10).optional().default([]),
  allergies: texte(500),
  urgenceNom: texte(120),
  urgenceLien: texte(60),
  urgenceTelephone: texte(40),
  notes: texte(2000),
})

export type TypeProfilVoyageur = z.infer<typeof profilVoyageurSchema>
