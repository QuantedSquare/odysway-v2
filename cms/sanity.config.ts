import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {media} from 'sanity-plugin-media'

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
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Voyages')
              .child(
                S.list()
                  .title('Voyages')
                  .items([
                    S.documentTypeListItem('voyage').title('All Voyages'),
                    S.listItem()
                      .title('Voyages by Category')
                      .child(
                        S.documentTypeList('category')
                          .title('Categories')
                          .child((catId) =>
                            S.documentList()
                              .title('Voyages')
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
                              .filter('_type == "voyage" && references($destId)')
                              .params({destId}),
                          ),
                      ),
                  ]),
              ),
            S.divider(),
            S.documentTypeListItem('destination').title('Destinations'),
            S.documentTypeListItem('experience').title('Experiences'),
            S.documentTypeListItem('category').title('Categories'),
            S.documentTypeListItem('region').title('Regions'),
            S.divider(),
            S.documentTypeListItem('post').title('Posts'),
            S.documentTypeListItem('user').title('Users'),
            S.documentTypeListItem('review').title('Reviews'),
            S.divider(),
            S.documentTypeListItem('teamMember').title('Team Members'),
            S.listItem()
            .title('Textes')
            .icon(() => '📝')
            .child(
              S.list()
              .title('Textes')
              .items([
                S.documentTypeListItem('header').title('Header'),
                S.documentTypeListItem('footer').title('Footer'),
                S.documentTypeListItem('tops').title('Tops'),
                S.documentTypeListItem('partner').title('Partners'),
                 S.documentTypeListItem('page_blog').title('Page Blog'),
                 S.documentTypeListItem('checkout').title('Checkout'),
                 S.documentTypeListItem('page_contact').title('Page Contact'),
                 S.documentTypeListItem('page_experiences').title('Page Expériences'),
                 S.documentTypeListItem('ctas').title('CTAs'),
                 S.documentTypeListItem('devis').title('Devis'),
                     // S.documentTypeListItem('page_voyage_fr').title('Page Voyage'),
                    // S.documentTypeListItem('page_search').title('Page Recherche'),
                    // S.documentTypeListItem('page_contact').title('Page Contact'),
                    // S.documentTypeListItem('page_experiences').title('Page Expériences'),
                    // S.documentTypeListItem('page_thematiques').title('Page Thématiques'),
                    // S.documentTypeListItem('ctas').title('CTAs'),
                    // S.documentTypeListItem('checkout').title('Checkout'),
                    // S.documentTypeListItem('devis').title('Devis'),
                    // S.documentTypeListItem('search_field').title('Champ de Recherche'),
                    // S.documentTypeListItem('voyage_card').title('Carte Voyage'),
                    // S.documentTypeListItem('newsletter').title('Newsletter'),
                  ]),
              ),
            S.divider(),
            S.listItem()
              .title('Assets')
              .icon(() => '📁')
              .child(S.documentTypeList('sanity.imageAsset').title('All Assets')),
          ]),
    }),
    media(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
