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
            S.listItem()
              .title('Blog Posts')
              .child(
                S.list()
                  .title('Blog Posts')
                  .items([
                    S.listItem()
                      .title('All Blog Posts')
                      .child(
                        S.documentList()
                          .title('All Blog Posts')
                          .filter('_type == "blog"')
                      ),
                    S.listItem()
                      .title('Category Blog Posts')
                      .child(
                        S.documentList()
                          .title('Category Blog Posts')
                          .filter('_type == "blog" && _id in *[_type == "category"].blog._ref')
                      ),
                    S.listItem()
                      .title('Destination Blog Posts')
                      .child(
                        S.documentList()
                          .title('Destination Blog Posts')
                          .filter('_type == "blog" && _id in *[_type == "destination"].blog._ref')
                      ),
                    S.listItem()
                      .title('Standalone Blog Posts')
                      .child(
                        S.documentList()
                          .title('Standalone Blog Posts')
                          .filter('_type == "blog" && !(_id in *[_type == "category"].blog._ref) && !(_id in *[_type == "destination"].blog._ref)')
                      ),
                  ]),
              ),
            S.divider(),
            S.documentTypeListItem('destination').title('Destinations'),
            S.documentTypeListItem('experience').title('Experiences'),
            S.documentTypeListItem('category').title('Categories'),
            S.documentTypeListItem('region').title('Regions'),
            S.divider(),
            S.documentTypeListItem('teamMember').title('Team Members'),
            S.documentTypeListItem('partner').title('Partners'),
            S.documentTypeListItem('review').title('Reviews'),
            S.documentTypeListItem('tops').title('Tops'),
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
