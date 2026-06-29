import { createFileRoute } from '@tanstack/react-router'
import { BookGridBase } from '@local/components/BookGrid/BookGridBase'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <BookGridBase />
  )
}
