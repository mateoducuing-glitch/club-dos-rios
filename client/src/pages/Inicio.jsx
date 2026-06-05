import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import NivelCard from '../components/NivelCard'
import { ShoppingCart } from 'lucide-react'
import { MOCK_PUNTOS } from '../mockData'

export default function Inicio() {
  const { usuario } = useAuth()
  const [puntos, setPuntos] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/puntos/resumen').then(res => setPuntos(res.data)).catch(() => setPuntos(MOCK_PUNTOS))
  }, [])

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-verde-700 pt-12 pb-8 px-5 md:pt-10">
        <p className="text-verde-200 text-sm font-medium mb-1">Bienvenido al</p>
        <h1 className="text-3xl font-extrabold text-white">Club Dos Ríos</h1>
        <p className="text-dorado-300 text-sm mt-1">🥩 Carnicería Premium</p>
      </div>

      <div className="px-4 -mt-4 pb-6 md:px-6 md:mt-6">
        {/* Grid desktop: tarjeta nivel + botones lado a lado */}
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6 gap-4">

          {/* Tarjeta nivel */}
          <div className="animate-fade-in-up md:col-span-1">
            <NivelCard
              nombre={usuario?.nombre}
              nivel={puntos?.nivel || usuario?.nivel || 'Bronce'}
              puntosActuales={puntos?.puntos_actuales ?? usuario?.puntos_actuales ?? 0}
              puntosTotales={puntos?.puntos_totales ?? usuario?.puntos_totales ?? 0}
            />
          </div>

          {/* Hacer pedido — destacado */}
          <div className="animate-fade-in-up md:col-span-1 md:flex md:flex-col md:justify-center">
            <button
              onClick={() => navigate('/pedido')}
              className="w-full bg-verde-700 text-white rounded-3xl py-5 font-bold text-lg flex items-center justify-center gap-3 shadow-card active:scale-95 transition-all hover:bg-verde-800"
            >
              <ShoppingCart size={22} />
              Hacer un pedido
            </button>
            <p className="text-center text-gray-400 text-xs mt-2">Elegí tus productos y confirmá tu pedido</p>
          </div>

          {/* Grid de accesos rápidos */}
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up">
            {[
              { emoji: '🎁', label: 'Premios',     to: '/premios' },
              { emoji: '🎟️', label: 'Mis Cupones', to: '/cupones' },
              { emoji: '📦', label: 'Mis Pedidos', to: '/pedidos' },
              { emoji: '👤', label: 'Mi Perfil',   to: '/perfil'  },
            ].map(({ emoji, label, to }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="bg-white rounded-3xl py-5 font-semibold text-gray-700 flex flex-col items-center gap-2 shadow-card active:scale-95 transition-all hover:shadow-card-hover"
              >
                <span className="text-3xl">{emoji}</span>
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Info puntos */}
          <div className="md:col-span-2 bg-dorado-50 border border-dorado-200 rounded-3xl p-4 animate-fade-in-up">
            <p className="text-dorado-700 font-semibold text-sm mb-1">💡 ¿Cómo funciona?</p>
            <p className="text-dorado-600 text-sm">Ganás <strong>1 punto</strong> por cada <strong>$500</strong> de compra. Acumulá puntos y canjeálos por premios exclusivos.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
