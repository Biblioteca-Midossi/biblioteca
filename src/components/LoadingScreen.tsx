import { Box, Loader, Text } from '@mantine/core'

export function LoadingScreen() {
  return (
    <Box
      className="flex flex-col items-center justify-center h-full"
    >
      <Loader size="lg" />
      <Text size="lg" mt="md">
        Loading...
      </Text>
    </Box>
  )
}
