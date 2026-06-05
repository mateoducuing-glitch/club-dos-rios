import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('club_usuario')
    return saved ? JSON.parse(saved) : null
  })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('club_token')
    if (token) {
      api.get('/auth/perfil')
        .then(res => { setUsuario(res.data); localStorage.setItem('club_usuario', JSON.stringify(res.data)) })
        .catch(() => { localStorage.removeItem('club_token'); localStorage.removeItem('club_usuario'); setUsuario(null) })
        .finally(() => setCargando(false))
    } else {
      setCargando(false)
    }
  }, [])

  function login(token, clienteData) {
    localStorage.setItem('club_token', token)
    localStorage.setItem('club_usuario', JSON.stringify(clienteData))
    setUsuario(clienteData)
  }

  function logout() {
    localStorage.removeItem('club_token')
    localStorage.removeItem('club_usuario')
    setUsuario(null)
  }

  function actualizarUsuario(data) {
    const actualizado = { ...usuario, ...data }
    setUsuario(actualizado)
    localStorage.setItem('club_usuario', JSON.stringify(actualizado))
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
