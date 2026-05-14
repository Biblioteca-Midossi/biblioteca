import React, { createContext, useContext, useEffect, useState } from 'react'

interface DarkModeContextType {
  darkMode: boolean
  toggleDarkTheme: () => void
}

const DarkModeContext = createContext<DarkModeContextType | null>(null)

export const DarkModeProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    return savedDarkMode || false
  })

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  const toggleDarkTheme = () => {
    setDarkMode((prevMode) => !prevMode)
  }

  return (
    <DarkModeContext.Provider
      value={{
        darkMode,
        toggleDarkTheme
      }}
    >
      {children}
    </DarkModeContext.Provider>
  )
}

export const UseDarkMode = (): DarkModeContextType => {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('UseDarkMode must be used within a DarkModeProvider')
  }
  return context
}
