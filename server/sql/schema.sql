-- ============================================================
-- CLUB DOS RÍOS — Schema Supabase
-- ============================================================

-- TABLA: clientes
CREATE TABLE IF NOT EXISTS clientes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           text,
  telefono         text UNIQUE NOT NULL,
  email            text,
  direccion        text,
  fecha_nacimiento date,
  puntos_actuales  integer DEFAULT 0,
  puntos_totales   integer DEFAULT 0,
  nivel            text DEFAULT 'Bronce',
  codigo_acceso    text,
  activo           boolean DEFAULT true,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- TABLA: pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_externo_id   text UNIQUE,
  cliente_id          uuid REFERENCES clientes(id),
  telefono            text,
  nombre_cliente      text,
  total               numeric,
  estado              text,
  fecha_pedido        timestamptz,
  puntos_acreditados  boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- TABLA: movimientos_puntos
-- tipo: suma | canje | ajuste
CREATE TABLE IF NOT EXISTS movimientos_puntos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id  uuid REFERENCES clientes(id),
  pedido_id   uuid REFERENCES pedidos(id),
  tipo        text NOT NULL CHECK (tipo IN ('suma', 'canje', 'ajuste')),
  puntos      integer NOT NULL,
  motivo      text,
  created_at  timestamptz DEFAULT now()
);

-- TABLA: premios
CREATE TABLE IF NOT EXISTS premios (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre            text NOT NULL,
  descripcion       text,
  tipo              text,
  puntos_requeridos integer NOT NULL,
  stock             integer,
  activo            boolean DEFAULT true,
  imagen_url        text,
  created_at        timestamptz DEFAULT now()
);

-- TABLA: canjes
-- estado: pendiente | usado | vencido | cancelado
CREATE TABLE IF NOT EXISTS canjes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id        uuid REFERENCES clientes(id),
  premio_id         uuid REFERENCES premios(id),
  codigo_cupon      text UNIQUE NOT NULL,
  puntos_usados     integer NOT NULL,
  estado            text DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'usado', 'vencido', 'cancelado')),
  fecha_canje       timestamptz DEFAULT now(),
  fecha_vencimiento timestamptz
);

-- ============================================================
-- PREMIOS INICIALES
-- ============================================================
INSERT INTO premios (nombre, descripcion, tipo, puntos_requeridos, stock, activo) VALUES
  ('Cupón 5% OFF',           'Descuento del 5% en tu próxima compra',        'descuento',  500,  NULL, true),
  ('Cupón 10% OFF',          'Descuento del 10% en tu próxima compra',       'descuento',  1000, NULL, true),
  ('Envío gratis',           'Envío sin costo en tu próxima compra',         'envio',      700,  NULL, true),
  ('Chorizos x2',            '2 chorizos criollos de regalo',                'producto',   900,  50,   true),
  ('Vino Malbec',            'Botella de Malbec seleccionado',               'producto',   1500, 20,   true),
  ('Combo Hamburguesas',     '4 hamburguesas artesanales de 200g c/u',       'producto',   2000, 30,   true),
  ('Picada para 2',          'Tabla de embutidos y quesos para 2 personas',  'producto',   3000, 15,   true),
  ('Caja Parrillera Premium','Selección premium de cortes para parrilla',    'producto',   6000, 10,   true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- TABLA: catalogo (productos disponibles para pedir)
-- ============================================================
CREATE TABLE IF NOT EXISTS catalogo (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      text NOT NULL,
  descripcion text,
  categoria   text NOT NULL,
  precio      numeric NOT NULL,
  unidad      text DEFAULT 'kg',
  disponible  boolean DEFAULT true,
  orden       integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

INSERT INTO catalogo (nombre, descripcion, categoria, precio, unidad, orden) VALUES
  ('Asado de tira',       'Corte clásico para parrilla',           'Vacunos',    3200, 'kg',  1),
  ('Vacío',               'Tierno y jugoso, ideal a la parrilla',  'Vacunos',    3800, 'kg',  2),
  ('Bife de chorizo',     'Corte premium de lomo ancho',           'Vacunos',    5200, 'kg',  3),
  ('Lomo',                'El corte más tierno de la res',         'Vacunos',    7500, 'kg',  4),
  ('Matambre',            'Para arrollar o a la parrilla',         'Vacunos',    3000, 'kg',  5),
  ('Paleta',              'Ideal para estofados y guisos',         'Vacunos',    2800, 'kg',  6),
  ('Bondiola de cerdo',   'Jugosa y sabrosa a la parrilla',        'Cerdo',      3400, 'kg',  1),
  ('Costillas de cerdo',  'Tiernas y con mucho sabor',             'Cerdo',      2900, 'kg',  2),
  ('Chorizo criollo',     'Artesanal, mezcla especial de la casa', 'Embutidos',  1200, 'u',   1),
  ('Morcilla',            'Tradicional, con especias',             'Embutidos',  900,  'u',   2),
  ('Salchicha parrillera','Ideal para parrilla o sartén',          'Embutidos',  800,  'u',   3),
  ('Hamburguesa 200g',    'Artesanal, 100% vacuno',                'Listos',     750,  'u',   1),
  ('Milanesa de nalga',   'Fina y tierna, lista para cocinar',     'Listos',     4200, 'kg',  2)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_pedidos_externo_id ON pedidos(pedido_externo_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_cliente_id ON movimientos_puntos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_canjes_cliente_id ON canjes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_canjes_codigo ON canjes(codigo_cupon);
