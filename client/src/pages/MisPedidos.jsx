import { useEffect, useState } from 'react'
import api from '../api'
import PedidoCard from '../components/PedidoCard'
import Header from '../components/Header'
import { MOCK_PEDIDOS } from '../mockData'

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/pedidos/mis-pedidos')
      .then(res => setPedidos(res.data))
      .catch(() => setPedidos(MOCK_PEDIDOS))
      .finally(() => setCargando(false))
  }, [])

  return (
    <div>
      <Header titulo="Mis Pedidos" subtitulo={`${pedidos.length} pedidos en total`} />

      <div className="px-4 py-5 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cargando ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-verde-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📦</p>
            <p className="font-medium">Todavía no tenés pedidos</p>
            <p className="text-sm mt-1">Tus pedidos aparecerán acá cuando se sincronicen</p>
          </div>
        ) : (
          pedidos.map(p => <PedidoCard key={p.id} pedido={p} />)
        )}
      </div>
    </div>
  )
}
