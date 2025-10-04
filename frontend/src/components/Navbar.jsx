import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', roles: ['manager', 'admin'] },
    { path: '/employee-dashboard', label: 'My Expenses', roles: ['manager', 'admin'] },
    { path: '/approvals', label: 'Approvals', roles: ['manager', 'admin'] },
    { path: '/users', label: 'Users', roles: ['admin'] },
    { path: '/approval-rules', label: 'Rules', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-semibold text-gray-800">ExpenseFlow</h1>
          <div className="flex gap-6">
            {filteredNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 capitalize">{user?.role}</span>
          <button
            onClick={logout}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;