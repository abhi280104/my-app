import { Navigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!session) {
        setLoading(false);
        return;
      }

      const decoded = jwtDecode(session.access_token);
      const cleanRole = decoded.user_role?.trim(); // ✅ trim here
      setRole(cleanRole);
      setLoading(false);
    };

    fetchSession();
  }, []);

  if (loading) return <p>Loading...</p>;

  // No session
  if (!role) return <Navigate to="/login" />;

  // Check for required role
  if (requiredRole && role !== requiredRole) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
