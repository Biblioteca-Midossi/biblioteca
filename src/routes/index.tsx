import { createFileRoute } from '@tanstack/react-router'
import { Box } from '@mui/material'
import { BookGridBase } from '@local/components/BookGrid/BookGridBase'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <>
      <Box>
        <BookGridBase />
      </Box>
    </>
  )
}
