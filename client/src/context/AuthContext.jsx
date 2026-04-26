import { createContext, useContext, useEffect, useRef, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const interceptorRef        = useRef(null)

  useEffect(() => {
    // 1. Registra o interceptor PRIMEIRO
    interceptorRef.current = api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })

    // 2. Só depois tenta recuperar a sessão
    const token = localStorage.getItem('token')

    if (!token) {
      setLoading(false)
      return () => api.interceptors.request.eject(interceptorRef.current)
    }

    api.get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      })
      .finally(() => setLoading(false))

    return () => api.interceptors.request.eject(interceptorRef.current)
  }, [])

  const login = async (email, senha) => {
    const { data } = await api.post('/auth/login', { email, senha })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (nome, email, senha) => {
    const { data } = await api.post('/auth/register', { nome, email, senha })
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = { user, loading, login, register, logout }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}