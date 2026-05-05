import {defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'

import {assist} from '@sanity/assist'
import {structureTool} from 'sanity/structure'

import {schemaTypes} from './schemaTypes'
import {media} from 'sanity-plugin-media'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {colorInput} from '@sanity/color-input'
// import {embeddingsIndexReferenceInput, embeddingsIndexDashboard} from '@sanity/embeddings-index-ui'



export default defineConfig({
  name: 'default',
  title: 'Odysway',
  projectId: 'nu6yntji',
  dataset: 'production',
  mediaLibrary: {
    enabled: true,
  },
  plugins: [
    presentationTool({
      previewUrl: {
        origin: process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'https://localhost:3000',
        initial: process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'https://localhost:3000',
        preview: '/',
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      }
    }),
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Contenu Odysway')
          .items([
            S.listItem()
              .title('Voyages')
              .icon(() => '🛫')
              .child(
                S.list()
                  .title('Voyages')
                  .items([
                    S.listItem()
                    .title('Voyages en ligne')
                    .icon(() => '✓')
                    .child(
                      S.documentList()
                        .title('Voyages en ligne')
                        .apiVersion('v2025-02-19')
                        .filter('_type == "voyage" && ("groupe" in availabilityTypes || "privatisation" in availabilityTypes) && !(_id in path("drafts.**"))')
                    ),
                    orderableDocumentListDeskItem({
                      type: 'voyage',
                      title: 'Voyages triés',
                      icon: () => '🔀',
                      S,
                      context,
                    }),
                    S.divider(),
                    S.documentTypeListItem('voyage').title('Tous les Voyages').icon(() => '✈️'),
                    S.divider(),
                    S.listItem()
                      .title('Voyages by Category')
                      .child(
                        S.documentTypeList('category')
                          .title('Categories')
                          .child((catId) =>
                            S.documentList()
                              .title('Voyages')
                              .apiVersion('v2025-02-19')
                              .filter('_type == "voyage" && references($catId)')
                              .params({catId}),
                          ),
                      ),
                    S.listItem()
                      .title('Voyages by Destination')
                      .child(
                        S.documentTypeList('destination')
                          .title('Destinations')
                          .child((destId) =>
                            S.documentList()
                              .title('Voyages')
                              .apiVersion('v2025-02-19')
                              .filter('_type == "voyage" && references($destId)')
                              .params({destId}),
                          ),
                      ),
                    
                    S.listItem()
                      .title('Voyages by Experience')
                      .child(
                        S.documentTypeList('experience')
                          .title('Experiences')
                          .child((experienceId) =>
                            S.documentList()
                              .title('Voyages')
                              .apiVersion('v2025-02-19')
                              .filter('_type == "voyage" && references($experienceId)')
                              .params({experienceId}),
                          ),
                      ),
                    S.divider(),
                    S.listItem()
                      .title('Voyages en Groupe')
                      .child(
                        S.documentList()
                          .title('Voyages en Groupe')
                          .apiVersion('v2025-02-19')
                          .filter('_type == "voyage" && "groupe" in availabilityTypes')
                      ),
                    S.listItem()
                      .title('Voyages en Privatisation')
                      .child(
                        S.documentList()
                          .title('Voyages en Privatisation')
                          .apiVersion('v2025-02-19')
                          .filter('_type == "voyage" && "privatisation" in availabilityTypes')
                      ),
                    S.listItem()
                      .title('Voyages Sur-Mesure')
                      .child(
                        S.documentList()
                          .title('Voyages Sur-Mesure')
                          .apiVersion('v2025-02-19')
                          .filter('_type == "voyage" && "custom" in availabilityTypes')
                      ),
                  ]),
              ),
            S.divider(),
            S.listItem()
              .title('Blog Posts')
              .icon(() => '📝')
              .child(
                S.list()
                  .title('Blog Posts')
                  .items([
                    S.documentTypeListItem('blog').title('Tous les articles de blog'),
                    S.listItem()
                      .title('Blogs liés à une catégorie/thematique')
                      .child(
                        S.documentList()
                          .title('Blogs liés à une catégorie/thematique')
                          .apiVersion('v2025-02-19')
                          .filter('_type == "blog" && _id in *[_type == "category"].blog._ref'),
                      ),
                    S.listItem()
                      .title('Blogs liés à une destination/region')
                      .child(
                        S.documentList()
                          .title('Blogs liés à une destination')
                          .apiVersion('v2025-02-19')
                          .filter('_type == "blog" && _id in *[_type == "destination" || _type == "region"].blog._ref '),
                      ),
                    S.listItem()
                      .title('Blogs non liés')
                      .icon(() => '⛓️‍💥')
                      .child(
                        S.documentList()
                          .title('Blogs non liés')
                          .apiVersion('v2025-02-19')
                          .filter(
                            '_type == "blog" && !(_id in *[_type == "category"].blog._ref) && !(_id in *[_type == "destination"].blog._ref)',
                          ),
                      ),
                      S.listItem()
                        .title('Toutes les categories de blog')
                        .icon(() => '🔖')
                        .child(
                          S.documentTypeList('blogCategory')
                            .title('Categories de blog')
                        ),
                  ]),
              ),
            S.divider(),
            S.documentTypeListItem('destination').title('Destinations').icon(() => '🌍'),
            S.documentTypeListItem('experience').title('Experiences').icon(() => '🌟'),
            S.documentTypeListItem('category').title('Categories').icon(() => '🔖'),
            S.documentTypeListItem('region').title('Regions').icon(() => '🌍'),
            S.documentTypeListItem('badge').title('Badges').icon(() => '🏅'),
            S.documentTypeListItem('difficultyLevel').title('Niveaux de Difficulté').icon(() => '💪'),
            S.divider(),
            orderableDocumentListDeskItem({
              type: 'teamMember',
              title: 'Team Members',
              icon: () => '👫',
              S,
              context,
            }),
            S.documentTypeListItem('review').title('Reviews').icon(() => '💬'),
            S.divider(),
            S.listItem()
              .title('Textes')
              .icon(() => '🖋️')
              .child(
                S.list()
                  .title('Textes')
                  .items([
                    S.documentTypeListItem('header').title('Header'),
                    S.documentTypeListItem('footer').title('Footer'),
                    S.documentTypeListItem('tops').title('Tops'),
                    S.documentTypeListItem('checkout').title('Checkout'),
                    S.documentTypeListItem('checkoutAlert').title('Checkout Alerte'),
                    S.documentTypeListItem('newsletter').title('Newsletter'),
                    S.documentTypeListItem('ctas').title('CTAs'),
                    S.documentTypeListItem('devis').title('Devis'),
                    S.documentTypeListItem('voyage_card').title('Carte Voyage'),
                   
                  ]),
              ),
            S.listItem()
              .title('Pages')
              .icon(() => '📄')
              .child(
                S.list()
                  .title('Pages')
                  .items([
                    S.documentTypeListItem('homePage').title('Accueil'),
                    S.documentTypeListItem('page_voyage').title('Voyage'),
                    S.documentTypeListItem('page_contact').title('Contact'),
                    S.documentTypeListItem('page_experiences').title('Expériences'),
                    S.documentTypeListItem('page_thematiques').title('Thématiques'),
                    S.documentTypeListItem('page_destinations').title('Destinations'),
                    S.documentTypeListItem('page_prochains_departs').title('Prochains Départs'),
                    S.documentTypeListItem('page_blog').title('Blog'),
                    S.documentTypeListItem('search').title('Recherche'),
                    S.documentTypeListItem('faq').title('FAQ'),
                    S.divider(),
                    S.documentTypeListItem('recruitment').title('Recrutement'),
                    S.documentTypeListItem('chequesVacances').title('Chèques-Vacances'),
                    S.documentTypeListItem('conditionsGeneralesVente').title(
                      'Conditions Générales de Vente',
                    ),
                    S.documentTypeListItem('avisVoyageurs').title('Avis Voyageurs'),
                    S.documentTypeListItem('confirmation').title('Confirmation'),
                    S.documentTypeListItem('offreCadeau').title('Offre Cadeau'),
                    S.documentTypeListItem('surMesure').title('Sur Mesure'),
                    S.documentTypeListItem('visionVoyageOdysway').title('Vision Voyage Odysway'),
                    S.documentTypeListItem('entreprise').title('Entreprise'),
                    S.documentTypeListItem('legalMentions').title('Mentions légales'),
                    S.documentTypeListItem('privacyPolicy').title(
                      'Politique de confidentialité',
                    ),
                  ]),
              ),
            orderableDocumentListDeskItem({
              type: 'tops',
              title: 'Tops',
              icon: () => '★',
              S,
              context,
            }),
            S.divider(),
            S.listItem()
              .title('Assets')
              .icon(() => '📁')
              .child(S.documentTypeList('sanity.imageAsset').title('All Assets')),
          ]),
    }),
    media(),
    colorInput(),
    // embeddingsIndexReferenceInput(),
    assist(),
    // process.env.NODE_ENV === 'development'
    // ? embeddingsIndexDashboard()
    // : {name: 'embeddings-index-dashboard-disabled'}
  ],
  // form: {
  //   components: {
  //     input: (props) => {
  //       if (
  //         props.id === 'root' &&
  //         props.schemaType.type?.name === 'document' &&
  //         props.schemaType.name === 'voyage'
  //       ) {
  //         console.log('props', props)
  //         return RequiredProgress(props as ObjectInputProps)
  //       }
  //       return props.renderDefault(props)
  //     },
  //   },
  // },
  schema: {
    types: schemaTypes,
  },
})
