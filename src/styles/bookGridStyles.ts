/** Horizontal padding based on current breakpoint */
export function getResponsivePadding(breakpoint: string): string {
  switch (breakpoint) {
    case 'xl': return '4rem'
    case 'lg': return '2.75rem'
    case 'md': return '1.75rem'
    case 'sm': return '1.25rem'
    default:   return '.75rem'
  }
}

/**
 * Number of columns (and page limit) based on current breakpoint.
 * Mirrors the SimpleGrid responsive cols object so both values stay in sync.
 */
export function getResponsiveCols(breakpoint: string): number {
  switch (breakpoint) {
    case 'xl': return 16
    case 'lg': return 6
    case 'md': return 4
    case 'sm': return 4
    default:   return 2
  }
}