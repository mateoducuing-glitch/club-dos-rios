import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { supabase } from '../lib/supabase.js'
import { acreditarPuntos } from '../services/puntosService.js'

const router = express.Router()

// POST /auth/registro
router.post('/registro', async (req, res) => {
  try {
    const { nombre, telefono, password, email, direccion, fecha_nacimiento } = req.body
    if (!nombre?.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' })
    if (!telefono?.trim()) return res.status(400).json({ error: 'El teléfono es obligatorio' })
    if (!password || password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })

    const telefonoLimpio = telefono.replace(/\s/g, '').replace(/-/g, '')

    const { data: existente } = await supabase
      .from('clientes')
      .select('id')
      .eq('telefono', telefonoLimpio)
      .single()

    if (existente) return res.status(409).json({ error: 'Ya existe una cuenta con ese número' })

    const password_hash = await bcrypt.hash(password, 10)

    const { data: cliente, error } = await supabase
      .from('clientes')
      .insert({ nombre, telefono: telefonoLimpio, password_hash, email: email || null, direccion: direccion || null, fecha_nacimiento: fecha_nacimiento || null })
      .select()
      .single()

    if (error) throw error

    // Bono bienvenida
    await acreditarPuntos(cliente.id, null, 100, 'Bienvenida al Club Dos Ríos')
    const { data: clienteActualizado } = await supabase.from('clientes').select('*').eq('id', cliente.id).single()

    const token = jwt.sign(
      { id: clienteActualizado.id, telefono: clienteActualizado.telefono, rol: 'cliente' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.status(201).json({ token, cliente: clienteActualizado })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { telefono, password } = req.body
    if (!telefono || !password) return res.status(400).json({ error: 'Teléfono y contraseña requeridos' })

    const telefonoLimpio = telefono.replace(/\s/g, '').replace(/-/g, '')

    const { data: cliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefono', telefonoLimpio)
      .single()

    if (!cliente) return res.status(401).json({ error: 'Número no registrado' })
    if (!cliente.password_hash) return res.status(401).json({ error: 'Esta cuenta no tiene contraseña. Contactá a Dos Ríos.' })

    const valida = await bcrypt.compare(password, cliente.password_hash)
    if (!valida) return res.status(401).json({ error: 'Contraseña incorrecta' })

    const token = jwt.sign(
      { id: cliente.id, telefono: cliente.telefono, rol: 'cliente' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({ token, cliente })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/perfil', autenticar, async (req, res) => {
  try {
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', req.usuario.id)
      .single()

    if (error) throw error
    res.json(cliente)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token requerido' })
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

export function esAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' })
  next()
}

export default router
