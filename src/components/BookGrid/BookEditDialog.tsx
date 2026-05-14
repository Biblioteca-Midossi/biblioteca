import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@mui/material'
import type { ChangeEvent } from 'react'
import type { Book } from '@local/types/Book'

interface BookEditDialogProps {
  open: boolean
  onClose: () => void
  bookId?: number
  editFormData: Partial<Book>
  setEditFormData: React.Dispatch<React.SetStateAction<Partial<Book>>>
  onSubmit: () => Promise<void>
}

export function BookEditDialog({ open, onClose, editFormData, setEditFormData, onSubmit }: BookEditDialogProps) {
  function handleEditInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]:
      name === 'nomeAutore' || name === 'cognomeAutore' || name === 'genere'
        ? value.split(',').map(item => item.trim())
        : value
    }))
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (files) {
      const file = files[0]
      setEditFormData((prev) => ({
        ...prev,
        coverUrl: URL.createObjectURL(file),
        copertina: file
      }))
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Modifica Libro</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ marginTop: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Titolo"
              name="titolo"
              value={editFormData.titolo}
              onChange={handleEditInputChange}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Nome Autore"
              name="nomeAutore"
              value={editFormData.nomeAutore?.join(', ') || ''}
              onChange={handleEditInputChange}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Cognome Autore"
              name="cognomeAutore"
              value={editFormData.cognomeAutore?.join(', ') || ''}
              onChange={handleEditInputChange}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="ISBN"
              name="isbn"
              value={editFormData.isbn}
              onChange={handleEditInputChange}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Genere"
              name="genere"
              value={editFormData.genere?.join(', ') || ''}
              onChange={handleEditInputChange}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Quantità"
              name="quantita"
              type="number"
              value={editFormData.quantita}
              onChange={handleEditInputChange}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Casa Editrice"
              name="casaEditrice"
              value={editFormData.casaEditrice}
              onChange={handleEditInputChange}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Istituto"
              name="istituto"
              value={editFormData.istituto}
              onChange={handleEditInputChange}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Scaffale"
              name="scaffale"
              value={editFormData.scaffale}
              onChange={handleEditInputChange}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descrizione"
              name="descrizione"
              value={editFormData.descrizione}
              onChange={handleEditInputChange}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {editFormData.coverUrl && (
              <img
                src={editFormData.coverUrl}
                alt="Current Cover"
                style={{ maxHeight: 200, marginTop: 16 }}
              />
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Annulla
        </Button>
        <Button onClick={onSubmit} color="primary">
          Salva Modifiche
        </Button>
      </DialogActions>
    </Dialog>
  )
}