// Outils du navigateur pour l'Espace porteur (/espace-porteur) : appels à
// l'API, images (réduction avant envoi, URL du CDN Sanity), clés de liste.

const COTE_MAX = 2400
const QUALITE = 0.85

export const useEspacePorteur = () => {
  const config = useRuntimeConfig()

  const api = (chemin, options = {}) => $fetch(`/api/v1/espace-porteur${chemin}`, { credentials: 'include', ...options })

  // « image-<hash>-1920x1080-jpg » → URL du CDN, à la largeur voulue.
  const urlImage = (ref, largeur = 600) => {
    const m = /^image-([a-f0-9]+)-(\d+x\d+)-([a-z0-9]+)$/.exec(ref || '')
    if (!m) return ''
    const { projectId, dataset } = config.public.sanity
    return `https://cdn.sanity.io/images/${projectId}/${dataset}/${m[1]}-${m[2]}.${m[3]}?w=${largeur}&auto=format&fit=max`
  }

  // Une photo de téléphone dépasse vite la limite de requête Vercel (4,5 Mo) :
  // on la réduit à 2400 px de côté et on la réencode en JPEG avant l'envoi.
  const reduire = async (fichier) => {
    const bitmap = await createImageBitmap(fichier)
    const echelle = Math.min(1, COTE_MAX / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * echelle)
    canvas.height = Math.round(bitmap.height * echelle)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close?.()
    return new Promise((resolve, reject) => canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Image illisible'))),
      'image/jpeg',
      QUALITE,
    ))
  }

  /** Envoie une image aux assets Sanity, rend `{ ref, url }`. */
  const envoyerImage = async (fichier) => {
    let blob
    try {
      blob = await reduire(fichier)
    }
    catch {
      throw new Error('Cette image ne peut pas être lue. Essayez une photo en JPEG ou PNG.')
    }
    const form = new FormData()
    form.append('fichier', blob, `${(fichier.name || 'photo').replace(/\.[^.]+$/, '')}.jpg`)
    try {
      return await api('/images', { method: 'POST', body: form })
    }
    catch (err) {
      throw new Error(err?.data?.statusMessage || 'L\'image n\'a pas pu être envoyée. Réessayez.')
    }
  }

  const nouvelleCle = () => Math.random().toString(36).slice(2, 12).replace(/[^a-z0-9]/g, '') || `k${Date.now()}`

  return { api, urlImage, envoyerImage, nouvelleCle }
}
