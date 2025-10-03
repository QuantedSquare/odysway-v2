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
            S.documentTypeListItem('teamMember').title('Team Members'),
            S.documentTypeListItem('partner').title('Partners'),
            S.documentTypeListItem('review').title('Reviews'),
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
