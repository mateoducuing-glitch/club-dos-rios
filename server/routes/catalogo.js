import express from 'express'
import axios from 'axios'
import { supabase } from '../lib/supabase.js'
import { autenticar } from './auth.js'
import { calcularPuntosPorCompra, acreditarPuntos } from '../services/puntosService.js'

const router = express.Router()

// GET catálogo de productos
router.get('/', autenticar, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('catalogo')
      .select('*')
      .eq('disponible', true)
      .order('categoria')
      .order('orden')

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST confirmar pedido desde la app
router.post('/pedido', autenticar, async (req, res) => {
  try {
    const { items, direccion_entrega, notas, metodo_pago } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' })
    }
    if (!metodo_pago) {
      return res.status(400).json({ error: 'Seleccioná un método de pago' })
    }

    const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
    const pedidoExternoId = `CLUB-${Date.now()}`
    const puntos = calcularPuntosPorCompra(total)

    const { data: cliente } = await supabase
      .from('clientes')
      .select('nombre, telefono')
      .eq('id', req.usuario.id)
      .single()

    // Crear pedido en Supabase
    const { data: pedido, error } = await supabase
      .from('pedidos')
      .insert({
        pedido_externo_id: pedidoExternoId,
        cliente_id: req.usuario.id,
        telefono: cliente.telefono,
        nombre_cliente: cliente.nombre,
        total,
        estado: 'pendiente',
        fecha_pedido: new Date().toISOString(),
        items_texto: JSON.stringify(items),
        direccion: direccion_entrega,
        notas,
        metodo_pago,
        origen: 'club',
        puntos_acreditados: true,
      })
      .select()
      .single()

    if (error) throw error

    // Acreditar puntos inmediatamente
    const puntosResult = await acreditarPuntos(
      req.usuario.id,
      pedido.id,
      puntos,
      `Pedido ${pedidoExternoId}`
    )

    // Bonus primer pedido: verificar si es el primero
    const { count } = await supabase
      .from('pedidos')
      .select('id', { count: 'exact' })
      .eq('cliente_id', req.usuario.id)

    if (count === 1) {
      await acreditarPuntos(req.usuario.id, null, 50, 'Bono primer pedido')
      puntosResult.puntos_sumados += 50
      puntosResult.puntos_actuales += 50
    }

    // Notificar a dosrios-app
    const dosriosUrl = process.env.DOSRIOS_API_URL
    const dosriosSecret = process.env.PEDIDOS_API_SECRET
    if (dosriosUrl) {
      try {
        await axios.post(
          `${dosriosUrl}/api/orders/from-club`,
          { pedido_externo_id: pedidoExternoId, cliente: cliente.nombre, telefono: cliente.telefono, items, total, direccion_entrega, notas, metodo_pago },
          { headers: { 'x-api-secret': dosriosSecret }, timeout: 5000 }
        )
      } catch { /* si dosrios-app no responde, el pedido igual queda en Supabase */ }
    }

    res.status(201).json({
      pedido_id: pedido.id,
      pedido_externo_id: pedidoExternoId,
      total,
      puntos_sumados: puntosResult.puntos_sumados,
      puntos_actuales: puntosResult.puntos_actuales,
      nivel: puntosResult.nivel,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
