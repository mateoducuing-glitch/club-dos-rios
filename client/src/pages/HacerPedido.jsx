import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCarrito } from '../context/CarritoContext'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { MOCK_CATALOGO } from '../mockData'
import { Plus, Minus, ArrowLeft, CheckCircle, MapPin, FileText, Banknote, ArrowLeftRight, Search, X, ShoppingBag } from 'lucide-react'

const CATEGORIAS_EMOJI = {
  Cortes: '🥩',
  Achuras: '🍖',
  'Elaborados y Pollo': '🍗',
  Otros: '🔥',
}

const METODOS_PAGO = [
  { id: 'efectivo',      label: 'Efectivo',      icon: Banknote,       desc: 'Pagás al recibir' },
  { id: 'transferencia', label: 'Transferencia',  icon: ArrowLeftRight, desc: 'CBU/alias al confirmar' },
]

function AvisoPrecioReferencia({ onCancelar, onConfirmar, enviando }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-end md:items-center justify-center px-4 pb-6 md:pb-0">
      <div className="card w-full max-w-sm bg-white animate-fade-in-up">
        <h3 className="font-bold text-gray-800 text-lg mb-2">Precio de referencia</h3>
        <p className="text-sm text-gray-500 mb-5">
          Este precio es una referencia. Una vez que pesemos tu pedido, te vamos a enviar el total correcto.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancelar} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={onConfirmar} disabled={enviando} className="btn-primary flex-1 disabled:opacity-50">
            {enviando ? 'Enviando...' : 'Confirmar pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DetalleProducto({ producto, cantidad, onCerrar, onAgregar }) {
  const [imagenCargada, setImagenCargada] = useState(false)
  const [imagenError, setImagenError] = useState(false)
  const [cantidadLocal, setCantidadLocal] = useState(1)
  const [confirmacionVisible, setConfirmacionVisible] = useState(false)
  const dialogRef = useRef(null)
  const focoAnteriorRef = useRef(null)

  // Accesibilidad: foco inicial, trampa de foco, Escape, bloqueo de scroll, restaurar foco al cerrar
  useEffect(() => {
    focoAnteriorRef.current = document.activeElement
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onCerrar()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const primero = focusables[0]
        const ultimo = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault()
          ultimo.focus()
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault()
          primero.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      if (focoAnteriorRef.current?.focus) focoAnteriorRef.current.focus()
    }
  }, [onCerrar])

  function confirmarAgregado() {
    for (let i = 0; i < cantidadLocal; i++) onAgregar(producto)
    setConfirmacionVisible(true)
    setTimeout(() => {
      onCerrar()
    }, 700)
  }

  const subtotal = producto.precio * cantidadLocal
  const mostrarImagen = producto.imagen_url && !imagenError

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[60] flex items-end md:items-center justify-center animate-backdrop-in"
      onClick={onCerrar}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-producto-titulo"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full md:w-auto md:min-w-[420px] md:max-w-[600px] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] md:max-h-[85vh] outline-none animate-sheet-up"
      >
        {/* Imagen */}
        <div className="relative flex-shrink-0 bg-verde-50 rounded-t-3xl md:rounded-t-3xl overflow-hidden">
          {mostrarImagen ? (
            <>
              {!imagenCargada && <div className="w-full aspect-[4/3] max-h-[34vh] bg-gray-200 animate-pulse" />}
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                onLoad={() => setImagenCargada(true)}
                onError={() => setImagenError(true)}
                className={`w-full aspect-[4/3] max-h-[34vh] object-cover ${imagenCargada ? 'block' : 'hidden'}`}
              />
            </>
          ) : (
            <div className="w-full aspect-[4/3] max-h-[34vh] flex items-center justify-center text-7xl">
              {CATEGORIAS_EMOJI[producto.categoria] || '🥩'}
            </div>
          )}
          <button
            onClick={onCerrar}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-md active:scale-90 transition-all"
            aria-label="Cerrar"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
          <h2 id="detalle-producto-titulo" className="text-2xl font-bold text-gray-900 tracking-tight">
            {producto.nombre}
          </h2>
          {producto.descripcion && (
            <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">{producto.descripcion}</p>
          )}

          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-3xl font-extrabold text-verde-700">
              ${producto.precio.toLocaleString('es-AR')}
            </span>
            <span className="text-gray-400 text-sm">/ {producto.unidad}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Precio de referencia — el total final se ajusta al peso real del corte.
          </p>

          {/* Selector de cantidad (local, todavia no se agrega al pedido) */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cantidad</p>
              {cantidad > 0 && (
                <p className="text-xs text-gray-400">Ya tenés {cantidad} {producto.unidad} en tu pedido</p>
              )}
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2">
              <button
                onClick={() => setCantidadLocal(c => Math.max(1, c - 1))}
                disabled={cantidadLocal <= 1}
                className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center active:scale-90 transition-all disabled:opacity-30 disabled:active:scale-100"
                aria-label="Restar unidad"
              >
                <Minus size={18} className="text-gray-700" />
              </button>
              <span className="font-bold text-gray-900 text-lg tabular-nums" aria-live="polite">
                {cantidadLocal} {producto.unidad}
              </span>
              <button
                onClick={() => setCantidadLocal(c => c + 1)}
                className="w-11 h-11 rounded-xl bg-verde-700 flex items-center justify-center active:scale-90 transition-all"
                aria-label="Sumar unidad"
              >
                <Plus size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Subtotal + confirmación */}
          <div className="mt-4 min-h-[2.5rem]">
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500">Subtotal estimado</span>
              <span className="font-bold text-gray-900 text-lg">${subtotal.toLocaleString('es-AR')}</span>
            </div>
            <p
              className={`flex items-center gap-1.5 text-sm font-semibold text-verde-700 mt-2 transition-opacity duration-300 ${
                confirmacionVisible ? 'opacity-100' : 'opacity-0'
              }`}
              aria-live="polite"
            >
              <CheckCircle size={15} /> Agregado al pedido
            </p>
          </div>
        </div>

        {/* Footer fijo */}
        <div className="flex-shrink-0 px-6 pt-3 border-t border-gray-100 safe-bottom">
          <button
            onClick={confirmarAgregado}
            disabled={confirmacionVisible}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-80"
          >
            <Plus size={18} /> Agregar {cantidadLocal} al pedido
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HacerPedido() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { items, total, totalItems, agregar, quitar, cantidadDe, vaciar } = useCarrito()

  const [productos, setProductos] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [paso, setPaso] = useState('catalogo') // catalogo | carrito | exito
  const [direccion, setDireccion] = useState(usuario?.direccion || '')
  const [notas, setNotas] = useState('')
  const [metodoPago, setMetodoPago] = useState(usuario?.metodo_pago_preferido || '')
  const [enviando, setEnviando] = useState(false)
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null)
  const [avisoAbierto, setAvisoAbierto] = useState(false)
  const [productoDetalle, setProductoDetalle] = useState(null)

  useEffect(() => {
    api.get('/catalogo')
      .then(res => setProductos(res.data))
      .catch(() => setProductos(MOCK_CATALOGO))
  }, [])

  const categorias = [...new Set(productos.map(p => p.categoria))]
  const categoriaSeleccionada = categoriaActiva || categorias[0]
  const buscando = busqueda.trim().length > 0
  const productosFiltrados = buscando
    ? productos.filter(p => p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    : categoriaSeleccionada === 'Todos'
      ? productos
      : productos.filter(p => p.categoria === categoriaSeleccionada)
  const puntosAGanar = Math.floor(total / 500)

  function abrirAviso() {
    if (!direccion.trim()) return alert('Ingresá una dirección de entrega')
    if (!metodoPago) return alert('Seleccioná un método de pago')
    setAvisoAbierto(true)
  }

  async function confirmarPedido() {
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
      <div className="h-pantalla bg-crema flex flex-col">
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
            onClick={abrirAviso}
            disabled={enviando || items.length === 0 || !metodoPago}
            className="btn-primary w-full text-base flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {enviando ? 'Enviando pedido...' : `Confirmar · $${total.toLocaleString('es-AR')}`}
          </button>
        </div>

        {avisoAbierto && (
          <AvisoPrecioReferencia
            enviando={enviando}
            onCancelar={() => setAvisoAbierto(false)}
            onConfirmar={confirmarPedido}
          />
        )}
      </div>
    )
  }

  // ── PANTALLA CATÁLOGO ────────────────────────────────────────
  return (
    <div className="h-pantalla bg-crema flex flex-col">
      <div className="bg-verde-700 text-white px-4 pt-4 pb-3 md:px-8 md:pt-5 rounded-b-3xl shadow-lg">
        <div className="max-w-5xl mx-auto">
          <p className="text-dorado-300 text-[11px] font-bold tracking-[0.15em] uppercase mb-1.5">
            Dos Ríos · Carnicería
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-verde-600 active:bg-verde-600 transition-colors flex-shrink-0"
              aria-label="Volver"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold leading-tight truncate">Elegí tus productos</h1>
              <p className="text-verde-200 text-xs md:text-sm mt-0.5 truncate">Cortes seleccionados para tu mesa</p>
            </div>
            <button
              onClick={() => setPaso('carrito')}
              className="relative p-2 -mr-2 rounded-full hover:bg-verde-600 active:bg-verde-600 transition-colors flex-shrink-0"
              aria-label="Ver pedido"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-dorado-500 text-verde-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          <div className="relative mt-3.5">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-white text-gray-800 text-sm rounded-2xl pl-10 pr-9 py-2.5 outline-none placeholder:text-gray-400"
            />
            {buscando && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto mt-3 -mx-1 px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {['Todos', ...categorias].map(cat => {
              const activa = !buscando && categoriaSeleccionada === cat
              return (
                <button
                  key={cat}
                  onClick={() => { setCategoriaActiva(cat); setBusqueda('') }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                    activa ? 'bg-crema text-verde-800' : 'bg-verde-600 text-white'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Lista productos */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 content-start pb-28 md:pb-6">
          {buscando && productosFiltrados.length === 0 && (
            <p className="col-span-full text-center text-gray-400 text-sm py-8">
              No encontramos productos para "{busqueda.trim()}"
            </p>
          )}
          {productosFiltrados.map(producto => {
            const cantidad = cantidadDe(producto.id)
            return (
              <div
                key={producto.id}
                className="card p-0 overflow-hidden flex flex-col cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => setProductoDetalle(producto)}
              >
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square bg-verde-50 flex items-center justify-center text-6xl">
                    {CATEGORIAS_EMOJI[producto.categoria] || '🥩'}
                  </div>
                )}
                <div className="p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{producto.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{producto.descripcion}</p>
                    <p className="text-verde-700 font-bold text-sm mt-1">
                      ${producto.precio.toLocaleString('es-AR')}<span className="text-gray-400 font-normal"> / {producto.unidad}</span>
                    </p>
                  </div>
                  <div onClick={e => e.stopPropagation()}>
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
              </div>
            )
          })}
        </div>

        {/* Panel derecho — solo desktop */}
        {totalItems > 0 && (
          <div className="hidden md:flex flex-col w-80 bg-white border-l border-gray-100 shadow-xl">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">Tu pedido</h3>
              <p className="text-gray-400 text-xs">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
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

              <div className="mt-1 flex flex-col gap-1.5">
                <input
                  type="text"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  placeholder="Dirección de entrega *"
                  className="input-field text-sm !py-2"
                />
                {/* Método de pago en desktop */}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5">Método de pago</p>
                <div className="flex gap-2">
                  {METODOS_PAGO.map(m => {
                    const Icon = m.icon
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMetodoPago(m.id)}
                        title={m.label}
                        className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl border-2 transition-all text-xs font-semibold ${
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
                  className="input-field text-sm resize-none !py-2"
                  rows={2}
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-500 text-sm">Total</span>
                <span className="font-bold text-gray-800">${total.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-dorado-500 text-sm">⭐ Puntos a ganar</span>
                <span className="font-bold text-dorado-500">+{puntosAGanar}</span>
              </div>
              <button
                onClick={abrirAviso}
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
      {totalItems > 0 && !productoDetalle && (
        <div
          className="fixed left-4 right-4 md:hidden z-50 animate-fade-in-up"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }}
        >
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

      {avisoAbierto && (
        <AvisoPrecioReferencia
          enviando={enviando}
          onCancelar={() => setAvisoAbierto(false)}
          onConfirmar={confirmarPedido}
        />
      )}

      {productoDetalle && (
        <DetalleProducto
          producto={productoDetalle}
          cantidad={cantidadDe(productoDetalle.id)}
          onCerrar={() => setProductoDetalle(null)}
          onAgregar={agregar}
        />
      )}
    </div>
  )
}
