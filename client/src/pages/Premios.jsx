import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import PremioCard from '../components/PremioCard'
import Header from '../components/Header'
import { MOCK_PREMIOS, MOCK_PUNTOS } from '../mockData'

export default function Premios() {
  const { usuario, actualizarUsuario } = useAuth()
  const [premios, setPremios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [canjeando, setCanjeando] = useState(null)
  const [exito, setExito] = useState(null)
  const [puntosActuales, setPuntosActuales] = useState(usuario?.puntos_actuales || 0)

  useEffect(() => {
    Promise.all([api.get('/premios'), api.get('/puntos/resumen')])
      .then(([premiosRes, puntosRes]) => {
        setPremios(premiosRes.data)
        setPuntosActuales(puntosRes.data.puntos_actuales)
      })
      .catch(() => { setPremios(MOCK_PREMIOS); setPuntosActuales(MOCK_PUNTOS.puntos_actuales) })
      .finally(() => setCargando(false))
  }, [])

  async function handleCanjear(premio) {
    if (!window.confirm(`¿Canjear "${premio.nombre}" por ${premio.puntos_requeridos} puntos?`)) return
    setCanjeando(premio.id)
    try {
      const res = await api.post(`/premios/${premio.id}/canjear`)
      const nuevoPuntaje = puntosActuales - premio.puntos_requeridos
      setPuntosActuales(nuevoPuntaje)
      actualizarUsuario({ puntos_actuales: nuevoPuntaje })
      setExito({ premio: premio.nombre, codigo: res.data.codigo })
      setTimeout(() => setExito(null), 5000)
    } catch (err) {
      alert(err.response?.data?.error || 'Error al canjear')
    } finally {
      setCanjeando(null)
    }
  }

  return (
    <div>
      <Header
        titulo="Premios"
        subtitulo={`Tenés ${puntosActuales.toLocaleString('es-AR')} puntos disponibles`}
      />

      <div className="px-4 py-5 flex flex-col gap-4">
        {exito && (
          <div className="bg-green-50 border border-green-200 rounded-3xl p-4 text-center animate-fade-in-up">
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bold text-green-700">{exito.premio} canjeado</p>
            <p className="text-green-600 text-sm mt-1">Código: <strong className="tracking-wider">{exito.codigo}</strong></p>
            <p className="text-green-500 text-xs mt-1">Encontralo en Mis Cupones</p>
          </div>
        )}

        {cargando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-verde-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : premios.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🎁</p>
            <p>No hay premios disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {premios.map(p => (
              <PremioCard
                key={p.id}
                premio={p}
                puntosActuales={puntosActuales}
                onCanjear={handleCanjear}
                canjeando={canjeando === p.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
