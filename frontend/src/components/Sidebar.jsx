import { NavLink } from 'react-router-dom';
import { HomeIcon, ClipboardDocumentListIcon, CheckBadgeIcon, Cog6ToothIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: HomeIcon, label: 'Dashboard', roles: ['employee', 'manager', 'admin'] },
    { path: '/expenses', icon: ClipboardDocumentListIcon, label: 'Expenses', roles: ['employee', 'admin'] },
    { path: '/approvals', icon: CheckBadgeIcon, label: 'Approvals', roles: ['manager', 'admin'] },
    { path: '/users', icon: UserIcon, label: 'Users', roles: ['admin'] },
    { path: '/settings', icon: Cog6ToothIcon, label: 'Settings', roles: ['admin'] },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm border-r h-screen">
      <nav className="p-4 space-y-2">
        {navItems
          .filter(item => item.roles.includes(user?.role))
          .map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
};

export default Sidebar;