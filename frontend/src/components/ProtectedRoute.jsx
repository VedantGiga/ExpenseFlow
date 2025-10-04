import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate page based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin-approval-view" replace />;
    } else if (user.role === 'manager') {
      return <Navigate to="/approvals" replace />;
    } else {
      return <Navigate to="/expenses" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;