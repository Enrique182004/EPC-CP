import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/doctors', label: 'Doctors', icon: '👨‍⚕️' },
  { to: '/alerts', label: 'Alerts', icon: '🔔' },
]

const adminItems = [
  { to: '/users', label: 'Users', icon: '👥' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-blue-900 text-white flex flex-col shrink-0">
      <div className="p-5 border-b border-blue-800">
        <h1 className="text-lg font-bold leading-tight">EPC Medical</h1>
        <p className="text-blue-300 text-xs mt-0.5">Credentialing System</p>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
            )}
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="pt-3 pb-1 px-3 text-xs font-semibold text-blue-400 uppercase tracking-wider">Admin</div>
            {adminItems.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                )}
              >
                <span>{icon}</span>
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <div className="text-sm text-blue-200 mb-1">{user?.name}</div>
        <div className="text-xs text-blue-400 capitalize mb-3">{user?.role}</div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-blue-300 hover:text-white transition-colors"
        >
          Sign out →
        </button>
      </div>
    </aside>
  )
}
