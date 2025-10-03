import {defineField, defineType} from 'sanity'

export const teamMemberType = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  fields: [
    defineField({name: 'slug', type: 'slug', options: {source: 'name'}}),
    defineField({name: 'name', type: 'string'}),
    defineField({name: 'image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'description', type: 'text'}),
    defineField({name: 'linkedin', type: 'url'}),
    defineField({name: 'position', type: 'string'}),
  ],
})

