import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from "react"
import { useAuth } from "@local/contexts/AuthContext"
import { Button, Container, Paper, TextField, Typography } from "@mui/material"
import { register } from "@local/hooks/auth"
import type { SubmitEvent } from "react"

export const Route = createFileRoute('/register')({
  component: Register,
})

function Register() {
  const [nome, setNome] = useState<string>('')
  const [cognome, setCognome] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [istituto, setIstituto] = useState<string | number>('')

  const navigate = useNavigate()

  const { user } = useAuth()

  if (user) {
    alert('You are already logged in.\nRedirecting you to the home.')
    navigate({ to: '/' })
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      await register({ nome, cognome, username, email, password, istituto })
        .then((result) => {
          if (result.includes("successful-request")) {
            navigate({ to: '/login' })
          }
        })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Container component="main" maxWidth="xs" sx={{ marginTop: '5.5rem' }}>
        <Paper sx={{ padding: '1rem' }} elevation={5}>
          <Typography component="h1" variant="h5">
            Registrati
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Nome"
              name="nome"
              autoFocus
              value={nome}
              onChange={function (e) {
                setNome(e.target.value)
              }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Cognome"
              name="cognome"
              autoFocus
              value={cognome}
              onChange={function (e) {
                setCognome(e.target.value)
              }}
            />
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
              label="Email"
              name="email"
              autoFocus
              value={email}
              onChange={function (e) {
                setEmail(e.target.value)
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
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Istituto"
              name="istituto"
              autoFocus
              value={istituto}
              onChange={function (e) {
                setIstituto(e.target.value)
              }}
            />
            <Button type="submit" fullWidth variant="contained" color="primary">
              Registrati
            </Button>
          </form>
        </Paper>
      </Container>
    </>
  )
}
