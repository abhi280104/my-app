import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const DashBoard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Fetch current session user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/login');
      }
    };

    fetchUser();

    // Optional: Listen for session changes (logout from another tab)
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
    });

    return () => subscription.subscription.unsubscribe();
  }, [navigate]);

  // Logout function
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut(); // client-side logout
      if (error) console.error('Logout error:', error.message);
    } finally {
      navigate('/login'); // always redirect
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      
      handleLogin
    </div>
  );
};

export default DashBoard;
