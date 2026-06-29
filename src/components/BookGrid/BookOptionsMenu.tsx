import { Menu } from '@mantine/core'

interface BookOptionsMenuProps {
  anchorEl: HTMLElement | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onGoToPage: () => void
}

export function BookOptionsMenu({ anchorEl, onClose, onEdit, onDelete, onGoToPage }: BookOptionsMenuProps) {
  return (
    <Menu
      opened={Boolean(anchorEl)}
      onChange={(opened) => { if (!opened) onClose() }}
      middlewares={{ flip: true, shift: true }}
    >
      <Menu.Target>
        <div className="absolute invisible pointer-events-none" />
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={onEdit}>Modifica libro</Menu.Item>
        <Menu.Item onClick={onDelete}>Elimina libro</Menu.Item>
        <Menu.Item onClick={onGoToPage}>Vai alla pagina</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
