import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CarritoProvider } from './context/CarritoContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Premios from './pages/Premios'
import MisPedidos from './pages/MisPedidos'
import MisCupones from './pages/MisCupones'
import Perfil from './pages/Perfil'
import Admin from './pages/Admin'
import HacerPedido from './pages/HacerPedido'

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-crema">
      <div className="w-10 h-10 border-4 border-verde-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return usuario ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/pedido" element={<RutaProtegida><HacerPedido /></RutaProtegida>} />
            <Route element={<RutaProtegida><Layout /></RutaProtegida>}>
              <Route path="/" element={<Navigate to="/inicio" replace />} />
              <Route path="/inicio" element={<Inicio />} />
              <Route path="/premios" element={<Premios />} />
              <Route path="/pedidos" element={<MisPedidos />} />
              <Route path="/cupones" element={<MisCupones />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CarritoProvider>
    </AuthProvider>
  )
}
