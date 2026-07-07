const TOKEN_KEY = 'note_cloud_token'
const USER_KEY = 'note_cloud_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getUser(): any {
  const data = localStorage.getItem(USER_KEY)
  return data ? JSON.parse(data) : null
}

export function setUser(user: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function removeUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function clearStorage(): void {
  removeToken()
  removeUser()
}