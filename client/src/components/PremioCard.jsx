import { Gift, Lock } from 'lucide-react'

export default function PremioCard({ premio, puntosActuales, onCanjear, canjeando }) {
  const puedesCanjear = puntosActuales >= premio.puntos_requeridos
  const puntasFaltantes = premio.puntos_requeridos - puntosActuales

  return (
    <div className={`card flex flex-col gap-3 transition-all duration-200 ${puedesCanjear ? 'hover:shadow-card-hover' : 'opacity-80'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
          puedesCanjear ? 'bg-dorado-50' : 'bg-gray-100'
        }`}>
          {premio.imagen_url
            ? <img src={premio.imagen_url} alt={premio.nombre} className="w-8 h-8 object-cover rounded-xl" />
            : <Gift size={22} className={puedesCanjear ? 'text-dorado-700' : 'text-gray-400'} />
          }
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-base">{premio.nombre}</h3>
          {premio.descripcion && (
            <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{premio.descripcion}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-400 text-lg">⭐</span>
          <span className="font-bold text-gray-800">{premio.puntos_requeridos.toLocaleString('es-AR')}</span>
          <span className="text-gray-500 text-sm">puntos</span>
        </div>
        {premio.stock !== null && premio.stock <= 5 && (
          <span className="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
            Últimos {premio.stock}
          </span>
        )}
      </div>

      {puedesCanjear ? (
        <button
          onClick={() => onCanjear(premio)}
          disabled={canjeando}
          className="btn-gold w-full text-center"
        >
          {canjeando ? 'Canjeando...' : 'CANJEAR'}
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-2xl py-3 text-gray-400 text-sm">
          <Lock size={14} />
          <span>Te faltan <strong>{puntasFaltantes.toLocaleString('es-AR')}</strong> puntos</span>
        </div>
      )}
    </div>
  )
}
