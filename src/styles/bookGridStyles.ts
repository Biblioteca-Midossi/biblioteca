import type { SxProps } from '@mui/material'
import type { CSSProperties } from 'react'

export const BookGridStyles: {
  [key: string]: CSSProperties | SxProps
} = {
  altText: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center'
  },
  containerGrid: {
    marginTop: '1rem',
    marginBottom: '1rem',
    width: '100%',
    maxWidth: '100%',
    justifyItems: 'center',
    paddingTop: '1rem',
    '& .MuiGrid-item': {
      padding: 0.5
    },
    '& .MuiGrid-root:last-of-type': {
      margin: '0rem'
    }
  },
  bookCard: {
    height: '100%',
    width: '100%',
    padding: '.5rem',
    '& .MuiCardContent-root:last-child': {
      padding: 0,
      margin: '0rem'
    }
  },
  bookTitle: {
    whiteSpace: 'hidden',
    textOverflow: 'ellipsis'
  },
  bookAuthor: {
    whiteSpace: 'hidden',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}

export const getResponsivePadding = (currentBreakpoint: string) => {
  return (
    (currentBreakpoint === "xl") ? '4rem'
    : (currentBreakpoint === 'lg') ? '2.75rem'
    : (currentBreakpoint === 'md') ? '1.75rem'
    : (currentBreakpoint === 'sm') ? '1.25rem'
    : (currentBreakpoint === 'xs') ? '.75rem'
    : '.5rem'
  )
}