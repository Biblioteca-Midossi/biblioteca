import { CheckCircle, Close, Error, Warning } from '@mui/icons-material'
import { Alert, IconButton } from '@mui/material'
import type { AlertColor } from '@mui/material'

interface CustomAlertProps {
  children: string
  alertVariation: AlertColor
  closeAlert: () => void
}

export function CustomAlert({ children, alertVariation, closeAlert }: CustomAlertProps) {
  function getIcon() {
    switch (alertVariation) {
      case 'success':
        return <CheckCircle fontSize="inherit" />
      case 'error':
        return <Error fontSize="inherit" />
      case 'warning':
        return <Warning fontSize="inherit" />
      default:
        return null
    }
  }

  return (
    <Alert
      icon={getIcon()}
      variant="outlined"
      severity={alertVariation}
      action={
        <IconButton onClick={closeAlert} size="small">
          <Close />
        </IconButton>
      }
      sx={{
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {children}
    </Alert>
  )
}
