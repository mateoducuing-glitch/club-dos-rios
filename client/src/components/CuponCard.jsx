import { MessageCircle, CheckCircle, XCircle, Clock } from 'lucide-react'

const WHATSAPP = import.meta.env.VITE_WHATSAPP_DOS_RIOS || '+5491161333709'

const ESTADO_CONFIG = {
  pendiente: { label: 'Disponible', color: 'text-verde-700', bg: 'bg-verde-50', icon: Clock },
  usado:     { label: 'Usado',      color: 'text-gray-400',  bg: 'bg-gray-50',  icon: CheckCircle },
  vencido:   { label: 'Vencido',    color: 'text-red-400',   bg: 'bg-red-50',   icon: XCircle },
  cancelado: { label: 'Cancelado',  color: 'text-gray-400',  bg: 'bg-gray-50',  icon: XCircle },
}

export default function CuponCard({ cupon }) {
  const estado = ESTADO_CONFIG[cupon.estado] || ESTADO_CONFIG.pendiente
  const Icon = estado.icon
  const vencimiento = cupon.fecha_vencimiento ? new Date(cupon.fecha_vencimiento) : null
  const nombrePremio = cupon.premios?.nombre || 'Premio'

  function usarPorWhatsApp() {
    const texto = encodeURIComponent(`Hola Dos Ríos, quiero utilizar mi cupón ${cupon.codigo_cupon}.`)
    window.open(`https://wa.me/${WHATSAPP.replace(/\D/g, '')}?text=${texto}`, '_blank')
  }

  return (
    <div className={`card ${cupon.estado !== 'pendiente' ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{nombrePremio}</h3>
          {vencimiento && (
            <p className="text-xs text-gray-400 mt-0.5">
              Vence: {vencimiento.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${estado.bg}`}>
          <Icon size={12} className={estado.color} />
          <span className={`text-xs font-semibold ${estado.color}`}>{estado.label}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl py-3 px-4 mb-3 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Código</p>
        <p className="text-2xl font-bold tracking-widest text-gray-800">{cupon.codigo_cupon}</p>
      </div>

      {cupon.estado === 'pendiente' && (
        <button onClick={usarPorWhatsApp} className="btn-primary w-full flex items-center justify-center gap-2">
          <MessageCircle size={16} />
          USAR POR WHATSAPP
        </button>
      )}
    </div>
  )
}
