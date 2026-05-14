import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import type { Book } from '@local/types/Book'

interface BookDeleteDialogProps {
  open: boolean
  book: Partial<Book> | null
  deleteResponseDialog: {
    open: boolean
    message: string
    success: boolean
  }
  onCancel: () => void
  onConfirm: () => void
  onResponseDialogClose: () => void
}

export function BookDeleteDialog(
  {
    open,
    book,
    deleteResponseDialog,
    onCancel,
    onConfirm,
    onResponseDialogClose
  }
  : BookDeleteDialogProps
){
  return (
    <>
      {/* Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={onCancel}
        aria-labelledby="delete-book-dialog-title"
        aria-describedby="delete-book-dialog-description"
      >
        <DialogTitle id="delete-book-dialog-title">
          {"Conferma eliminazione"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-book-dialog-description">
            Sei sicuro di voler eliminare il libro "{book?.titolo}"?
            Questa azione non può essere annullata.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary">
            Annulla
          </Button>
          <Button
            onClick={onConfirm}
            color="error"
            autoFocus
          >
            Elimina
          </Button>
        </DialogActions>
      </Dialog>

      {/* Response Dialog */}
      <Dialog
        open={deleteResponseDialog.open}
        onClose={onResponseDialogClose}
        aria-labelledby="delete-response-dialog-title"
      >
        <DialogTitle id="delete-response-dialog-title">
          {deleteResponseDialog.success ? 'Eliminazione Riuscita' : 'Errore'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteResponseDialog.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onResponseDialogClose}
            color={deleteResponseDialog.success ? "primary" : "error"}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}