import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button, Container, Paper, TextField, Typography } from '@mui/material'
import {  useEffect, useState } from 'react'
import { useAuth } from '@local/contexts/AuthContext'
import type { SubmitEvent } from 'react'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const { login, user } = useAuth()

  useEffect(() => {
    if (user) {
      alert('You are already logged in.\nRedirecting you to the home.')
      navigate({ to: '/' })
    }
  }, [])
  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      await login(username, password)
      navigate({ to: '/' })
    } catch (error) {
      alert('Invalid credentials! Please try again.')
    }

  }
  return (
    <>
      <Container component="main" maxWidth="xs" sx={{ marginTop: '5.5rem' }}>
        <Paper sx={{ padding: '1rem' }} elevation={5}>
          <Typography component="h1" variant="h5">
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Username"
              name="username"
              autoFocus
              value={username}
              onChange={function (e) {
                setUsername(e.target.value)
              }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={function (e) {
                setPassword(e.target.value)
              }}
            />
            <Button type="submit" fullWidth variant="contained" color="primary">
              Login
            </Button>
          </form>
        </Paper>
      </Container>
    </>
  )

}


