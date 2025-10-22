import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../services/supabaseClient";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session) {
          const decoded = jwtDecode(session.access_token);
          const role = decoded.user_role?.trim();
          if (role === "admin") {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }
      } catch (err) {
        console.error("Error checking session:", err.message);
      } finally {
        setLoadingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  // Email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingLogin(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      const decoded = jwtDecode(data.session.access_token);
      const role = decoded.user_role?.trim();

      if (role === "admin") navigate("/admin/dashboard", { replace: true });
      else navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  // Google OAuth login
  const handleGoogleLogin = async () => {
    setError("");
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/login` },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message);
    }
  };

  // Loader
  if (loadingSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-700 text-lg animate-pulse">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Welcome Back!</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="email-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="password-input"
            required
          />
          <button
            type="submit"
            disabled={loadingLogin}
            data-testid="login-button"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition"
          >
            {loadingLogin ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="my-6 text-center text-gray-400 relative">
          <span className="bg-white px-3 relative z-10">or</span>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 -z-0"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-md transition"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-gray-600">
          Don’t have an account?{" "}
          <span
            data-testid="register-link"
            onClick={() => navigate("/register")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
