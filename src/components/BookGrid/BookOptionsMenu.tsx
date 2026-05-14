import { Menu, MenuItem } from '@mui/material'

interface BookOptionsMenuProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onGoToPage: () => void
}

export function BookOptionsMenu({ anchorEl, onClose, onEdit, onDelete, onGoToPage }: BookOptionsMenuProps ){
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
    >
      <MenuItem onClick={onEdit}>Modifica libro</MenuItem>
      <MenuItem onClick={onDelete}>Elimina libro</MenuItem>
      <MenuItem onClick={onGoToPage}>Vai alla pagina</MenuItem>
    </Menu>
  )
}