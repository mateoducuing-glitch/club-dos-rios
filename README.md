# Club Dos Ríos 🥩

Sistema de fidelización para Dos Ríos Carnicería. Los clientes acumulan puntos con cada compra y los canjean por premios.

---

## Estructura

```
club-dos-rios/
├── server/          → Backend Node.js + Express
│   ├── lib/         → Conexión Supabase
│   ├── routes/      → Endpoints de la API
│   ├── services/    → Lógica de negocio (puntos, niveles, premios)
│   └── sql/         → Schema de base de datos
└── client/          → Frontend React + Vite + Tailwind
    └── src/
        ├── pages/       → Pantallas de la app
        └── components/  → Componentes reutilizables
```

---

## 1. Configurar Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a **SQL Editor** y ejecutar el contenido de `server/sql/schema.sql`
4. Ir a **Settings → API** y copiar:
   - Project URL → `SUPABASE_URL`
   - `anon` public key → `SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Variables de entorno

**Server** — crear `server/.env`:
```
PORT=3002
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...
JWT_SECRET=un_secreto_largo_y_seguro
WHATSAPP_DOS_RIOS=+5491161333709
PEDIDOS_API_SECRET=secreto_compartido_con_sistema_pedidos
ADMIN_PASSWORD=contraseña_admin
```

**Client** — crear `client/.env`:
```
VITE_WHATSAPP_DOS_RIOS=+5491161333709
```

---

## 3. Instalar y levantar

```bash
# Backend
cd server
npm install
npm run dev    # http://localhost:3002

# Frontend (otra terminal)
cd client
npm install
npm run dev    # http://localhost:5174
```

---

## 4. Login de clientes

1. Abrir la app en el navegador
2. Ingresar número de WhatsApp
3. El sistema genera un código de 4 dígitos
4. **En desarrollo**: el código aparece en pantalla (caja amarilla)
5. **En producción**: conectar con WhatsApp Business API para envío real

---

## 5. Sincronización de pedidos

Desde el sistema de pedidos (`dosrios-app`), al marcar un pedido como **ENTREGADO** enviar:

```bash
POST http://localhost:3002/api/pedidos/sync
Headers: x-api-secret: <PEDIDOS_API_SECRET>

{
  "pedido_externo_id": "PED-0001",
  "telefono": "+5491161333709",
  "nombre_cliente": "Juan Perez",
  "total": 61500,
  "estado": "entregado",
  "fecha_pedido": "2026-06-06T18:30:00"
}
```

Respuesta:
```json
{
  "cliente": "Juan Perez",
  "puntos_sumados": 123,
  "puntos_actuales": 1840,
  "nivel": "Bronce"
}
```

---

## 6. Sistema de puntos

- **Regla:** 1 punto cada $500 gastados
- **Bienvenida:** +100 puntos al registrarse
- **Primer pedido:** +50 puntos
- Los puntos solo se acreditan cuando el estado es `entregado`
- Nunca se acreditan dos veces (campo `puntos_acreditados`)

---

## 7. Niveles

| Nivel   | Puntos totales | Beneficios principales |
|---------|---------------|----------------------|
| 🥉 Bronce  | 0 - 1.999     | Acumular puntos |
| 🥈 Plata   | 2.000 - 4.999 | Cupón 5% OFF mensual |
| 🥇 Oro     | 5.000 - 9.999 | Envío gratis mensual |
| 💎 Platino | 10.000+       | Envíos gratis + cupón 10% + vino premium |

---

## 8. Panel administrador

Acceder en: `http://localhost:5174/admin`

- Ver estadísticas generales
- Gestionar clientes (buscar, ajustar puntos)
- Gestionar premios (activar/desactivar)
- Ver historial de canjes
- Top 10 clientes

---

## 9. PWA — Instalar en celular

**Android:**
1. Abrir Chrome y navegar a la URL del sitio
2. Tocar los 3 puntos → "Agregar a pantalla de inicio"

**iPhone:**
1. Abrir Safari y navegar a la URL del sitio
2. Tocar el ícono compartir → "Agregar a pantalla de inicio"

---

## Roadmap futuro

- [ ] Notificaciones Push
- [ ] Integración Mercado Pago
- [ ] QR para identificar clientes en local
- [ ] Envío real de código por WhatsApp Business API
- [ ] App Android/iPhone nativa
- [ ] Integración con Meta Ads
