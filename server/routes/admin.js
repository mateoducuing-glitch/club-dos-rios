import express from 'express'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase.js'
import { ajustarPuntos } from '../services/puntosService.js'

const router = express.Router()

function autenticarAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token requerido' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    if (payload.rol !== 'admin') return res.status(403).json({ error: 'Solo administradores' })
    req.usuario = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

// Login admin
router.post('/login', (req, res) => {
  const { password } = req.body
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Credenciales incorrectas' })
  }
  const token = jwt.sign({ rol: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' })
  res.json({ token })
})

// Estadísticas
router.get('/stats', autenticarAdmin, async (req, res) => {
  try {
    const [clientesRes, puntosEntregadosRes, puntosCanjeadosRes, pedidosRes, topPremioRes] = await Promise.all([
      supabase.from('clientes').select('nivel'),
      supabase.from('movimientos_puntos').select('puntos').eq('tipo', 'suma'),
      supabase.from('movimientos_puntos').select('puntos').eq('tipo', 'canje'),
      supabase.from('pedidos').select('id', { count: 'exact' }),
      supabase.from('canjes').select('premio_id, premios(nombre)', { count: 'exact' }).order('created_at', { ascending: false }).limit(100)
    ])

    const niveles = { Bronce: 0, Plata: 0, Oro: 0, Platino: 0 }
    clientesRes.data?.forEach(c => { niveles[c.nivel] = (niveles[c.nivel] || 0) + 1 })

    const totalEntregados = puntosEntregadosRes.data?.reduce((s, m) => s + m.puntos, 0) || 0
    const totalCanjeados = Math.abs(puntosCanjeadosRes.data?.reduce((s, m) => s + m.puntos, 0) || 0)

    res.json({
      clientes_total: clientesRes.data?.length || 0,
      niveles,
      puntos_entregados: totalEntregados,
      puntos_canjeados: totalCanjeados,
      pedidos_sincronizados: pedidosRes.count || 0
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Listar clientes
router.get('/clientes', autenticarAdmin, async (req, res) => {
  try {
    const { search, nivel, page = 1 } = req.query
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabase.from('clientes').select('*', { count: 'exact' })
    if (search) query = query.or(`nombre.ilike.%${search}%,telefono.ilike.%${search}%`)
    if (nivel) query = query.eq('nivel', nivel)

    const { data, count, error } = await query
      .order('puntos_totales', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    res.json({ data, total: count, page: Number(page), pages: Math.ceil(count / limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Ajustar puntos de un cliente
router.post('/clientes/:id/puntos', autenticarAdmin, async (req, res) => {
  try {
    const { puntos, motivo } = req.body
    const resultado = await ajustarPuntos(req.params.id, Number(puntos), motivo || 'Ajuste manual admin')
    res.json(resultado)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// CRUD premios
router.get('/premios', autenticarAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('premios').select('*').order('puntos_requeridos')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/premios', autenticarAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('premios').insert(req.body).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/premios/:id', autenticarAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('premios').update(req.body).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Listar canjes
router.get('/canjes', autenticarAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('canjes')
      .select('*, clientes(nombre, telefono), premios(nombre)')
      .order('fecha_canje', { ascending: false })
      .limit(50)
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Top 10 clientes
router.get('/top-clientes', autenticarAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('id, nombre, telefono, nivel, puntos_totales, puntos_actuales')
      .order('puntos_totales', { ascending: false })
      .limit(10)
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
