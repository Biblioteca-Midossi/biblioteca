import type { IstitutoEnum } from "@local/types/user"

export interface RegisterValues {
  nome: string
  cognome: string
  username: string
  email: string
  password: string
  istituto: IstitutoEnum
}