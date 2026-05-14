import { Box, Card, CardContent, TextField } from '@mui/material'
import { useState } from 'react'
import type { SxProps } from '@mui/material'
import type { CSSProperties, ChangeEvent } from 'react'

const SearchBarStyles: {
  [key: string]: CSSProperties | SxProps
} = {
  mainBox: {
    // display: 'flex',
    position: 'sticky',
    marginTop: '1rem',
    // left: '1rem',
    bottom: '1rem',
    marginX: 'auto',
    width: '70%'
  },
  card: {
    '& .MuiCardContent-root:last-child': {
      paddingX: '.25rem',
      paddingY: '.5rem'
    }
  },
  cardContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row'
  },
  searchField: {
    flexGrow: 1,
    marginLeft: '0.5rem'
  }
}

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState<string>('')

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const handleSearch = () => {
    onSearch(query)
  }

  return (
    <Box sx={SearchBarStyles.mainBox}>
      <Card sx={SearchBarStyles.card}>
        <CardContent sx={SearchBarStyles.cardContent}>
          <TextField
            sx={SearchBarStyles.searchField}
            value={query}
            onChange={handleInputChange}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearch()
              }
            }}
            placeholder="Cerca per titolo, o parola chiave"
          />
        </CardContent>
      </Card>
    </Box>
  )
}
