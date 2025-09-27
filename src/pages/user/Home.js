import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Fetch current session user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/login'); // redirect if no session
      }
    };

    fetchUser();
  }, [navigate]);

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.email}</h1>
      <p className="mb-6">You are now logged in.</p>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default Home;

