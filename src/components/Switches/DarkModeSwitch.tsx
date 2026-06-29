import { Switch, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react"

export function DarkModeSwitch() {
  const { toggleColorScheme } = useMantineColorScheme({ keepTransitions: true })
  const computedColorScheme = useComputedColorScheme('light')

  return (
    <Switch
      color="midossi"
      onLabel={<IconSunFilled size={16}></IconSunFilled>}
      offLabel={<IconMoonFilled size={16}></IconMoonFilled>}
      checked={computedColorScheme === 'dark'}
      onChange={toggleColorScheme}
      size="md"
    />
  )
}
