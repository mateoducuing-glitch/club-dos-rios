import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Login() {
  const [telefono, setTelefono] = useState('')
  const [codigo, setCodigo] = useState('')
  const [paso, setPaso] = useState(1) // 1: teléfono | 2: código | 3: registro
  const [codigoDesarrollo, setCodigoDesarrollo] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [tokenTemp, setTokenTemp] = useState(null)
  const [clienteTemp, setClienteTemp] = useState(null)
  const [formRegistro, setFormRegistro] = useState({ nombre: '', email: '', direccion: '', fecha_nacimiento: '' })
  const { login } = useAuth()
  const navigate = useNavigate()

  async function solicitarCodigo(e) {
    e.preventDefault()
    if (!telefono.trim()) return setError('Ingresá tu número de WhatsApp')
    setCargando(true)
    setError('')
    try {
      const res = await api.post('/auth/solicitar-codigo', { telefono })
      if (res.data.codigo_desarrollo) setCodigoDesarrollo(res.data.codigo_desarrollo)
      setPaso(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar código')
    } finally {
      setCargando(false)
    }
  }

  async function verificarCodigo(e) {
    e.preventDefault()
    if (!codigo.trim()) return setError('Ingresá el código')
    setCargando(true)
    setError('')
    try {
      const res = await api.post('/auth/verificar-codigo', { telefono, codigo })
      if (res.data.es_nuevo) {
        // Usuario nuevo → mostrar formulario de registro
        setTokenTemp(res.data.token)
        setClienteTemp(res.data.cliente)
        setPaso(3)
      } else {
        login(res.data.token, res.data.cliente)
        navigate('/inicio')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Código incorrecto')
    } finally {
      setCargando(false)
    }
  }

  async function completarRegistro(e) {
    e.preventDefault()
    if (!formRegistro.nombre.trim()) return setError('El nombre es obligatorio')
    setCargando(true)
    setError('')
    try {
      // Guardar token temporalmente para hacer el PUT
      localStorage.setItem('club_token', tokenTemp)
      const res = await api.put('/clientes/me', formRegistro)
      login(tokenTemp, { ...clienteTemp, ...res.data })
      navigate('/inicio')
    } catch {
      // Si falla el update igual entramos con los datos base
      login(tokenTemp, clienteTemp)
      navigate('/inicio')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1208 50%, #0f0a00 100%)' }}
    >
      {/* Destellos dorados decorativos */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #e5ae1e 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #e5ae1e 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg border border-dorado-400/30"
            style={{ background: 'linear-gradient(135deg, #e5ae1e, #c9920f)' }}>
            <span className="text-4xl">🥩</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">CLUB</h1>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: '#e5ae1e' }}>DOS RÍOS</h1>
          {/* Línea dorada separadora */}
          <div className="flex items-center justify-center gap-2 mt-3 mb-3">
            <div className="h-px w-10 opacity-50" style={{ background: '#e5ae1e' }} />
            <span style={{ color: '#e5ae1e', opacity: 0.6, fontSize: 10 }}>✦</span>
            <div className="h-px w-10 opacity-50" style={{ background: '#e5ae1e' }} />
          </div>
          <p className="text-white/50 text-sm">Sumá puntos con cada compra y<br />canjeálos por premios.</p>
        </div>

        {/* PASO 1 — Teléfono */}
        {paso === 1 && (
          <div className="bg-white rounded-3xl p-6 shadow-2xl animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Ingresá tu WhatsApp</h2>
            <p className="text-gray-400 text-sm mb-4">Te enviamos un código para verificar tu número.</p>
            <form onSubmit={solicitarCodigo} className="flex flex-col gap-4">
              <input
                type="tel"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="+54 9 11 ..."
                className="input-field text-lg"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button type="submit" disabled={cargando} className="btn-primary w-full">
                {cargando ? 'Enviando...' : 'Enviar código'}
              </button>
            </form>
          </div>
        )}

        {/* PASO 2 — Código */}
        {paso === 2 && (
          <div className="bg-white rounded-3xl p-6 shadow-2xl animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Ingresá el código</h2>
            <p className="text-gray-400 text-sm mb-4">Enviado al número <strong className="text-gray-600">{telefono}</strong></p>
            <form onSubmit={verificarCodigo} className="flex flex-col gap-4">
              {codigoDesarrollo && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
                  <p className="text-xs text-yellow-600 font-medium">Modo desarrollo</p>
                  <p className="text-2xl font-bold tracking-widest text-yellow-700">{codigoDesarrollo}</p>
                </div>
              )}
              <input
                type="text"
                value={codigo}
                onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="0000"
                className="input-field text-center text-3xl tracking-widest font-bold"
                maxLength={4}
                autoFocus
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button type="submit" disabled={cargando} className="btn-primary w-full">
                {cargando ? 'Verificando...' : 'Ingresar'}
              </button>
              <button type="button" onClick={() => { setPaso(1); setError(''); setCodigo('') }} className="text-gray-400 text-sm text-center">
                Cambiar número
              </button>
            </form>
          </div>
        )}

        {/* PASO 3 — Registro nuevo usuario */}
        {paso === 3 && (
          <div className="bg-white rounded-3xl p-6 shadow-2xl animate-fade-in-up">
            <div className="text-center mb-5">
              <span className="text-3xl">👋</span>
              <h2 className="text-xl font-bold text-gray-800 mt-2">¡Bienvenido al Club!</h2>
              <p className="text-gray-400 text-sm mt-1">Completá tus datos para terminar el registro.</p>
              <div className="mt-3 bg-dorado-50 border border-dorado-200 rounded-2xl py-2 px-3 inline-flex items-center gap-1.5">
                <span>⭐</span>
                <span className="text-dorado-700 text-sm font-semibold">+100 puntos de bienvenida acreditados</span>
              </div>
            </div>
            <form onSubmit={completarRegistro} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={formRegistro.nombre}
                  onChange={e => setFormRegistro(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Juan Pérez"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email (opcional)</label>
                <input
                  type="email"
                  value={formRegistro.email}
                  onChange={e => setFormRegistro(f => ({ ...f, email: e.target.value }))}
                  placeholder="tu@email.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Dirección de entrega (opcional)</label>
                <input
                  type="text"
                  value={formRegistro.direccion}
                  onChange={e => setFormRegistro(f => ({ ...f, direccion: e.target.value }))}
                  placeholder="Av. San Martín 1234"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fecha de nacimiento (opcional)</label>
                <input
                  type="date"
                  value={formRegistro.fecha_nacimiento}
                  onChange={e => setFormRegistro(f => ({ ...f, fecha_nacimiento: e.target.value }))}
                  className="input-field"
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button type="submit" disabled={cargando} className="btn-primary w-full mt-1">
                {cargando ? 'Guardando...' : 'Comenzar a acumular puntos'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

