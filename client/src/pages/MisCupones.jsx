import { useEffect, useState } from 'react'
import api from '../api'
import CuponCard from '../components/CuponCard'
import Header from '../components/Header'
import { MOCK_CUPONES } from '../mockData'

export default function MisCupones() {
  const [cupones, setCupones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/cupones')
      .then(res => setCupones(res.data))
      .catch(() => setCupones(MOCK_CUPONES))
      .finally(() => setCargando(false))
  }, [])

  const activos = cupones.filter(c => c.estado === 'pendiente')
  const usados  = cupones.filter(c => c.estado !== 'pendiente')

  return (
    <div>
      <Header titulo="Mis Cupones" subtitulo={`${activos.length} disponibles`} />

      <div className="px-4 py-5 md:px-6 flex flex-col gap-4">
        {cargando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-verde-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cupones.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🎟️</p>
            <p className="font-medium">No tenés cupones todavía</p>
            <p className="text-sm mt-1">Canjea puntos por premios para obtener cupones</p>
          </div>
        ) : (
          <>
            {activos.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activos.map(c => <CuponCard key={c.id} cupon={c} />)}
                </div>
              </div>
            )}
            {usados.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-1 mt-2">Historial</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {usados.map(c => <CuponCard key={c.id} cupon={c} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
