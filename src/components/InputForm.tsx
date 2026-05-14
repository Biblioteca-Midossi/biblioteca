import { Button, Collapse, Grid, Paper, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'

import { AccordionAutore } from '@local/components/Accordions/AccordionAutore'
import { AccordionCollocazione } from '@local/components/Accordions/AccordionCollocazione'
import { AccordionLibro } from '@local/components/Accordions/AccordionLibro'
import useBookStore from "@local/hooks/useBookStore"
import { CustomAlert } from "@local/components/CustomAlert"
import type { CSSProperties, SubmitEvent } from 'react'
import type { AlertColor } from '@mui/material'

const styles: {
  [key: string]: CSSProperties
} = {
  formInput: {
    marginBottom: '4px'
  }
}

export function InputForm() {
  const { addBook } = useBookStore()
  const theme = useTheme()

  // Alerts
  const [alertVariation, setAlertVariation] = useState<AlertColor>('success')
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
  const [alertText, setAlertText] = useState<string>('')

  // Const collocazione
  const [istituto, setIstituto] = useState<string>('')
  const [scaffale, setScaffale] = useState<string>('')

  // Const autore
  const [nomeAutore, setNomeAutore] = useState<Array<string>>([])
  const [cognomeAutore, setCognomeAutore] = useState<Array<string>>([])

  // Const libro
  const [isbn, setIsbn] = useState<string>('')
  const [titolo, setTitolo] = useState<string>('')
  const [genere, setGenere] = useState<Array<string>>([])
  const [quantita, setQuantita] = useState<string>('')
  const [casaEditrice, setCasaEditrice] = useState<string>('')

  const [descrizione, setDescrizione] = useState<string>('')

  const [copertina, setCopertina] = useState<File | null>()
  const [preview, setPreview] = useState<string>('')

  function openAlert() {
    setIsAlertOpen(true)
  }

  function closeAlert() {
    setIsAlertOpen(false)
  }

  function clearForm() {
    // // Collocazione
    setIstituto('')
    setScaffale('')

    // Autore
    setNomeAutore([])
    setCognomeAutore([])

    // Libro
    setIsbn('')
    setTitolo('')
    setGenere([])
    setQuantita('')
    setCasaEditrice('')
    setDescrizione('')
    setCopertina(null)
    setPreview('')
  }

  function handleResult(result: Array<string>) {
    if (result[0] === 'error-no-thumbnail-provided') {
      setAlertText('Nessun file fornito o altro errore (copertina libro)')
      setAlertVariation('error')
      openAlert()
    }
    else if (result[0] === 'successful-request') {
      setAlertText('Azione eseguita con successo (dati e copertina libro)')
      setAlertVariation('success')
      openAlert()
    }
    else if (result[0] === 'client-error') {
      setAlertText('Client error: ' + result[1])
      setAlertVariation('error')
      openAlert()
    }
    else if (result[0] === 'server-error') {
      setAlertText('Server error ' + result[1])
      setAlertVariation('error')
      openAlert()
    }
    else if (result[0] === 'uncoded-error') {
      setAlertText('Uncoded error ' + result[1])
      setAlertVariation('error')
      openAlert()
    }
    else if (result[0] === 'network-error') {
      setAlertText('Network error: ' + result[1])
      setAlertVariation('error')
      openAlert()
    }

    if (!result[0].includes("error")) {
      clearForm()
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isAlertOpen) {
      closeAlert()
    }

    // if (!copertina) {
    //   handleResult(['error-no-thumbnail-provided'])
    //   return
    // }

    const result: Array<string> = await addBook(
      {
        istituto: istituto,
        scaffale: scaffale,

        nomeAutore: nomeAutore,
        cognomeAutore: cognomeAutore,

        isbn: isbn,
        titolo: titolo,
        genere: genere,
        quantita: quantita,
        casaEditrice: casaEditrice,
        descrizione: descrizione,
        copertina: copertina
      }
    )

    console.debug("result is ", result)

    handleResult(result)

  }

  return (
    <>
      <form name="submitInsert" onSubmit={handleSubmit}>
        <Paper
          elevation={8}
          sx={{
            margin: '1rem',
            padding: '1rem'
          }}
        >
          <Typography> Add a new book</Typography>
          <Grid container spacing={.5} sx={{ direction: 'column' }} >
            <AccordionCollocazione
              istituto={istituto}
              setIstituto={setIstituto}
              scaffale={scaffale}
              setScaffale={setScaffale}
              styles={styles}
            />

            <AccordionAutore
              nomeAutore={nomeAutore}
              cognomeAutore={cognomeAutore}
              setNomeAutore={setNomeAutore}
              setCognomeAutore={setCognomeAutore}
              styles={styles}
            />

            <AccordionLibro
              isbn={isbn}
              setIsbn={setIsbn}
              titolo={titolo}
              setTitolo={setTitolo}
              genere={genere}
              setGenere={setGenere}
              quantita={quantita}
              setQuantita={setQuantita}
              casaEditrice={casaEditrice}
              setCasaEditrice={setCasaEditrice}
              descrizione={descrizione}
              setDescrizione={setDescrizione}
              styles={styles}
              setCopertina={setCopertina}
              preview={preview}
              setPreview={setPreview}
            />
          </Grid>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              marginTop: '.5rem',
              backgroundColor: theme.palette.mode === 'dark' ? 'midossiblue.dark' : 'midossiblue.main',
              color: 'white',
              marginBottom: '.5rem',
            }}
            // onClick={() => console.log(darkMode)}
          >
            Conferma
          </Button>
          <Collapse in={isAlertOpen} style={{ marginTop: '4px' }}>
            <CustomAlert alertVariation={alertVariation} closeAlert={closeAlert}>
              {alertText}
            </CustomAlert>
          </Collapse>

        </Paper>
      </form>
    </>
  )
}
