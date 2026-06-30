import axios from 'axios'

axios.defaults.withCredentials = true
axios.defaults.headers.post['Content-Type'] = 'application/json'

export const api = axios.create({
  baseURL: `/api`,
  withCredentials: true,
})

let logoutCallback: (() => Promise<void>) | null = null
let activeSession = false

export function setLogoutCallback(cb: () => Promise<void>) {
  logoutCallback = cb
}

export function setActiveSession(v: boolean) {
  activeSession = v
}

// silent token refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (
      err.response?.status === 401 &&
      !err.config._retry &&
      !err.config._skipAuthRefresh
    ) {
      err.config._retry = true
      try {
        await api.post('/auth/refresh', undefined, { _skipAuthRefresh: true } as any)
        return api(err.config)
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
