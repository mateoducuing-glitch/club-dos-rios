import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { ShoppingCart, Gift, Tag, Package, User, ChevronRight } from 'lucide-react'
import { MOCK_PUNTOS } from '../mockData'
import { puntosParaSiguienteNivelClient } from '../utils/niveles'

const NIVEL_CONFIG = {
  Bronce:  { emoji: '🥉', label: 'Bronce'  },
  Plata:   { emoji: '🥈', label: 'Plata'   },
  Oro:     { emoji: '🥇', label: 'Oro'     },
  Platino: { emoji: '💎', label: 'Platino' },
}

function saludo() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function Inicio() {
  const { usuario } = useAuth()
  const [puntos, setPuntos] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/puntos/resumen').then(res => setPuntos(res.data)).catch(() => setPuntos(MOCK_PUNTOS))
  }, [])

  const nivel = puntos?.nivel || usuario?.nivel || 'Bronce'
  const puntosActuales = puntos?.puntos_actuales ?? usuario?.puntos_actuales ?? 0
  const puntosTotales = puntos?.puntos_totales ?? usuario?.puntos_totales ?? 0
  const cfg = NIVEL_CONFIG[nivel] || NIVEL_CONFIG.Bronce
  const progreso = puntosParaSiguienteNivelClient(puntosTotales || puntosActuales)
  const porcentaje = progreso.siguienteNivel
    ? Math.min(100, Math.round(((puntosTotales - progreso.minNivelActual) / (progreso.maxNivelActual - progreso.minNivelActual)) * 100))
    : 100
  const nombre = usuario?.nombre?.split(' ')[0] || 'Miembro'

  return (
    <div className="min-h-full flex flex-col">

      {/* ── HERO ── */}
      <div
        className="relative overflow-hidden px-5 pt-12 pb-20"
        style={{ background: 'linear-gradient(160deg, #0a0a0a 0%, #1a1208 60%, #0f0a00 100%)' }}
      >
        {/* Destellos dorados */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full pointer-events-none opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #e5ae1e 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #e5ae1e 0%, transparent 70%)' }} />

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #e5ae1e, #c9920f)' }}>
              <span className="text-base">🥩</span>
            </div>
            <div>
              <p className="text-white/40 text-xs leading-none">Club</p>
              <p className="text-white text-sm font-bold leading-tight">Dos Ríos</p>
            </div>
          </div>

          {/* Badge de nivel */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: '#e5ae1e18', border: '1px solid #e5ae1e44', color: '#e5ae1e' }}
          >
            <span>{cfg.emoji}</span>
            <span>{cfg.label}</span>
          </div>
        </div>

        {/* Saludo */}
        <div className="relative z-10 mb-6">
          <p className="text-white/40 text-sm mb-0.5">{saludo()},</p>
          <h1 className="text-white text-3xl font-extrabold tracking-tight">{nombre} 👋</h1>
        </div>

        {/* Puntos */}
        <div className="relative z-10 mb-4">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Tus puntos acumulados</p>
          <div className="flex items-end gap-2">
            <span
              className="text-white font-black tabular-nums"
              style={{ fontSize: 56, lineHeight: 1 }}
            >
              {puntosActuales.toLocaleString('es-AR')}
            </span>
            <span className="font-bold mb-1.5" style={{ color: '#e5ae1e', fontSize: 20 }}>pts</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full animate-fill-bar"
              style={{ width: `${porcentaje}%`, background: 'linear-gradient(90deg, #c9920f, #e5ae1e, #f5d060)' }}
            />
          </div>
          <p className="text-white/35 text-xs whitespace-nowrap">
            {progreso.siguienteNivel
              ? `${progreso.puntosNecesarios.toLocaleString('es-AR')} pts para ${progreso.siguienteNivel}`
              : '🏆 Nivel máximo'}
          </p>
        </div>
      </div>

      {/* ── PANEL CONTENIDO ── */}
      <div className="flex-1 rounded-t-3xl -mt-6 px-4 pt-5 pb-6 md:px-6 space-y-4" style={{ background: '#f8f4ef' }}>

        {/* CTA principal */}
        <button
          onClick={() => navigate('/pedido')}
          className="w-full rounded-3xl py-5 flex items-center justify-between px-6 active:scale-95 transition-all shadow-lg"
          style={{ background: 'linear-gradient(135deg, #1a3a2a 0%, #2d5a40 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: '#e5ae1e22' }}>
              <ShoppingCart size={20} style={{ color: '#e5ae1e' }} />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-base leading-tight">Hacer un pedido</p>
              <p className="text-white/50 text-xs">Elegí tus cortes favoritos</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/40" />
        </button>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Gift,    label: 'Premios',  to: '/premios', accent: '#c9920f' },
            { icon: Tag,     label: 'Cupones',  to: '/cupones', accent: '#1a3a2a' },
            { icon: Package, label: 'Pedidos',  to: '/pedidos', accent: '#1a3a2a' },
            { icon: User,    label: 'Perfil',   to: '/perfil',  accent: '#c9920f' },
          ].map(({ icon: Icon, label, to, accent }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-white shadow-sm active:scale-95 transition-all"
            >
              <Icon size={22} style={{ color: accent }} strokeWidth={1.5} />
              <span className="text-xs font-semibold text-gray-600">{label}</span>
            </button>
          ))}
        </div>

        {/* Cómo funciona */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-dorado-100">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #fdf8ee, #f9edcc)' }}>
              <span className="text-xl">⭐</span>
            </div>
            <div>
              <p className="text-gray-800 font-semibold text-sm mb-0.5">¿Cómo ganás puntos?</p>
              <p className="text-gray-500 text-sm leading-relaxed">
                Ganás <strong className="text-gray-700">1 punto</strong> por cada <strong className="text-gray-700">$500</strong> de compra.
                Acumulá y canjeálos por premios exclusivos.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
