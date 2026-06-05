import { Package, CheckCircle, Clock, ChefHat, Truck } from 'lucide-react'

const ESTADO_CONFIG = {
  pendiente:  { label: 'Pendiente',    icon: Clock,        color: 'text-orange-500', bg: 'bg-orange-50' },
  preparando: { label: 'En preparación', icon: ChefHat,    color: 'text-blue-500',   bg: 'bg-blue-50'   },
  listo:      { label: 'Listo',         icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50'  },
  entregado:  { label: 'Entregado',     icon: Truck,       color: 'text-verde-700',  bg: 'bg-verde-50'  },
}

export default function PedidoCard({ pedido }) {
  const estado = ESTADO_CONFIG[pedido.estado?.toLowerCase()] || ESTADO_CONFIG.pendiente
  const Icon = estado.icon
  const fecha = new Date(pedido.fecha_pedido || pedido.created_at)

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            {fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${estado.bg}`}>
          <Icon size={13} className={estado.color} />
          <span className={`text-xs font-semibold ${estado.color}`}>{estado.label}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">
            ${(pedido.total || 0).toLocaleString('es-AR')}
          </p>
          {pedido.pedido_externo_id && (
            <p className="text-xs text-gray-400 mt-0.5">{pedido.pedido_externo_id}</p>
          )}
        </div>
        {pedido.puntos_acreditados && (
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm font-bold text-gray-700">
                +{Math.floor((pedido.total || 0) / 500)}
              </span>
            </div>
            <p className="text-xs text-gray-400">puntos ganados</p>
          </div>
        )}
      </div>
    </div>
  )
}
