import { AuthApi, BooksApi, UsersApi } from '@local/api'
import axios, { type AxiosRequestConfig } from 'axios'

axios.defaults.withCredentials = true
axios.defaults.headers.post['Content-Type'] = 'application/json'

let logoutCallback: (() => Promise<void>) | null = null
let activeSession = false

export function setLogoutCallback(cb: () => Promise<void>) {
  logoutCallback = cb
}

export function setActiveSession(v: boolean) {
  activeSession = v
}

// silent token refresh on 401
declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Set by the 401 interceptor once a refresh retry has been attempted. */
    _retry?: boolean
    /** Marks the refresh call itself so the interceptor ignores its own 401s. */
    _skipAuthRefresh?: boolean
  }
}

/**
 * Shared generated API clients. They use the global axios instance, so the
 * 401 interceptor below covers every generated call.
 */
export const authApi = new AuthApi()
export const booksApi = new BooksApi()
export const usersApi = new UsersApi()

axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config: AxiosRequestConfig | undefined = err.config
    if (err.response?.status === 401 && config && !config._retry && !config._skipAuthRefresh) {
      config._retry = true
      try {
        await authApi.refresh({ _skipAuthRefresh: true })
        return axios.request(config)
      } catch {
        if (activeSession) {
          activeSession = false
          if (logoutCallback) await logoutCallback()
        }
      }
    }
    return Promise.reject(err)
  }
)
