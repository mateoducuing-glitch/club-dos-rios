import { NavLink } from 'react-router-dom'
import { Home, Gift, Ticket, Package, User } from 'lucide-react'

const items = [
  { to: '/inicio',   icon: Home,    label: 'Inicio'   },
  { to: '/premios',  icon: Gift,    label: 'Premios'  },
  { to: '/cupones',  icon: Ticket,  label: 'Cupones'  },
  { to: '/pedidos',  icon: Package, label: 'Pedidos'  },
  { to: '/perfil',   icon: User,    label: 'Perfil'   },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 safe-bottom z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-150 ${
                isActive
                  ? 'text-verde-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-verde-50' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-verde-700' : 'text-gray-400'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
