import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();



  return (
    <nav className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">ExpenseFlow</h1>
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