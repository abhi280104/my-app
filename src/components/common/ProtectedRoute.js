import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setAuthorized(false);
          return;
        }

        // Fetch user role
        const { data: userRole, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("id", session.user.id) // adjust if your column is "user_id"
          .single();

        if (roleError || !userRole) {
          console.error("Error fetching role:", roleError?.message);
          setAuthorized(false);
        } else {
          setAuthorized(!requiredRole || userRole.role === requiredRole);
        }
      } catch (err) {
        console.error("ProtectedRoute error:", err);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (loading) return <p>Loading...</p>;
  return authorized ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
