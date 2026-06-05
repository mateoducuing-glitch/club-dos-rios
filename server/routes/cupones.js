import express from 'express'
import { supabase } from '../lib/supabase.js'
import { autenticar } from './auth.js'

const router = express.Router()

router.get('/', autenticar, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('canjes')
      .select('*, premios(nombre, descripcion, tipo)')
      .eq('cliente_id', req.usuario.id)
      .order('fecha_canje', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:codigo', autenticar, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('canjes')
      .select('*, premios(nombre, descripcion)')
      .eq('codigo_cupon', req.params.codigo)
      .eq('cliente_id', req.usuario.id)
      .single()

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(404).json({ error: 'Cupón no encontrado' })
  }
})

export default router
