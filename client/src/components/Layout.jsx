import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import DesktopNav from './DesktopNav'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-crema">
      {/* Sidebar — solo desktop */}
      <DesktopNav />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0 md:max-w-4xl md:mx-auto md:w-full md:px-0">
          <Outlet />
        </main>

        {/* BottomNav — solo móvil */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
