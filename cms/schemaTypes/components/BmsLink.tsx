import {ObjectInputProps, useFormValue} from 'sanity'
import {Card, Box, Stack, Text, Button} from '@sanity/ui'

const BASE_URL = 'https://odysway.com/booking-management'

export default function BmsLink(props: ObjectInputProps) {
  const slug = useFormValue(['slug', 'current']) as string | undefined
  const isDraft = (props?.renderDefault as any)?.context?.documentId?.startsWith?.('drafts.')
  const url = slug ? `${BASE_URL}/${slug}` : ''

  if (!slug || isDraft) {
    return props.renderDefault(props)
  }

  return (
    <Stack space={3}>
          {/* Text and Button in the same line */}
            <Box marginLeft={3} marginTop={3}>
              <Button
                as="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                text="Ouvrir"
              />
            </Box>
     
    </Stack>
  )
}


