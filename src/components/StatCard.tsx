import { Card, Skeleton, Text } from "@mantine/core"

interface StatCardProps {
  loading: boolean
  title: string
  value: number | string
}

export function StatCard({ loading, title, value }: StatCardProps) {
  return (
    <Card
      withBorder
      shadow="sm"
      className="flex flex-col justify-center"
    >
      <Text c="dimmed" size="sm">{title}</Text>
      {loading ? <Skeleton height={28} mt="xs" width={60} /> : <Text size="xl" fw={700}>{value}</Text>}
    </Card>
  )
}