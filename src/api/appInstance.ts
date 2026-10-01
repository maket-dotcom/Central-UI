import axios from "axios"
import { useAppStore } from "@/store"

const appInstance = axios.create({
  headers: { "Content-Type": "application/json" },
})

// Request interceptor: set baseURL dynamically + inject token
appInstance.interceptors.request.use(
  (config) => {
    const { token, selectedApp } = useAppStore.getState()
    if (selectedApp?.backendBaseUrl) {
      config.baseURL = selectedApp.backendBaseUrl
    }
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: 401/403 → clear session → redirect /login
appInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear Zustand state; ProtectedRoute will automatically redirect to /login
      useAppStore.getState().clearAuth()
      useAppStore.getState().clearApp()
    }
    return Promise.reject(error)
  }
)

export default appInstance
