import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    // 1. Sign up user
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // 2. Optionally add default role (if trigger is not set up in DB)
    if (data?.user) {
      await supabase.from('user_roles').upsert({
        id: data.user.id,
        role: 'customer',
      });
    }

    navigate('/'); // redirect after signup
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-700">
      <div className="bg-white bg-opacity-90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md animate-fadeIn">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 tracking-wide">
          Create Account
        </h2>

        {error && <p className="text-red-500 text-center mb-4 font-medium">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Email */}
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

          {/* Password */}
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

          {/* Confirm Password */}
          <div className="relative">
            <input
              type="password"
              placeholder=" "
              className="peer w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <label className="absolute left-4 top-4 text-gray-400 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-indigo-600 peer-focus:text-sm transition-all">
              Confirm Password
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition duration-300 shadow-md hover:shadow-lg"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="my-6 text-center text-gray-500 relative">
          <span className="bg-white px-3 relative z-10">or</span>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 -z-0"></div>
        </div>

        <button
          onClick={handleGoogleRegister}
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
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-indigo-600 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
