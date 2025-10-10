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
    defineField({name: 'slug', type: 'slug', options: {source: 'name'}}),
    defineField({name: 'image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'description', type: 'text'}),
    defineField({name: 'linkedin', type: 'url'}),
    defineField({name: 'position', type: 'string'}),
  ],
})

