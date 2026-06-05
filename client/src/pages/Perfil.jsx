import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import Header from '../components/Header'
import { LogOut, Edit3, Check, Banknote, ArrowLeftRight, CreditCard, ChevronRight } from 'lucide-react'

const NIVEL_EMOJI = { Bronce: '🥉', Plata: '🥈', Oro: '🥇', Platino: '💎' }

const METODOS_PAGO = [
  { id: 'efectivo',      label: 'Efectivo',      icon: Banknote,       desc: 'Pagás al recibir' },
  { id: 'transferencia', label: 'Transferencia',  icon: ArrowLeftRight, desc: 'CBU/alias' },
  { id: 'tarjeta',       label: 'Tarjeta',        icon: CreditCard,     desc: 'Débito o crédito' },
]

const TIPOS_TARJETA = ['Visa débito', 'Visa crédito', 'Mastercard débito', 'Mastercard crédito', 'Cabal', 'Naranja', 'Otra']

export default function Perfil() {
  const { usuario, logout, actualizarUsuario } = useAuth()

  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    email: usuario?.email || '',
    direccion: usuario?.direccion || '',
    fecha_nacimiento: usuario?.fecha_nacimiento || '',
  })
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  const [editandoPago, setEditandoPago] = useState(false)
  const [metodoPref, setMetodoPref] = useState(usuario?.metodo_pago_preferido || '')
  const [tarjetaTipo, setTarjetaTipo] = useState(usuario?.tarjeta_tipo || '')
  const [tarjetaUltimos4, setTarjetaUltimos4] = useState(usuario?.tarjeta_ultimos4 || '')
  const [guardandoPago, setGuardandoPago] = useState(false)
  const [guardadoPago, setGuardadoPago] = useState(false)

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    try {
      const res = await api.put('/clientes/me', form)
      actualizarUsuario(res.data)
      setEditando(false)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2000)
    } catch {
      alert('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function guardarPago() {
    setGuardandoPago(true)
    try {
      const payload = {
        metodo_pago_preferido: metodoPref,
        tarjeta_tipo: metodoPref === 'tarjeta' ? tarjetaTipo : null,
        tarjeta_ultimos4: metodoPref === 'tarjeta' ? tarjetaUltimos4.replace(/\D/g, '').slice(0, 4) : null,
      }
      const res = await api.put('/clientes/me', payload)
      actualizarUsuario(res.data)
      setEditandoPago(false)
      setGuardadoPago(true)
      setTimeout(() => setGuardadoPago(false), 2000)
    } catch {
      alert('Error al guardar método de pago')
    } finally {
      setGuardandoPago(false)
    }
  }

  const nivel = usuario?.nivel || 'Bronce'
  const emoji = NIVEL_EMOJI[nivel] || '🥉'
  const metodoPagoActual = METODOS_PAGO.find(m => m.id === usuario?.metodo_pago_preferido)

  return (
    <div>
      <Header titulo="Mi Perfil" />

      <div className="px-4 py-5 md:px-6 md:grid md:grid-cols-2 md:gap-6 flex flex-col gap-4">

        {/* Card nivel */}
        <div className="card text-center">
          <div className="w-16 h-16 rounded-full bg-verde-50 flex items-center justify-center mx-auto mb-3 text-3xl">
            {emoji}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{usuario?.nombre || 'Sin nombre'}</h2>
          <p className="text-gray-400 text-sm">{usuario?.telefono}</p>
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{(usuario?.puntos_actuales || 0).toLocaleString('es-AR')}</p>
              <p className="text-xs text-gray-400">Puntos actuales</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{(usuario?.puntos_totales || 0).toLocaleString('es-AR')}</p>
              <p className="text-xs text-gray-400">Históricos</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800">{emoji} {nivel}</p>
              <p className="text-xs text-gray-400">Nivel</p>
            </div>
          </div>
        </div>

        {/* Datos personales */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Mis datos</h3>
            {!editando && (
              <button onClick={() => setEditando(true)} className="flex items-center gap-1.5 text-verde-700 font-medium text-sm">
                <Edit3 size={14} /> Editar
              </button>
            )}
          </div>

          {editando ? (
            <form onSubmit={guardar} className="flex flex-col gap-3">
              {[
                { label: 'Nombre', key: 'nombre', type: 'text', placeholder: 'Tu nombre completo' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'tucorreo@email.com' },
                { label: 'Dirección', key: 'direccion', type: 'text', placeholder: 'Tu dirección de entrega' },
                { label: 'Fecha de nacimiento', key: 'fecha_nacimiento', type: 'date', placeholder: '' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="input-field"
                  />
                </div>
              ))}
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setEditando(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={guardando} className="btn-primary flex-1">
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              {[
                { label: 'Teléfono', value: usuario?.telefono },
                { label: 'Nombre', value: usuario?.nombre },
                { label: 'Email', value: usuario?.email },
                { label: 'Dirección', value: usuario?.direccion },
                { label: 'Miembro desde', value: usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }) : null },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                  <span className="text-sm text-gray-700 font-medium">{value}</span>
                </div>
              ) : null)}
            </div>
          )}

          {guardado && (
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm mt-3">
              <Check size={16} /> Datos guardados
            </div>
          )}
        </div>

        {/* Método de pago */}
        <div className="card md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-verde-700" />
              <h3 className="font-semibold text-gray-700">Método de pago preferido</h3>
            </div>
            {!editandoPago && (
              <button onClick={() => setEditandoPago(true)} className="flex items-center gap-1.5 text-verde-700 font-medium text-sm">
                <Edit3 size={14} /> {metodoPagoActual ? 'Cambiar' : 'Agregar'}
              </button>
            )}
          </div>

          {editandoPago ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                {METODOS_PAGO.map(m => {
                  const Icon = m.icon
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMetodoPref(m.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                        metodoPref === m.id
                          ? 'border-verde-700 bg-verde-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        metodoPref === m.id ? 'bg-verde-700' : 'bg-gray-100'
                      }`}>
                        <Icon size={18} className={metodoPref === m.id ? 'text-white' : 'text-gray-500'} />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${metodoPref === m.id ? 'text-verde-700' : 'text-gray-800'}`}>{m.label}</p>
                        <p className="text-xs text-gray-400">{m.desc}</p>
                      </div>
                      {metodoPref === m.id && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-verde-700 flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Datos de tarjeta */}
              {metodoPref === 'tarjeta' && (
                <div className="flex flex-col gap-2 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tipo de tarjeta</label>
                    <select
                      value={tarjetaTipo}
                      onChange={e => setTarjetaTipo(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Seleccioná el tipo</option>
                      {TIPOS_TARJETA.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Últimos 4 dígitos</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={tarjetaUltimos4}
                      onChange={e => setTarjetaUltimos4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="1234"
                      className="input-field tracking-widest"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-1">
                <button onClick={() => { setEditandoPago(false); setMetodoPref(usuario?.metodo_pago_preferido || ''); setTarjetaTipo(usuario?.tarjeta_tipo || ''); setTarjetaUltimos4(usuario?.tarjeta_ultimos4 || '') }} className="btn-secondary flex-1">
                  Cancelar
                </button>
                <button onClick={guardarPago} disabled={guardandoPago || !metodoPref} className="btn-primary flex-1 disabled:opacity-50">
                  {guardandoPago ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {metodoPagoActual ? (
                <div className="flex items-center gap-3 p-3 bg-verde-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-verde-700 flex items-center justify-center">
                    {(() => { const Icon = metodoPagoActual.icon; return <Icon size={18} className="text-white" /> })()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-verde-700">{metodoPagoActual.label}</p>
                    {usuario?.metodo_pago_preferido === 'tarjeta' && usuario?.tarjeta_ultimos4 && (
                      <p className="text-xs text-gray-500">
                        {usuario.tarjeta_tipo && `${usuario.tarjeta_tipo} · `}terminada en <strong>{usuario.tarjeta_ultimos4}</strong>
                      </p>
                    )}
                    {usuario?.metodo_pago_preferido !== 'tarjeta' && (
                      <p className="text-xs text-gray-400">{metodoPagoActual.desc}</p>
                    )}
                  </div>
                  <Check size={16} className="text-verde-700" />
                </div>
              ) : (
                <button
                  onClick={() => setEditandoPago(true)}
                  className="w-full flex items-center justify-between p-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-verde-300 hover:text-verde-600 transition-all"
                >
                  <span className="text-sm">Agregar método de pago</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}

          {guardadoPago && (
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm mt-3">
              <Check size={16} /> Método de pago guardado
            </div>
          )}
        </div>

        <button
          onClick={() => { if (window.confirm('¿Cerrar sesión?')) logout() }}
          className="flex items-center justify-center gap-2 text-red-400 font-medium py-3 hover:text-red-600 transition-colors md:col-span-2"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
