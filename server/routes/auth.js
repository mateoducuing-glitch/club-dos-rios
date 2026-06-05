import express from 'express'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase.js'
import { acreditarPuntos } from '../services/puntosService.js'

const router = express.Router()

// En desarrollo mostramos el código; en producción se enviará por WhatsApp
const codigosTemporales = new Map()

router.post('/solicitar-codigo', async (req, res) => {
  try {
    const { telefono } = req.body
    if (!telefono) return res.status(400).json({ error: 'Teléfono requerido' })

    const telefonoLimpio = telefono.replace(/\s/g, '').replace(/-/g, '')
    const codigo = Math.floor(1000 + Math.random() * 9000).toString()

    codigosTemporales.set(telefonoLimpio, { codigo, expires: Date.now() + 10 * 60 * 1000 })

    // En desarrollo devolvemos el código directamente
    const isDev = process.env.NODE_ENV !== 'production'
    res.json({ ok: true, ...(isDev && { codigo_desarrollo: codigo }) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/verificar-codigo', async (req, res) => {
  try {
    const { telefono, codigo } = req.body
    if (!telefono || !codigo) return res.status(400).json({ error: 'Teléfono y código requeridos' })

    const telefonoLimpio = telefono.replace(/\s/g, '').replace(/-/g, '')
    const registro = codigosTemporales.get(telefonoLimpio)

    if (!registro || registro.codigo !== codigo || Date.now() > registro.expires) {
      return res.status(401).json({ error: 'Código inválido o expirado' })
    }

    codigosTemporales.delete(telefonoLimpio)

    // Buscar o crear cliente
    let { data: cliente } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefono', telefonoLimpio)
      .single()

    let esNuevo = false
    if (!cliente) {
      const { data: nuevoCliente, error } = await supabase
        .from('clientes')
        .insert({ telefono: telefonoLimpio, nombre: telefonoLimpio })
        .select()
        .single()

      if (error) throw error
      cliente = nuevoCliente
      esNuevo = true
    }

    // Bono de bienvenida
    if (esNuevo) {
      await acreditarPuntos(cliente.id, null, 100, 'Bienvenida al Club Dos Ríos')
      const { data } = await supabase.from('clientes').select('*').eq('id', cliente.id).single()
      cliente = data
    }

    const token = jwt.sign(
      { id: cliente.id, telefono: cliente.telefono, rol: 'cliente' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({ token, cliente, es_nuevo: esNuevo })
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
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' })
  }
  next()
}

export default router
