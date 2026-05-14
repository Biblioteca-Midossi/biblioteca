import { useMediaQuery, useTheme } from "@mui/material"

export function getBreakpoints() {
  const theme = useTheme()
  const XL = useMediaQuery(theme.breakpoints.only("xl"))
  const LG = useMediaQuery(theme.breakpoints.only("lg"))
  const MD = useMediaQuery(theme.breakpoints.only("md"))
  const SM = useMediaQuery(theme.breakpoints.only("sm"))
  const XS = useMediaQuery(theme.breakpoints.only("xs"))

  if (XL) {
    return 'xl'
  }
  else if (LG) {
   return 'lg'
  }
  else if (MD) {
    return 'md'
  }
  else if (SM) {
    return 'sm'
  }
  else if (XS) {
    return 'xs'
  }
  else {
    return 'md' // fallback
  }
}