import express from 'express'
import { supabase } from '../lib/supabase.js'
import { autenticar } from './auth.js'
import { canjearPremio } from '../services/premiosService.js'

const router = express.Router()

router.get('/', autenticar, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('premios')
      .select('*')
      .eq('activo', true)
      .order('puntos_requeridos', { ascending: true })

    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:id/canjear', autenticar, async (req, res) => {
  try {
    const resultado = await canjearPremio(req.usuario.id, req.params.id)
    res.json(resultado)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
