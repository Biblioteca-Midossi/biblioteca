import { createTheme, virtualColor } from '@mantine/core'
import type { MantineColorsTuple } from '@mantine/core'

const sharedColors: Record<string, MantineColorsTuple> = {
  lightblue: ['#ADD8E6','#ADD8E6','#ADD8E6','#ADD8E6','#ADD8E6','#ADD8E6','#ADD8E6','#ADD8E6','#ADD8E6','#ADD8E6'],
  trafficblue: ['#063971','#063971','#063971','#063971','#063971','#063971','#063971','#063971','#063971','#063971'],
  coffee: ['#6F4E37','#6F4E37','#6F4E37','#6F4E37','#6F4E37','#6F4E37','#6F4E37','#6F4E37','#6F4E37','#6F4E37'],
  nutbrown: ['#5B3A29','#5B3A29','#5B3A29','#5B3A29','#5B3A29','#5B3A29','#5B3A29','#5B3A29','#5B3A29','#5B3A29'],
  green: ['#00FF00','#00FF00','#00FF00','#00FF00','#00FF00','#00FF00','#00FF00','#00FF00','#00FF00','#00FF00'],
  anthracite: ['#293133','#293133','#293133','#293133','#293133','#293133','#293133','#293133','#293133','#293133'],
  cream: ['#FDF4E3','#FDF4E3','#FDF4E3','#FDF4E3','#FDF4E3','#FDF4E3','#FDF4E3','#FDF4E3','#FDF4E3','#FDF4E3'],
  graphiteblack: ['#1C1C1C','#1C1C1C','#1C1C1C','#1C1C1C','#1C1C1C','#1C1C1C','#1C1C1C','#1C1C1C','#1C1C1C','#1C1C1C'],
  papyruswhite: ['#CFD3CD','#CFD3CD','#CFD3CD','#CFD3CD','#CFD3CD','#CFD3CD','#CFD3CD','#CFD3CD','#CFD3CD','#CFD3CD'],
  smokyblack: ['#0f0a08','#0f0a08','#0f0a08','#0f0a08','#0f0a08','#0f0a08','#0f0a08','#0f0a08','#0f0a08','#0f0a08'],
  stonegrey: ['#8B8C7A','#8B8C7A','#8B8C7A','#8B8C7A','#8B8C7A','#8B8C7A','#8B8C7A','#8B8C7A','#8B8C7A','#8B8C7A'],
  red: ['#FF0000','#FF0000','#FF0000','#FF0000','#FF0000','#FF0000','#FF0000','#FF0000','#FF0000','#FF0000'],
  rose: ['#E63244','#E63244','#E63244','#E63244','#E63244','#E63244','#E63244','#E63244','#E63244','#E63244'],
  salmon: ['#FA8072','#FA8072','#FA8072','#FA8072','#FA8072','#FA8072','#FA8072','#FA8072','#FA8072','#FA8072'],
  signalorange: ['#D84B20','#D84B20','#D84B20','#D84B20','#D84B20','#D84B20','#D84B20','#D84B20','#D84B20','#D84B20'],
  tomatored: ['#A12312','#A12312','#A12312','#A12312','#A12312','#A12312','#A12312','#A12312','#A12312','#A12312'],
  trafficorange: ['#F54021','#F54021','#F54021','#F54021','#F54021','#F54021','#F54021','#F54021','#F54021','#F54021'],
  vermilion: ['#CB2821','#CB2821','#CB2821','#CB2821','#CB2821','#CB2821','#CB2821','#CB2821','#CB2821','#CB2821'],
  violet: ['#5C3A93','#5C3A93','#5C3A93','#5C3A93','#5C3A93','#5C3A93','#5C3A93','#5C3A93','#5C3A93','#5C3A93'],
  melonyellow: ['#F4A900','#F4A900','#F4A900','#F4A900','#F4A900','#F4A900','#F4A900','#F4A900','#F4A900','#F4A900'],
  trafficyellow: ['#FAD201','#FAD201','#FAD201','#FAD201','#FAD201','#FAD201','#FAD201','#FAD201','#FAD201','#FAD201'],
}

const theme = createTheme({
  primaryColor: 'midossi',
  colors: {
    midossi: virtualColor({
      name: 'midossi',
      light: 'blue',
      dark: 'orange',
    }),
    ...sharedColors,
  },
  fontFamily: 'Varela Round, sans-serif',
  defaultRadius: 'md',
})

export default theme
