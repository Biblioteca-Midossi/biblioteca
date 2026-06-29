import { useMediaQuery } from '@mantine/hooks'

export function getBreakpoints() {
  const XL = useMediaQuery('(min-width: 1536px)')
  const LG = useMediaQuery('(min-width: 1200px) and (max-width: 1535px)')
  const MD = useMediaQuery('(min-width: 900px) and (max-width: 1199px)')
  const SM = useMediaQuery('(min-width: 600px) and (max-width: 899px)')
  const XS = useMediaQuery('(max-width: 599px)')

  if (XL) return 'xl'
  if (LG) return 'lg'
  if (MD) return 'md'
  if (SM) return 'sm'
  if (XS) return 'xs'
  return 'md'
}
