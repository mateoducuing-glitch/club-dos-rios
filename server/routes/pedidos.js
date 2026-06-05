import express from 'express'
import { supabase } from '../lib/supabase.js'
import { autenticar } from './auth.js'
import { calcularPuntosPorCompra, acreditarPuntos } from '../services/puntosService.js'
import { calcularNivel } from '../services/nivelesService.js'

const router = express.Router()

// Webhook desde el sistema de pedidos
router.post('/sync', async (req, res) => {
  try {
    const secret = req.headers['x-api-secret']
    if (secret !== process.env.PEDIDOS_API_SECRET) {
      return res.status(401).json({ error: 'Secret inválido' })
    }

    const { pedido_externo_id, telefono, nombre_cliente, total, estado, fecha_pedido } = req.body

    if (!pedido_externo_id || !telefono || !total || !estado) {
      return res.status(400).json({ error: 'Campos requeridos: pedido_externo_id, telefono, total, estado' })
    }

    const telefonoLimpio = telefono.replace(/\s/g, '').replace(/-/g, '')

    // Buscar o crear cliente
    let { data: cliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefono', telefonoLimpio)
      .single()

    if (!cliente) {
      const { data: nuevoCliente, error } = await supabase
        .from('clientes')
        .insert({ telefono: telefonoLimpio, nombre: nombre_cliente || telefonoLimpio })
        .select()
        .single()
      if (error) throw error
      cliente = nuevoCliente
    }

    // Crear o actualizar pedido
    const { data: pedidoExistente } = await supabase
      .from('pedidos')
      .select('*')
      .eq('pedido_externo_id', pedido_externo_id)
      .single()

    let pedido
    if (pedidoExistente) {
      const { data } = await supabase
        .from('pedidos')
        .update({ estado, total, updated_at: new Date().toISOString() })
        .eq('id', pedidoExistente.id)
        .select()
        .single()
      pedido = data
    } else {
      const { data, error } = await supabase
        .from('pedidos')
        .insert({
          pedido_externo_id,
          cliente_id: cliente.id,
          telefono: telefonoLimpio,
          nombre_cliente,
          total,
          estado,
          fecha_pedido: fecha_pedido || new Date().toISOString()
        })
        .select()
        .single()
      if (error) throw error
      pedido = data
    }

    // Acreditar puntos si estado es entregado y no fueron acreditados
    let puntosResult = null
    if (estado.toLowerCase() === 'entregado' && !pedido.puntos_acreditados) {
      const puntos = calcularPuntosPorCompra(total)
      puntosResult = await acreditarPuntos(cliente.id, pedido.id, puntos, `Pedido ${pedido_externo_id}`)

      await supabase
        .from('pedidos')
        .update({ puntos_acreditados: true })
        .eq('id', pedido.id)

      // Verificar si es su primer pedido
      const { count } = await supabase
        .from('pedidos')
        .select('id', { count: 'exact' })
        .eq('cliente_id', cliente.id)
        .eq('estado', 'entregado')

      if (count === 1) {
        await acreditarPuntos(cliente.id, null, 50, 'Bono primer pedido')
        puntosResult.puntos_sumados += 50
        puntosResult.puntos_actuales += 50
      }

      // Actualizar cliente con datos frescos
      const { data: clienteActualizado } = await supabase
        .from('clientes')
        .select('puntos_actuales, nivel')
        .eq('id', cliente.id)
        .single()

      puntosResult.puntos_actuales = clienteActualizado.puntos_actuales
      puntosResult.nivel = clienteActualizado.nivel
    }

    res.json({
      cliente: nombre_cliente || cliente.nombre,
      puntos_sumados: puntosResult?.puntos_sumados || 0,
      puntos_actuales: puntosResult?.puntos_actuales || cliente.puntos_actuales,
      nivel: puntosResult?.nivel || cliente.nivel
    })
  } catch (err) {
    console.error('Error en sync pedidos:', err)
    res.status(500).json({ error: err.message })
  }
})

// Pedidos del cliente autenticado
router.get('/mis-pedidos', autenticar, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('cliente_id', req.usuario.id)
      .order('fecha_pedido', { ascending: false })
      .limit(30)

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
