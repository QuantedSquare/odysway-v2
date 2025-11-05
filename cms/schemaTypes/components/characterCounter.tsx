import {Box, Stack, Text} from '@sanity/ui'
import {useMemo} from 'react'
import { TextInputProps } from 'sanity'

export function CharacterCounter(props: TextInputProps, {maxLength}: {maxLength: number}) {
const characterCount = useMemo(() => {
  return props.value ? props.value.length : 0
  }, [props.value])

  return (
    <Stack space={2}>
      <Text size={1} accent={characterCount > maxLength}>{characterCount}/{maxLength} caractères</Text>
      <Box>{props.renderDefault(props)}</Box>
    </Stack>
  )
}