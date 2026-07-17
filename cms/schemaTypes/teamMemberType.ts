import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

export const teamMemberType = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({type: 'teamMember'}),
    defineField({name: 'name', type: 'string'}),
    // LEGACY #
    defineField({name: 'slug', type: 'slug', options: {source: 'name'}, hidden: true}),
    defineField({name: 'image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'description', type: 'text'}),
    // LEGACY #
    defineField({name: 'linkedin', type: 'url', hidden: true}),
    defineField({name: 'position', type: 'string'}),
    defineField({
      name: 'visibleOnHomepage',
      title: 'Visible sur la homepage',
      type: 'boolean',
      description: 'Afficher ce membre dans la rangée d\'avatars de la home',
      initialValue: true,
    }),
  ],
})

