import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import clientesRoutes from './routes/clientes.js'
import pedidosRoutes from './routes/pedidos.js'
import puntosRoutes from './routes/puntos.js'
import premiosRoutes from './routes/premios.js'
import cuponesRoutes from './routes/cupones.js'
import adminRoutes from './routes/admin.js'
import catalogoRoutes from './routes/catalogo.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5175', 'http://localhost:4173'],
  credentials: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', proyecto: 'Club Dos Ríos', version: '1.0.0' })
})

app.use('/api/auth', authRoutes)
app.use('/api/clientes', clientesRoutes)
app.use('/api/pedidos', pedidosRoutes)
app.use('/api/puntos', puntosRoutes)
app.use('/api/premios', premiosRoutes)
app.use('/api/cupones', cuponesRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/catalogo', catalogoRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Error interno del servidor' })
})

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

app.listen(PORT, () => {
  console.log(`🥩 Club Dos Ríos - Backend corriendo en http://localhost:${PORT}`)
})
