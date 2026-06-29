import { ActionIcon, Avatar, Box, Divider, Group, Image, Menu } from '@mantine/core'
import { IconBook, IconHome, IconLogin, IconLogout, IconMenu2, IconSettings, IconUsers } from '@tabler/icons-react'
import { DarkModeSwitch } from '@local/components/Switches/DarkModeSwitch'
import { useDisclosure } from '@mantine/hooks'
import { Link, useNavigate } from '@tanstack/react-router'
import { CustomDrawer } from '@local/components/Drawer/CustomDrawer'
import { useAuthStore } from '@local/hooks/useAuthStore'

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false)
  const [menuOpened, { toggle: toggleMenu, close: closeMenu }] = useDisclosure(false)
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  return (
    <>
      <Box h="100%" px="md" className="grid grid-cols-[1fr_auto_1fr] items-center">
        <Group gap="xs" justify="flex-start">
          <ActionIcon
            variant="transparent"
            onClick={toggleDrawer}
            size="lg"
          >
            <IconMenu2 size={24} />
          </ActionIcon>
          <ActionIcon
            variant="transparent"
            size="lg"
            onClick={() => navigate({ to: '/' })}
          >
            <IconHome size={24} />
          </ActionIcon>
        </Group>

        <Group justify="center">
          <Link to="https://midossi.edu.it">
            <Image
              src="/assets/logos/midossi.png"
              alt="Midossi Logo"
              h={48}
              bg='white'
              radius="xl"
            />
          </Link>
        </Group>

        <Group gap="sm" justify="flex-end" align="center">
          <DarkModeSwitch />

          {user ? (
            <Menu
              opened={menuOpened}
              onChange={toggleMenu}
              position="bottom-end"
              shadow="sm"
            >
              <Menu.Target>
                <Avatar
                  key={`${user.nome} ${user.cognome}`}
                  name={`${user.nome} ${user.cognome}`}
                  color="initials"
                />
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  onClick={() => { closeMenu(); navigate({ to: '/users/me' }) }}
                  leftSection={<Avatar size={20} />}
                >
                  My account
                </Menu.Item>
                <Divider />
                <Menu.Item
                  onClick={() => { closeMenu(); navigate({ to: '/dashboard' }) }}
                  leftSection={<IconBook size={16} />}
                >
                  Dashboard
                </Menu.Item>
                <Menu.Item
                  onClick={() => { closeMenu(); navigate({ to: '/userlist' }) }}
                  leftSection={<IconUsers size={16} />}
                >
                  User list
                </Menu.Item>
                <Menu.Item
                  onClick={closeMenu}
                  leftSection={<IconSettings size={16} />}
                >
                  Settings
                </Menu.Item>
                <Menu.Item
                  onClick={async () => { closeMenu(); await logout(); navigate({ to: '/' }) }}
                  leftSection={<IconLogout size={16} />}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <ActionIcon variant="transparent" onClick={() => { closeMenu(); navigate({ to: '/login' }) }} >
              <IconLogin/>
            </ActionIcon>
          )}
        </Group>
      </Box>

      <CustomDrawer opened={drawerOpened} onClose={closeDrawer} />
    </>
  )
}
