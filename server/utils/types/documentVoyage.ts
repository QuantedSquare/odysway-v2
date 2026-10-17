import { z } from 'zod'

// Documents de voyage déposés par l'équipe (Ulysse) pour l'Espace Voyageur.

const types = ['fiche_voyage', 'carnet', 'billet', 'assurance', 'facture', 'autre'] as const
const jour = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

/** Préparation d'un dépôt : la ligne naît non publiée, le fichier suit par URL signée. */
export const depotDocumentSchema = z.object({
  type: z.enum(types),
  titre: z.string().trim().min(1).max(120),
  description: z.string().trim().max(300).nullable().optional(),
  // Portée : tout le départ (absent / null) ou un seul dossier réservé sur ce départ.
  dealId: z.number().int().positive().nullable().optional(),
  reserveTitulaire: z.boolean().optional(),
  disponibleLe: jour.nullable().optional(),
  nomFichier: z.string().trim().min(1).max(255),
  taille: z.number().int().positive().max(20 * 1024 * 1024, 'Fichier trop volumineux (20 Mo au plus).'),
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png'], { message: 'Format refusé : PDF, JPEG ou PNG.' }),
})

/** Modification : titre, visibilité, date de disponibilité, publication. */
export const modificationDocumentSchema = z.object({
  titre: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(300).nullable().optional(),
  reserveTitulaire: z.boolean().optional(),
  disponibleLe: jour.nullable().optional(),
  publie: z.boolean().optional(),
})

export type TypeDepotDocument = z.infer<typeof depotDocumentSchema>
export type TypeModificationDocument = z.infer<typeof modificationDocumentSchema>
