import axios from 'axios'


axios.defaults.withCredentials = true
axios.defaults.headers.post['Content-Type'] = 'application/json'

const api = axios.create({
  baseURL: `/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<any> = []

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom: any) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.get('/auth/token/refresh')
        processQueue()
        return api(originalRequest)
      } catch (err) {
        processQueue(err)
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
