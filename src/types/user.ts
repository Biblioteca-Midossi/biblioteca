export interface User {
  id: number
  username: string
  nome: string
  cognome: string
  email: string
  ruolo: number           // 0 = utente, 3+ = admin (integer, as in DB)
  id_istituto: IstitutoEnum     // istituto_enum: 'EXT' | 'ITT' | 'LAC' | 'LAV'
  profile_picture: string | null
  bio: string | null
  preferred_language: string | null
  notification_settings: Record<string, unknown> | null
}

export enum UserRole {
  User = 1,
  Moderator = 3,
  Admin = 4,
}

export enum IstitutoEnum {
  EXT = 0,
  ITT = 1,
  LAC = 2,
  LAV = 3
}