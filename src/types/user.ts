export interface User {
  id: number
  username: string
  nome: string
  cognome: string
  email: string
  roleId: number
  roleName: string
  permissions: Array<string>
  istituto: IstitutoEnum
  profilePicture: string | null
  bio: string | null
  preferredLanguage: string | null
  notificationSettings: Record<string, unknown> | null
}

export enum IstitutoEnum {
  EXT = 'EXT',
  ITT = 'ITT',
  LAC = 'LAC',
  LAV = 'LAV',
}

/** Known permission names used in the app. */
export const Permissions = {
  viewBooks: 'view_books',
  createBook: 'create_book',
  editBook: 'edit_book',
  deleteBook: 'delete_book',
  viewUsers: 'view_users',
  editUser: 'edit_user',
  viewDashboard: 'view_dashboard',
  viewRoles: 'view_roles',
  manageRoles: 'manage_roles',
} as const
