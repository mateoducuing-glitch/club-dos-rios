import { supabase } from '../lib/supabase.js'
import { calcularNivel } from './nivelesService.js'

const PUNTOS_POR_PESO = 500

export function calcularPuntosPorCompra(total) {
  return Math.floor(total / PUNTOS_POR_PESO)
}

export async function acreditarPuntos(clienteId, pedidoId, puntos, motivo = 'Compra') {
  const { data: cliente, error: errCliente } = await supabase
    .from('clientes')
    .select('puntos_actuales, puntos_totales')
    .eq('id', clienteId)
    .single()

  if (errCliente) throw new Error('Cliente no encontrado')

  const nuevosPuntos = cliente.puntos_actuales + puntos
  const nuevosTotales = cliente.puntos_totales + puntos
  const nuevoNivel = calcularNivel(nuevosTotales)

  await supabase.from('movimientos_puntos').insert({
    cliente_id: clienteId,
    pedido_id: pedidoId || null,
    tipo: 'suma',
    puntos,
    motivo
  })

  await supabase.from('clientes').update({
    puntos_actuales: nuevosPuntos,
    puntos_totales: nuevosTotales,
    nivel: nuevoNivel,
    updated_at: new Date().toISOString()
  }).eq('id', clienteId)

  return { puntos_sumados: puntos, puntos_actuales: nuevosPuntos, nivel: nuevoNivel }
}

export async function descontarPuntos(clienteId, puntos, motivo = 'Canje') {
  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('puntos_actuales')
    .eq('id', clienteId)
    .single()

  if (error) throw new Error('Cliente no encontrado')
  if (cliente.puntos_actuales < puntos) throw new Error('Puntos insuficientes')

  const nuevosPuntos = cliente.puntos_actuales - puntos

  await supabase.from('movimientos_puntos').insert({
    cliente_id: clienteId,
    tipo: 'canje',
    puntos: -puntos,
    motivo
  })

  await supabase.from('clientes').update({
    puntos_actuales: nuevosPuntos,
    updated_at: new Date().toISOString()
  }).eq('id', clienteId)

  return { puntos_descontados: puntos, puntos_actuales: nuevosPuntos }
}

export async function ajustarPuntos(clienteId, puntos, motivo = 'Ajuste manual') {
  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('puntos_actuales, puntos_totales')
    .eq('id', clienteId)
    .single()

  if (error) throw new Error('Cliente no encontrado')

  const nuevosPuntos = Math.max(0, cliente.puntos_actuales + puntos)
  const nuevosTotales = puntos > 0 ? cliente.puntos_totales + puntos : cliente.puntos_totales
  const nuevoNivel = calcularNivel(nuevosTotales)

  await supabase.from('movimientos_puntos').insert({
    cliente_id: clienteId,
    tipo: 'ajuste',
    puntos,
    motivo
  })

  await supabase.from('clientes').update({
    puntos_actuales: nuevosPuntos,
    puntos_totales: nuevosTotales,
    nivel: nuevoNivel,
    updated_at: new Date().toISOString()
  }).eq('id', clienteId)

  return { puntos_ajustados: puntos, puntos_actuales: nuevosPuntos, nivel: nuevoNivel }
}
