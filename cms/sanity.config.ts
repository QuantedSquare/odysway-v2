import {defineConfig, isObjectInputProps, ObjectInputProps} from 'sanity'
import {Stack} from '@sanity/ui'
import { RequiredProgress } from './schemaTypes/components/RequiredProgress'
import {structureTool} from 'sanity/structure'

import {schemaTypes} from './schemaTypes'
import {media, mediaAssetSource} from 'sanity-plugin-media'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'
import {colorInput} from '@sanity/color-input'



export default defineConfig({
  name: 'default',
  title: 'Odysway',

  projectId: 'nu6yntji',
  dataset: 'production',
  mediaLibrary: {
    enabled: true,
  },
  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Voyages')
              .child(
                S.list()
                  .title('Voyages')
                  .items([
                    S.documentTypeListItem('voyage').title('Tous les Voyages'),
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
              .child(
                S.list()
                  .title('Blog Posts')
                  .items([
                    orderableDocumentListDeskItem({
                      type: 'blog',
                      title: 'All Blog Posts',
                      S,
                      context,
                    }),
                    S.listItem()
                      .title('Category Blog Posts')
                      .child(
                        S.documentList()
                          .title('Category Blog Posts')
                          .apiVersion('v2025-02-19')
                          .filter('_type == "blog" && _id in *[_type == "category"].blog._ref'),
                      ),
                    S.listItem()
                      .title('Destination Blog Posts')
                      .child(
                        S.documentList()
                          .title('Destination Blog Posts')
                          .apiVersion('v2025-02-19')
                          .filter('_type == "blog" && _id in *[_type == "destination"].blog._ref'),
                      ),
                    S.listItem()
                      .title('Standalone Blog Posts')
                      .child(
                        S.documentList()
                          .title('Standalone Blog Posts')
                          .apiVersion('v2025-02-19')
                          .filter(
                            '_type == "blog" && !(_id in *[_type == "category"].blog._ref) && !(_id in *[_type == "destination"].blog._ref)',
                          ),
                      ),
                  ]),
              ),
            S.divider(),
            S.documentTypeListItem('destination').title('Destinations'),
            S.documentTypeListItem('experience').title('Experiences'),
            S.documentTypeListItem('category').title('Categories'),
            S.documentTypeListItem('region').title('Regions'),
            S.documentTypeListItem('badge').title('Badges'),
            S.documentTypeListItem('difficultyLevel').title('Niveaux de Difficulté'),
            S.divider(),
            orderableDocumentListDeskItem({
              type: 'teamMember',
              title: 'Team Members',
              icon: () => '👫',
              S,
              context,
            }),
            S.documentTypeListItem('review').title('Reviews'),
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
    colorInput()
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
