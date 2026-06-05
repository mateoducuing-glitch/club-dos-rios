import express from 'express'
import { supabase } from '../lib/supabase.js'
import { autenticar } from './auth.js'

const router = express.Router()

router.get('/me', autenticar, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', req.usuario.id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/me', autenticar, async (req, res) => {
  try {
    const { nombre, email, direccion, fecha_nacimiento, metodo_pago_preferido, tarjeta_tipo, tarjeta_ultimos4 } = req.body
    const campos = { updated_at: new Date().toISOString() }
    if (nombre !== undefined) campos.nombre = nombre
    if (email !== undefined) campos.email = email
    if (direccion !== undefined) campos.direccion = direccion
    if (fecha_nacimiento !== undefined) campos.fecha_nacimiento = fecha_nacimiento
    if (metodo_pago_preferido !== undefined) campos.metodo_pago_preferido = metodo_pago_preferido
    if (tarjeta_tipo !== undefined) campos.tarjeta_tipo = tarjeta_tipo
    if (tarjeta_ultimos4 !== undefined) campos.tarjeta_ultimos4 = tarjeta_ultimos4

    const { data, error } = await supabase
      .from('clientes')
      .update(campos)
      .eq('id', req.usuario.id)
      .select()
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/movimientos', autenticar, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('movimientos_puntos')
      .select('*')
      .eq('cliente_id', req.usuario.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
