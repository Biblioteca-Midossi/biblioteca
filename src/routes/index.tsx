import { BookGridBase } from '@local/components/BookGrid/BookGridBase'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return <BookGridBase />
}
