import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary, Box,
  Button,
  Grid,
  TextField,
  Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { getRequired } from '@local/components/Accordions/getRequired'
import type { CSSProperties, ChangeEvent } from 'react'

interface AccordionLibroProps {
  isbn: string
  setIsbn: (isbn: string) => void
  titolo: string
  setTitolo: (titolo: string) => void
  genere: Array<string>
  setGenere: (genere: Array<string>) => void
  quantita: string
  setQuantita: (quantita: string) => void
  casaEditrice: string
  setCasaEditrice: (casaEditrice: string) => void
  descrizione: string
  setDescrizione: (descrizione: string) => void
  setCopertina: (copertina: File | null) => void
  preview: string
  setPreview: (preview: string) => void
  styles: {
    [key: string]: CSSProperties
  }
}

export function AccordionLibro({
  isbn,
  setIsbn,
  titolo,
  setTitolo,
  genere,
  setGenere,
  quantita,
  setQuantita,
  casaEditrice,
  setCasaEditrice,
  descrizione,
  setDescrizione,
  setCopertina,
  preview,
  setPreview,
  styles
}: AccordionLibroProps) {
  const required = getRequired()
  const theme = useTheme()

  function onSelectFile(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      setCopertina(null)
      return
    }
    setCopertina(e.target.files[0])
    setPreview(URL.createObjectURL(e.target.files[0]))
  }

  return (
    <>
      <Grid size={12}>
        <Accordion sx={{ margin: '.2rem' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Libro</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              required={required}
              style={styles.formInput}
              label="Isbn"
              variant="outlined"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              fullWidth
            />
            <TextField
              required={required}
              style={styles.formInput}
              label="Titolo"
              variant="outlined"
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              fullWidth
            />
            <TextField
              required={required}
              style={styles.formInput}
              label="Genere"
              variant="outlined"
              value={genere}
              onChange={(e) => setGenere([e.target.value])}
              fullWidth
            />
            <TextField
              required={required}
              style={styles.formInput}
              label="Quantità"
              variant="outlined"
              value={quantita}
              onChange={(e) => setQuantita(e.target.value)}
              fullWidth
            />
            <TextField
              required={required}
              style={styles.formInput}
              label="Casa Editrice"
              variant="outlined"
              value={casaEditrice}
              onChange={(e) => setCasaEditrice(e.target.value)}
              fullWidth
            />
            <TextField
              required={required}
              style={styles.formInput}
              label="Descrizione"
              variant="outlined"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              fullWidth
              multiline
              helperText={`${descrizione.length}/1024`}
              slotProps={{
                htmlInput: {
                  maxLength: 1024
                }
              }}
            />
            <Button
              sx={[
                styles.formInput,
                {
                  color: theme.palette.mode === 'dark' ? 'white' : 'midossiblue.main',
                  borderColor: theme.palette.mode === 'dark' ? 'midossiblue.dark' : 'midossiblue.main'
                }
              ]}
              variant="outlined"
              component="label"
              fullWidth
            >
              Carica copertina
              <input
                type="file"
                accept="file"
                style={styles.formInput}
                onChange={onSelectFile}
                hidden
              />
            </Button>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {preview && (<img width={'25%'} src={preview} alt={'Preview'}/>)}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Grid>
    </>
  )
}
