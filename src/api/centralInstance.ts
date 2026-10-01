import axios from "axios"
import { useAppStore } from "@/store"

const centralInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  headers: { "Content-Type": "application/json" },
})

// Request interceptor: inject Bearer token from Zustand/localStorage
centralInstance.interceptors.request.use(
  (config) => {
    const token = useAppStore.getState().token
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: 401/403 → clear session → redirect /login
centralInstance.interceptors.response.use(
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

export default centralInstance
