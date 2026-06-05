import express from 'express'
import { supabase } from '../lib/supabase.js'
import { autenticar } from './auth.js'
import { puntosParaSiguienteNivel } from '../services/nivelesService.js'

const router = express.Router()

router.get('/resumen', autenticar, async (req, res) => {
  try {
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('puntos_actuales, puntos_totales, nivel')
      .eq('id', req.usuario.id)
      .single()

    if (error) throw error

    const progreso = puntosParaSiguienteNivel(cliente.puntos_totales)
    res.json({ ...cliente, progreso })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/historial', autenticar, async (req, res) => {
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
