/** Query key factories. List keys carry their parameters so caches don't collide. */
export const bookKeys = {
  all: ['books'] as const,
  list: (page: number, limit: number, search: string | null) =>
    ['books', 'list', { page, limit, search }] as const,
  detail: (bookId: number) => ['books', 'detail', bookId] as const,
  recent: (limit: number) => ['books', 'recent', limit] as const,
}

export const userKeys = {
  all: ['users'] as const,
  list: (offset: number, limit: number) => ['users', 'list', { offset, limit }] as const,
  recent: (limit: number) => ['users', 'recent', limit] as const,
  profile: ['users', 'profile'] as const,
}
