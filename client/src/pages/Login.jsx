import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [modo, setModo] = useState(null) // null | 'login' | 'registro'
  const [form, setForm] = useState({ nombre: '', telefono: '', password: '', email: '', direccion: '', fecha_nacimiento: '', dia: '', mes: '', anio: '' })
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); setError('') }

  function buildFecha(dia, mes, anio) {
    if (dia && mes && anio && anio.length === 4) {
      const d = String(dia).padStart(2, '0')
      const m = String(mes).padStart(2, '0')
      setForm(f => ({ ...f, dia, mes, anio, fecha_nacimiento: `${anio}-${m}-${d}` }))
    } else {
      setForm(f => ({ ...f, dia, mes, anio, fecha_nacimiento: '' }))
    }
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!form.telefono.trim()) return setError('Ingresá tu número de teléfono')
    if (!form.password) return setError('Ingresá tu contraseña')
    setCargando(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { telefono: form.telefono, password: form.password })
      login(res.data.token, res.data.cliente)
      navigate('/inicio')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  async function handleRegistro(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return setError('El nombre es obligatorio')
    if (!form.telefono.trim()) return setError('El teléfono es obligatorio')
    if (!form.password || form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    setCargando(true)
    setError('')
    try {
      const res = await api.post('/auth/registro', form)
      login(res.data.token, res.data.cliente)
      navigate('/inicio')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1208 50%, #0f0a00 100%)' }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #e5ae1e 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #e5ae1e 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <img src="/logo.png" alt="Dos Ríos" className="w-24 h-24 rounded-full mx-auto mb-5 shadow-lg object-cover" />
          <h1 className="text-4xl font-extrabold text-white tracking-tight">CLUB</h1>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: '#e5ae1e' }}>DOS RÍOS</h1>
          <div className="flex items-center justify-center gap-2 mt-3 mb-3">
            <div className="h-px w-10 opacity-40" style={{ background: '#e5ae1e' }} />
            <span style={{ color: '#e5ae1e', opacity: 0.5, fontSize: 10 }}>✦</span>
            <div className="h-px w-10 opacity-40" style={{ background: '#e5ae1e' }} />
          </div>
          <p className="text-white/50 text-sm">Sumá puntos con cada compra y<br />canjeálos por premios.</p>
        </div>

        {/* PANTALLA INICIAL */}
        {!modo && (
          <div className="flex flex-col gap-3 animate-fade-in-up">
            <button
              onClick={() => setModo('registro')}
              className="w-full py-4 rounded-2xl font-bold text-base text-black"
              style={{ background: 'linear-gradient(135deg, #e5ae1e, #c9920f)' }}
            >
              Crear cuenta
            </button>
            <button
              onClick={() => setModo('login')}
              className="w-full py-4 rounded-2xl font-bold text-base border-2 text-white"
              style={{ borderColor: '#e5ae1e33' }}
            >
              Ya tengo cuenta
            </button>
          </div>
        )}

        {/* INICIAR SESIÓN */}
        {modo === 'login' && (
          <div className="bg-white rounded-3xl p-6 shadow-2xl animate-fade-in-up">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Iniciar sesión</h2>
            <p className="text-gray-400 text-sm mb-4">Ingresá con tu número y contraseña.</p>
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input
                type="tel"
                value={form.telefono}
                onChange={e => set('telefono', e.target.value)}
                placeholder="+54 9 11 ..."
                className="input-field"
                autoFocus
              />
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Contraseña"
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setMostrarPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button type="submit" disabled={cargando} className="btn-primary w-full mt-1">
                {cargando ? 'Ingresando...' : 'Ingresar'}
              </button>
              <button type="button" onClick={() => { setModo(null); setError('') }}
                className="text-gray-400 text-sm text-center">
                Volver
              </button>
            </form>
          </div>
        )}

        {/* REGISTRO */}
        {modo === 'registro' && (
          <div className="bg-white rounded-3xl p-6 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Crear cuenta</h2>
                <p className="text-gray-400 text-sm">Completá tus datos para unirte.</p>
              </div>
              <div className="bg-dorado-50 border border-dorado-200 rounded-2xl py-1.5 px-2.5 text-center">
                <p className="text-dorado-700 text-xs font-bold">⭐ +100 pts</p>
                <p className="text-dorado-500 text-xs">bienvenida</p>
              </div>
            </div>
            <form onSubmit={handleRegistro} className="flex flex-col gap-3">
              <input type="text" value={form.nombre} onChange={e => set('nombre', e.target.value)}
                placeholder="Nombre completo *" className="input-field" autoFocus />
              <input type="tel" value={form.telefono} onChange={e => set('telefono', e.target.value)}
                placeholder="Teléfono WhatsApp *" className="input-field" />
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Contraseña (mín. 6 caracteres) *"
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setMostrarPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="Email (opcional)" className="input-field" />
              <input type="text" value={form.direccion} onChange={e => set('direccion', e.target.value)}
                placeholder="Dirección de entrega (opcional)" className="input-field" />
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 ml-1">Fecha de nacimiento (opcional)</label>
                <div className="flex gap-2">
                  <input
                    type="number" inputMode="numeric" min="1" max="31"
                    placeholder="Día"
                    value={form.dia || ''}
                    onChange={e => { set('dia', e.target.value); buildFecha(e.target.value, form.mes, form.anio) }}
                    className="input-field text-center w-1/3"
                  />
                  <input
                    type="number" inputMode="numeric" min="1" max="12"
                    placeholder="Mes"
                    value={form.mes || ''}
                    onChange={e => { set('mes', e.target.value); buildFecha(form.dia, e.target.value, form.anio) }}
                    className="input-field text-center w-1/3"
                  />
                  <input
                    type="number" inputMode="numeric" min="1900" max="2010"
                    placeholder="Año"
                    value={form.anio || ''}
                    onChange={e => { set('anio', e.target.value); buildFecha(form.dia, form.mes, e.target.value) }}
                    className="input-field text-center w-1/3"
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button type="submit" disabled={cargando} className="btn-primary w-full mt-1">
                {cargando ? 'Creando cuenta...' : 'Crear cuenta y entrar'}
              </button>
              <button type="button" onClick={() => { setModo(null); setError('') }}
                className="text-gray-400 text-sm text-center">
                Volver
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}
