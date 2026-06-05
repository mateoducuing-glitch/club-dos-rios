export const MOCK_USUARIO = {
  id: 'demo-001',
  nombre: 'Mateo Demo',
  telefono: '+5491161333709',
  email: 'demo@dosrios.com',
  nivel: 'Plata',
  puntos_actuales: 2340,
  puntos_totales: 3100,
  created_at: '2026-01-15T10:00:00Z',
}

export const MOCK_PUNTOS = {
  puntos_actuales: 2340,
  puntos_totales: 3100,
  nivel: 'Plata',
  progreso: {
    siguienteNivel: 'Oro',
    puntosNecesarios: 1900,
    minNivelActual: 2000,
    maxNivelActual: 4999,
  },
}

export const MOCK_PREMIOS = [
  { id: 'p1', nombre: 'Cupón 5% OFF', descripcion: 'Descuento del 5% en tu próxima compra', puntos_requeridos: 500, stock: null, activo: true, imagen_url: null },
  { id: 'p2', nombre: 'Cupón 10% OFF', descripcion: 'Descuento del 10% en tu próxima compra', puntos_requeridos: 1000, stock: null, activo: true, imagen_url: null },
  { id: 'p3', nombre: 'Envío gratis', descripcion: 'Envío sin costo en tu próxima compra', puntos_requeridos: 700, stock: null, activo: true, imagen_url: null },
  { id: 'p4', nombre: 'Chorizos x2', descripcion: '2 chorizos criollos de regalo', puntos_requeridos: 900, stock: 12, activo: true, imagen_url: null },
  { id: 'p5', nombre: 'Vino Malbec', descripcion: 'Botella de Malbec seleccionado', puntos_requeridos: 1500, stock: 5, activo: true, imagen_url: null },
  { id: 'p6', nombre: 'Combo Hamburguesas', descripcion: '4 hamburguesas artesanales de 200g c/u', puntos_requeridos: 2000, stock: 8, activo: true, imagen_url: null },
  { id: 'p7', nombre: 'Picada para 2', descripcion: 'Tabla de embutidos y quesos para 2 personas', puntos_requeridos: 3000, stock: 4, activo: true, imagen_url: null },
  { id: 'p8', nombre: 'Caja Parrillera Premium', descripcion: 'Selección premium de cortes para parrilla', puntos_requeridos: 6000, stock: 2, activo: true, imagen_url: null },
]

export const MOCK_PEDIDOS = [
  { id: 'ped1', pedido_externo_id: 'PED-0023', total: 62500, estado: 'entregado', fecha_pedido: '2026-06-04T14:30:00Z', puntos_acreditados: true },
  { id: 'ped2', pedido_externo_id: 'PED-0019', total: 45000, estado: 'entregado', fecha_pedido: '2026-05-28T11:00:00Z', puntos_acreditados: true },
  { id: 'ped3', pedido_externo_id: 'PED-0015', total: 38000, estado: 'entregado', fecha_pedido: '2026-05-20T09:15:00Z', puntos_acreditados: true },
  { id: 'ped4', pedido_externo_id: 'PED-0010', total: 71000, estado: 'entregado', fecha_pedido: '2026-05-10T16:45:00Z', puntos_acreditados: true },
  { id: 'ped5', pedido_externo_id: 'PED-0007', total: 29000, estado: 'entregado', fecha_pedido: '2026-04-30T10:00:00Z', puntos_acreditados: true },
]

export const MOCK_CATALOGO = [
  { id: 'c1',  nombre: 'Asado de tira',       descripcion: 'Corte clásico para parrilla',          categoria: 'Vacunos',   precio: 3200, unidad: 'kg'  },
  { id: 'c2',  nombre: 'Vacío',                descripcion: 'Tierno y jugoso, ideal a la parrilla', categoria: 'Vacunos',   precio: 3800, unidad: 'kg'  },
  { id: 'c3',  nombre: 'Bife de chorizo',      descripcion: 'Corte premium de lomo ancho',          categoria: 'Vacunos',   precio: 5200, unidad: 'kg'  },
  { id: 'c4',  nombre: 'Lomo',                 descripcion: 'El corte más tierno de la res',         categoria: 'Vacunos',   precio: 7500, unidad: 'kg'  },
  { id: 'c5',  nombre: 'Matambre',             descripcion: 'Para arrollar o a la parrilla',         categoria: 'Vacunos',   precio: 3000, unidad: 'kg'  },
  { id: 'c6',  nombre: 'Bondiola de cerdo',    descripcion: 'Jugosa y sabrosa a la parrilla',        categoria: 'Cerdo',     precio: 3400, unidad: 'kg'  },
  { id: 'c7',  nombre: 'Costillas de cerdo',   descripcion: 'Tiernas y con mucho sabor',             categoria: 'Cerdo',     precio: 2900, unidad: 'kg'  },
  { id: 'c8',  nombre: 'Chorizo criollo',      descripcion: 'Artesanal, mezcla especial de la casa', categoria: 'Embutidos', precio: 1200, unidad: 'u'   },
  { id: 'c9',  nombre: 'Morcilla',             descripcion: 'Tradicional, con especias',             categoria: 'Embutidos', precio: 900,  unidad: 'u'   },
  { id: 'c10', nombre: 'Hamburguesa 200g',     descripcion: 'Artesanal, 100% vacuno',                categoria: 'Listos',    precio: 750,  unidad: 'u'   },
  { id: 'c11', nombre: 'Milanesa de nalga',    descripcion: 'Fina y tierna, lista para cocinar',     categoria: 'Listos',    precio: 4200, unidad: 'kg'  },
]

export const MOCK_CUPONES = [
  {
    id: 'cup1',
    codigo_cupon: 'DR-ABC123',
    estado: 'pendiente',
    puntos_usados: 500,
    fecha_canje: '2026-06-01T10:00:00Z',
    fecha_vencimiento: '2026-07-01T23:59:00Z',
    premios: { nombre: 'Cupón 5% OFF', descripcion: 'Descuento del 5% en tu próxima compra', tipo: 'descuento' },
  },
  {
    id: 'cup2',
    codigo_cupon: 'DR-XYZ789',
    estado: 'usado',
    puntos_usados: 700,
    fecha_canje: '2026-05-15T10:00:00Z',
    fecha_vencimiento: '2026-06-15T23:59:00Z',
    premios: { nombre: 'Envío gratis', descripcion: 'Envío sin costo', tipo: 'envio' },
  },
]
