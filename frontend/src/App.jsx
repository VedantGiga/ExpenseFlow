import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import AdminSignup from './pages/AdminSignup';
import Expenses from './pages/Expenses';
import Approvals from './pages/Approvals';
import AdminApprovalView from './pages/AdminApprovalView';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AddExpense from './pages/AddExpense';

const Layout = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) return children;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'admin') {
    return <Navigate to="/admin-approval-view" replace />;
  } else if (user.role === 'manager') {
    return <Navigate to="/approvals" replace />;
  } else {
    return <Navigate to="/employee-dashboard" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin-signup" element={<AdminSignup />} />

            <Route path="/" element={<RoleBasedRedirect />} />

            <Route
              path="/expenses"
              element={
                <ProtectedRoute allowedRoles={['employee', 'admin']}>
                  <Expenses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/employee-dashboard"
              element={
                <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-expense"
              element={
                <ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
                  <AddExpense />
                </ProtectedRoute>
              }
            />

            <Route
              path="/approvals"
              element={
                <ProtectedRoute allowedRoles={['manager', 'admin']}>
                  <Approvals />
                </ProtectedRoute>
              }
            />



            <Route
              path="/admin-approval-view"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminApprovalView />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;