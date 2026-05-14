import { Box } from '@mui/material'
import { useState } from 'react'

import { CustomDrawer } from '@local/components/Drawer/CustomDrawer'
import { CustomAppBar } from "@local/components/Drawer/CustomAppBar"

export function AppBarDrawer() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  function handleDrawerToggle() {
    setIsOpen(!isOpen)
  }

  return (
    <Box
      sx={{
        marginBottom: '5rem'
      }}
    >
      <CustomAppBar handleDrawerToggle={handleDrawerToggle} />
      <CustomDrawer isOpen={isOpen} handleDrawerToggle={handleDrawerToggle} />
    </Box>
  )
}
