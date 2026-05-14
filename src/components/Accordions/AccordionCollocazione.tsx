import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary, Grid, InputAdornment, TextField, Tooltip, Typography } from '@mui/material'
import { getRequired } from '@local/components/Accordions/getRequired'
import { HelpOutlined } from "@mui/icons-material"
import type { CSSProperties } from 'react'

interface AccordionCollocazioneProps {
  istituto: string
  setIstituto: (nome: string) => void
  scaffale: string
  setScaffale: (cognome: string) => void
  styles: {
    [key: string]: CSSProperties
  }
}

export function AccordionCollocazione({
  istituto,
  setIstituto,
  scaffale,
  setScaffale,
  styles
}: AccordionCollocazioneProps) {
  const required = getRequired()

  return (
    <>
      <Grid size={12}>
        <Accordion sx={{ margin: '.2rem' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Collocazione</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              required={required}
              style={styles.formInput}
              label="Istituto per Nome o ID (es. ITT, 1)"
              variant="outlined"
              value={istituto}
              onChange={(e) => setIstituto(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={'ITT: 1, LAC: 2, LAV: 3'}>
                        <HelpOutlined fontSize="medium" />
                      </Tooltip>
                    </InputAdornment>
                  )
                }
              }}
            />


            <TextField
              required={required}
              style={styles.formInput}
              label="Posizione/Scaffale (es. A01)"
              variant="outlined"
              value={scaffale}
              onChange={(e) => setScaffale(e.target.value)}
              fullWidth
            />
          </AccordionDetails>
        </Accordion>
      </Grid>
    </>
  )
}
