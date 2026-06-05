import { supabase } from '../lib/supabase.js'
import { descontarPuntos } from './puntosService.js'
import { v4 as uuidv4 } from 'uuid'

function generarCodigoCupon() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let codigo = 'DR-'
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return codigo
}

export async function canjearPremio(clienteId, premioId) {
  const { data: premio, error: errPremio } = await supabase
    .from('premios')
    .select('*')
    .eq('id', premioId)
    .eq('activo', true)
    .single()

  if (errPremio || !premio) throw new Error('Premio no disponible')
  if (premio.stock !== null && premio.stock <= 0) throw new Error('Premio sin stock')

  const { data: cliente, error: errCliente } = await supabase
    .from('clientes')
    .select('puntos_actuales, nombre')
    .eq('id', clienteId)
    .single()

  if (errCliente) throw new Error('Cliente no encontrado')
  if (cliente.puntos_actuales < premio.puntos_requeridos) {
    throw new Error(`Puntos insuficientes. Necesitás ${premio.puntos_requeridos - cliente.puntos_actuales} puntos más.`)
  }

  const codigoCupon = generarCodigoCupon()
  const fechaVencimiento = new Date()
  fechaVencimiento.setDate(fechaVencimiento.getDate() + 30)

  const { data: cupon, error: errCupon } = await supabase
    .from('canjes')
    .insert({
      cliente_id: clienteId,
      premio_id: premioId,
      codigo_cupon: codigoCupon,
      puntos_usados: premio.puntos_requeridos,
      estado: 'pendiente',
      fecha_vencimiento: fechaVencimiento.toISOString()
    })
    .select()
    .single()

  if (errCupon) throw new Error('Error al crear cupón')

  await descontarPuntos(clienteId, premio.puntos_requeridos, `Canje: ${premio.nombre}`)

  if (premio.stock !== null) {
    await supabase.from('premios').update({ stock: premio.stock - 1 }).eq('id', premioId)
  }

  return { cupon, premio, codigo: codigoCupon }
}
