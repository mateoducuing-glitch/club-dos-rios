import { useState, useEffect } from 'react'
import api from '../api'
import { Users, Gift, Ticket, Star, BarChart3, Settings, LogOut, ChevronRight, Plus, Minus } from 'lucide-react'

const NIVEL_EMOJI = { Bronce: '🥉', Plata: '🥈', Oro: '🥇', Platino: '💎' }

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [seccion, setSeccion] = useState('stats')
  const [stats, setStats] = useState(null)
  const [clientes, setClientes] = useState([])
  const [premios, setPremios] = useState([])
  const [canjes, setCanjes] = useState([])
  const [topClientes, setTopClientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [ajusteModal, setAjusteModal] = useState(null)
  const [ajustePuntos, setAjustePuntos] = useState('')
  const [ajusteMotivo, setAjusteMotivo] = useState('')

  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  async function loginAdmin(e) {
    e.preventDefault()
    try {
      const res = await api.post('/admin/login', { password })
      localStorage.setItem('admin_token', res.data.token)
      setToken(res.data.token)
    } catch {
      setLoginError('Contraseña incorrecta')
    }
  }

  function logout() {
    localStorage.removeItem('admin_token')
    setToken(null)
  }

  useEffect(() => {
    if (!token) return
    api.get('/admin/stats', { headers }).then(r => setStats(r.data)).catch(() => {})
    api.get('/admin/clientes', { headers }).then(r => setClientes(r.data.data || [])).catch(() => {})
    api.get('/admin/premios', { headers }).then(r => setPremios(r.data)).catch(() => {})
    api.get('/admin/canjes', { headers }).then(r => setCanjes(r.data)).catch(() => {})
    api.get('/admin/top-clientes', { headers }).then(r => setTopClientes(r.data)).catch(() => {})
  }, [token])

  async function ajustarPuntos(tipo) {
    if (!ajustePuntos) return
    const delta = tipo === 'suma' ? Number(ajustePuntos) : -Number(ajustePuntos)
    try {
      await api.post(`/admin/clientes/${ajusteModal.id}/puntos`, { puntos: delta, motivo: ajusteMotivo || 'Ajuste manual admin' }, { headers })
      alert('Puntos ajustados correctamente')
      setAjusteModal(null)
      setAjustePuntos('')
      setAjusteMotivo('')
      api.get('/admin/clientes', { headers }).then(r => setClientes(r.data.data || []))
    } catch (err) {
      alert(err.response?.data?.error || 'Error')
    }
  }

  const clientesFiltrados = clientes.filter(c =>
    !busqueda || c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || c.telefono?.includes(busqueda)
  )

  if (!token) {
    return (
      <div className="min-h-screen bg-verde-700 flex items-center justify-center px-6">
        <div className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl">
          <div className="text-center mb-6">
            <span className="text-4xl">🔐</span>
            <h1 className="text-2xl font-bold text-gray-800 mt-2">Panel Admin</h1>
            <p className="text-gray-400 text-sm">Club Dos Ríos</p>
          </div>
          <form onSubmit={loginAdmin} className="flex flex-col gap-3">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña admin"
              className="input-field"
              autoFocus
            />
            {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
            <button type="submit" className="btn-primary w-full">Ingresar</button>
          </form>
        </div>
      </div>
    )
  }

  const secciones = [
    { key: 'stats',    icon: BarChart3, label: 'Estadísticas' },
    { key: 'clientes', icon: Users,     label: 'Clientes'     },
    { key: 'premios',  icon: Gift,      label: 'Premios'      },
    { key: 'canjes',   icon: Ticket,    label: 'Canjes'       },
    { key: 'top',      icon: Star,      label: 'Top Clientes' },
  ]

  return (
    <div className="min-h-screen bg-crema max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-verde-700 text-white px-5 pt-12 pb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Panel Admin</h1>
          <p className="text-verde-200 text-sm">Club Dos Ríos</p>
        </div>
        <button onClick={logout} className="p-2 rounded-xl bg-verde-600 hover:bg-verde-500">
          <LogOut size={18} />
        </button>
      </div>

      {/* Nav secciones */}
      <div className="flex overflow-x-auto gap-2 px-4 py-3 bg-white border-b border-gray-100">
        {secciones.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setSeccion(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              seccion === key ? 'bg-verde-700 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* STATS */}
        {seccion === 'stats' && stats && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Clientes totales', value: stats.clientes_total, emoji: '👥' },
                { label: 'Pedidos sincronizados', value: stats.pedidos_sincronizados, emoji: '📦' },
                { label: 'Puntos entregados', value: stats.puntos_entregados?.toLocaleString('es-AR'), emoji: '⭐' },
                { label: 'Puntos canjeados', value: stats.puntos_canjeados?.toLocaleString('es-AR'), emoji: '🎁' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="card text-center">
                  <p className="text-3xl mb-1">{emoji}</p>
                  <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-3">Clientes por nivel</h3>
              {Object.entries(stats.niveles || {}).map(([nivel, cant]) => (
                <div key={nivel} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm">{NIVEL_EMOJI[nivel]} {nivel}</span>
                  <span className="font-bold text-gray-700">{cant}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLIENTES */}
        {seccion === 'clientes' && (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="input-field"
            />
            {clientesFiltrados.map(c => (
              <div key={c.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{c.nombre || 'Sin nombre'}</p>
                    <p className="text-sm text-gray-400">{c.telefono}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-700">{NIVEL_EMOJI[c.nivel]} {c.nivel}</p>
                    <p className="text-xs text-gray-400">{(c.puntos_actuales || 0).toLocaleString('es-AR')} pts</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setAjusteModal(c)} className="flex-1 text-xs bg-verde-50 text-verde-700 font-semibold py-2 rounded-xl">
                    Ajustar puntos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PREMIOS */}
        {seccion === 'premios' && (
          <div className="flex flex-col gap-3">
            {premios.map(p => (
              <div key={p.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{p.nombre}</p>
                    <p className="text-sm text-gray-400">{p.puntos_requeridos.toLocaleString('es-AR')} puntos</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.activo ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    {p.stock !== null && <p className="text-xs text-gray-400 mt-1">Stock: {p.stock}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CANJES */}
        {seccion === 'canjes' && (
          <div className="flex flex-col gap-3">
            {canjes.map(c => (
              <div key={c.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800">{c.clientes?.nombre || 'Cliente'}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    c.estado === 'pendiente' ? 'bg-green-50 text-green-600' :
                    c.estado === 'usado' ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-400'
                  }`}>{c.estado}</span>
                </div>
                <p className="text-sm text-gray-600">{c.premios?.nombre}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs font-mono bg-gray-50 px-2 py-1 rounded-lg">{c.codigo_cupon}</p>
                  <p className="text-xs text-gray-400">{new Date(c.fecha_canje).toLocaleDateString('es-AR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TOP CLIENTES */}
        {seccion === 'top' && (
          <div className="flex flex-col gap-3">
            {topClientes.map((c, i) => (
              <div key={c.id} className="card flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  i === 0 ? 'bg-dorado-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{i + 1}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{c.nombre || c.telefono}</p>
                  <p className="text-xs text-gray-400">{NIVEL_EMOJI[c.nivel]} {c.nivel}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{(c.puntos_totales || 0).toLocaleString('es-AR')}</p>
                  <p className="text-xs text-gray-400">pts históricos</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal ajuste puntos */}
      {ajusteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-1">Ajustar puntos</h3>
            <p className="text-sm text-gray-400 mb-4">{ajusteModal.nombre} — {ajusteModal.puntos_actuales} pts actuales</p>
            <input
              type="number"
              value={ajustePuntos}
              onChange={e => setAjustePuntos(e.target.value)}
              placeholder="Cantidad de puntos"
              className="input-field mb-3"
            />
            <input
              type="text"
              value={ajusteMotivo}
              onChange={e => setAjusteMotivo(e.target.value)}
              placeholder="Motivo (opcional)"
              className="input-field mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setAjusteModal(null)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={() => ajustarPuntos('resta')} className="flex-1 bg-red-50 text-red-500 font-semibold py-3 rounded-2xl">- Quitar</button>
              <button onClick={() => ajustarPuntos('suma')} className="flex-1 bg-verde-700 text-white font-semibold py-3 rounded-2xl">+ Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
