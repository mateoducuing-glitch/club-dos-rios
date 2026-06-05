import { NavLink } from 'react-router-dom'
import { Home, Gift, Ticket, Package, User, ShoppingCart, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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
    <aside
      className="hidden md:flex flex-col w-64 min-h-screen sticky top-0 shrink-0 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1208 60%, #0f0a00 100%)' }}
    >
      {/* Gold glow */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #e5ae1e 0%, transparent 70%)' }}
      />

      {/* Logo */}
      <div className="px-6 pt-8 pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #e5ae1e, #c9920f)' }}
          >
            🥩
          </div>
          <div>
            <p className="text-white font-extrabold text-lg leading-tight">Club</p>
            <p className="font-extrabold text-lg leading-tight" style={{ color: '#e5ae1e' }}>Dos Ríos</p>
          </div>
        </div>
      </div>

      {/* Usuario */}
      {usuario && (
        <div className="px-4 py-4 border-b border-white/10 relative z-10">
          <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <p className="text-white font-semibold text-sm truncate">{usuario.nombre || usuario.telefono}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-bold" style={{ color: '#e5ae1e' }}>
                {NIVEL_EMOJI[nivel]} {nivel}
              </span>
              <span className="text-xs font-bold" style={{ color: '#e5ae1e99' }}>
                ⭐ {(usuario.puntos_actuales || 0).toLocaleString('es-AR')} pts
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 relative z-10">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                isActive ? 'bg-dorado-50 text-dorado-800' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 relative z-10">
        <button
          onClick={() => { if (window.confirm('¿Cerrar sesión?')) logout() }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:bg-white/10 hover:text-white/80 transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
