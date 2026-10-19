import { Text } from '@mantine/core'

interface ErrorPageProps {
  error: unknown
}

export function ErrorPage({ error }: ErrorPageProps) {
  return (
    <Text size="xl" fw={700} m="1rem" className="flex">
      {String(error)}
    </Text>
  )
}
