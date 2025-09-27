import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './services/supabaseClient';

const SessionListener = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSessionChange = async (session) => {
      setLoading(true);

      if (session?.user) {
        const { data: userRole, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error.message);
        } else if (userRole?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        navigate('/login');
      }

      setLoading(false);
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionChange(session);
    });

    // Listen for session changes (login/logout)
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionChange(session);
    });

    return () => subscription.subscription.unsubscribe();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;

  return children;
};

export default SessionListener;
