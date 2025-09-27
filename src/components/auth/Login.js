import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      const session = data.session;
      if (!session?.user) throw new Error('No active session found.');

      // Fetch user role
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (roleError) throw roleError;

      // Redirect based on role
      if (userRole?.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });

    if (oauthError) setError(oauthError.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-700">
      <div className="bg-white bg-opacity-90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md animate-fadeIn">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 tracking-wide">
          Welcome Back!
        </h2>

        {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              placeholder=" "
              className="peer w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="absolute left-4 top-4 text-gray-400 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-indigo-600 peer-focus:text-sm transition-all">
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder=" "
              className="peer w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className="absolute left-4 top-4 text-gray-400 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-indigo-600 peer-focus:text-sm transition-all">
              Password
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition duration-300 shadow-md hover:shadow-lg"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="my-6 text-center text-gray-500 relative">
          <span className="bg-white px-3 relative z-10">or</span>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 -z-0"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-100 transition duration-300 shadow-sm"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-gray-600">
          Don’t have an account?{' '}
          <span
            onClick={() => navigate('/register')}
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
