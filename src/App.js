import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import SessionListener from './SessionListener';
import Home from './pages/user/Home';
import AdminDashboard from './pages/admin/DashBoard';

const App = () => {
  return (
    <Router>
      <SessionListener>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes for all logged-in users */}
          <Route
            path="/"
            element={
              <ProtectedRoute requiredRole={null}>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </SessionListener>
    </Router>
  );
};

export default App;
