import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { MOCK_CATALOGO } from '../mockData'
import { Plus, Minus, ArrowLeft, CheckCircle, MapPin, FileText, Banknote, ArrowLeftRight } from 'lucide-react'

const CATEGORIAS_EMOJI = {
  Vacunos: '🥩',
  Cerdo: '🍖',
  Embutidos: '🌭',
  Listos: '🍔',
}

const METODOS_PAGO = [
  { id: 'efectivo',      label: 'Efectivo',      icon: Banknote,       desc: 'Pagás al recibir' },
  { id: 'transferencia', label: 'Transferencia',  icon: ArrowLeftRight, desc: 'CBU/alias al confirmar' },
]

export default function HacerPedido() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { items, total, totalItems, agregar, quitar, cantidadDe, vaciar } = useCarrito()

  const [productos, setProductos] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [paso, setPaso] = useState('catalogo') // catalogo | carrito | exito
  const [direccion, setDireccion] = useState(usuario?.direccion || '')
  const [notas, setNotas] = useState('')
  const [metodoPago, setMetodoPago] = useState(usuario?.metodo_pago_preferido || '')
  const [enviando, setEnviando] = useState(false)
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null)

  useEffect(() => {
    api.get('/catalogo')
      .then(res => setProductos(res.data))
      .catch(() => setProductos(MOCK_CATALOGO))
  }, [])

  const categorias = [...new Set(productos.map(p => p.categoria))]
  const categoriaSeleccionada = categoriaActiva || categorias[0]
  const productosFiltrados = productos.filter(p => p.categoria === categoriaSeleccionada)
  const puntosAGanar = Math.floor(total / 500)

  async function confirmarPedido() {
    if (!direccion.trim()) return alert('Ingresá una dirección de entrega')
    if (!metodoPago) return alert('Seleccioná un método de pago')
    setEnviando(true)
    try {
      const res = await api.post('/catalogo/pedido', {
        items: items.map(i => ({ id: i.id, nombre: i.nombre, precio: i.precio, cantidad: i.cantidad, unidad: i.unidad })),
        direccion_entrega: direccion,
        notas,
        metodo_pago: metodoPago,
      })
      setPedidoConfirmado(res.data)
      vaciar()
      setPaso('exito')
    } catch (err) {
      alert('Error al confirmar el pedido: ' + (err.response?.data?.error || err.message))
    } finally {
      setEnviando(false)
    }
  }

  // ── PANTALLA ÉXITO ──────────────────────────────────────────
  if (paso === 'exito') {
    const metodo = METODOS_PAGO.find(m => m.id === pedidoConfirmado?.metodo_pago || m.id === metodoPago)
    return (
      <div className="min-h-screen bg-crema flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-fade-in-up w-full max-w-sm">
          <div className="w-24 h-24 bg-verde-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-verde-700" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">¡Pedido confirmado!</h2>
          <p className="text-gray-500 mb-6">Tu pedido fue enviado a Dos Ríos.<br />Te avisamos cuando esté listo.</p>

          <div className="card mb-4 text-left">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Número</span>
              <span className="font-bold text-gray-800 text-sm">{pedidoConfirmado?.pedido_externo_id}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Total</span>
              <span className="font-bold text-gray-800">${pedidoConfirmado?.total?.toLocaleString('es-AR')}</span>
            </div>
            {metodo && (
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Pago</span>
                <span className="font-semibold text-gray-700">{metodo.label}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Puntos acreditados</span>
              <span className="font-bold text-dorado-500">⭐ +{pedidoConfirmado?.puntos_sumados}</span>
            </div>
          </div>

          {metodoPago === 'transferencia' && (
            <div className="card bg-blue-50 border border-blue-100 mb-4 text-left">
              <p className="font-semibold text-blue-700 mb-1 text-sm">Datos para transferir</p>
              <p className="text-sm text-blue-600">CBU: <strong>0000000000000000000000</strong></p>
              <p className="text-sm text-blue-600">Alias: <strong>DOSRIOS.CARNICERIA</strong></p>
              <p className="text-xs text-blue-400 mt-1">Enviá el comprobante por WhatsApp</p>
            </div>
          )}

          <button onClick={() => navigate('/inicio')} className="btn-primary w-full">
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // ── PANTALLA CARRITO (móvil) ─────────────────────────────────
  if (paso === 'carrito') {
    return (
      <div className="min-h-screen bg-crema flex flex-col">
        <div className="bg-verde-700 text-white px-5 pt-12 pb-5 flex items-center gap-3">
          <button onClick={() => setPaso('catalogo')} className="p-2 rounded-xl bg-verde-600">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Tu pedido</h1>
            <p className="text-verde-200 text-sm">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {/* Items */}
          {items.map(item => (
            <div key={item.id} className="card flex items-center gap-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.nombre}</p>
                <p className="text-sm text-gray-400">${item.precio.toLocaleString('es-AR')} / {item.unidad}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => quitar(item.id)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Minus size={14} className="text-gray-600" />
                </button>
                <span className="w-6 text-center font-bold text-gray-800">{item.cantidad}</span>
                <button onClick={() => agregar(item)} className="w-8 h-8 rounded-full bg-verde-700 flex items-center justify-center">
                  <Plus size={14} className="text-white" />
                </button>
              </div>
              <p className="w-20 text-right font-bold text-gray-800">
                ${(item.precio * item.cantidad).toLocaleString('es-AR')}
              </p>
            </div>
          ))}

          {/* Dirección */}
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-verde-700" />
              <span className="font-semibold text-gray-700">Dirección de entrega</span>
            </div>
            <input
              type="text"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              placeholder="Ej: Av. San Martín 1234, piso 2"
              className="input-field"
            />
          </div>

          {/* Método de pago */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Banknote size={16} className="text-verde-700" />
              <span className="font-semibold text-gray-700">Método de pago</span>
            </div>
            <div className="flex flex-col gap-2">
              {METODOS_PAGO.map(m => {
                const Icon = m.icon
                return (
                  <button
                    key={m.id}
                    onClick={() => setMetodoPago(m.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                      metodoPago === m.id
                        ? 'border-verde-700 bg-verde-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      metodoPago === m.id ? 'bg-verde-700' : 'bg-gray-100'
                    }`}>
                      <Icon size={18} className={metodoPago === m.id ? 'text-white' : 'text-gray-500'} />
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${metodoPago === m.id ? 'text-verde-700' : 'text-gray-800'}`}>{m.label}</p>
                      <p className="text-xs text-gray-400">{m.desc}</p>
                    </div>
                    {metodoPago === m.id && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-verde-700 flex items-center justify-center">
                        <CheckCircle size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notas */}
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-verde-700" />
              <span className="font-semibold text-gray-700">Notas (opcional)</span>
            </div>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Ej: timbre roto, llamar por teléfono, corte especial..."
              className="input-field resize-none"
              rows={3}
            />
          </div>

          {/* Resumen */}
          <div className="card bg-verde-700 text-white">
            <div className="flex justify-between items-center mb-1">
              <span className="text-verde-200 text-sm">Total</span>
              <span className="font-bold">${total.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-verde-600">
              <span className="text-dorado-300 text-sm">⭐ Puntos a ganar</span>
              <span className="text-dorado-300 font-bold">+{puntosAGanar}</span>
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 pt-3 bg-white border-t border-gray-100">
          <button
            onClick={confirmarPedido}
            disabled={enviando || items.length === 0 || !metodoPago}
            className="btn-primary w-full text-base flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {enviando ? 'Enviando pedido...' : `Confirmar · $${total.toLocaleString('es-AR')}`}
          </button>
        </div>
      </div>
    )
  }

  // ── PANTALLA CATÁLOGO ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-crema flex flex-col">
      <div className="bg-verde-700 text-white px-5 pt-12 pb-5 md:pt-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-verde-600 md:hidden">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Hacer pedido</h1>
            <p className="text-verde-200 text-sm">Dos Ríos Carnicería</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                categoriaSeleccionada === cat ? 'bg-white text-verde-700' : 'bg-verde-600 text-verde-100'
              }`}
            >
              {CATEGORIAS_EMOJI[cat] || '🍽️'} {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Lista productos */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 content-start pb-28 md:pb-6">
          {productosFiltrados.map(producto => {
            const cantidad = cantidadDe(producto.id)
            return (
              <div key={producto.id} className="card flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-verde-50 flex items-center justify-center flex-shrink-0 text-2xl">
                  {CATEGORIAS_EMOJI[producto.categoria] || '🥩'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{producto.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{producto.descripcion}</p>
                  <p className="text-verde-700 font-bold text-sm mt-1">
                    ${producto.precio.toLocaleString('es-AR')}<span className="text-gray-400 font-normal"> / {producto.unidad}</span>
                  </p>
                </div>
                <div>
                  {cantidad === 0 ? (
                    <button onClick={() => agregar(producto)} className="w-10 h-10 rounded-2xl bg-verde-700 flex items-center justify-center active:scale-90 transition-all shadow-md">
                      <Plus size={18} className="text-white" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => quitar(producto.id)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-90 transition-all">
                        <Minus size={14} className="text-gray-600" />
                      </button>
                      <span className="w-5 text-center font-bold text-gray-800 text-sm">{cantidad}</span>
                      <button onClick={() => agregar(producto)} className="w-8 h-8 rounded-full bg-verde-700 flex items-center justify-center active:scale-90 transition-all">
                        <Plus size={14} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Panel derecho — solo desktop */}
        {totalItems > 0 && (
          <div className="hidden md:flex flex-col w-80 bg-white border-l border-gray-100 shadow-xl">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Tu pedido</h3>
              <p className="text-gray-400 text-sm">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{item.nombre}</p>
                    <p className="text-xs text-gray-400">${item.precio.toLocaleString('es-AR')} / {item.unidad}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => quitar(item.id)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <Minus size={11} />
                    </button>
                    <span className="w-4 text-center text-sm font-bold">{item.cantidad}</span>
                    <button onClick={() => agregar(item)} className="w-6 h-6 rounded-full bg-verde-700 flex items-center justify-center">
                      <Plus size={11} className="text-white" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-16 text-right">
                    ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                  </span>
                </div>
              ))}

              <div className="mt-1 flex flex-col gap-2">
                <input
                  type="text"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  placeholder="Dirección de entrega *"
                  className="input-field text-sm"
                />
                {/* Método de pago en desktop */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Método de pago</p>
                <div className="flex gap-2">
                  {METODOS_PAGO.map(m => {
                    const Icon = m.icon
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMetodoPago(m.id)}
                        title={m.label}
                        className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 transition-all text-xs font-semibold ${
                          metodoPago === m.id
                            ? 'border-verde-700 bg-verde-50 text-verde-700'
                            : 'border-gray-100 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        <Icon size={16} />
                        {m.label}
                      </button>
                    )
                  })}
                </div>
                <textarea
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Notas opcionales..."
                  className="input-field text-sm resize-none"
                  rows={2}
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 text-sm">Total</span>
                <span className="font-bold text-gray-800">${total.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-dorado-500 text-sm">⭐ Puntos a ganar</span>
                <span className="font-bold text-dorado-500">+{puntosAGanar}</span>
              </div>
              <button
                onClick={confirmarPedido}
                disabled={enviando || !metodoPago}
                className="btn-primary w-full disabled:opacity-50"
              >
                {enviando ? 'Enviando...' : 'Confirmar pedido'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botón carrito flotante — solo móvil */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-4 right-4 md:hidden z-50 animate-fade-in-up">
          <button
            onClick={() => setPaso('carrito')}
            className="w-full bg-verde-700 text-white rounded-3xl py-4 px-5 flex items-center justify-between shadow-2xl active:scale-95 transition-all"
          >
            <div className="bg-verde-600 rounded-xl w-8 h-8 flex items-center justify-center font-bold text-sm">{totalItems}</div>
            <span className="font-bold text-base">Ver pedido</span>
            <span className="font-bold">${total.toLocaleString('es-AR')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
