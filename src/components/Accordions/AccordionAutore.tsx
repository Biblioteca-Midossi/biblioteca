import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Grid, TextField, Typography } from '@mui/material'
import { getRequired } from '@local/components/Accordions/getRequired'
import type { CSSProperties } from 'react'


interface AccordionAutoreProps {
  nomeAutore: Array<string>
  setNomeAutore: (nome: Array<string>) => void
  cognomeAutore: Array<string>
  setCognomeAutore: (cognome: Array<string>) => void
  styles: {
    [key: string]: CSSProperties
  }
}

export function AccordionAutore({
  nomeAutore,
  setNomeAutore,
  cognomeAutore,
  setCognomeAutore,
  styles
}: AccordionAutoreProps) {
  const required = getRequired()

  return (
    <>
      <Grid size={12}>
        <Accordion sx={{ margin: '.2rem' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Autore</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              required={required}
              style={styles.formInput}
              label="Nome"
              variant="outlined"
              value={nomeAutore}
              onChange={(e) => setNomeAutore([e.target.value])}
              fullWidth
            />
            <TextField
              required={required}
              style={styles.formInput}
              label="Cognome"
              variant="outlined"
              value={cognomeAutore}
              onChange={(e) => setCognomeAutore([e.target.value])}
              fullWidth
            />
          </AccordionDetails>
        </Accordion>
      </Grid>
    </>
  )
}
