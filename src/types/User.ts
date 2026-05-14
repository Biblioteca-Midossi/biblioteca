export interface User {
  id_utente: number
  nome: string
  cognome: string
  username: string
  id_istituto: number
  email: string
  ruolo: number
}

export enum UserRole {
  User = 1,
  Moderator = 3,
  Admin = 4,
}

export enum Istituto {
  Esterno = 0,
  ITT = 1,
  LAC = 2,
  LAV = 3
}