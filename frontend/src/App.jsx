import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import AdminSignup from './pages/AdminSignup';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Approvals from './pages/Approvals';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import ApprovalRules from './pages/ApprovalRules';
import AdminApprovalView from './pages/AdminApprovalView';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin-signup" element={<AdminSignup />} />
            <Route path="/" element={<Navigate to="/admin-approval-view" replace />} />

            <Route
              path="/expenses"
              element={
                <ProtectedRoute allowedRoles={['employee', 'admin']}>
                  <Expenses />
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
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approval-rules"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ApprovalRules />
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