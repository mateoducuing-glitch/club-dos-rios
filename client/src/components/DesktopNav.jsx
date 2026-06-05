import { NavLink } from 'react-router-dom'
import { Home, Gift, Ticket, Package, User, ShoppingCart, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NIVEL_COLOR = {
  Bronce:  'text-amber-600',
  Plata:   'text-slate-400',
  Oro:     'text-dorado-500',
  Platino: 'text-purple-500',
}

const NIVEL_EMOJI = { Bronce: '🥉', Plata: '🥈', Oro: '🥇', Platino: '💎' }

const items = [
  { to: '/inicio',  icon: Home,         label: 'Inicio'        },
  { to: '/pedido',  icon: ShoppingCart,  label: 'Hacer pedido'  },
  { to: '/premios', icon: Gift,          label: 'Premios'       },
  { to: '/cupones', icon: Ticket,        label: 'Mis Cupones'   },
  { to: '/pedidos', icon: Package,       label: 'Mis Pedidos'   },
  { to: '/perfil',  icon: User,          label: 'Mi Perfil'     },
]

export default function DesktopNav() {
  const { usuario, logout } = useAuth()
  const nivel = usuario?.nivel || 'Bronce'

  return (
    <aside className="hidden md:flex flex-col w-64 bg-verde-700 min-h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="px-6 pt-8 pb-6 border-b border-verde-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dorado-400 rounded-2xl flex items-center justify-center text-xl shrink-0">🥩</div>
          <div>
            <p className="text-white font-extrabold text-lg leading-tight">Club</p>
            <p className="text-dorado-400 font-extrabold text-lg leading-tight">Dos Ríos</p>
          </div>
        </div>
      </div>

      {/* Usuario */}
      {usuario && (
        <div className="px-4 py-4 border-b border-verde-600">
          <div className="bg-verde-600 rounded-2xl p-3">
            <p className="text-white font-semibold text-sm truncate">{usuario.nombre || usuario.telefono}</p>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs font-bold ${NIVEL_COLOR[nivel]}`}>
                {NIVEL_EMOJI[nivel]} {nivel}
              </span>
              <span className="text-dorado-300 text-xs font-bold">
                ⭐ {(usuario.puntos_actuales || 0).toLocaleString('es-AR')} pts
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                isActive
                  ? 'bg-white text-verde-700'
                  : 'text-verde-100 hover:bg-verde-600'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={() => { if (window.confirm('¿Cerrar sesión?')) logout() }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-verde-300 hover:bg-verde-600 hover:text-white transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
