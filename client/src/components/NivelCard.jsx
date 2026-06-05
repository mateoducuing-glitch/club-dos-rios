import { puntosParaSiguienteNivelClient } from '../utils/niveles'

const NIVEL_CONFIG = {
  Bronce:  { emoji: '🥉', color: 'from-amber-700 to-amber-500',  textColor: 'text-amber-100' },
  Plata:   { emoji: '🥈', color: 'from-slate-500 to-slate-400',  textColor: 'text-slate-100' },
  Oro:     { emoji: '🥇', color: 'from-dorado-600 to-dorado-400', textColor: 'text-dorado-100' },
  Platino: { emoji: '💎', color: 'from-purple-700 to-indigo-500', textColor: 'text-purple-100' },
}

export default function NivelCard({ nombre, nivel, puntosActuales, puntosTotales }) {
  const config = NIVEL_CONFIG[nivel] || NIVEL_CONFIG.Bronce
  const progreso = puntosParaSiguienteNivelClient(puntosTotales || puntosActuales)
  const porcentaje = progreso.siguienteNivel
    ? Math.min(100, Math.round(((puntosTotales - progreso.minNivelActual) / (progreso.maxNivelActual - progreso.minNivelActual)) * 100))
    : 100

  return (
    <div className={`bg-gradient-to-br ${config.color} rounded-3xl p-6 shadow-card text-white`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className={`text-sm font-medium ${config.textColor} opacity-80`}>Hola</p>
          <h2 className="text-2xl font-bold">{nombre || 'Club Member'}</h2>
        </div>
        <div className="text-right">
          <p className={`text-xs ${config.textColor} opacity-70 uppercase tracking-wider`}>Nivel</p>
          <p className="text-xl font-bold flex items-center gap-1">
            {config.emoji} {nivel}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-end gap-1 mb-1">
          <span className="text-4xl font-extrabold">{(puntosActuales || 0).toLocaleString('es-AR')}</span>
          <span className={`text-sm ${config.textColor} opacity-70 mb-1`}>puntos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-300">⭐</span>
          <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-white rounded-full animate-fill-bar"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <span className={`text-xs ${config.textColor} opacity-70`}>{porcentaje}%</span>
        </div>
      </div>

      {progreso.siguienteNivel ? (
        <p className={`text-sm ${config.textColor} opacity-80`}>
          Te faltan <strong className="text-white">{progreso.puntosNecesarios.toLocaleString('es-AR')} puntos</strong> para llegar a <strong className="text-white">{progreso.siguienteNivel}</strong>
        </p>
      ) : (
        <p className={`text-sm ${config.textColor} opacity-80`}>
          🏆 ¡Alcanzaste el nivel máximo!
        </p>
      )}
    </div>
  )
}
