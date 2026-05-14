import { extendTheme } from '@mui/material/styles'

const sharedPalette = {
  // Blue Tones
  lightblue: {
    main: '#ADD8E6',
  },
  midossiblue: {
    main: '#0066cc',
    dark: '#D84B20',
  },
  trafficblue: {
    main: '#063971',
  },

  // Brown Tones
  coffee: {
    main: '#6F4E37',
  },
  nutbrown: {
    main: '#5B3A29',
  },

  // Green Tones
  green: {
    main: '#00FF00',
  },

  // Neutral Tones (Black and whites)
  anthracite: {
    main: '#293133',
  },
  cream: {
    main: '#FDF4E3',
  },
  graphiteblack: {
    main: '#1C1C1C',
  },
  papyruswhite: {
    main: '#CFD3CD',
  },
  smokyblack: {
    main: '#0f0a08',
  },
  stonegrey: {
    main: '#8B8C7A',
  },

  // Red Tones
  red: {
    main: '#FF0000',
  },
  rose: {
    main: '#E63244',
  },
  salmon: {
    main: '#FA8072',
  },
  signalorange: {
    main: '#D84B20',
  },
  tomatored: {
    main: '#A12312',
  },
  trafficorange: {
    main: '#F54021',
  },
  vermilion: {
    main: '#CB2821',
  },

  // Violet Tones
  violet: {
    main: '#5C3A93',
  },

  // Yellow Tones
  melonyellow: {
    main: '#F4A900',
  },
  trafficyellow: {
    main: '#FAD201',
  },
} as const

const theme = extendTheme({
  colorSchemeSelector: 'data-mui-color-scheme',
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        background: {
          default: '#F4F3F2',
        },
        ...sharedPalette,
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        background: {
          default: '#121212',
        },
        ...sharedPalette,
      },
    },
  },
})

export default theme
