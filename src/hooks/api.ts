import axios from 'axios'
import { useAuthStore } from "@local/hooks/useAuthStore"


axios.defaults.withCredentials = true
axios.defaults.headers.post['Content-Type'] = 'application/json'

export const api = axios.create({
  baseURL: `/api`,
  withCredentials: true,
})

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
        if (useAuthStore.getState().user) await useAuthStore.getState().logout()
      }
    }
    return Promise.reject(err)
  }
)
