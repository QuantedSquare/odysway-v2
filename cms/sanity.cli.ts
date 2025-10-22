import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'nu6yntji',
    dataset: 'production'
  },
  // app:{
  //   organizationId:"oISUUvkPA",
  //   id:"ige2ef30k425yky1yxshkzef",
  // },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
